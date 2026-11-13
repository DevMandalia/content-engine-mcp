import { existsSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_PROJECT_DIR = "content-engine";

export function packageRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
        if (pkg.name === "content-engine-mcp") return dir;
      } catch {
        // keep walking
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export function themesDir(): string {
  return join(packageRoot(), "themes");
}

export function schemasDir(): string {
  return join(packageRoot(), "schemas");
}

export function resolveProjectRoot(explicit?: string): string {
  const fromEnv = explicit ?? process.env.CONTENT_ENGINE_ROOT;
  if (fromEnv && fromEnv.trim()) {
    return isAbsolute(fromEnv) ? fromEnv : resolve(process.cwd(), fromEnv);
  }
  return resolve(process.cwd(), DEFAULT_PROJECT_DIR);
}

export type ProjectPaths = {
  root: string;
  config: string;
  vision: string;
  audience: string;
  brand: string;
  voice: string;
  voiceSamples: string;
  sourcing: string;
  preferences: string;
  calendar: string;
  seeds: string;
  briefs: string;
  sources: string;
  drafts: string;
  out: string;
};

export function projectPaths(root: string): ProjectPaths {
  return {
    root,
    config: join(root, "config.yaml"),
    vision: join(root, "vision.md"),
    audience: join(root, "audience.md"),
    brand: join(root, "brand.md"),
    voice: join(root, "voice.md"),
    voiceSamples: join(root, "voice-samples.md"),
    sourcing: join(root, "sourcing.md"),
    preferences: join(root, "learned-preferences.yaml"),
    calendar: join(root, "calendar.yaml"),
    seeds: join(root, "seeds"),
    briefs: join(root, "briefs"),
    sources: join(root, "sources"),
    drafts: join(root, "drafts"),
    out: join(root, "out")
  };
}
