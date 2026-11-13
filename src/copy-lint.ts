import type { Source } from "./types.js";

const WORD_RUN = 25;

function wordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function ngrams(words: string[], n: number): Set<string> {
  const out = new Set<string>();
  if (words.length < n) return out;
  for (let i = 0; i <= words.length - n; i++) {
    out.add(words.slice(i, i + n).join(" "));
  }
  return out;
}

export type CopyFlag = { source_id: string; excerpt: string };

export function flagVerbatimCopy(draft: string, sources: Source[], run = WORD_RUN): CopyFlag[] {
  const draftGrams = ngrams(wordsOf(draft), run);
  if (draftGrams.size === 0) return [];
  const flags: CopyFlag[] = [];
  const seen = new Set<string>();
  for (const source of sources) {
    const blob = [source.title, source.notes, source.quote ?? ""].join(" ");
    const srcGrams = ngrams(wordsOf(blob), run);
    for (const gram of draftGrams) {
      if (srcGrams.has(gram) && !seen.has(`${source.id}:${gram}`)) {
        seen.add(`${source.id}:${gram}`);
        flags.push({ source_id: source.id, excerpt: gram });
      }
    }
  }
  return flags;
}
