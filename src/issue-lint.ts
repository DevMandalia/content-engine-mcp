export const SUBJECT_MAX = 90;
export const PREHEADER_MAX = 110;

export type IssueHeader = {
  subject: string;
  preheader: string;
  subjectAlternatives: string[];
};

export function lintIssueHeaders(input: {
  subject?: string;
  preheader?: string;
  subjectAlternatives?: string[];
  title: string;
}): { headers: IssueHeader; errors: string[] } {
  const subject = (input.subject ?? input.title).trim();
  const preheader = (input.preheader ?? input.title).trim();
  const subjectAlternatives = (input.subjectAlternatives ?? []).map((s) => s.trim()).filter(Boolean);
  const errors: string[] = [];
  if (subject.length === 0) errors.push("subject is empty.");
  if (subject.length > SUBJECT_MAX) errors.push(`subject is ${subject.length} characters (max ${SUBJECT_MAX}).`);
  if (preheader.length > PREHEADER_MAX) {
    errors.push(`preheader is ${preheader.length} characters (max ${PREHEADER_MAX}).`);
  }
  for (const alt of subjectAlternatives) {
    if (alt.length > SUBJECT_MAX) {
      errors.push(`subject alternative "${alt.slice(0, 24)}…" is ${alt.length} characters (max ${SUBJECT_MAX}).`);
    }
  }
  return { headers: { subject, preheader, subjectAlternatives }, errors };
}
