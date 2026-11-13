# Scheduling recipes

`content-engine-mcp` stores cadence as **data** (`get_cadence_status`). It does not run a cron inside the MCP process. Wire an external timer to open your agent and say “run the weekly issue.”

## Claude scheduled tasks

In Claude (Pro/Max or Claude Code with a scheduler):

1. Keep this server in the workspace MCP config.
2. Create a Thursday 9:00 task:
   > Call `get_cadence_status`. If the newsletter channel is due and there is an approved seed, `render_outputs`. If nothing is approved, `list_seeds` with status active and help me pick one. Never call `send_newsletter` without asking me to pass `confirm: true`.

## ChatGPT / Codex automations

Codex talks to this server over **stdio tools only** (no prompts, no elicitation). Put a shell one-liner on a timer:

```bash
# remind only — the agent still has to be invoked by you or a wrapper
node dist/index.js --root "$HOME/writing/content-engine"
```

Pair with a Codex/ChatGPT automation prompt that starts: “Use content-engine tools. Do not send.”

## cron

```cron
# Friday 08:00 local — print cadence JSON via a tiny MCP client, or just ping yourself
0 8 * * 5 echo "Content engine: list seeds and cadence" | mail "$USER"
```

A fuller pattern: a script that uses the same `ContentEngine` API as `scripts/smoke.ts` to print `getCadenceStatus()` and exit.

## GitHub Actions

```yaml
name: Cadence ping
on:
  schedule:
    - cron: "0 12 * * 4"   # Thursday 12:00 UTC
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci && npm run build
      - run: node -e "console.log('Open the agent and run get_cadence_status')"
```

Do not put `RESEND_API_KEY` or `SMTP_PASS` in the repo. If an Action should send a **test to self**, store secrets in GitHub Secrets and still require a `workflow_dispatch` confirmation input `confirm=true`.
