import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const twitterText = require("twitter-text") as {
  parseTweet: (text: string) => { weightedLength: number; valid: boolean };
};

export const X_WEIGHTED_MAX = 280;
export const INTENT_ENCODE_EXTRA = /[!'()*]/g;

export type IntentPath = "post" | "tweet";

export function parseTweet(text: string) {
  return twitterText.parseTweet(text);
}

export function isValidTweet(text: string): boolean {
  return parseTweet(text).valid && parseTweet(text).weightedLength <= X_WEIGHTED_MAX;
}

export function weightedLength(text: string): number {
  return parseTweet(text).weightedLength;
}

export function splitIntoTweets(body: string): string[] {
  const chunks = body
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);
  if (chunks.length === 0) return [];
  const packed: string[] = [];
  for (const chunk of chunks) {
    if (isPackable(chunk)) {
      packed.push(chunk);
      continue;
    }
    packed.push(...splitLong(chunk));
  }
  return packed;
}

function prefixRoom(n: number): number {
  const sample = `${n}/${n} `;
  return X_WEIGHTED_MAX - weightedLength(sample);
}

function isPackable(text: string): boolean {
  return weightedLength(text) <= prefixRoom(12);
}

function splitLong(text: string): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = "";
  const room = prefixRoom(12);
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (weightedLength(next) <= room) {
      current = next;
    } else {
      if (current) out.push(current);
      if (weightedLength(word) > room) {
        out.push(...hardSplit(word, room));
        current = "";
      } else {
        current = word;
      }
    }
  }
  if (current) out.push(current);
  return out;
}

function hardSplit(word: string, room: number): string[] {
  const out: string[] = [];
  let rest = word;
  while (rest.length) {
    let lo = 1;
    let hi = rest.length;
    let best = 1;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (weightedLength(rest.slice(0, mid)) <= room) {
        best = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    out.push(rest.slice(0, best));
    rest = rest.slice(best);
  }
  return out;
}

export function numberThread(tweets: string[]): string[] {
  if (tweets.length <= 1) return tweets;
  const n = tweets.length;
  return tweets.map((t, i) => `${i + 1}/${n} ${t}`);
}

export function composeThread(body: string): { tweets: string[]; valid: boolean[] } {
  const tweets = numberThread(splitIntoTweets(body));
  return { tweets, valid: tweets.map(isValidTweet) };
}

export function encodeIntentQuery(value: string): string {
  return encodeURIComponent(value).replace(INTENT_ENCODE_EXTRA, (ch) => {
    return `%${ch.charCodeAt(0).toString(16).toUpperCase()}`;
  });
}

export function intentUrl(text: string, path: IntentPath = "post"): string {
  const p = path === "tweet" ? "tweet" : "post";
  return `https://x.com/intent/${p}?text=${encodeIntentQuery(text)}`;
}

const HASHTAG_RE = /(?:^|\s)(#[\p{L}\p{N}_]+)/gu;

export function extractHashtags(text: string): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(HASHTAG_RE)) {
    const tag = (m[1] ?? "").toLowerCase();
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  }
  return tags;
}

export function oneLinkPerPost(text: string): { ok: boolean; links: string[] } {
  const links = text.match(/https?:\/\/[^\s]+/gi) ?? [];
  return { ok: links.length <= 1, links };
}

export type XPack = {
  tweets: { text: string; weighted_length: number; valid: boolean; intent_url: string; hashtags: string[] }[];
  all_valid: boolean;
  extra_hashtags: string[];
};

export function buildXPack(body: string, extraHashtags: string[] = [], intentPath: IntentPath = "post"): XPack {
  const { tweets, valid } = composeThread(body);
  const extras = extraHashtags
    .map((h) => (h.startsWith("#") ? h : `#${h}`))
    .map((h) => h.toLowerCase());
  return {
    extra_hashtags: extras,
    all_valid: valid.every(Boolean),
    tweets: tweets.map((text, i) => {
      const withTags =
        i === tweets.length - 1 && extras.length
          ? `${text} ${extras.filter((t) => !text.toLowerCase().includes(t)).join(" ")}`.trim()
          : text;
      const links = oneLinkPerPost(withTags);
      const ok = isValidTweet(withTags) && links.ok;
      return {
        text: withTags,
        weighted_length: weightedLength(withTags),
        valid: ok,
        intent_url: intentUrl(withTags, intentPath),
        hashtags: extractHashtags(withTags)
      };
    })
  };
}

export type SplitThread = {
  numbered: boolean;
  intent_path: IntentPath;
  extra_hashtags: string[];
  tweets: (XPack["tweets"][number] & { index: number; total: number; more_than_one_link: boolean })[];
};

export function splitThread(body: string, extraHashtags: string[] = [], intentPath: IntentPath = "post"): SplitThread {
  const pack = buildXPack(body, extraHashtags, intentPath);
  const total = pack.tweets.length;
  return {
    numbered: total > 1,
    intent_path: intentPath,
    extra_hashtags: pack.extra_hashtags,
    tweets: pack.tweets.map((t, i) => ({
      ...t,
      index: i + 1,
      total,
      more_than_one_link: !oneLinkPerPost(t.text).ok
    }))
  };
}
