#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ContentEngine } from "./engine.js";
import { resolveProjectRoot } from "./paths.js";
import { createServer } from "./server.js";
import { VERSION } from "./version.js";

function parseArgs(argv: string[]) {
  let root: string | undefined;
  let draft = process.env.CONTENT_ENGINE_DRAFT === "1";
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--root" && argv[i + 1]) {
      root = argv[++i];
    } else if (arg === "--draft") {
      draft = true;
    } else if (arg === "--version" || arg === "-v") {
      process.stdout.write(`${VERSION}\n`);
      process.exit(0);
    } else if (arg === "--help" || arg === "-h") {
      process.stderr.write(`content-engine-mcp ${VERSION}
Usage: content-engine-mcp [--root ./content-engine] [--draft]

  --root    Project folder (default ./content-engine or $CONTENT_ENGINE_ROOT)
  --draft   Default render_outputs to draft=true (warnings only, do not block)

Secrets (RESEND_API_KEY, SMTP_*) belong in the environment, never in files.
`);
      process.exit(0);
    }
  }
  return { root: resolveProjectRoot(root), draft };
}

async function main() {
  const { root, draft } = parseArgs(process.argv.slice(2));
  const engine = new ContentEngine({ root, draftDefault: draft });
  const server = createServer({ engine });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`content-engine-mcp ${VERSION} stdio · project ${root}${draft ? " · draft mode" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
