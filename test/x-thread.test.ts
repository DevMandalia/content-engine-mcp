import { describe, expect, it } from "vitest";
import { splitThread, weightedLength } from "../src/x-thread.js";

describe("splitThread", () => {
  it("keeps a short post as a single tweet with one intent link", () => {
    const text = "Warm the tahini. That is the whole trick.";
    const split = splitThread(text);
    expect(split.tweets).toHaveLength(1);
    expect(split.numbered).toBe(false);
    expect(split.tweets[0]?.intent_url).toBe(
      `https://x.com/intent/post?text=${encodeURIComponent(text)}`
    );
    expect(split.tweets[0]?.valid).toBe(true);
  });

  it("counts URLs as 23 weighted characters via twitter-text", () => {
    const url = "https://www.example.com/hummus/weeknight-method-that-is-quite-long";
    const withUrl = `Read this ${url}`;
    const without = "Read this " + "x".repeat(url.length);
    expect(weightedLength(withUrl)).toBeLessThan(weightedLength(without));
    expect(weightedLength(withUrl)).toBeGreaterThan(10);
  });

  it("returns numbered separate intent links for a long thread", async () => {
    const paragraphs = Array.from({ length: 8 }, (_, i) => {
      return `Plate ${i + 1}: ${"hummus and warm pita and olive oil ".repeat(8)}`;
    });
    const split = splitThread(paragraphs.join("\n\n"));
    expect(split.tweets.length).toBeGreaterThan(1);
    expect(split.numbered).toBe(true);
    const urls = new Set(split.tweets.map((t) => t.intent_url));
    expect(urls.size).toBe(split.tweets.length);
    for (const tweet of split.tweets) {
      expect(tweet.text.startsWith(`${tweet.index}/${tweet.total} `)).toBe(true);
      expect(tweet.intent_url.startsWith("https://x.com/intent/post?text=")).toBe(true);
      expect(tweet.valid).toBe(true);
      expect(tweet.weighted_length).toBeLessThanOrEqual(280);
    }
    const golden = {
      numbered: split.numbered,
      count: split.tweets.length,
      prefixes: split.tweets.map((t) => t.text.slice(0, 12)),
      all_valid: split.tweets.every((t) => t.valid)
    };
    await expect(JSON.stringify(golden, null, 2) + "\n").toMatchFileSnapshot("./golden/x-thread.json");
  });
});
