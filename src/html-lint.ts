export const HTML_FORBIDDEN = ["script", "iframe", "form"] as const;

export function lintHtml(html: string): string[] {
  const errors: string[] = [];
  for (const tag of HTML_FORBIDDEN) {
    const re = new RegExp(`<${tag}\\b`, "i");
    if (re.test(html)) errors.push(`Forbidden <${tag}> in HTML.`);
  }
  if (/\son[a-z]+\s*=/i.test(html)) {
    errors.push("Forbidden on* event handler in HTML.");
  }
  return errors;
}
