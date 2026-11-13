import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ContentEngine } from "../src/engine.js";
import { EngineError } from "../src/types.js";
import { setupKitchen, tempEngine } from "./helpers.js";

describe("wizard → config", () => {
  it("writes config.yaml and markdown files", () => {
    const engine = tempEngine();
    engine.applyTheme("taverna-daily");
    engine.setupVisionAndAudience({
      vision: "Weeknight mezze.",
      audience: "Tired cooks.",
      owner_email: "kitchen@example.com",
      owner_name: "Kitchen table"
    });
    engine.setupBrand({ name: "Taverna Daily", theme_mode: "dark" });
    engine.setupVoice({
      adjectives: ["warm"],
      samples: ["I warm the tahini until it smells like sesame, not like the jar."]
    });
    const setup = engine.getSetup();
    expect(setup.config.theme).toBe("taverna-daily");
    expect(setup.config.brand.palette.background.toUpperCase()).toBe("#12140F");
    expect(setup.config.brand.palette.accent.toUpperCase()).toBe("#A9B455");
    expect(setup.config.vision).toMatch(/mezze/i);
    expect(setup.checklist.voice).toBe(true);
  });
});

describe("seed bank", () => {
  it("captures, classifies, searches, kills, and revives", () => {
    const engine = tempEngine();
    const captured = engine.captureSeed({
      body: "Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blend with ice water and tahini.",
      kind: "how_to"
    });
    expect(captured.seed.kind).toBe("how_to");
    expect(engine.listSeeds().seeds).toHaveLength(1);
    expect(engine.searchSeeds("chickpeas").seeds).toHaveLength(1);
    engine.killSeed(captured.seed.id, "already wrote this");
    expect(engine.getSeed(captured.seed.id).status).toBe("killed");
    engine.reviveSeed(captured.seed.id);
    expect(engine.getSeed(captured.seed.id).status).toBe("active");
  });
});

describe("feedback → voice", () => {
  it("stores standing preferences into the voice guide", () => {
    const engine = tempEngine();
    setupKitchen(engine);
    const seed = engine.captureSeed({
      body: "Warm the pita on a dry pan until it blisters. That is dinner."
    }).seed;
    engine.saveDraft({
      seed_id: seed.id,
      channel: "x",
      body: "Warm the pita on a dry pan until it blisters. That is dinner."
    });
    engine.requestRevision(seed.id, "x", "shorter openers");
    engine.requestRevision(seed.id, "x", "no emojis");
    const prefs = engine.listLearnedPreferences();
    expect(prefs.preferences.map((p) => p.text)).toEqual(expect.arrayContaining(["shorter openers", "no emojis"]));
    expect(prefs.voice).toMatch(/shorter openers/);
    expect(prefs.voice).toMatch(/no emojis/);
  });
});

describe("send_newsletter confirm", () => {
  it("refuses without confirm=true and never calls the adapter", async () => {
    const engine = tempEngine();
    setupKitchen(engine);
    const seed = engine.captureSeed({ body: "A lemon and a can of chickpeas is a meal." }).seed;
    engine.saveDraft({
      seed_id: seed.id,
      channel: "newsletter",
      body: "# Lemon\n\n## From the taverna\nA lemon and a can of chickpeas is a meal."
    });
    let called = 0;
    const sending = new ContentEngine({
      root: engine.paths.root,
      sendImpl: {
        resend: async () => {
          called += 1;
          return { id: "should-not-run" };
        }
      }
    });
    await expect(
      sending.sendNewsletter({ seed_id: seed.id, adapter: "resend", confirm: false, to: "kitchen@example.com" })
    ).rejects.toBeInstanceOf(EngineError);
    await expect(
      sending.sendNewsletter({ seed_id: seed.id, adapter: "resend", confirm: false, to: "kitchen@example.com" })
    ).rejects.toThrow(/confirm/i);
    expect(called).toBe(0);
  });

  it("sends through the adapter when confirm is true", async () => {
    const engine = tempEngine();
    setupKitchen(engine);
    const seed = engine.captureSeed({ body: "A lemon and a can of chickpeas is a meal." }).seed;
    engine.saveDraft({
      seed_id: seed.id,
      channel: "newsletter",
      body: "# Lemon\n\n## From the taverna\nA lemon and a can of chickpeas is a meal."
    });
    const sending = new ContentEngine({
      root: engine.paths.root,
      sendImpl: {
        resend: async (msg) => {
          expect(msg.to).toBe("kitchen@example.com");
          expect(msg.html).toMatch(/bgcolor="/);
          return { id: "msg_test" };
        }
      }
    });
    const result = await sending.sendNewsletter({
      seed_id: seed.id,
      adapter: "resend",
      confirm: true,
      test_to_self: true
    });
    expect(result.ok).toBe(true);
    expect(result.id).toBe("msg_test");
  });
});

describe("render fact-check gate", () => {
  it("blocks newsletter render on unsourced numbers, allows draft=true with warnings", () => {
    const engine = tempEngine();
    setupKitchen(engine);
    const seed = engine.captureSeed({ body: "How salty should pasta water be, really?" }).seed;
    engine.saveDraft({
      seed_id: seed.id,
      channel: "newsletter",
      body: "# Salt\n\n## From the taverna\nPasta water at 1% salt is the usual advice."
    });
    expect(() => engine.renderOutputs({ seed_id: seed.id, channels: ["newsletter"] })).toThrow(/blocked/i);
    const drafted = engine.renderOutputs({ seed_id: seed.id, channels: ["newsletter"], draft: true });
    expect(drafted.draft).toBe(true);
    expect(drafted.warnings.some((w) => /fact-check/i.test(w))).toBe(true);
  });

  it("renders after a [S1] citation is attached", async () => {
    const engine = tempEngine();
    setupKitchen(engine);
    const seed = engine.captureSeed({ body: "How salty should pasta water be, really?" }).seed;
    await engine.attachSource({
      seed_id: seed.id,
      url: "https://example.com/pasta-water",
      title: "On salting pasta water",
      notes: "1% salt by weight is a common starting point.",
      quote: "1% salt by weight"
    });
    engine.saveDraft({
      seed_id: seed.id,
      channel: "newsletter",
      body: "# Salt\n\n## From the taverna\nPasta water at 1% salt is a starting point [S1]."
    });
    engine.markDraftReady(seed.id, "newsletter");
    const rendered = engine.renderOutputs({ seed_id: seed.id, channels: ["newsletter"] });
    expect(rendered.ok).toBe(true);
    expect(rendered.issue.sources).toEqual([
      expect.objectContaining({ id: "S1", url: "https://example.com/pasta-water" })
    ]);
  });
});

describe("source ids", () => {
  it("assigns S1, S2 sequentially and rejects private URLs", async () => {
    const engine = tempEngine();
    setupKitchen(engine);
    const seed = engine.captureSeed({ body: "Tahini from a jar can still taste like sesame." }).seed;
    const first = await engine.attachSource({
      seed_id: seed.id,
      url: "https://example.com/tahini",
      title: "Tahini note"
    });
    const second = await engine.attachSource({
      seed_id: seed.id,
      url: "https://example.com/chickpeas",
      title: "Chickpeas"
    });
    expect(first.source.id).toBe("S1");
    expect(second.source.id).toBe("S2");
    await expect(
      engine.attachSource({ seed_id: seed.id, url: "http://127.0.0.1/secret" })
    ).rejects.toThrow(/Blocked/i);
  });
});

describe("project isolation", () => {
  it("does not share state across roots", () => {
    const a = new ContentEngine({ root: mkdtempSync(join(tmpdir(), "ce-a-")) });
    const b = new ContentEngine({ root: mkdtempSync(join(tmpdir(), "ce-b-")) });
    a.captureSeed({ body: "Only in A." });
    expect(b.listSeeds().seeds).toHaveLength(0);
  });
});
