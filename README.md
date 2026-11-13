<p>
  <a href="docs/QUICKSTART.md"><img alt="No-terminal quickstart" src="https://img.shields.io/badge/Quickstart-no%20terminal-2ea44f?style=for-the-badge"></a>
  <a href="docs/QUICKSTART.md#1-claude-desktop"><img alt="Install in Claude Desktop" src="https://img.shields.io/badge/Install%20in-Claude%20Desktop-D97757?style=for-the-badge"></a>
</p>

**Not a developer?** Follow the [click-by-click quickstart](docs/QUICKSTART.md) for Claude Desktop. Notes for ChatGPT and claude.ai are included. No terminal needed.

# content-engine-mcp

Turn Claude Desktop, Claude Code, Cursor, Codex, ChatGPT, Windsurf, or any MCP-capable agent into a **personal content engine** — without running a multi-agent system.

You paste a 2–5 line idea. The server stores voice, sources, drafts, and calendar state in a local folder. **Your agent** researches and writes. The server fact-checks citations, splits X threads with `twitter-text`, and renders newsletter HTML plus social copy packs.

MIT. v0.1.1. The server never calls an LLM.

## 60-second quickstart

```bash
git clone https://github.com/DevMandalia/content-engine-mcp.git
cd content-engine-mcp
npm install
npm run build
node dist/index.js --root ./content-engine
```

Leave that process to your MCP client (stdio). Project files land in `./content-engine/` (or `$CONTENT_ENGINE_ROOT`).

### Claude Desktop

Download [`content-engine-mcp.mcpb`](https://github.com/DevMandalia/content-engine-mcp/releases/download/v0.1.1/content-engine-mcp.mcpb) from the [v0.1.1 release](https://github.com/DevMandalia/content-engine-mcp/releases/tag/v0.1.1) and double-click it (or drag it onto Claude Desktop). The install screen has a **Project folder** setting; the default is `content-engine` in your home folder.

Manual `claude_desktop_config.json` still works: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "content-engine": {
      "command": "node",
      "args": ["/absolute/path/to/content-engine-mcp/dist/index.js", "--root", "/absolute/path/to/content-engine"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add content-engine -- node /absolute/path/to/content-engine-mcp/dist/index.js --root ./content-engine
```

Or a project `.mcp.json`:

```json
{
  "mcpServers": {
    "content-engine": {
      "command": "node",
      "args": ["./dist/index.js", "--root", "./content-engine"]
    }
  }
}
```

### Cursor

`.cursor/mcp.json` or `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "content-engine": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/index.js", "--root", "${workspaceFolder}/content-engine"]
    }
  }
}
```

### Codex

`~/.codex/config.toml` (tools only — this server does not rely on prompts or elicitation):

```toml
[mcp_servers.content-engine]
command = "node"
args = ["/absolute/path/to/content-engine-mcp/dist/index.js", "--root", "./content-engine"]
```

After `npm publish` (later): `npx -y content-engine-mcp`. Until then, clone and build, or `npx -y ./content-engine-mcp-0.1.1.tgz` from a packed tarball.

## Walkthrough

Example theme: **Taverna Daily** (`taverna-daily`). Idea:

> Weeknight hummus: simmer canned chickpeas with baking soda, peel the skins, blend with ice water and tahini. People overcomplicate it.

1. `apply_theme` name=`taverna-daily`
2. `setup_vision_and_audience`, `setup_brand`, `setup_voice` (paste 1–3 of your own paragraphs), `setup_sourcing`
3. `capture_seed` with the idea above
4. `build_research_brief` — then **you** (the agent) search the web
5. `attach_source` with each http(s) URL (ids become `S1`, `S2`, …). Private/loopback URLs are refused.
6. `get_draft_kit` for `newsletter`, `x`, `instagram`, `linkedin` — then **you write**
7. `save_draft` each channel. Cite numbers as `[S1]`.
8. `fact_check_draft` — unsourced numbers/%/$/dates get `[UNSOURCED]`
9. `mark_draft_ready` → `approve_draft` → `render_outputs`
10. Newsletter HTML is **blocked** until fact-check passes. Pass `draft: true` (or start the server with `--draft`) to render with warnings only.
11. `send_newsletter` only with `confirm: true` (Resend or SMTP). Never put API keys in the project folder.

Handoff: X intent links, Instagram caption + carousel markdown, LinkedIn text, `out/<seed>/issue.json`. No auto-publish to social networks.

## Themes

YAML in `themes/`: sections, word limits, voice do/don't, banned words, dark/light palettes, fallback fonts.

| Name | Notes |
|---|---|
| `default` | Clean, topic-agnostic, light |
| `taverna-daily` | Taverna Daily. Dark olive-charcoal `#12140F`, olive `#A9B455`, gold `#D9B77A`, cream `#F2E8D8` |
| `minimal-plain` | Black/white, system fonts |

## Send (optional)

```bash
# Resend
RESEND_API_KEY=re_...
RESEND_FROM="Taverna Daily <you@example.com>"

# SMTP (Gmail app password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=you@gmail.com
SMTP_PASS=app-password
```

`send_newsletter` with `test_to_self: true` mails `owner.email`. Still requires `confirm: true`.

Kit, beehiiv, and Buttondown are Phase 2. beehiiv’s free plan cannot send via API.

## Tests

```bash
npm test          # Node unit + in-process MCP client hitting every tool
npm run smoke     # Rewrites docs/DEMO.md
```

CI: GitHub Actions on Node 20 and 22.

## Docs

- [QUICKSTART.md](docs/QUICKSTART.md) — no-terminal install for Claude Desktop
- [SPEC.md](docs/SPEC.md) — Phase 1 spec, assumptions, Phase 2
- [RESEARCH.md](docs/RESEARCH.md) — 24-row prior-art table, wedge, design check (no Postiz/AGPL copies; `content-repurposer-mcp` is a dead listing)
- [SCHEDULING.md](docs/SCHEDULING.md) — Claude / Codex / cron / Actions
- [DEMO.md](docs/DEMO.md) — recorded smoke transcript
- [CHANGELOG.md](CHANGELOG.md)

## Safety

- No send/publish without explicit `confirm: true`
- No secrets in project files
- No financial / medical / legal advice templates
- SSRF: source fetch blocks loopback, private, link-local, CGNAT, and metadata hosts; redirects are re-checked
- Writes stay inside the project folder (path jail). Exports include a SHA-256 `manifest.json`
- Newsletter HTML lints out `<script>` / `<iframe>` / `<form>` / `on*` handlers
- MCPB bundle: `npm run pack:mcpb` writes `content-engine-mcp.mcpb` (manifest at archive root, production dependencies included)
