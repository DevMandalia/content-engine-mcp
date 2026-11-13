import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { flagVerbatimCopy } from "../src/copy-lint.js";
import { ContentEngine } from "../src/engine.js";
import { lintHtml } from "../src/html-lint.js";
import { lintIssueHeaders, PREHEADER_MAX, SUBJECT_MAX } from "../src/issue-lint.js";
import { UNSUBSCRIBE_TOKEN } from "../src/render/newsletter.js";
import { assertInsideDir, assertSafeId } from "../src/safe-path.js";
import { safeFetchUrl, SsrfError } from "../src/ssrf.js";
import { EngineError } from "../src/types.js";
import { encodeIntentQuery, intentUrl, oneLinkPerPost } from "../src/x-thread.js";
import { setupKitchen, tempEngine } from "./helpers.js";

describe("issue headers", () => {
  it("requires subject ≤90 and preheader ≤110", () => {
    const ok = lintIssueHeaders({ title: "Weeknight hummus", subject: "Chickpeas tonight" });
    expect(ok.errors).toEqual([]);
    expect(ok.headers.subject).toBe("Chickpeas tonight");
    expect(ok.headers.preheader.length).toBeLessThanOrEqual(PREHEADER_MAX);

    const long = lintIssueHeaders({
      title: "x",
      subject: "s".repeat(SUBJECT_MAX + 1),
      preheader: "p".repeat(PREHEADER_MAX + 1)
    });
    expect(long.errors.length).toBeGreaterThan(0);
  });

  it("writes subject, preheader, alternatives, and unsubscribe token into the issue", () => {
    const engine = tempEngine();
    setupKitchen(engine);
    const seed = engine.captureSeed({ body: "Warm pita is dinner." }).seed;
    engine.saveDraft({
      seed_id: seed.id,
      channel: "newsletter",
      body: "# Warm pita\n\n## Mezze\nWarm pita is dinner."
    });
    const rendered = engine.renderOutputs({
      seed_id: seed.id,
      channels: ["newsletter"],
      subject: "Warm pita tonight",
      preheader: "A Tuesday plate.",
      subjectAlternatives: ["Pita, then sleep"]
    });
    const issue = rendered.issue as {
      subject: string;
      preheader: string;
      subjectAlternatives: string[];
    };
    expect(issue.subject).toBe("Warm pita tonight");
    expect(issue.preheader).toBe("A Tuesday plate.");
    expect(issue.subjectAlternatives).toEqual(["Pita, then sleep"]);
    const html = readFileSync(join(engine.paths.out, seed.id, "newsletter.html"), "utf8");
    expect(html).toContain(UNSUBSCRIBE_TOKEN);
    expect(html).toMatch(/Unsubscribe/i);
  });
});

describe("SSRF redirects and metadata", () => {
  it("blocks IPv6 link-local and CGNAT literals", async () => {
    await expect(safeFetchUrl("http://[fe80::1]/")).rejects.toBeInstanceOf(SsrfError);
    await expect(safeFetchUrl("http://100.64.0.1/")).rejects.toBeInstanceOf(SsrfError);
  });

  it("re-checks redirect Location against the SSRF allowlist", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const href = String(input instanceof Request ? input.url : input);
      if (href.includes("/go")) {
        return new Response(null, { status: 302, headers: { location: "http://127.0.0.1/secret" } });
      }
      return new Response("should not fetch", { status: 200 });
    }) as typeof fetch;
    await expect(safeFetchUrl("https://example.com/go", fetchImpl)).rejects.toBeInstanceOf(SsrfError);
  });
});

describe("path jail and checksums", () => {
  it("rejects path traversal ids and writes", () => {
    expect(() => assertSafeId("../etc")).toThrow(EngineError);
    const root = mkdtempSync(join(tmpdir(), "ce-jail-"));
    expect(() => assertInsideDir(root, join(root, "..", "outside.txt"))).toThrow(/outside|Refusing/i);
  });

  it("writes a SHA-256 manifest next to exports", () => {
    const engine = tempEngine();
    setupKitchen(engine);
    const seed = engine.captureSeed({ body: "Lemon and oil." }).seed;
    engine.saveDraft({
      seed_id: seed.id,
      channel: "newsletter",
      body: "# Lemon\n\n## Mezze\nLemon and oil."
    });
    const rendered = engine.renderOutputs({ seed_id: seed.id, channels: ["newsletter"] });
    const manifest = rendered.manifest as { files: Array<{ path: string; sha256: string; bytes: number }> };
    expect(manifest.files.some((f) => f.path === "newsletter.html")).toBe(true);
    expect(manifest.files.every((f) => /^[a-f0-9]{64}$/.test(f.sha256))).toBe(true);
    const onDisk = JSON.parse(readFileSync(join(engine.paths.out, seed.id, "manifest.json"), "utf8"));
    expect(onDisk.files.length).toBeGreaterThan(0);
  });
});

describe("HTML lint and verbatim overlap", () => {
  it("flags script, iframe, form, and on* handlers", () => {
    expect(lintHtml('<td bgcolor="#000"><script>x()</script></td>').join(" ")).toMatch(/script/i);
    expect(lintHtml('<td bgcolor="#000"><iframe src="x"></iframe></td>').join(" ")).toMatch(/iframe/i);
    expect(lintHtml('<td bgcolor="#000"><form action="/"></form></td>').join(" ")).toMatch(/form/i);
    expect(lintHtml('<td bgcolor="#000" onclick="x()">hi</td>').join(" ")).toMatch(/on\*/i);
  });

  it("flags a 25-word verbatim run from a source quote", () => {
    const run =
      "simmer canned chickpeas with baking soda peel the skins blend with ice water and tahini until the bowl looks like it could take a nap on the counter";
    const flags = flagVerbatimCopy(run, [
      {
        id: "S1",
        url: "https://example.com/hummus",
        title: "Hummus",
        notes: run,
        added_at: new Date().toISOString()
      }
    ]);
    expect(flags.length).toBeGreaterThan(0);
    expect(flags[0]?.source_id).toBe("S1");
  });
});

describe("X intent encoding", () => {
  it("percent-encodes ! ' ( ) * in the intent query", () => {
    const text = "Try this! It's (really) *good*";
    const encoded = encodeIntentQuery(text);
    expect(encoded).toContain("%21");
    expect(encoded).toContain("%27");
    expect(encoded).toContain("%28");
    expect(encoded).toContain("%29");
    expect(encoded).toContain("%2A");
    expect(intentUrl(text, "tweet")).toMatch(/^https:\/\/x\.com\/intent\/tweet\?text=/);
    expect(oneLinkPerPost("see https://a.example https://b.example").ok).toBe(false);
  });
});
