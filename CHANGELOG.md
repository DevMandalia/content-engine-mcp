# Changelog

## 0.1.0 — 2026-11-13

First public slice. MIT licensed local MCP server (`stdio`) that turns an MCP-capable agent into a personal content engine without a multi-agent runtime.

- Setup tools write `./content-engine/` (`config.yaml` + markdown). Optional prompts; everything works with tools alone.
- YAML themes: `default`, `babaganoush` (Greek taverna; `#12140F` / `#A9B455` / `#D9B77A` / `#F2E8D8`), `minimal-plain`.
- Seed bank: capture, classify, search, kill, revive.
- Research brief tool (questions/angles/sources). The **agent** does the web work. No RSS.
- `attach_source` assigns `S1`, `S2`, … and refuses private/loopback URLs (SSRF). Optional fetch.
- Draft kits + versioned drafts. Deterministic fact-check flags numbers / `%` / `$` / dates without `[S#]`.
- Newsletter render blocked on failed fact-check; `draft: true` or `--draft` renders with warnings.
- Email-safe HTML (classic, digest, editorial): table layout, inline styles, `bgcolor` on every cell, Gmail ~102 KB clip warning.
- X threads via `twitter-text`; numbered separate `x.com/intent/post` links. Instagram caption + carousel copy + optional Reel script. LinkedIn post text. No social publish.
- `send_newsletter` (Resend, SMTP) requires `confirm: true`. Keys from env. Test-to-self.
- Feedback tools write standing preferences into the voice guide.
- Calendar/cadence as data. `docs/SCHEDULING.md` recipes.
- `schemas/issue.schema.json`, `server.json` (description ≤ 100 chars), `package.json` `mcpName`.
- Tests + GitHub Actions on Node 20 and 22. In-process MCP smoke recorded in `docs/DEMO.md`.

npm and official MCP Registry publish are **not** in this release.
