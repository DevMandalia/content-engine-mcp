import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ContentEngine } from "../src/engine.js";
import { createServer, TOOL_NAMES } from "../src/server.js";

async function connect(root: string) {
  const engine = new ContentEngine({
    root,
    sendImpl: {
      resend: async () => ({ id: "msg_mock" })
    }
  });
  const server = createServer({ engine });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return { client, engine, close: () => Promise.all([client.close(), server.close()]) };
}

function textOf(result: { content: Array<{ type: string; text?: string }> }): string {
  return result.content.map((c) => (c.type === "text" ? c.text ?? "" : "")).join("\n");
}

async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
  const result = await client.callTool({ name, arguments: args });
  return { result, text: textOf(result as { content: Array<{ type: string; text?: string }> }), isError: Boolean((result as { isError?: boolean }).isError) };
}

describe("MCP server tools", () => {
  const closers: Array<() => Promise<unknown>> = [];
  afterEach(async () => {
    while (closers.length) await closers.pop()?.();
  });

  it("lists every advertised tool and each tool can be called", async () => {
    const root = mkdtempSync(join(tmpdir(), "ce-mcp-tools-"));
    const { client, close } = await connect(root);
    closers.push(close);

    const listed = await client.listTools();
    const names = listed.tools.map((t) => t.name).sort();
    expect(names).toEqual([...TOOL_NAMES].sort());

    const called = new Set<string>();
    const record = async (name: string, args: Record<string, unknown> = {}) => {
      const out = await call(client, name, args);
      called.add(name);
      return out;
    };

    await record("list_themes");
    await record("apply_theme", { name: "babaganoush" });
    await record("setup_vision_and_audience", {
      vision: "Weeknight mezze, not a restaurant recap.",
      audience: "Home cooks after work.",
      promise: "One plate on a Tuesday.",
      owner_name: "Alex",
      owner_email: "alex@example.com"
    });
    await record("setup_brand", { name: "Babaganoush", theme_mode: "dark" });
    await record("setup_channels", {
      channels: [
        { id: "newsletter", enabled: true, cadence: "weekly", day: "thursday" },
        { id: "x", enabled: true, cadence: "3x-week" },
        { id: "instagram", enabled: true, cadence: "weekly" },
        { id: "linkedin", enabled: true, cadence: "weekly" }
      ]
    });
    await record("setup_newsletter_sections", {
      layout: "editorial",
      sections: [
        { id: "opener", title: "From the taverna", required: true },
        { id: "plate", title: "What we are cooking", required: true }
      ]
    });
    await record("setup_voice", {
      adjectives: ["warm", "practical"],
      samples: ["I put the garlic in cold oil and wait."]
    });
    await record("setup_sourcing", { require_urls: true, allow_personal_anecdotes_unsourced: true });
    await record("get_setup");

    const captured = await record("capture_seed", {
      body: "Weeknight hummus: simmer canned chickpeas, peel the skins, blend with ice water and tahini.",
      kind: "how_to"
    });
    expect(captured.isError).toBe(false);
    const seedId = JSON.parse(captured.text).seed.id as string;

    await record("get_seed", { seed_id: seedId });
    await record("list_seeds", {});
    await record("search_seeds", { query: "hummus" });
    await record("kill_seed", { seed_id: seedId, reason: "pause" });
    await record("revive_seed", { seed_id: seedId });
    await record("build_research_brief", { seed_id: seedId });
    await record("get_research_brief", { seed_id: seedId });
    await record("attach_source", {
      seed_id: seedId,
      url: "https://example.com/hummus",
      title: "Hummus notes",
      notes: "Ice water keeps it fluffy.",
      quote: "Ice water"
    });
    await record("list_sources", { seed_id: seedId });

    for (const channel of ["newsletter", "x", "instagram", "linkedin"]) {
      await record("get_draft_kit", { seed_id: seedId, channel });
    }

    await record("save_draft", {
      seed_id: seedId,
      channel: "newsletter",
      body: "# Hummus\n\n## From the taverna\nI put the garlic in cold oil.\n\n## What we are cooking\nChickpeas and tahini."
    });
    await record("save_draft", {
      seed_id: seedId,
      channel: "x",
      body: "Warm the tahini. That is the whole trick."
    });
    await record("save_draft", {
      seed_id: seedId,
      channel: "instagram",
      body: "Warm tahini hummus.\n\n## Carousel\n### Slide 1\nChickpeas\n### Slide 2\nIce water\n\n#hummus"
    });
    await record("save_draft", {
      seed_id: seedId,
      channel: "linkedin",
      body: "The weeknight plate is hummus and warm pita.\n\nThat is the post."
    });
    await record("get_draft", { seed_id: seedId, channel: "newsletter" });
    await record("list_drafts", { seed_id: seedId });
    await record("fact_check_draft", { seed_id: seedId, channel: "newsletter" });
    await record("mark_draft_ready", { seed_id: seedId, channel: "newsletter" });
    await record("approve_draft", { seed_id: seedId, channel: "newsletter", comment: "shorter openers" });
    await record("request_revision", { seed_id: seedId, channel: "x", comment: "no emojis" });
    await record("kill_draft", { seed_id: seedId, channel: "linkedin", comment: "save for next week" });
    await record("list_learned_preferences");
    const rendered = await record("render_outputs", { seed_id: seedId, draft: true });
    expect(rendered.isError).toBe(false);

    const refused = await record("send_newsletter", {
      seed_id: seedId,
      adapter: "resend",
      confirm: false,
      test_to_self: true
    });
    expect(refused.isError).toBe(true);
    expect(refused.text).toMatch(/confirm/i);

    const sent = await record("send_newsletter", {
      seed_id: seedId,
      adapter: "resend",
      confirm: true,
      test_to_self: true
    });
    expect(sent.isError).toBe(false);

    await record("get_calendar");
    await record("get_cadence_status");

    expect([...called].sort()).toEqual([...TOOL_NAMES].sort());
  });
});
