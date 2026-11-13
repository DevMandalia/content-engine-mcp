import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ContentEngine } from "../src/engine.js";
import { createServer, TOOL_NAMES } from "../src/server.js";
import { VERSION } from "../src/version.js";

function textOf(result: { content: Array<{ type: string; text?: string }> }): string {
  return result.content.map((c) => (c.type === "text" ? c.text ?? "" : "")).join("\n");
}

async function main() {
  const root = mkdtempSync(join(tmpdir(), "ce-smoke-"));
  const log: string[] = [];
  const engine = new ContentEngine({
    root,
    sendImpl: { resend: async () => ({ id: "smoke_msg" }) }
  });
  const server = createServer({ engine });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "smoke", version: VERSION });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

  const listed = await client.listTools();
  log.push(`# content-engine-mcp ${VERSION} smoke test`, "");
  log.push("In-process MCP client (InMemoryTransport), not a host LLM.", "");
  log.push(`Tools listed (${listed.tools.length}): ${listed.tools.map((t) => t.name).join(", ")}`, "");
  if (listed.tools.length !== TOOL_NAMES.length) {
    throw new Error(`Expected ${TOOL_NAMES.length} tools, got ${listed.tools.length}`);
  }

  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const result = await client.callTool({ name, arguments: args });
    const text = textOf(result as { content: Array<{ type: string; text?: string }> });
    const isError = Boolean((result as { isError?: boolean }).isError);
    log.push(`## ${name}${isError ? " (error)" : ""}`);
    log.push("```");
    log.push(text.length > 1800 ? `${text.slice(0, 1800)}\n…` : text);
    log.push("```", "");
    return { text, isError };
  };

  await call("apply_theme", { name: "babaganoush" });
  await call("setup_vision_and_audience", {
    vision: "A weeknight letter for people who want mezze, not a restaurant recap.",
    audience: "Home cooks who will mash chickpeas after work.",
    promise: "One plate you can actually make on a Tuesday.",
    owner_name: "Alex",
    owner_email: "alex@example.com"
  });
  await call("setup_brand", { name: "Babaganoush", theme_mode: "dark" });
  await call("setup_voice", {
    adjectives: ["warm", "practical", "unfussy"],
    samples: ["I put the garlic in cold oil and wait until the kitchen smells like someone else's house."]
  });
  await call("setup_sourcing", { require_urls: true });
  const captured = await call("capture_seed", {
    body: "Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blend with ice water and tahini. People overcomplicate it.",
    kind: "how_to"
  });
  const seedId = JSON.parse(captured.text).seed.id as string;
  await call("build_research_brief", { seed_id: seedId });
  await call("attach_source", {
    seed_id: seedId,
    url: "https://example.com/hummus",
    title: "On peeling chickpeas",
    notes: "Peeling the skins is optional but makes it silkier.",
    quote: "Peeling the skins"
  });
  await call("get_draft_kit", { seed_id: seedId, channel: "newsletter" });
  await call("save_draft", {
    seed_id: seedId,
    channel: "newsletter",
    body: "# Weeknight hummus\n\n## From the taverna\nI put the garlic in cold oil.\n\n## What we are cooking\nChickpeas, tahini, lemon, ice water.\n\n## How\nSimmer, peel, blend. Stop when it looks like it could take a nap."
  });
  await call("save_draft", {
    seed_id: seedId,
    channel: "x",
    body: "Warm the tahini. That is the whole trick.\n\nhttps://example.com/hummus"
  });
  await call("fact_check_draft", { seed_id: seedId, channel: "newsletter" });
  await call("mark_draft_ready", { seed_id: seedId, channel: "newsletter" });
  await call("approve_draft", { seed_id: seedId, channel: "newsletter", comment: "shorter openers" });
  await call("render_outputs", { seed_id: seedId, draft: false });
  const refused = await call("send_newsletter", {
    seed_id: seedId,
    adapter: "resend",
    confirm: false,
    test_to_self: true
  });
  if (!refused.isError) throw new Error("send without confirm should fail");
  log.push("_Smoke finished._", "");

  await client.close();
  await server.close();

  const docs = join(dirname(fileURLToPath(import.meta.url)), "..", "docs");
  mkdirSync(docs, { recursive: true });
  const out = join(docs, "DEMO.md");
  writeFileSync(out, log.join("\n"));
  process.stderr.write(`Wrote ${out}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
