import { randomBytes } from "node:crypto";

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(4).toString("hex")}`;
}

export function nextSourceId(existing: string[]): string {
  let max = 0;
  for (const id of existing) {
    const match = /^S(\d+)$/.exec(id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `S${max + 1}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
