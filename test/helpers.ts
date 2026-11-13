import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ContentEngine } from "../src/engine.js";

export function tempEngine(overrides?: ConstructorParameters<typeof ContentEngine>[0] extends infer T ? Partial<T> : never) {
  const root = mkdtempSync(join(tmpdir(), "ce-mcp-"));
  return new ContentEngine({
    root,
    ...(overrides ?? {})
  });
}

export async function setupKitchen(engine: ContentEngine) {
  engine.applyTheme("taverna-daily");
  engine.setupVisionAndAudience({
    vision: "A weeknight letter for people who want mezze, not a restaurant recap.",
    audience: "Home cooks who will mash chickpeas after work.",
    promise: "One plate you can actually make on a Tuesday.",
    owner_name: "Kitchen table",
    owner_email: "kitchen@example.com"
  });
  engine.setupBrand({ name: "Taverna Daily", mood: "warm, unhurried", theme_mode: "dark" });
  engine.setupChannels({
    channels: [
      { id: "newsletter", enabled: true, cadence: "weekly", day: "thursday" },
      { id: "x", enabled: true, cadence: "3x-week" },
      { id: "instagram", enabled: true, cadence: "weekly" },
      { id: "linkedin", enabled: true, cadence: "weekly" }
    ]
  });
  engine.setupVoice({
    adjectives: ["warm", "practical", "unfussy"],
    samples: [
      "I put the garlic in cold oil and wait until the kitchen smells like someone else's house.",
      "Don't fuss the tomatoes. Crush them with your hand. If they squirt, you are doing it right.",
      "I have never measured the tahini. I stop when the hummus looks like it could take a nap."
    ]
  });
  engine.setupSourcing({ require_urls: true, allow_personal_anecdotes_unsourced: true });
  return engine;
}
