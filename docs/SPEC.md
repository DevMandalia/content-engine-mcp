# content-engine-mcp v0.1 spec

A local MCP server that turns **your existing agent** into a personal content engine. The server never writes prose and never calls an LLM.

License: **MIT**.

## Promise

You give a 2–5 line idea. The engine stores it, builds a research brief, keeps sources, hands the agent channel kits in your voice, fact-checks citations, and renders:

- a newsletter (email-safe HTML + markdown)
- an X post/thread (twitter-text weighted split + numbered intent links)
- an Instagram pack (caption, carousel copy, optional Reel script)
- a LinkedIn post

You approve, edit, kill, or request revisions. Standing preferences stick in `voice.md`.

## Non-goals (v0.1)

- No server-side sampling / LLM (MCP spec 2026-07-28 deprecates sampling; tools are deterministic and golden-file tested).
- No elicitation. Every setup step is a **tool** (Codex-safe). Prompts are optional extras.
- No RSS input — only seeds and http(s) URLs.
- No native Instagram / LinkedIn / Threads / TikTok / X API posting (app review / paid API). Copy packs and intent links only.
- No Kit / beehiiv / Buttondown / Ghost send (Phase 2).
- No self-scheduling daemon (see `SCHEDULING.md`).
- No PNG carousel slides (Phase 2).
- No copying Postiz (AGPL) source.

## Assumptions

1. Default project folder is `./content-engine/` (`CONTENT_ENGINE_ROOT` or `--root`).
2. One editable `config.yaml` plus markdown/yaml files. The user can edit them by hand.
3. Themes are YAML under `themes/`. Shipped: `default`, **`taverna-daily`** (Taverna Daily; olive-charcoal `#12140F`, olive `#A9B455`, gold `#D9B77A`, cream `#F2E8D8`), `minimal-plain`.
4. Source ids are `S1`, `S2`, … per seed. Optional `fetch=true` loads a URL after an SSRF private/loopback block. Redirects are re-checked.
5. Fact-check: any sentence with a number, `%`, `$`/`€`/`£`, or date and no `[S#]` matching an attached source is flagged `[UNSOURCED]`. Unknown `[S99]` is also a flag. Ready/approve require a clean check. **Newsletter render is blocked** until it passes, unless `draft=true` or CLI `--draft` (warnings only).
6. Email HTML is table-based, inline CSS, `bgcolor` on every cell. Warn above Gmail’s ~102 KB clip.
7. X counting uses `twitter-text` (URLs = 23, emoji/CJK weighted). Each tweet gets its own `https://x.com/intent/post?text=` link, numbered `1/N` when split.
8. Send adapters: Resend and SMTP. Keys from env only. `confirm: true` is mandatory. `test_to_self` uses `owner.email`.
9. Examples are cooking / taverna. No finance, medical, or legal advice templates.
10. `server.json` + `package.json` `mcpName` are ready for the official MCP Registry; **npm and registry publish are later**. v0.1.1 is the current git tag (v0.1.0 remains).

## Project layout

```
content-engine/
  config.yaml
  vision.md audience.md brand.md voice.md voice-samples.md sourcing.md
  learned-preferences.yaml
  calendar.yaml
  seeds/{id}.md
  briefs/{id}.md
  sources/{id}.yaml          # S1, S2, …
  drafts/{seedId}/{channel}/vN.md
  out/{seedId}/newsletter.html|md x.txt instagram.json linkedin.txt issue.json
```

Issue JSON matches `schemas/issue.schema.json`.

## Tool list

Setup: `setup_vision_and_audience`, `setup_brand`, `setup_channels`, `setup_newsletter_sections`, `setup_voice`, `setup_sourcing`, `list_themes`, `apply_theme`, `get_setup`

Seeds: `capture_seed`, `get_seed`, `list_seeds`, `search_seeds`, `kill_seed`, `revive_seed`

Develop: `build_research_brief`, `get_research_brief`, `attach_source`, `list_sources`, `get_draft_kit`, `save_draft`, `get_draft`, `list_drafts`

Quality: `fact_check_draft`, `mark_draft_ready`

Feedback: `approve_draft`, `request_revision`, `kill_draft`, `list_learned_preferences`

Output: `render_outputs`, `send_newsletter`, `get_calendar`, `get_cadence_status`

Optional prompts (clients that support them): `setup_wizard`, `develop_idea`.

## Phase 2

- Handoff to Buffer / Typefully / Postiz MCPs for social publish (do not vend their OAuth here).
- Kit / beehiiv / Buttondown / Ghost newsletter adapters (draft in their UI; respect their human-send rules).
- 1080×1350 PNG slides from HTML.
- Instagram character-limit nuances / X paid API (still confirm-gated).
- Analytics → next seed.
- Optional RSS (explicitly out of v0.1).

## Design check (prior-art pack vs this spec)

The Cursor-leg 24-row pack is folded into `docs/RESEARCH.md`. We took its **wedge** (CRUD MCPs vs a deterministic toolkit) and its **mechanics** (`S#`, SSRF, twitter-text, email `bgcolor`, 102 KB, YAML themes, issue schema, registry `server.json`).

We did **not** collapse to that pack’s 10-tool surface or its “never send / no secrets” default. Owner steering keeps wizard tools, a seed bank, four channel packs, a feedback loop, and confirm-gated Resend/SMTP. Ghost **does** now have first-party `TryGhost/ghst` (pre-1.0) — still Phase 2.

npm and the MCP Registry stay **ready and unpublished**.

## Later

- MCP resources (`theme://`, `schema://issue`) if a client needs them; tools already cover the same files.
- A scheduler inside the server.
- Multi-writer teams.
- Sampling, if the spec ever restores a safe form of it (not planned).
- LinkedIn share-offsite intent (open question in the prior-art pack).
