# Contributing

## Dev

```bash
npm install
npm test
npm run build
npm run smoke
```

Node 20+ (CI runs 20 and 22).

## Rules for this repo

- **No LLM calls** in the server. Tools must stay deterministic so golden files in `test/golden/` remain stable.
- **Do not copy Postiz** or any AGPL sources. Read their docs; write our own files.
- Do not add RSS in v0.1.
- Do not add native social posting.
- Secrets stay in the environment, never in `content-engine/` files.
- Examples stay topic-agnostic or cooking/taverna. No finance-fund material.
- Every new tool needs a call in `test/mcp-tools.test.ts` (that test starts the MCP server and hits **every** tool).

## Golden files

If you change HTML, fact-check markup, or thread packing:

```bash
npx vitest run -u
```

Commit the updated `test/golden/` files with an explanation.

## MCP Registry (later)

npm publish and `mcp-publisher publish` are **not** part of v0.1. When you do publish:

1. Change `server.json` `name` and `package.json` `mcpName` to `io.github.<your-user>/content-engine-mcp`.
2. Keep `description` ≤ 100 characters.
3. `mcpName` must match `server.json.name`.

## Pull requests

Include tests. Do not add a second component library, a database, or auth.
