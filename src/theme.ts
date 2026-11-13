import { readdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { themesDir } from "./paths.js";
import type { Config, Palette, ThemeFile } from "./types.js";
import { EngineError } from "./types.js";
import { readYamlFile } from "./yaml-io.js";

const PaletteSchema = z.object({
  background: z.string(),
  foreground: z.string(),
  accent: z.string(),
  muted: z.string()
});

export const ThemeSchema = z.object({
  name: z.string(),
  description: z.string(),
  mood: z.string(),
  theme_mode: z.enum(["light", "dark"]),
  palettes: z.object({
    light: PaletteSchema,
    dark: PaletteSchema
  }),
  fallback_fonts: z.array(z.string()).min(1),
  word_limits: z.object({
    newsletter: z.number(),
    x_post: z.number(),
    instagram_caption: z.number(),
    linkedin: z.number(),
    opener: z.number().optional()
  }),
  voice: z.object({
    adjectives: z.array(z.string()).default([]),
    do: z.array(z.string()).default([]),
    dont: z.array(z.string()).default([])
  }),
  banned_words: z.array(z.string()).default([]),
  newsletter: z.object({
    layout: z.enum(["classic", "digest", "editorial"]),
    sections: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        required: z.boolean().default(false),
        word_limit: z.number().optional()
      })
    )
  })
});

export function listThemeNames(): string[] {
  return readdirSync(themesDir())
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => f.replace(/\.ya?ml$/, ""))
    .sort();
}

export function loadTheme(name: string): ThemeFile {
  const file = join(themesDir(), `${name}.yaml`);
  const raw = readYamlFile<unknown>(file, null);
  if (raw == null) {
    throw new EngineError(`Unknown theme "${name}". Available: ${listThemeNames().join(", ")}`, "THEME");
  }
  const parsed = ThemeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new EngineError(`Theme ${name} failed schema: ${parsed.error.message}`, "THEME");
  }
  return parsed.data as ThemeFile;
}

export function paletteFor(theme: ThemeFile, mode: "light" | "dark"): Palette {
  return theme.palettes[mode];
}

export function applyThemeToConfig(config: Config, theme: ThemeFile): Config {
  const mode = theme.theme_mode;
  return {
    ...config,
    theme: theme.name,
    theme_mode: mode,
    brand: {
      ...config.brand,
      name: config.brand.name || theme.name,
      mood: theme.mood,
      palette: paletteFor(theme, mode)
    },
    newsletter: {
      ...config.newsletter,
      layout: theme.newsletter.layout,
      from_name: config.newsletter.from_name || config.brand.name || theme.name,
      sections: theme.newsletter.sections
    },
    voice: {
      adjectives: config.voice.adjectives.length ? config.voice.adjectives : theme.voice.adjectives
    }
  };
}
