# Research: personal content engines and MCP servers

This file merges our Phase 1 scan with the Cursor-leg prior-art pack (researcher, 13 Nov 2026 PT). That pack checked every listed URL with curl (HTTP 200 unless noted) and read GitHub stars / last-push from the GitHub API that day. We do not invent additional stats.

**Wedge (unchanged):** every newsletter and social MCP we found is a **platform CRUD pipe**. The few “repurpose this text” MCPs have no sources, no themes, and no email-safe HTML. Nobody ships an **open, account-free, deterministic content toolkit** that (1) takes seeds + URLs into a cited brief, (2) flags numbers without `[S#]` as `[UNSOURCED]`, (3) renders themed email-safe HTML, and (4) emits X as **twitter-text-weighted `x.com/intent/post` links** so it never needs the X API.

The host LLM writes. The server structures, validates, renders, and links. It **pairs with** Kit / beehiiv / Ghost / Typefully / Buffer / Postiz downstream instead of replacing them.

## Owner steering that this repo follows

These beat the researcher’s optional “collapse to 10 tools / never send” pack when they conflict.

| Steering | This repo |
|---|---|
| MIT; TypeScript; `@modelcontextprotocol/sdk`; stdio; Node 20+ | Yes |
| Server **never calls an LLM**; no MCP sampling (spec 2026-07-28 deprecates it) | Yes. Tools are deterministic + golden-file tested |
| Codex has **no prompts / elicitation** — every setup step is a tool | Yes. Prompts exist but are optional |
| Wizard, seed bank, research brief, versioned drafts, feedback → voice | Yes (richer than the 10-tool pack) |
| Source ids `S1`, `S2`, …; SSRF on fetch; **no RSS** in v0.1 | Yes |
| Fact-check: number / `%` / `$` / date without `[S#]` → `[UNSOURCED]`; newsletter **render blocked** unless `draft: true` / `--draft` | Yes |
| Email: table layout, `bgcolor` on every cell, Gmail ~102 KB clip warning | Yes (inline styles; no MJML) |
| X: pin `twitter-text`, numbered **separate** intent links | Yes. [X web intent](https://developer.x.com/en/docs/x-for-websites/tweet-button/guides/web-intent) documents `twitter.com/intent/tweet`; `x.com/intent/post` is the current equivalent |
| Themes as YAML: `default`, **`babaganoush`**, `minimal-plain` | Yes. Palette is the owner’s: charcoal `#12140F`, olive `#A9B455`, gold `#D9B77A`, cream `#F2E8D8` (not the researcher’s sample `#14191F` / `#EFDDB8` draft) |
| Instagram + LinkedIn copy packs in Phase 1; no native social APIs | Yes. PNG slides Phase 2 |
| Optional send: **Resend + SMTP**, env keys only, `confirm: true` | Yes. Researcher pack said “no secrets / never sends”; owner overrode with confirm-gated adapters. Kit/beehiiv/Ghost remain Phase 2 |
| `schemas/issue.schema.json`; CI on Node 20 and 22; MCP client test hits every tool | Yes |
| **Postiz is AGPL** — do not copy code | Yes |
| **`content-repurposer-mcp` GitHub 404** — do not cite as working | Yes |
| Smithery closed to new external servers (31 Oct 2026) | `server.json` + `mcpName` ready; **npm and registry unpublished** |
| Babaganoush / cooking examples; no finance-fund | Yes |

**Not adopted from the 10-tool pack:** collapsing to `setup_workspace` + `ingest_sources` + `create_brief` + `validate_issue` + `render_issue` + `draft_x_posts` only. Owner asked for a usable content engine (wizard steps, seed kill/revive, four channels, feedback loop, confirm-gated send). Mapping:

| Researcher pack tool | Where it lives here |
|---|---|
| `setup_workspace` | `apply_theme` + `setup_*` + `get_setup` writing `./content-engine/` |
| `list_themes` / `get_theme` | `list_themes`, `apply_theme`; YAML is on disk under `themes/` |
| `ingest_sources` | `attach_source` (`S#`, optional fetch, SSRF). No RSS |
| `create_brief` | `build_research_brief` (skeleton; agent fills) |
| `validate_issue` | `fact_check_draft` + `mark_draft_ready` |
| `render_issue` | `render_outputs` (newsletter HTML/md, X, IG, LinkedIn, `issue.json`) |
| `draft_x_posts` | `render_outputs` channel `x` via `twitter-text` |
| `save_issue` / `get_state` | versioned `drafts/` + `out/` + `get_calendar` / `get_cadence_status` |

MCP **resources** (`theme://`, `schema://issue`) and `juice` / Readability were suggested, not steered. v0.1 keeps tools-only + a light HTML fetch. Add resources in v0.2 if a client needs them.

## Constraints (protocol, platforms, distribution)

| Constraint | Source | Implication |
|---|---|---|
| MCP spec **2026-07-28** deprecates **sampling** | [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28); older sampling chapter still at [2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) | Never sample. Host writes |
| Codex: no prompts / elicitation | Client capability notes | Setup = tools |
| Smithery proxy / new external servers ended **31 Oct 2026** | [The future of Smithery](https://www.smithery.ai/future) | Official [MCP Registry](https://modelcontextprotocol.io/registry/quickstart) `server.json` + `npx`. Not submitted yet |
| IG / LinkedIn / Threads / TikTok posting needs app review; X API posting is paid | Platform policies; [EnesCinr/twitter-mcp](https://github.com/EnesCinr/twitter-mcp) needs keys and **posts** | Copy packs + [intent links](https://developer.x.com/en/docs/x-for-websites/tweet-button/guides/web-intent) |
| beehiiv free is read-only; sending stays human / plan-gated | [beehiiv MCP help](https://www.beehiiv.com/support/article/39255979546263-getting-started-with-the-beehiiv-mcp), [MCP v2 post](https://product.beehiiv.com/p/beehiiv-mcp-v2) | Phase 1 send = Resend + SMTP |
| Kit MCP drafts; official brief: MCP does not send | [Kit MCP](https://developers.kit.com/mcp/kit-mcp) | Phase 2 |
| Postiz **AGPL-3.0** | [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | Hand off; never copy |
| `content-repurposer` GitHub 404 | [registry.npmjs.org/content-repurposer-mcp](https://registry.npmjs.org/content-repurposer-mcp); `github.com/As-The-Geek-Learns/content-repurposer` **404** | Dead listing |
| `twitter-text` last upstream push Apr 2024; config v3 still the weighted-length source | [twitter/twitter-text](https://github.com/twitter/twitter-text), [config/v3.json](https://raw.githubusercontent.com/twitter/twitter-text/master/config/v3.json) | Pin `3.1.0` (Apache-2.0) |

## Comparison table (24 + adjacent)

Stars · last push: GitHub API, 13 Nov 2026, Cursor-leg researcher. Licenses from each repo’s LICENSE / npm page.

| # | Name | Type | License · stars · last push | Surface | Vs. us |
|---|---|---|---|---|---|
| 1 | [beehiiv MCP](https://www.beehiiv.com/support/article/39255979546263-getting-started-with-the-beehiiv-mcp) (`mcp.beehiiv.com/mcp`) | Official hosted newsletter MCP, OAuth | Proprietary | Posts, templates, tags, segments, automations, assets, RSS, stats. Free read-only; Lite drafts; Pro sends. `get_post_content` used for voice | Platform CRUD. No citation check, no theme renderer, no X pack |
| 2 | [Kit MCP](https://developers.kit.com/mcp/kit-mcp) (`app.kit.com/mcp`) | Official, OAuth, paid plans, 120 req/min | Proprietary | v4-shaped: subscribers, tags, segments, sequences, **broadcast drafts** | CRUD. Does not write, render, or validate |
| 3 | [dancumberland/kit-mcp](https://github.com/dancumberland/kit-mcp) | Community Kit MCP | MIT · 2★ · 2026-03 | 13 composite tools / ~45 actions | Same CRUD gap; tiny |
| 4 | [conorbronsdon/substack-mcp](https://github.com/conorbronsdon/substack-mcp) | Community (Substack has no first-party write MCP) | MIT · 48★ · 2026-11-12 | Drafts, Notes, analytics, subscribers. Draft-only by design; tool annotations for side effects | Session-cookie login. Notes can publish instantly. Worth copying **annotations**, not auth |
| 5 | [TryGhost/ghst](https://github.com/TryGhost/ghst) (`ghst mcp stdio`) | **First-party** Ghost MCP, pre-1.0 | MIT · 37★ · 2026-11-13 | Posts, pages, tags, members, newsletters, tiers, webhooks | Official CRUD. No generation. (Earlier notes that “Ghost has no first-party MCP” are outdated.) |
| 6 | [MFYDev/ghost-mcp](https://github.com/MFYDev/ghost-mcp) | Community Ghost MCP | MIT · 246★ · 2026-04 | Browse/create/edit posts, members, newsletters | Mature CRUD |
| 7 | [Mailchimp Transactional MCP](https://mailchimp.com/developer/transactional/guides/how-to-use-mailchimps-transactional-messaging-mcp/) | Official Mandrill MCP | Proprietary | `build_template`, `call_api`, `diagnose_failed_send` (9 tools) | Transactional only. Marketing API: community e.g. [damientilman/mailchimp-mcp-server](https://github.com/damientilman/mailchimp-mcp-server) (author claims a huge tool list — treat as hype) |
| 8 | [rhnvrm/listmonk-mcp](https://github.com/rhnvrm/listmonk-mcp) | Self-hosted newsletter MCP | MIT · 44★ · 2026-01 | 18 tools: subscribers, lists, campaigns, templates | Open stack, CRUD only |
| 9 | [Typefully MCP](https://support.typefully.com/en/articles/13128440-typefully-mcp-server) (`mcp.typefully.com/mcp`) + [typefully/agent-skills](https://github.com/typefully/agent-skills) | Official social MCP + MIT skills repo | Proprietary MCP · skills MIT · 65★ | Drafts, threads, queue, media, tags on X, LinkedIn, Threads, Bluesky, Mastodon | Best X drafting UX. Needs account. No newsletter HTML, no sources |
| 10 | [Buffer MCP](https://developers.buffer.com/guides/integrations/mcp.html) (`mcp.buffer.com/mcp`) | Official social MCP | Proprietary; free 150 req / 15 min | Channels, queue, `create_post` (can publish now), ideas, analytics. Returns remaining quota; write tools flagged | **Publishes.** Phase 2 hand-off |
| 11 | [EnesCinr/twitter-mcp](https://github.com/EnesCinr/twitter-mcp) | X API MCP | MIT · 408★ · 2026-11-03 | `post_tweet`, `search_tweets`, `get_home_timeline` | Needs X keys; timeline is paid. **Posts directly** — opposite of intent links |
| 12 | [Postiz](https://github.com/gitroomhq/postiz-app) ([MCP](https://postiz.com/mcp), [docs](https://docs.postiz.com/mcp/introduction)) | OSS scheduler + MCP | **AGPL-3.0** · 41.5k★ · 2026-11-13 | ~30 networks via MCP / CLI | Scheduler, not a writer. **Do not copy source** |
| 13 | [agentic-repurpose](https://registry.npmjs.org/agentic-repurpose) (`io.github.pooriaarab/agentic-repurpose`) | Content-gen MCP | MIT (npm) · v0.1.1 · 2026-10 | Two tools: `repurpose`, `score_variant`. Live post needs `approved:true` | Approval-in-schema is good. Tiny: no newsletter, themes, citations |
| 14 | [content-repurposer-mcp](https://registry.npmjs.org/content-repurposer-mcp) (`io.github.As-The-Geek-Learns/content-repurposer`) | Registry listing | MIT (npm) · v1.0.2 · 2026-04 | Threads, LinkedIn, Substack Notes, email, video script **on paper** | **GitHub 404.** Do not cite as working |
| 15 | [NewsletterProAI](https://newsletterproai.eliteaiempire.com/) (`com.eliteaiempire/newsletterproai`) | Hosted content-gen MCP | Proprietary; no repo | “Drafts a real newsletter issue” + test send | Closed, sends, unverifiable copy |
| 16 | [AgriciDaniel/claude-repurpose](https://github.com/AgriciDaniel/claude-repurpose) | Claude Code skill, not MCP | MIT · 175★ · 2026-04 | 1 asset → 10+ platform packs | Demand signal. Prompt-only, no validation/render |
| 17 | [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent) | LangGraph engine | MIT · 3.0k★ · 2026-11-11 | URL → relevance → post → HITL → schedule | HITL graph to learn from. Not MCP; needs OAuth. No newsletter |
| 18 | [assafelovic/gpt-researcher](https://github.com/assafelovic/gpt-researcher) + [gptr-mcp](https://github.com/assafelovic/gptr-mcp) | Research engine + MCP | Apache-2.0 · 30.7k★ / MIT · 378★ | Deep research with citations | Citation pipeline is the model for `attach_source`. Writes reports, needs search keys |
| 19 | [n8n #14412](https://n8n.io/workflows/14412-generate-and-send-ai-newsletters-with-openai-tavily-google-sheets-and-gmail/) · [#7264 RSS→draft](https://n8n.io/workflows/7264-generate-ai-summarized-newsletter-drafts-from-rss-feeds-with-gpt-4-and-gmail/) · [#22365](https://n8n.io/workflows/22365-draft-weekly-seo-blogs-and-social-posts-with-openai-google-sheets-and-wordpress/) · [#7517](https://n8n.io/workflows/7517-generate-and-schedule-social-media-content-with-gpt-4-and-buffer-from-google-sheets/) | No-code pipelines | n8n Sustainable Use License | RSS / Tavily / Sheets → LLM → HTML → Gmail/Buffer | Pipeline shape. HTML often untested; many send by default. No claim check |
| 20 | [giftedunicorn/ai-news-bot](https://github.com/giftedunicorn/ai-news-bot), [samestrin/llm-newsletter-generator](https://github.com/samestrin/llm-newsletter-generator) | OSS newsletter generators | GPL-3.0 · 28★ / MIT · 15★ | RSS → LLM → HTML email | Not MCP. Single-topic. GPL on the first |
| 21 | [rasa.io](https://rasa.io) | Commercial curation | Custom contracts | Per-reader personalized newsletters | Closed; associations |
| 22 | [Letterdrop](https://letterdrop.com) | Commercial B2B engine | SaaS (third-party pricing pages exist; we don’t restated figures) | Repurposing, LinkedIn, SEO, approvals | Enterprise; closed |
| 23 | [Typefully](https://typefully.com) / [Hypefury](https://hypefury.com) / [Tweet Hunter](https://tweethunter.io) / [Taplio](https://taplio.com) | Commercial X/LinkedIn writers | SaaS | Threads, queues, AI rewrite | Closed; posting permissions. Taplio is LinkedIn-first; X is Tweet Hunter / Typefully / Hypefury. No newsletter engine |
| 24 | [Jasper](https://www.jasper.ai) / [Copy.ai](https://www.copy.ai) | General content engines | SaaS | Brand-voice profiles (the idea behind theme YAML) | Closed; not MCP-first; no citation enforcement |

**Also in our scan (not in the 24):** [Stanford STORM](https://github.com/stanford-oval/storm) ([project](https://storm-project.stanford.edu/research/storm/)) — outline-first research swarm; [Lately](https://www.lately.ai/how-it-works) — voice model from edits; [Easel (ZJU-REAL)](https://github.com/ZJU-REAL/Easel) — multi-agent social workbench; [Mixpost](https://github.com/inovector/mixpost) — self-hosted scheduler.

**Hype flags (researcher):** #14 repo gone; #15 no repo; “most complete” claims on #3 and community Mailchimp are authors’ own; Taplio ≠ X.

## Capability matrix (Phase 1 / 2 / Later)

Legend: **P1** this repo, **P2** / **L** roadmap. Others: **Y** documented, **P** partial, **—** not the product.

| Capability | us | Postiz | Buffer | Typefully | GPT-R / gptr-mcp | Lately | claude-repurpose | LC social-media-agent | Kit / beehiiv | Ghost ghst | n8n |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Runs in the user’s existing agent | **P1** | — | Y | Y | — | — | P | — | Y | Y | — |
| Tools-only setup (Codex) | **P1** | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Local files, no required cloud | **P1** | self-host | — | — | Y | — | Y | Y | — | self-host | Sheets |
| YAML theme + voice + banned words | **P1** | P | — | P | — | Voice Model | — | style file | — | — | prompt |
| Learn prefs from approve / edit / kill | **P1** | — | — | comments | — | **Y** | — | HITL | — | — | — |
| Seed bank | **P1** | P | ideas | drafts | query | long-form | input | URL | — | — | rows |
| Research **brief** (agent fetches) | **P1** | — | — | — | they fetch | — | atomize | fetch | — | — | Tavily |
| `S#` sources + SSRF | **P1** | — | — | — | citations | — | P | — | — | — | varies |
| Unsourced number/%/$/date flags | **P1** | — | — | — | P | — | — | — | — | — | — |
| Email-safe HTML + 102 KB warn | **P1** | — | — | — | — | — | excerpt | — | in product | in product | HTML node |
| twitter-text + intent links (never posts) | **P1** | publish | publish | publish | — | schedule | files | publish | — | — | Buffer |
| IG / LinkedIn **copy packs** | **P1** | publish | publish | publish | — | Y | Y | LI publish | — | — | Y |
| Confirm-gated Resend/SMTP | **P1** | notif | — | — | — | — | — | — | human send | — | Gmail |
| Native social publish | **P2** hand-off | **Y** | **Y** | **Y** | — | Y | — | Y | — | — | Y |
| Kit / beehiiv / Ghost adapters | **P2** | — | Substack | Notes | — | — | — | — | **Y** | **Y** | — |
| PNG slides / RSS / sampling | **P2 / never** | media | assets | media | **Y** LLM | — | prompts | — | RSS in beehiiv | — | RSS |

## Channel and send reality

- **X:** paid API to post. We emit weighted 280-char chunks and [web intents](https://developer.x.com/en/docs/x-for-websites/tweet-button/guides/web-intent). Email HTML practices: [caniemail](https://www.caniemail.com).
- **IG / LinkedIn / Threads / TikTok:** app review. Copy packs only. LinkedIn `linkedin.com/sharing/share-offsite` is a Phase 2 question, not v0.1.
- **Phase 2 publish path:** Buffer MCP, Typefully MCP, or Postiz MCP (OAuth already theirs).
- **Kit:** drafts + `confirm_url`. **beehiiv:** free read-only; send is human / paid. **Ghost:** `ghst` first-party pre-1.0, plus community `ghost-mcp`. **listmonk** if self-hosting. None of these are v0.1 send adapters.

## Distribution (ready, unpublished)

Smithery is not an onboarding path. This repo already has:

1. `package.json` `name` `content-engine-mcp`, `bin`, `mcpName` `io.github.content-engine/content-engine-mcp`
2. [`server.json`](../server.json) — schema `2025-12-11`, description **84 characters** (limit 100), `packages[].transport.type: stdio`
3. README snippets for Claude Desktop, Claude Code, Cursor, Codex

**Not done (intentionally):** `npm publish`, `mcp-publisher login` / `publish`. Change the `io.github.content-engine/…` namespace to the real GitHub user/org first. Device-code registry login is the owner’s step.

## Sources

Prior-art pack (curl 200 on 13 Nov 2026 unless noted) plus our scan:

- MCP: [registry quickstart](https://modelcontextprotocol.io/registry/quickstart) · [registry API](https://registry.modelcontextprotocol.io) · [registry repo](https://github.com/modelcontextprotocol/registry) · [reference servers](https://github.com/modelcontextprotocol/servers) · [spec 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25) · [spec 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) · [sampling 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/client/sampling) · [Inspector](https://modelcontextprotocol.io/docs/tools/inspector) · [TS SDK](https://github.com/modelcontextprotocol/typescript-sdk) · [Smithery future](https://www.smithery.ai/future)
- Platforms: [beehiiv MCP](https://www.beehiiv.com/support/article/39255979546263-getting-started-with-the-beehiiv-mcp) · [beehiiv MCP v2](https://product.beehiiv.com/p/beehiiv-mcp-v2) · [Kit MCP](https://developers.kit.com/mcp/kit-mcp) · [Typefully MCP](https://support.typefully.com/en/articles/13128440-typefully-mcp-server) · [Buffer MCP](https://developers.buffer.com/guides/integrations/mcp.html) · [Mailchimp Transactional MCP](https://mailchimp.com/developer/transactional/guides/how-to-use-mailchimps-transactional-messaging-mcp/) · [Postiz MCP](https://postiz.com/mcp)
- Repos: every GitHub link in the table, plus [twitter-text](https://github.com/twitter/twitter-text) · [v3 config](https://raw.githubusercontent.com/twitter/twitter-text/master/config/v3.json) · [MJML](https://github.com/mjmlio/mjml) (considered, skipped)
- X: [web intent](https://developer.x.com/en/docs/x-for-websites/tweet-button/guides/web-intent)
- Email: [caniemail](https://www.caniemail.com)
- Commercial: [rasa.io](https://rasa.io) · [Letterdrop](https://letterdrop.com) · [Typefully](https://typefully.com) · [Hypefury](https://hypefury.com) · [Tweet Hunter](https://tweethunter.io) · [Taplio](https://taplio.com) · [Jasper](https://www.jasper.ai) · [Copy.ai](https://www.copy.ai)
- Unreachable: `github.com/As-The-Geek-Learns/content-repurposer` (404). npmjs.com HTML often 403 to curl; npm rows link to `registry.npmjs.org`. `modelcontextprotocol.io/clients` timed out for the researcher (sampling matrix unverified from that page).
