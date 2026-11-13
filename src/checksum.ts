import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export type ManifestFile = {
  path: string;
  bytes: number;
  sha256: string;
};

export function sha256Bytes(data: string | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}

export function exportManifest(outDir: string): { files: ManifestFile[] } {
  const files: ManifestFile[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === "manifest.json") continue;
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else {
        const buf = readFileSync(full);
        files.push({
          path: relative(outDir, full).replaceAll("\\", "/"),
          bytes: buf.byteLength,
          sha256: sha256Bytes(buf)
        });
      }
    }
  };
  walk(outDir);
  files.sort((a, b) => a.path.localeCompare(b.path));
  return { files };
}
