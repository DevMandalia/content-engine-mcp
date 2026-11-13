import { describe, expect, it } from "vitest";
import { everyTdHasBgcolor, renderNewsletter } from "../src/render/newsletter.js";
import { loadTheme } from "../src/theme.js";
import { defaultConfig, type Config } from "../src/types.js";

const body = `# Weeknight hummus

## From the taverna
I put the garlic in cold oil.

## What we are cooking
Chickpeas, tahini, lemon, ice water.

## How
Simmer, peel, blend. Stop when it looks like it could take a nap.

## At the table
Warm pita. More olive oil than you think.
`;

function configWith(layout: Config["newsletter"]["layout"], themeName: string): { config: Config; theme: ReturnType<typeof loadTheme> } {
  const theme = loadTheme(themeName);
  const config = defaultConfig();
  config.theme = theme.name;
  config.theme_mode = theme.theme_mode;
  config.brand = {
    name: "Taverna Daily",
    mood: theme.mood,
    palette: theme.palettes[theme.theme_mode]
  };
  config.newsletter.layout = layout;
  config.newsletter.sections = theme.newsletter.sections;
  return { config, theme };
}

describe("newsletter HTML", () => {
  for (const layout of ["classic", "digest", "editorial"] as const) {
    it(`renders ${layout} with bgcolor on every cell`, async () => {
      const { config, theme } = configWith(layout, layout === "editorial" ? "taverna-daily" : layout === "digest" ? "default" : "minimal-plain");
      const rendered = renderNewsletter(body, config, theme);
      expect(rendered.layout).toBe(layout);
      expect(everyTdHasBgcolor(rendered.html)).toBe(true);
      expect(rendered.html).toMatch(/bgcolor="/);
      expect(rendered.gmail_clip_warning).toBe(false);
      await expect(rendered.html).toMatchFileSnapshot(`./golden/email-${layout}.html`);
    });
  }

  it("warns when HTML exceeds Gmail's ~102 KB clip limit", () => {
    const { config, theme } = configWith("classic", "default");
    const huge = `# Huge\n\n## Body\n\n${"word ".repeat(80_000)}`;
    const rendered = renderNewsletter(huge, config, theme);
    expect(rendered.gmail_clip_warning).toBe(true);
    expect(rendered.bytes).toBeGreaterThan(102 * 1024);
    expect(rendered.warnings[0]).toMatch(/102 KB/);
  });
});
