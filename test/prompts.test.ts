import { Client } from "@modelcontextprotocol/client";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ContentEngine } from "../src/engine.js";
import { createServer, TOOL_NAMES } from "../src/server.js";
import {
  TOOL_CATALOG,
  USER_GUIDE_NAME,
  USER_GUIDE_TITLE,
  userGuidePromptText
} from "../src/user-guide.js";

async function connect(root: string) {
  const engine = new ContentEngine({ root });
  const server = createServer({ engine });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  return { client, close: () => Promise.all([client.close(), server.close()]) };
}

function promptText(result: { messages: Array<{ content: { type: string; text?: string } }> }): string {
  return result.messages
    .map((m) => (m.content.type === "text" ? m.content.text ?? "" : ""))
    .join("\n");
}

describe("MCP prompts", () => {
  const closers: Array<() => Promise<unknown>> = [];
  afterEach(async () => {
    while (closers.length) await closers.pop()?.();
  });

  it("lists user-guide and returns the walkthrough, covering every live tool", async () => {
    const root = mkdtempSync(join(tmpdir(), "ce-prompts-"));
    const { client, close } = await connect(root);
    closers.push(close);

    const listed = await client.listPrompts();
    const names = listed.prompts.map((p) => p.name);
    expect(names).toContain(USER_GUIDE_NAME);
    const meta = listed.prompts.find((p) => p.name === USER_GUIDE_NAME);
    expect(meta?.title).toBe(USER_GUIDE_TITLE);

    const got = await client.getPrompt({ name: USER_GUIDE_NAME });
    const text = promptText(got);
    expect(text.trim().length).toBeGreaterThan(400);
    expect(text).toBe(userGuidePromptText());

    const tools = await client.listTools();
    expect(tools.tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
    expect(TOOL_CATALOG.map((t) => t.name)).toEqual([...TOOL_NAMES]);

    for (const tool of tools.tools) {
      expect(text).toContain(`\`${tool.name}\``);
      expect(text).toContain(tool.description);
      const catalog = TOOL_CATALOG.find((t) => t.name === tool.name);
      expect(catalog?.description).toBe(tool.description);
    }
  });
});
