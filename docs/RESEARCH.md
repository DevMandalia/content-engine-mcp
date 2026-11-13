# Research: personal content engines and MCP servers

Time-boxed scan of adjacent products, open-source engines, and newsletter/social MCP servers. Capability claims below come from public docs, GitHub READMEs, and vendor help pages as of 13 Nov 2026. No usage, revenue, or performance numbers are invented.

**What this project is not:** a scheduler, a publisher, or a multi-agent research swarm. Phase 1 is a **local, tools-only MCP server** that stores voice, ideas, briefs, sources, drafts, and renders, then hands copy packs back to the user. The user's existing MCP-capable agent (Claude Desktop/Code, Cursor, Codex, ChatGPT, Windsurf, …) does the web research and the writing.

## Constraints folded into Phase 1

| Constraint | Source | Implication |
|---|---|---|
| MCP spec **2026-07-28** deprecates **sampling** | [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28) | This server never asks the host to sample. Research briefs, voice guides, and draft kits are deterministic templates. The **user's agent writes**. |
| **Codex does not support MCP prompts or elicitation** | Client capability matrix (Codex config is tools-only stdio) | Every setup step is a **plain tool**. Prompts exist as optional guided flows for clients that list them; nothing requires them. |
| **Smithery** stopped accepting new external servers and shut down its proxy / `run.tools` URLs on **31 Oct 2026** | [The future of Smithery](https://www.smithery.ai/future); [registry migration notes](https://github.com/jin-1119/plato-mcp/issues/157) | Distribute via **`npx` + official MCP Registry `server.json`**. Do not depend on Smithery hosting. |
| Instagram / LinkedIn / Threads / TikTok **API posting needs app review**; **X API posting is paid** | Platform developer policies | Phase 1 ships **copy packs and intent links only**. No auto-publish to social networks. |
| **beehiiv free cannot send via API** | [beehiiv MCP help](https://www.beehiiv.com/support/article/39255979546263-getting-started-with-the-beehiiv-mcp); [newsletter MCP comparison](https://www.newsletterapi.io/blog/newsletter-mcp-servers-compared) | Phase 1 send adapters are **Resend** (free tier) and **SMTP** (Gmail app passwords). Kit / beehiiv / Buttondown / Ghost are Phase 2. |
| Server **never calls an LLM** in v0.1 | Design | Tools are deterministic and tested with golden files. |
| Source fetch **SSRF** | Design | Block private/loopback; ids `S1`, `S2`, …. No RSS in v0.1. |
| Fact-check + render gate | Design | Flag number / `%` / `$` / date without `[S#]`. Newsletter render blocked unless `draft: true`. |
| X weighted length | `twitter-text` | URLs count 23; emoji/CJK weighted; numbered separate intent links. |
| **Postiz is AGPL-3.0** | [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | Cite as a scheduler to *hand off to*. **Do not copy its code.** |
| `content-repurposer-mcp` registry listing | Registry scan | **Dead repo — do not cite as a working prior art.** |
| Themes as YAML | Design | Ship `default`, `babaganoush` (Greek taverna), `minimal-plain`. |
| Official MCP Registry | [quickstart](https://modelcontextprotocol.io/registry/quickstart) | `server.json` + `mcpName`. Description ≤ 100 chars. npm/registry publish are **later**. |

## Competitive table

| Project | What it is | License / access | How it relates |
|---|---|---|---|
| [Postiz](https://github.com/gitroomhq/postiz-app) ([MCP docs](https://docs.postiz.com/mcp/introduction), [MCP product](https://postiz.com/mcp)) | Open-source self-hosted social scheduler with AI assists, analytics, team collab, and a remote MCP (`schedulePostTool`, image/video/clip tools). Positions as Buffer / Hypefury alternative. | **AGPL-3.0** self-host; hosted cloud | **Publish/schedule** engine. Phase 2: hand off copy packs to Postiz MCP. **We do not copy Postiz source.** |
| [Buffer MCP](https://developers.buffer.com/guides/integrations/mcp.html) | Remote MCP at `https://mcp.buffer.com/mcp`. Ideas, drafts, queue, `create_post` across Instagram, Facebook, X, LinkedIn, Pinterest, YouTube, TikTok, Threads, Bluesky, Substack, etc. | Hosted product | **Publish/schedule**. Phase 2 hand-off target. Does not own voice, fact-check, or newsletter HTML. |
| [Typefully MCP](https://support.typefully.com/en/articles/13128440-typefully-mcp-server) (`https://mcp.typefully.com/mcp`) | Writing-first scheduler for X, LinkedIn, Threads, Bluesky, Mastodon, Instagram. Drafts, threads, queue, comments, media, AI rewrite in the product. | Hosted product | Best-in-class **thread editor + queue**. Phase 2 hand-off. |
| [Hypefury](https://hypefury.com) | X-centric scheduler: threads, queues, engagement automation, cross-post. | Hosted | Feature set to match for **X thread split + cadence**, not a protocol to integrate. |
| [Mixpost](https://github.com/inovector/mixpost) | Self-hosted Laravel scheduler; Lite is MIT (Facebook Pages, Mastodon, X); Pro unlocks Instagram/LinkedIn/etc. Calendar, media library, per-network versions. | MIT (Lite) | Scheduler, not a writing engine. |
| [n8n content workflows](https://n8n.io/workflows/) | Graph automations: e.g. [weekly SEO blog + social](https://n8n.io/workflows/22365-draft-weekly-seo-blogs-and-social-posts-with-openai-google-sheets-and-wordpress/), [AI newsletter + Tavily + Gmail](https://n8n.io/workflows/14412-generate-and-send-ai-newsletters-with-openai-tavily-google-sheets-and-gmail/), [GPT-4 + Buffer from Sheets](https://n8n.io/workflows/7517-generate-and-schedule-social-media-content-with-gpt-4-and-buffer-from-google-sheets/). Some approval-gate; many auto-send. | Fair-code / hosted | Recipes for **cadence + approval**. We keep approval as MCP tools, not a daemon. |
| [GPT-Researcher](https://github.com/assafelovic/gpt-researcher) | Autonomous deep-research agent: planner + parallel retrieval + cited reports. | Apache-2.0 | **Does the research.** We do not. Phase 1 emits a research **brief** the user's agent (or GPTR) executes. |
| [Stanford STORM](https://github.com/stanford-oval/storm) ([project](https://storm-project.stanford.edu/research/storm/)) | Outline-first Wikipedia-like articles via multi-perspective question asking + retrieval. | MIT (`knowledge-storm`) | Same split: they run a research swarm; we only **structure the questions**. |
| [Lately](https://www.lately.ai/how-it-works) | Hosted social AI: Voice Model from analytics + **thumbs up/down/edits**, then atomizes long-form into channel posts and schedules. | Hosted | Closest **feedback → voice** analogue. We persist revision comments into `voice.md` instead of training a model. |
| [Easel (ZJU-REAL)](https://github.com/ZJU-REAL/Easel) | Open-source social agent: discover → plan → produce (copy/image/video) → publish via browser automation → attribute back to a profile. MCP/skills around an agent runtime. | Apache-2.0 | Full **multi-agent workbench**. We stay single-agent + files, Western channels, no browser login publishing. |
| [claude-repurpose](https://github.com/AgriciDaniel/claude-repurpose) | Claude Code engine: one asset → 10+ platform packs (X thread, IG carousel + reel, LinkedIn carousel script, newsletter excerpt, …) via parallel agents. | MIT | Repurpose **from finished long-form**. We start from a **2–5 line seed** and keep a source/fact-check loop. |
| [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent) | LangGraph agent: URL in → X & LinkedIn posts, human-in-the-loop auth/edit/accept, optional Slack. | MIT | HITL publish agent. We store HITL as **tools + calendar state**, and add newsletter HTML. |
| [Kit MCP](https://developers.kit.com/mcp/kit-mcp) (`https://app.kit.com/mcp`) | Official remote MCP for a Kit account: subscribers, tags, sequences, **draft broadcasts**. Paid plans. Official docs: MCP **does not send**; it returns a `confirm_url` for the creator. | Hosted, paid | Phase 2 newsletter adapter. Do not treat as a Phase 1 send path. |
| [beehiiv MCP](https://www.beehiiv.com/support/article/39255979546263-getting-started-with-the-beehiiv-mcp) (`https://mcp.beehiiv.com/mcp`) | Official hosted MCP, OAuth. Read on free; write from Lite. **Publishing/sending stay human** in beehiiv. | Hosted | Phase 2. Free cannot send via API. |
| [Ghost](https://forum.ghost.org/t/proposal-first-party-mcp-model-context-protocol-server-for-the-admin-api/62774) | No first-party MCP found. Community servers wrap Admin API (`MFYDev/ghost-mcp`). | Community | Phase 2 / Later. |
| [Buttondown](https://www.newsletterapi.io/blog/newsletter-mcp-servers-compared) | No first-party MCP found. Community API-key servers exist. | Community | Phase 2. |
| [SocialNeuron MCP](https://github.com/socialneuron/mcp-server) | Hosted “93 tools” content + schedule + analytics MCP. | Hosted | Cloud content OS. Opposite of our local-files promise. |
| [AI-Marketing-OS-MCP](https://github.com/thebuildercompany/ai-marketing-os-mcp) | Remote MCP: RSS research, save multi-channel drafts, scaffolded X/LinkedIn/beehiiv publish. | Project | Similar shape, remote + Mongo. We are stdio + a folder. |

## Capability matrix

Legend for **content-engine-mcp**: **P1** = Phase 1 (this repo), **P2** = Phase 2, **L** = Later. For others: **Y** = documented, **P** = partial / adjacent, **—** = not the product.

| Capability | content-engine-mcp | Postiz | Buffer MCP | Typefully MCP | Mixpost | GPT-R / STORM | Lately | Easel | claude-repurpose | LC social-media-agent | Kit / beehiiv MCP | n8n recipes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Runs inside the user's existing agent (no extra swarm) | **P1** | — | Y | Y | — | — | — | P (own agent) | P (Claude Code agents) | — | Y | — |
| Tools-only setup (Codex-safe; no elicitation) | **P1** | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Local markdown/yaml project (no required cloud) | **P1** | self-host | — | — | self-host | Y | — | Y | Y | Y | — | Sheets/DB |
| Vision, audience, brand, cadence, sourcing files | **P1** | P | P (ideas) | P | P | — | Voice Model | Account profile | — | — | — | CONFIG node |
| Voice guide from adjectives + pasted samples | **P1** | P | — | P (product AI) | — | — | Y | Y | — | — | — | prompt text |
| Learn standing prefs from approve / edit / kill | **P1** | — | — | comments | — | — | **Y** (edits & thumbs) | attribution loop | — | HITL edits | — | — |
| Seed bank (capture, classify, search, kill/revive) | **P1** | P | ideas | drafts | — | query | ingest long-form | topics | input URL/file | URL in | — | sheet rows |
| Structured research brief (questions/angles/sources) | **P1** | — | — | — | — | **Y** (executes) | — | discover | atomize existing | fetch URL | — | Tavily node |
| Agent-owned web research (server does not fetch the web) | **P1** | n/a | n/a | n/a | n/a | they fetch | they fetch | they fetch | they fetch | they fetch | n/a | they fetch |
| Attach sources with URLs; drafts cite them | **P1** | — | — | — | — | citations | — | P | atoms include stats | — | — | varies |
| Deterministic unsourced-claim flags | **P1** | — | — | — | — | P | — | quality-gate | — | — | — | — |
| Draft kits + versioned drafts per channel | **P1** | versions | drafts | drafts | per-network | report | posts | outputs/ | many packs | 2 channels | broadcasts | sheet tabs |
| Newsletter email-safe HTML (table, inline CSS, themes) | **P1** | — | — | — | — | — | — | — | excerpt | — | in product | HTML node |
| X thread split + `x.com/intent/post` handoff | **P1** | publish | publish | publish | publish | — | schedule | Playwright X | thread files | publish | — | Buffer node |
| Instagram caption + carousel copy (+ optional Reel script) | **P1** | publish | publish | P | Pro | — | Y | cards | carousel + reel | — | — | Y |
| LinkedIn post copy pack | **P1** | publish | publish | publish | Pro | — | Y | — | post + PDF script | publish | — | Y |
| Native social publish (IG/LI/X/TikTok APIs) | **P2** via Buffer/Typefully/Postiz MCP | **Y** | **Y** | **Y** | Y | — | Y | browser | — | Y | — | Y |
| Newsletter send: Resend + SMTP, explicit `confirm` | **P1** | email notif | — | — | — | — | — | — | — | — | human send | Gmail node |
| Kit / beehiiv / Buttondown / Ghost adapters | **P2** | — | Substack | Substack Notes | — | — | — | WeChat/etc. | — | — | **Y** | — |
| PNG 1080×1350 carousel slides | **P2** | media | assets | media | library | — | — | **Y** | image prompts | images | — | DALL·E |
| Self-scheduling daemon | **L** (docs only: host cron) | **Y** | **Y** | **Y** | **Y** | — | Y | queue | 7-day plan file | Y | product | **Y** |
| Analytics → next idea | **L** | Y | Y | Y | Y | — | **Y** | **Y** | — | — | product | — |
| MCP sampling / server-side LLM | **never** (spec-deprecated; out of scope) | product AI | — | product AI | — | **Y** | **Y** | **Y** | **Y** | **Y** | — | OpenAI node |

## Channel posting reality (why Phase 1 is copy packs)

- **X:** posting through the API is a paid product. Phase 1 emits a 280-character split and an [intent URL](https://x.com/intent/post?text=).
- **Instagram, LinkedIn, Threads, TikTok:** official posting APIs require a developer app and (typically) app review. Phase 1 does not ship those credentials flows.
- **Phase 2 (optional):** after the user approves a pack, the same agent can call **Buffer MCP**, **Typefully MCP**, or **Postiz MCP** — they already hold the OAuth connections.

## Newsletter sending reality

- **Kit MCP** (official): draft broadcasts; sending is a human confirmation in Kit ([developer brief](https://developers.kit.com/mcp/kit-mcp)).
- **beehiiv MCP:** available without a waitlist; write access and sending are plan-gated, and beehiiv keeps publish/send as human actions. Free is not an API send path.
- **Ghost / Buttondown:** community MCP only, API keys.
- **Phase 1:** `send_newsletter` with `confirm: true`, adapters **Resend** and **SMTP**, plus send-test-to-self.

## Distribution

Smithery is no longer an onboarding path for new external servers (proxy shutdown 31 Oct 2026). This repo ships:

1. `npx content-engine-mcp` / `node dist/index.js` over **stdio**.
2. [`server.json`](../server.json) for the [official MCP Registry](https://modelcontextprotocol.io/registry/quickstart) (`mcpName` in `package.json` must match `server.json.name` when you publish).

Update the `io.github.content-engine/…` namespace to your GitHub user/org before `mcp-publisher publish`.

## Sources

- Postiz: [GitHub](https://github.com/gitroomhq/postiz-app), [MCP introduction](https://docs.postiz.com/mcp/introduction), [postiz.com/mcp](https://postiz.com/mcp)
- Buffer: [MCP guide](https://developers.buffer.com/guides/integrations/mcp.html)
- Typefully: [MCP help](https://support.typefully.com/en/articles/13128440-typefully-mcp-server), [mcp.typefully.com](https://mcp.typefully.com/)
- Mixpost / open-source schedulers: [Unvendored Buffer alternatives](https://unvendored.com/alternatives/buffer)
- GPT-Researcher: [GitHub](https://github.com/assafelovic/gpt-researcher)
- STORM: [GitHub](https://github.com/stanford-oval/storm), [NAACL 2024 project page](https://storm-project.stanford.edu/research/storm/)
- Lately: [How it works](https://www.lately.ai/how-it-works)
- Easel: [ZJU-REAL/Easel](https://github.com/ZJU-REAL/Easel)
- claude-repurpose: [AgriciDaniel/claude-repurpose](https://github.com/AgriciDaniel/claude-repurpose)
- LangChain social-media-agent: [langchain-ai/social-media-agent](https://github.com/langchain-ai/social-media-agent)
- Kit MCP: [developers.kit.com/mcp/kit-mcp](https://developers.kit.com/mcp/kit-mcp)
- beehiiv MCP: [help article](https://www.beehiiv.com/support/article/39255979546263-getting-started-with-the-beehiiv-mcp)
- Newsletter MCP comparison (Kit / beehiiv / Ghost / Buttondown / Substack): [newsletterapi.io](https://www.newsletterapi.io/blog/newsletter-mcp-servers-compared)
- MCP Registry: [quickstart](https://modelcontextprotocol.io/registry/quickstart)
- Smithery shutdown: [smithery.ai/future](https://www.smithery.ai/future)
- n8n templates linked in the table above
- MCP TypeScript SDK: [v1 `@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk) (this repo); v2 is `@modelcontextprotocol/server`
