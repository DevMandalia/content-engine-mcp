import { describe, expect, it } from "vitest";
import { factCheck } from "../src/factcheck.js";

describe("factCheck", () => {
  it("flags numbers, percents, money, and dates without [S#]", async () => {
    const text = [
      "Simmer the chickpeas with a pinch of baking soda.",
      "Salt the water at 1% by weight.",
      "Tahini ran $12 a jar last winter.",
      "On 12 January 2024 I finally peeled the skins.",
      "The pan was 12 inches across."
    ].join("\n\n");
    const result = factCheck(text, ["S1"]);
    expect(result.ok).toBe(false);
    const reasons = result.flags.map((f) => f.reason);
    expect(reasons).toContain("percent");
    expect(reasons).toContain("money");
    expect(reasons).toContain("date");
    expect(reasons).toContain("number");
    expect(result.flagged_text).toMatch(/\[UNSOURCED\]/);
    await expect(result.flagged_text).toMatchFileSnapshot("./golden/factcheck-unsourced.md");
  });

  it("passes when the sentence cites an attached source", () => {
    const text = "Salt the water at 1% by weight [S1]. The rest is taste.";
    const result = factCheck(text, ["S1"]);
    expect(result.ok).toBe(true);
    expect(result.flagged_text).not.toMatch(/UNSOURCED/);
  });

  it("flags unknown citation ids", () => {
    const result = factCheck("The oven hit 400 [S9].", ["S1"]);
    expect(result.ok).toBe(false);
    expect(result.missing_ids).toContain("S9");
  });

  it("does not treat list markers as claims", () => {
    const result = factCheck("1. Rinse the chickpeas.\n2. Warm the tahini.", []);
    expect(result.ok).toBe(true);
  });
});
