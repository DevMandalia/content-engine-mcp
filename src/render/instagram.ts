export type InstagramPack = {
  caption: string;
  caption_length: number;
  hashtags: string[];
  slides: { index: number; title: string; body: string }[];
  reel_script?: string;
  warnings: string[];
};

const CAPTION_LIMIT = 2200;

export function renderInstagram(markdown: string): InstagramPack {
  const warnings: string[] = [];
  const lines = markdown.split("\n");
  const tags = new Set<string>();
  const bodyLines: string[] = [];
  const slides: InstagramPack["slides"] = [];
  let reel: string | undefined;
  let mode: "body" | "slides" | "reel" = "body";
  let currentSlide: { title: string; body: string } | null = null;

  const flushSlide = () => {
    if (currentSlide) {
      slides.push({ index: slides.length + 1, title: currentSlide.title, body: currentSlide.body.trim() });
      currentSlide = null;
    }
  };

  for (const line of lines) {
    if (/^##\s+slides?/i.test(line) || /^##\s+carousel/i.test(line)) {
      flushSlide();
      mode = "slides";
      continue;
    }
    if (/^##\s+reel/i.test(line)) {
      flushSlide();
      mode = "reel";
      reel = "";
      continue;
    }
    const tagMatch = line.match(/#[\p{L}\p{N}_]+/gu);
    if (tagMatch) for (const t of tagMatch) tags.add(t);
    if (mode === "slides") {
      const slideHead = /^###\s+(.+)/.exec(line);
      if (slideHead) {
        flushSlide();
        currentSlide = { title: slideHead[1] ?? "", body: "" };
      } else if (currentSlide) {
        currentSlide.body += `${line}\n`;
      } else if (line.trim()) {
        currentSlide = { title: `Slide ${slides.length + 1}`, body: `${line}\n` };
      }
      continue;
    }
    if (mode === "reel") {
      reel = `${reel ?? ""}${line}\n`;
      continue;
    }
    bodyLines.push(line);
  }
  flushSlide();

  let caption = bodyLines.join("\n").trim();
  if (tags.size && !/#[\p{L}\p{N}_]/u.test(caption)) {
    caption = `${caption}\n\n${[...tags].join(" ")}`;
  }
  if (caption.length > CAPTION_LIMIT) {
    warnings.push(`Caption is ${caption.length} characters; Instagram limit is ${CAPTION_LIMIT}. Truncating.`);
    caption = `${caption.slice(0, CAPTION_LIMIT - 1)}…`;
  }
  if (slides.length === 0) {
    slides.push({
      index: 1,
      title: "1",
      body: caption.split("\n").filter((l) => !l.startsWith("#"))[0] ?? caption.slice(0, 80)
    });
  }
  return {
    caption,
    caption_length: caption.length,
    hashtags: [...tags],
    slides,
    reel_script: reel?.trim() || undefined,
    warnings
  };
}
