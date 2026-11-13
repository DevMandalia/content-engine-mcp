export const SEED_KINDS = [
  "thesis",
  "personal_update",
  "lesson",
  "news_note",
  "meme",
  "how_to",
  "list",
  "story",
  "opinion",
  "question"
] as const;
export type SeedKind = (typeof SEED_KINDS)[number];

export const CHANNELS = ["newsletter", "x", "instagram", "linkedin"] as const;
export type Channel = (typeof CHANNELS)[number];

export const SEED_STATUSES = ["active", "killed", "developed"] as const;
export type SeedStatus = (typeof SEED_STATUSES)[number];

export const DRAFT_STATUSES = ["draft", "revision", "ready", "approved", "killed"] as const;
export type DraftStatus = (typeof DRAFT_STATUSES)[number];

export const LAYOUTS = ["classic", "digest", "editorial"] as const;
export type Layout = (typeof LAYOUTS)[number];

export type Palette = {
  background: string;
  foreground: string;
  accent: string;
  muted: string;
};

export type ChannelConfig = {
  enabled: boolean;
  cadence: string;
  day?: string;
};

export type NewsletterSection = {
  id: string;
  title: string;
  required: boolean;
  word_limit?: number;
};

export type Config = {
  version: number;
  theme: string;
  theme_mode: "light" | "dark";
  owner: { name: string; email: string };
  vision: string;
  audience: string;
  promise: string;
  brand: {
    name: string;
    mood: string;
    palette: Palette;
  };
  channels: Record<Channel, ChannelConfig>;
  newsletter: {
    layout: Layout;
    from_name: string;
    sections: NewsletterSection[];
  };
  x: {
    intent_path: "post" | "tweet";
  };
  voice: {
    adjectives: string[];
  };
  sourcing: {
    require_urls: boolean;
    allow_personal_anecdotes_unsourced: boolean;
    notes: string;
  };
  safety: {
    require_confirm_to_send: true;
    blocked_advice: string[];
  };
};

export type ThemeFile = {
  name: string;
  title?: string;
  description: string;
  mood: string;
  theme_mode: "light" | "dark";
  palettes: { light: Palette; dark: Palette };
  fallback_fonts: string[];
  word_limits: {
    newsletter: number;
    x_post: number;
    instagram_caption: number;
    linkedin: number;
    opener?: number;
  };
  voice: { adjectives: string[]; do: string[]; dont: string[] };
  banned_words: string[];
  newsletter: {
    layout: Layout;
    sections: NewsletterSection[];
  };
};

export type Seed = {
  id: string;
  title: string;
  kind: SeedKind;
  status: SeedStatus;
  created_at: string;
  updated_at: string;
  body: string;
  kill_reason?: string;
};

export type Source = {
  id: string;
  url: string;
  title: string;
  notes: string;
  quote?: string;
  fetched?: boolean;
  added_at: string;
};

export type DraftMeta = {
  seed_id: string;
  channel: Channel;
  version: number;
  status: DraftStatus;
  created_at: string;
  fact_check_ok?: boolean;
  comments: string[];
};

export type Preference = {
  id: string;
  text: string;
  source: string;
  created_at: string;
};

export class EngineError extends Error {
  constructor(message: string, public code = "ENGINE") {
    super(message);
    this.name = "EngineError";
  }
}

export function defaultConfig(): Config {
  return {
    version: 1,
    theme: "default",
    theme_mode: "light",
    owner: { name: "", email: "" },
    vision: "",
    audience: "",
    promise: "",
    brand: {
      name: "",
      mood: "",
      palette: {
        background: "#FFFFFF",
        foreground: "#111111",
        accent: "#2F6FED",
        muted: "#667085"
      }
    },
    channels: {
      newsletter: { enabled: true, cadence: "weekly", day: "thursday" },
      x: { enabled: true, cadence: "3x-week" },
      instagram: { enabled: true, cadence: "weekly" },
      linkedin: { enabled: true, cadence: "weekly" }
    },
    newsletter: {
      layout: "classic",
      from_name: "",
      sections: [
        { id: "opener", title: "This week", required: true },
        { id: "main", title: "The piece", required: true },
        { id: "close", title: "Before you go", required: false }
      ]
    },
    x: { intent_path: "post" },
    voice: { adjectives: [] },
    sourcing: {
      require_urls: true,
      allow_personal_anecdotes_unsourced: true,
      notes: ""
    },
    safety: {
      require_confirm_to_send: true,
      blocked_advice: ["financial", "medical", "legal"]
    }
  };
}
