import { createRequire } from "node:module";
import type { ParsedTweet } from "twitter-text";

const twitterText = createRequire(import.meta.url)("twitter-text") as {
  parseTweet: (text: string) => ParsedTweet;
};
const parseTweet = twitterText.parseTweet;

export type ThreadTweet = {
  index: number;
  total: number;
  text: string;
  weighted_length: number;
  valid: boolean;
  intent_url: string;
};

export type ThreadSplit = {
  tweets: ThreadTweet[];
  numbered: boolean;
};

const SENTENCE_SPLIT = /(?<=[.!?])\s+|\n+/;

export function weightedLength(text: string): number {
  return parseTweet(text).weightedLength;
}

export function isValidTweet(text: string): boolean {
  return parseTweet(text).valid;
}

function intentUrl(text: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
}

function packable(text: string): boolean {
  // Always leave room for "12/12 " numbering.
  return parseTweet(`12/12 ${text}`).valid;
}

function splitOversized(text: string): string[] {
  if (packable(text)) return [text];
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (packable(next)) {
      current = next;
    } else if (current) {
      chunks.push(current);
      current = packable(word) ? word : word.slice(0, 120);
    } else {
      chunks.push(word.slice(0, 120));
      current = "";
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function units(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const bits: string[] = [];
  for (const para of paragraphs) {
    if (isValidTweet(para)) {
      bits.push(para);
      continue;
    }
    const sentences = para.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);
    for (const sentence of sentences) bits.push(...splitOversized(sentence));
  }
  return bits.length > 0 ? bits : splitOversized(text.trim());
}

function withNumber(text: string, index: number, total: number): string {
  if (total <= 1) return text;
  return `${index}/${total} ${text}`;
}

export function splitThread(text: string): ThreadSplit {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return { tweets: [], numbered: false };

  if (isValidTweet(cleaned)) {
    const parsed = parseTweet(cleaned);
    return {
      numbered: false,
      tweets: [
        {
          index: 1,
          total: 1,
          text: cleaned,
          weighted_length: parsed.weightedLength,
          valid: parsed.valid,
          intent_url: intentUrl(cleaned)
        }
      ]
    };
  }

  const packed: string[] = [];
  let current = "";
  for (const unit of units(cleaned)) {
    const pieces = packable(unit) ? [unit] : splitOversized(unit);
    for (const piece of pieces) {
      const next = current ? `${current} ${piece}` : piece;
      if (packable(next)) {
        current = next;
      } else {
        if (current) packed.push(current);
        current = piece;
      }
    }
  }
  if (current) packed.push(current);

  const total = packed.length;
  const numbered = total > 1;
  const tweets = packed.map((body, i) => {
    const textOut = numbered ? withNumber(body, i + 1, total) : body;
    const parsed = parseTweet(textOut);
    return {
      index: i + 1,
      total,
      text: textOut,
      weighted_length: parsed.weightedLength,
      valid: parsed.valid,
      intent_url: intentUrl(textOut)
    };
  });
  return { tweets, numbered };
}
