#!/usr/bin/env node
import { chmodSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "index.ts");
const dist = join(root, "dist", "index.js");
const tsc = join(root, "node_modules", "typescript", "bin", "tsc");

if (existsSync(src) && existsSync(tsc)) {
  const result = spawnSync(process.execPath, [tsc, "-p", "tsconfig.json"], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
} else if (!existsSync(dist)) {
  console.error(
    "Cannot build: src/index.ts or typescript is missing, and dist/index.js is not present."
  );
  process.exit(1);
}

if (existsSync(dist)) chmodSync(dist, 0o755);
