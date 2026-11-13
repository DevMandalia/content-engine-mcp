export type VoiceAnalysis = {
  adjectives: string[];
  avg_sentence_length: number;
  uses_emoji: boolean;
  uses_contractions: boolean;
  uses_first_person: boolean;
  uses_questions: boolean;
  sample_lines: string[];
  do: string[];
  dont: string[];
};

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const CONTRACTION_RE = /\b(?:['’](?:t|s|re|ve|ll|d|m)|n't)\b/i;
const FIRST_PERSON_RE = /\b(?:I|I'm|I’ve|I'd|I'll|me|my|we|we're|our)\b/;

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function analyzeVoice(adjectives: string[], samples: string[]): VoiceAnalysis {
  const blob = samples.join("\n\n");
  const sentences = sentencesOf(blob);
  const lengths = sentences.map((s) => s.split(/\s+/).length);
  const avg = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 0;
  const usesEmoji = EMOJI_RE.test(blob);
  const usesContractions = CONTRACTION_RE.test(blob);
  const usesFirstPerson = FIRST_PERSON_RE.test(blob);
  const usesQuestions = sentences.some((s) => s.endsWith("?"));
  const sampleLines = sentences.slice(0, 3);

  const dos: string[] = [];
  const donts: string[] = [];
  if (adjectives.length) dos.push(`Sound ${adjectives.join(", ")}.`);
  if (avg > 0 && avg <= 14) dos.push("Keep sentences short (about the sample length).");
  if (avg >= 22) dos.push("Allow a longer, essay-like sentence when the point needs it.");
  if (usesFirstPerson) dos.push("Write in first person when telling what you cooked, tried, or learned.");
  if (usesContractions) dos.push("Contractions are fine.");
  else donts.push("Do not force contractions if the samples are formal.");
  if (usesQuestions) dos.push("A genuine question to the reader is in-voice.");
  if (!usesEmoji) donts.push("No emoji unless the user later asks for them.");
  donts.push("Do not invent statistics, dollar amounts, or dates.");
  donts.push("Do not give financial, medical, or legal advice.");
  donts.push("Do not sound like a press release or a growth-hack thread.");

  return {
    adjectives,
    avg_sentence_length: avg,
    uses_emoji: usesEmoji,
    uses_contractions: usesContractions,
    uses_first_person: usesFirstPerson,
    uses_questions: usesQuestions,
    sample_lines: sampleLines,
    do: dos,
    dont: donts
  };
}

export function renderVoiceGuide(
  analysis: VoiceAnalysis,
  extras?: { themeDo?: string[]; themeDont?: string[]; learned?: string[]; banned?: string[] }
): string {
  const lines: string[] = ["# Voice guide", ""];
  if (analysis.adjectives.length) {
    lines.push(`Adjectives: ${analysis.adjectives.join(", ")}`, "");
  }
  lines.push("## Do");
  for (const item of [...analysis.do, ...(extras?.themeDo ?? [])]) lines.push(`- ${item}`);
  lines.push("", "## Don't");
  for (const item of [...analysis.dont, ...(extras?.themeDont ?? [])]) lines.push(`- ${item}`);
  if (extras?.banned?.length) {
    lines.push("", "## Banned words / phrases");
    for (const w of extras.banned) lines.push(`- ${w}`);
  }
  if (analysis.sample_lines.length) {
    lines.push("", "## Lines from your samples (match this grain)");
    for (const s of analysis.sample_lines) lines.push(`> ${s}`);
  }
  if (extras?.learned?.length) {
    lines.push("", "## Learned preferences (from your feedback)");
    for (const p of extras.learned) lines.push(`- ${p}`);
  }
  lines.push("");
  return lines.join("\n");
}

const PREFERENCE_HINT =
  /^(always|never|don't|do not|no |avoid |prefer |shorter |longer |less |more |keep |use |skip |drop )/i;

export function looksLikeStandingPreference(comment: string): boolean {
  const t = comment.trim();
  if (t.length < 4) return false;
  if (/^(preference|standing):/i.test(t)) return true;
  return PREFERENCE_HINT.test(t);
}
