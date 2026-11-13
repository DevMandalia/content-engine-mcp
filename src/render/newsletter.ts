import { GMAIL_CLIP_BYTES } from "../version.js";
import type { Config, Layout, Palette } from "../types.js";
import type { ThemeFile } from "../types.js";

export const UNSUBSCRIBE_TOKEN = "{{unsubscribe_url}}";

export type NewsletterIssueInput = {
  title: string;
  preheader?: string;
  sections: { id: string; title: string; html: string; text: string }[];
  footer?: string;
};

export type NewsletterRender = {
  html: string;
  markdown: string;
  layout: Layout;
  bytes: number;
  gmail_clip_warning: boolean;
  warnings: string[];
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mdToInline(md: string): string {
  const escaped = esc(md).replace(/\n/g, "<br>");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" style="color:inherit;text-decoration:underline;">$1</a>');
}

function td(
  inner: string,
  palette: Palette,
  extra = "",
  bgcolor?: string,
  color?: string
): string {
  const bg = bgcolor ?? palette.background;
  const fg = color ?? palette.foreground;
  return `<td bgcolor="${bg}" valign="top" style="background-color:${bg};color:${fg};${extra}">${inner}</td>`;
}

function table(inner: string, bgcolor: string, width = "100%"): string {
  return `<table role="presentation" width="${width}" cellpadding="0" cellspacing="0" border="0" bgcolor="${bgcolor}" style="background-color:${bgcolor};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">${inner}</table>`;
}

function wrapEmail(bodyRows: string, palette: Palette, fonts: string[], preheader: string): string {
  const font = fonts.map((f) => (f.includes(" ") ? `'${f}'` : f)).join(", ");
  const preview = esc(preheader);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Newsletter</title>
</head>
<body bgcolor="${palette.background}" style="margin:0;padding:0;background-color:${palette.background};color:${palette.foreground};font-family:${font};">
${table(
  `<tr><td bgcolor="${palette.background}" style="background-color:${palette.background};color:${palette.background};font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preview}</td></tr>
<tr>${td(
    table(
      bodyRows,
      palette.background,
      "600"
    ),
    palette,
    "padding:24px 12px;"
  )}</tr>`,
  palette.background
)}
</body>
</html>`;
}

function classic(input: NewsletterIssueInput, palette: Palette, fonts: string[]): string {
  const rows: string[] = [];
  rows.push(
    `<tr>${td(`<h1 style="margin:0 0 8px;font-size:28px;line-height:1.2;color:${palette.foreground};">${esc(input.title)}</h1>`, palette, "padding:16px 24px 8px;")}</tr>`
  );
  rows.push(
    `<tr>${td(`<hr style="border:none;border-top:3px solid ${palette.accent};margin:0;">`, palette, "padding:0 24px 16px;")}</tr>`
  );
  for (const section of input.sections) {
    rows.push(
      `<tr>${td(
        `<h2 style="margin:0 0 8px;font-size:18px;color:${palette.accent};">${esc(section.title)}</h2><p style="margin:0;font-size:16px;line-height:1.55;">${section.html}</p>`,
        palette,
        "padding:8px 24px 20px;"
      )}</tr>`
    );
  }
  if (input.footer) {
    rows.push(
      `<tr>${td(input.footer, palette, `padding:16px 24px 24px;border-top:1px solid ${palette.muted};`)}</tr>`
    );
  }
  return wrapEmail(rows.join(""), palette, fonts, input.preheader ?? input.title);
}

function digest(input: NewsletterIssueInput, palette: Palette, fonts: string[]): string {
  const cards = input.sections
    .map((section, i) => {
      const cardBg = i % 2 === 0 ? palette.background : palette.muted;
      const cardFg = i % 2 === 0 ? palette.foreground : palette.background;
      return `<tr>${td(
        table(
          `<tr>${td(
            `<p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${palette.accent};">${String(i + 1).padStart(2, "0")}</p><h2 style="margin:0 0 8px;font-size:18px;color:${cardFg};">${esc(section.title)}</h2><p style="margin:0;font-size:15px;line-height:1.5;color:${cardFg};">${section.html}</p>`,
            { ...palette, background: cardBg, foreground: cardFg },
            "padding:16px;"
          )}</tr>`,
          cardBg
        ),
        palette,
        "padding:0 24px 12px;"
      )}</tr>`;
    })
    .join("");
  const header = `<tr>${td(`<h1 style="margin:0;font-size:26px;color:${palette.foreground};">${esc(input.title)}</h1>`, palette, "padding:20px 24px;")}</tr>`;
  const footer = input.footer
    ? `<tr>${td(input.footer, palette, "padding:16px 24px 24px;")}</tr>`
    : "";
  return wrapEmail(header + cards + footer, palette, fonts, input.preheader ?? input.title);
}

function editorial(input: NewsletterIssueInput, palette: Palette, fonts: string[]): string {
  const [first, ...rest] = input.sections;
  const pull = first ? first.text.split(/(?<=[.!?])\s+/)[0] ?? first.title : input.title;
  const rows: string[] = [];
  rows.push(
    `<tr>${td(
      `<p style="margin:0 0 12px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:${palette.accent};">${esc("Issue")}</p><h1 style="margin:0 0 16px;font-size:32px;line-height:1.15;color:${palette.foreground};">${esc(input.title)}</h1>`,
      palette,
      "padding:28px 28px 8px;"
    )}</tr>`
  );
  rows.push(
    `<tr>${td(
      `<p style="margin:0;font-size:20px;line-height:1.4;font-style:italic;color:${palette.muted};">${esc(pull)}</p>`,
      palette,
      `padding:8px 28px 24px;border-left:4px solid ${palette.accent};`
    )}</tr>`
  );
  if (first) {
    rows.push(
      `<tr>${td(
        `<h2 style="margin:0 0 8px;font-size:16px;color:${palette.accent};">${esc(first.title)}</h2><p style="margin:0;font-size:16px;line-height:1.6;">${first.html}</p>`,
        palette,
        "padding:8px 28px 20px;"
      )}</tr>`
    );
  }
  for (const section of rest) {
    rows.push(
      `<tr>${td(
        `<h2 style="margin:0 0 8px;font-size:16px;color:${palette.accent};">${esc(section.title)}</h2><p style="margin:0;font-size:16px;line-height:1.6;">${section.html}</p>`,
        palette,
        "padding:8px 28px 20px;"
      )}</tr>`
    );
  }
  if (input.footer) {
    rows.push(`<tr>${td(input.footer, palette, "padding:16px 28px 28px;")}</tr>`);
  }
  return wrapEmail(rows.join(""), palette, fonts, input.preheader ?? input.title);
}

export function parseNewsletterMarkdown(markdown: string, config: Config): NewsletterIssueInput {
  const titleMatch = /^#\s+(.+)$/m.exec(markdown);
  const title = titleMatch?.[1]?.trim() || config.brand.name || "Untitled issue";
  const sections: NewsletterIssueInput["sections"] = [];
  const chunks = markdown.split(/^##\s+/m);
  for (const chunk of chunks.slice(1)) {
    const nl = chunk.indexOf("\n");
    const heading = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    const body = (nl === -1 ? "" : chunk.slice(nl + 1)).trim();
    const known = config.newsletter.sections.find(
      (s) => s.title.toLowerCase() === heading.toLowerCase() || s.id === heading.toLowerCase()
    );
    sections.push({
      id: known?.id ?? heading.toLowerCase().replace(/\s+/g, "-"),
      title: known?.title ?? heading,
      text: body,
      html: mdToInline(body)
    });
  }
  if (sections.length === 0) {
    const body = markdown.replace(/^#\s+.+\n*/, "").trim();
    sections.push({
      id: config.newsletter.sections[0]?.id ?? "body",
      title: config.newsletter.sections[0]?.title ?? "Body",
      text: body,
      html: mdToInline(body)
    });
  }
  return { title, preheader: title, sections, footer: defaultFooterHtml(config, paletteForParse(config)) };
}

function paletteForParse(config: Config): Palette {
  return config.brand.palette;
}

export function defaultFooterHtml(config: Config, palette: Palette): string {
  const brand = esc(config.brand.name || "This list");
  return `<p style="margin:0;font-size:13px;color:${palette.muted};">${brand} · You can reply to this email.</p>
<p style="margin:8px 0 0;font-size:12px;color:${palette.muted};"><a href="${UNSUBSCRIBE_TOKEN}" style="color:${palette.muted};text-decoration:underline;">Unsubscribe</a></p>`;
}

export function renderNewsletter(
  markdown: string,
  config: Config,
  theme: ThemeFile
): NewsletterRender {
  const input = parseNewsletterMarkdown(markdown, config);
  const palette = config.brand.palette;
  const fonts = theme.fallback_fonts;
  const layout = config.newsletter.layout;
  let html: string;
  if (layout === "digest") html = digest(input, palette, fonts);
  else if (layout === "editorial") html = editorial(input, palette, fonts);
  else html = classic(input, palette, fonts);

  const warnings: string[] = [];
  const bytes = Buffer.byteLength(html, "utf8");
  const gmail_clip_warning = bytes > GMAIL_CLIP_BYTES;
  if (gmail_clip_warning) {
    warnings.push(
      `HTML is ${bytes} bytes; Gmail clips around ${GMAIL_CLIP_BYTES} bytes (~102 KB). Shorten the issue.`
    );
  }
  const mdOut = [`# ${input.title}`, "", ...input.sections.flatMap((s) => [`## ${s.title}`, "", s.text, ""])].join(
    "\n"
  );
  return { html, markdown: mdOut.trim() + "\n", layout, bytes, gmail_clip_warning, warnings };
}

export type EmailRenderer = (markdown: string, config: Config, theme: ThemeFile) => NewsletterRender;
export const tableEmailRenderer: EmailRenderer = renderNewsletter;

export function everyTdHasBgcolor(html: string): boolean {
  const tds = html.match(/<td\b[^>]*>/gi) ?? [];
  return tds.length > 0 && tds.every((td) => /bgcolor="/i.test(td));
}
