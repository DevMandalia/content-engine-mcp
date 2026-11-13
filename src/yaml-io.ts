import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import YAML from "yaml";

export function readYamlFile<T>(path: string, fallback: T): T {
  try {
    const parsed = YAML.parse(readFileSync(path, "utf8"));
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function writeYamlFile(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, YAML.stringify(value, { lineWidth: 0 }), "utf8");
}

export function readTextFile(path: string, fallback = ""): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return fallback;
  }
}

export function writeTextFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
}

export function parseFrontMatter(text: string): { meta: Record<string, unknown>; body: string } {
  const normalized = text.replace(/^\uFEFF/, "");
  if (!normalized.startsWith("---")) {
    return { meta: {}, body: normalized };
  }
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(normalized);
  if (!match) return { meta: {}, body: normalized };
  const parsed = YAML.parse(match[1] ?? "") ?? {};
  return { meta: parsed as Record<string, unknown>, body: (match[2] ?? "").replace(/^\n/, "") };
}

export function stringifyFrontMatter(meta: Record<string, unknown>, body: string): string {
  return `---\n${YAML.stringify(meta).trimEnd()}\n---\n\n${body.replace(/^\n+/, "")}`;
}
