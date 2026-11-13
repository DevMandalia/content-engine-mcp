#!/usr/bin/env node
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "dist");
mkdirSync(outDir, { recursive: true });
execSync("npx tsc -p tsconfig.json", { cwd: root, stdio: "inherit" });

const staging = mkdtempSync(join(tmpdir(), "ce-mcpb-"));
for (const part of ["dist", "themes", "schemas", "mcpb", "package.json", "LICENSE", "README.md"]) {
  const from = join(root, part);
  if (!existsSync(from)) continue;
  cpSync(from, join(staging, part), { recursive: true });
}

const zipPath = join(outDir, "content-engine-mcp.mcpb");
rmSync(zipPath, { force: true });
execSync(`zip -qr "${zipPath}" .`, { cwd: staging, stdio: "inherit" });
rmSync(staging, { recursive: true, force: true });
process.stderr.write(`Wrote ${zipPath}\n`);
