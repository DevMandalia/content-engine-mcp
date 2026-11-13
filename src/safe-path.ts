import { isAbsolute, relative, resolve, sep } from "node:path";
import { EngineError } from "./types.js";

export function assertSafeId(id: string): string {
  if (!id || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) {
    throw new EngineError(
      `Invalid id "${id}". Use letters, numbers, dot, underscore, or hyphen — no path separators.`,
      "PATH"
    );
  }
  return id;
}

export function assertInsideDir(root: string, candidate: string): string {
  if (candidate.includes("\0")) {
    throw new EngineError("Refusing path with NUL byte.", "PATH");
  }
  if (candidate.split(/[/\\]/).includes("..")) {
    throw new EngineError(`Refusing path that contains '..': ${candidate}`, "PATH");
  }
  const rootResolved = resolve(root);
  const resolved = isAbsolute(candidate) ? resolve(candidate) : resolve(rootResolved, candidate);
  const rel = relative(rootResolved, resolved);
  if (rel === "") return resolved;
  if (rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel)) {
    throw new EngineError(`Refusing to write outside ${rootResolved}: ${candidate}`, "PATH");
  }
  return resolved;
}
