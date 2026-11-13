#!/usr/bin/env node
import { execSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "dist"), { recursive: true });
execSync("node scripts/build.mjs", { cwd: root, stdio: "inherit" });
chmodSync(join(root, "dist", "index.js"), 0o755);

const staging = mkdtempSync(join(tmpdir(), "ce-mcpb-"));
for (const part of ["dist", "themes", "schemas", "package.json", "LICENSE", "README.md"]) {
  const from = join(root, part);
  if (!existsSync(from)) continue;
  cpSync(from, join(staging, part), { recursive: true });
}
rmSync(join(staging, "dist", "content-engine-mcp.mcpb"), { force: true });
cpSync(join(root, "mcpb", "manifest.json"), join(staging, "manifest.json"));

execSync("npm install --omit=dev --ignore-scripts", { cwd: staging, stdio: "inherit" });

execSync("npx --yes @anthropic-ai/mcpb validate .", { cwd: staging, stdio: "inherit" });

const zipPath = join(root, "content-engine-mcp.mcpb");
rmSync(zipPath, { force: true });
execSync(`npx --yes @anthropic-ai/mcpb pack . "${zipPath}"`, { cwd: staging, stdio: "inherit" });
rmSync(staging, { recursive: true, force: true });
process.stderr.write(`Wrote ${zipPath}\n`);
