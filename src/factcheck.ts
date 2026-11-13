export type FactFlag = {
  sentence: string;
  reason: "number" | "percent" | "money" | "date" | "unknown_citation";
  citations: string[];
};

export type FactCheckResult = {
  ok: boolean;
  flagged_text: string;
  flags: FactFlag[];
  cited_ids: string[];
  missing_ids: string[];
};

const CITE_RE = /\[S(\d+)\]/g;
const MONEY_RE = /(?:[$€£]\s?\d[\d,]*(?:\.\d+)?)/;
const PERCENT_RE = /\d[\d,]*(?:\.\d+)?\s?%/;
const NUMBER_RE = /(?<![\w.])(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?![\dA-Za-z])/;
const MONTH =
  "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DATE_RE = new RegExp(
  String.raw`\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/.]\d{1,2}[/.]\d{2,4}|${MONTH}\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}\s+${MONTH}\s+\d{4}|(?:19|20)\d{2})\b`,
  "i"
);

function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\n+/)) {
    const trimmed = skipListMarker(line.trim());
    if (!trimmed) continue;
    const parts = trimmed
      .split(/(?<=[.!?])\s+(?=[A-Z“"(])/)
      .map((s) => s.trim())
      .filter(Boolean);
    out.push(...(parts.length ? parts : [trimmed]));
  }
  return out;
}

function citationsIn(text: string): string[] {
  const ids: string[] = [];
  const re = new RegExp(CITE_RE.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    ids.push(`S${match[1]}`);
  }
  return ids;
}

function skipListMarker(sentence: string): string {
  return sentence.replace(/^\s*(?:\d+[.)]|[-*+])\s+/, "");
}

function claimKind(sentence: string): FactFlag["reason"] | null {
  const body = skipListMarker(sentence);
  if (MONEY_RE.test(body)) return "money";
  if (PERCENT_RE.test(body)) return "percent";
  if (DATE_RE.test(body)) return "date";
  if (NUMBER_RE.test(body)) return "number";
  return null;
}

export function factCheck(text: string, knownSourceIds: string[]): FactCheckResult {
  const known = new Set(knownSourceIds);
  const flags: FactFlag[] = [];
  const cited = new Set<string>();
  const sentences = splitSentences(text);
  const flaggedSentences: string[] = [];

  for (const sentence of sentences) {
    const cites = citationsIn(sentence);
    for (const id of cites) cited.add(id);
    const unknown = cites.filter((id) => !known.has(id));
    const kind = claimKind(sentence);
    const needsCite = kind !== null;
    const hasValidCite = cites.some((id) => known.has(id));

    if (unknown.length > 0) {
      flags.push({ sentence, reason: "unknown_citation", citations: unknown });
    }
    if (needsCite && !hasValidCite) {
      flags.push({ sentence, reason: kind ?? "number", citations: cites });
      if (!sentence.includes("[UNSOURCED]")) {
        flaggedSentences.push(sentence.replace(/([.!?])?\s*$/, " [UNSOURCED]$1"));
        continue;
      }
    }
    flaggedSentences.push(sentence);
  }

  const missing = [...cited].filter((id) => !known.has(id));
  return {
    ok: flags.length === 0,
    flagged_text: flaggedSentences.join("\n\n"),
    flags,
    cited_ids: [...cited],
    missing_ids: missing
  };
}
