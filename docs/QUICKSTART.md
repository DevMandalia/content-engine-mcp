# Quickstart: connect Content Engine without a terminal

This guide is for people who don't use a terminal. You click through your AI app's settings, paste a few fields, and then talk to your agent. Developers who want the command line can use the [README](../README.md#60-second-quickstart).

**What you get:** Content Engine gives your AI agent 33 tools for turning a short idea into a newsletter plus X, Instagram, and LinkedIn drafts. Your agent does the writing. Content Engine saves your voice, sources, drafts, and calendar in a folder on your computer, checks citations, and formats the final copy. It never posts anything by itself.

**Pick your app:**

| App | Works? | Jump to |
|---|---|---|
| Claude Desktop (Mac or Windows) | Yes. Easiest path | [Claude Desktop](#1-claude-desktop) |
| Claude on the web (claude.ai) | No. Web Claude only connects to servers on the internet | [claude.ai web](#claudeai-on-the-web) |
| ChatGPT | Not directly. ChatGPT only connects to servers on the internet | [ChatGPT](#2-chatgpt) |
| Cursor | Yes. One-click button | [Cursor](#3-cursor) |
| Grok Bot | Yes, with limits | [Grok Bot](#4-grok-bot) |
| Any other MCP app | Usually | [Other apps](#5-any-other-mcp-app) |

---

## Before you start

- **Your project folder.** Content Engine saves everything in one folder. This guide uses a folder called `content-engine` inside your home folder. You don't need to create it. Content Engine creates it the first time it runs. Claude Desktop's install screen calls this **Project folder**.
- **Email sending is optional.** You can leave every email setting blank. You only need them if you want Content Engine to send the newsletter for you through Resend or Gmail SMTP, and even then it sends only when you say yes. Type keys only into your app's settings screen. Never paste them into a chat or a shared file.
- **Node.js (Cursor and "other apps" only).** These apps start Content Engine with Node.js. Download the **LTS** installer from [nodejs.org](https://nodejs.org/en/download), double-click it, and click through. Restart your AI app afterwards. Claude Desktop doesn't need this because it [includes its own Node.js](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop).

---

## 1. Claude Desktop

Claude Desktop installs Content Engine as a **desktop extension**, a single `.mcpb` file. Official docs: [Getting started with local MCP servers on Claude Desktop](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop) and [Build a desktop extension with MCPB](https://claude.com/docs/connectors/building/mcpb).

1. Open the [v0.1.1 release](https://github.com/DevMandalia/content-engine-mcp/releases/tag/v0.1.1) (or the [latest release](https://github.com/DevMandalia/content-engine-mcp/releases/latest)).
2. Under **Assets**, click **[`content-engine-mcp.mcpb`](https://github.com/DevMandalia/content-engine-mcp/releases/download/v0.1.1/content-engine-mcp.mcpb)** to download it.
3. Install it in **one** of these ways:
   - **Double-click** the downloaded file. Claude Desktop opens an install screen.
   - Or **drag** the file into the Claude Desktop window.
   - Or, in Claude Desktop, go to **Settings > Desktop app**, click **Manage** next to **Extensions**, then click **Advanced settings**. Under **Extension Developer**, click **Install Extension…** and pick the file. In the older Settings layout, this is **Settings > Extensions**.
4. Review the install screen and click **Install**.
5. Set **Project folder** if you want a different location. The default is `content-engine` inside your home folder. You can leave the default. Content Engine creates the folder if it does not exist.
6. Make sure the extension is turned **on**.

### Check it worked

1. In a new chat, click the **+** button at the bottom of the chat box, then **Connectors**. **Content Engine** should be listed with its tools. ([source](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop))
2. Try this first prompt:

   > Use Content Engine. Call `list_themes`, then `get_setup`, and tell me what I still need to set up.

3. Claude should ask permission to use the tool, then show the themes `default`, `taverna-daily` and `minimal-plain`, followed by a setup checklist.

### Troubleshooting

- **The file won't install.** Update Claude Desktop to the latest version and download the file again from the [v0.1.1 release](https://github.com/DevMandalia/content-engine-mcp/releases/tag/v0.1.1).
- **Double-click does nothing (often on Windows).** Use the **Install Extension…** button from step 3 instead. *(Reported by users, not stated in Anthropic's docs.)*
- **It installed, but the tools are missing.** Quit Claude Desktop completely, reopen it, and check that the extension is turned on. ([source](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop))
- **You want to see errors.** Open the extension in the Extensions page and read its logs. ([source](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop))
- **Your work or school account blocks it.** Your admin may have turned off custom extensions. Ask them.

### claude.ai on the web

**The website can't run Content Engine.** On claude.ai, a custom connector is a **remote** MCP server: a web address (`https://…`) that Anthropic's cloud connects to over the internet ([Anthropic: Get started with custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [Use connectors](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)). Content Engine runs as a program on your own computer and has no web address, so **Customize > Connectors > Add custom connector** won't work for it.

**Use Claude Desktop instead** (section 1 above). It runs Content Engine on your computer.

---

## 2. ChatGPT

**ChatGPT can't run Content Engine directly.** ChatGPT connects to custom MCP servers on the web only, and only through an internet address or OpenAI's Secure MCP Tunnel. Supported connection types are SSE and streaming HTTP ([OpenAI: Add custom MCP server](https://developers.openai.com/api/docs/guides/custom-mcp-server)). Content Engine runs as a program on your computer (a "local stdio" server), so you can't paste it into ChatGPT.

**Simplest option:** use [Claude Desktop](#1-claude-desktop) or [Cursor](#3-cursor). Both run Content Engine on your computer with no extra setup.

**Advanced option (needs technical help, not no-terminal):** someone technical can run Content Engine on a computer behind OpenAI's **Secure MCP Tunnel**, or behind a bridge that turns a local server into a web address. OpenAI's [Connect and test your plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt) page says a tunnel "can reach its configured stdio or HTTP MCP server". After that, the ChatGPT side is all clicks:

1. On ChatGPT **on the web**, go to **Plugins**.
2. Click the **plus** button, then **Add custom MCP server**. Some accounts show the label **Create custom MCP server**. *(The second label comes from third-party reports, not OpenAI's docs.)*
3. Enter a name (for example `Content Engine`). Under **Connection**, enter the server URL, or choose **Tunnel** and pick your tunnel.
4. Choose an authentication option, read the warning, click **I understand and want to continue**, then **Create as a plugin**.
5. Install the plugin. In a chat, type **@** and pick it.

Content Engine doesn't ship a tunnel or bridge itself. This project hasn't tested any tunnel setup, so treat this path as **(not verified)**.

### Check it worked (advanced option only)

> @Content Engine call `list_themes` and `get_setup`. Don't use any other tools.

### Troubleshooting

- **You can't find "Add custom MCP server".** It's web only, and your plan or workspace admin may control it ([OpenAI](https://developers.openai.com/api/docs/guides/custom-mcp-server)).
- **ChatGPT can't connect.** OpenAI's docs suggest checking the address with MCP Inspector, or checking the tunnel's status ([OpenAI](https://developers.openai.com/plugins/deploy/connect-chatgpt)).
- **ChatGPT asks before every action.** That's expected. Tools that change things ask for confirmation by default.

---

## 3. Cursor

Official docs: [Cursor: Model Context Protocol](https://cursor.com/docs/mcp) and [Cursor: MCP install links](https://cursor.com/docs/mcp/install-links).

### One-click install

1. Install [Node.js](https://nodejs.org/en/download) if you haven't (see [Before you start](#before-you-start)).
2. Open Cursor, then click this button:

   [![Add Content Engine to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=content-engine&config=eyJ0eXBlIjoic3RkaW8iLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImNvbnRlbnQtZW5naW5lLW1jcCJdLCJlbnYiOnsiQ09OVEVOVF9FTkdJTkVfUk9PVCI6IiR7dXNlckhvbWV9L2NvbnRlbnQtZW5naW5lIn19)

   If the button doesn't open Cursor, copy this link into your browser's address bar:

   ```text
   cursor://anysphere.cursor-deeplink/mcp/install?name=content-engine&config=eyJ0eXBlIjoic3RkaW8iLCJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImNvbnRlbnQtZW5naW5lLW1jcCJdLCJlbnYiOnsiQ09OVEVOVF9FTkdJTkVfUk9PVCI6IiR7dXNlckhvbWV9L2NvbnRlbnQtZW5naW5lIn19
   ```

3. Your browser may ask to open Cursor. Allow it.
4. Cursor asks you to confirm the install. Click to install. ([source](https://cursor.com/docs/mcp/install-links))

The link contains only these settings and no keys or passwords:

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "content-engine-mcp"],
  "env": { "CONTENT_ENGINE_ROOT": "${userHome}/content-engine" }
}
```

Cursor replaces `${userHome}` with your home folder ([source](https://cursor.com/docs/mcp#config-interpolation)).

> The button's `https://cursor.com/install-mcp` page hands off to the Cursor app. That page works today, but Cursor's docs only show the `cursor://` form, so the web button is **(not verified)** in official docs.

### Manual install (if the button doesn't work)

Cursor's docs say you manage MCP servers from the **Customize** page or in `mcp.json` ([source](https://cursor.com/docs/mcp)). They don't spell out a click-by-click "add custom server" form, so the exact button names below are **(not verified)**:

1. Open **Customize** in Cursor's sidebar and find the MCP section.
2. Choose the option to add a new or custom MCP server. Cursor opens your `mcp.json` file.
3. Paste the block from [Copy-paste JSON](#copy-paste-json) below, then save the file.
4. Restart Cursor.

### Check it worked

1. Open **Customize** in the sidebar. **content-engine** should be listed and turned on. ([source](https://cursor.com/docs/mcp#can-i-temporarily-disable-an-mcp-server))
2. In a new Agent chat, try:

   > Use the content-engine tools: call `list_themes`, then `apply_theme` with name `taverna-daily`, then `get_setup`.

3. Cursor asks before running each tool ([source](https://cursor.com/docs/mcp#tool-approval)). Approve them, and you should see the theme list and a setup checklist.

### Troubleshooting

- **"npx not found", or the server shows an error.** Install Node.js LTS, then quit and reopen Cursor.
- **Tools don't appear.** Make sure the server is turned on in **Customize**, then restart Cursor.
- **You want to see errors.** Open the Output panel (Cmd+Shift+U on Mac, Ctrl+Shift+U on Windows) and choose **MCP Logs** from the dropdown. ([source](https://cursor.com/docs/mcp#how-do-i-debug-mcp-server-issues))
- **Your company manages Cursor.** An admin allowlist may block local servers ([source](https://cursor.com/docs/mcp#mcp-allowlist)).

---

## 4. Grok Bot

**What we could verify:** Grok Bot adds connectors that aren't in its catalog when you ask it to in chat. It can add a server by **web address**, or by a **command that runs on Grok Bot's own cloud computer**. A command server is then available to all your Grok Bots. Grok Bot confirms the details with you before it adds one. New tools show up from your **next** message.

**What that means for Content Engine:**

- Content Engine runs on **Grok Bot's computer**, not on yours. Your drafts and project folder live there. To get a file onto your computer, ask Grok Bot to send or upload it.
- It needs the npm package to be published.

### Steps

1. Open a chat with your Grok Bot.
2. Send this message:

   > Add this MCP server as a command connector named "content-engine". Command: `npx`. Arguments: `-y`, `content-engine-mcp`. Environment: `CONTENT_ENGINE_ROOT` = a `content-engine` folder in your home directory. No secrets.

3. Grok Bot repeats the details back to you. Confirm them.
4. Send any message so the new tools load.

**Connect apps form (not verified):** some third-party guides describe a **Connect apps** item in the Grok Bot sidebar with an **Add a custom connector** form (Type: **Command**, then Command and Arguments). Other sources say there is no such form. We couldn't confirm either from official Grok Bot docs, so asking in chat is the method this guide recommends.

### Check it worked

> Use the content-engine connector: call `list_themes` and `get_setup`, and show me the results.

### Troubleshooting

- **Grok Bot says the tools aren't there.** Send one more message. New connectors load on the next turn.
- **The command fails.** Ask Grok Bot to check that Node.js is installed on its computer and to show you the connector's status.
- **You want to use it from claude.ai or ChatGPT instead.** Those need a web address. See the sections above.

---

## 5. Any other MCP app

Most MCP apps (Windsurf, VS Code, Goose, LM Studio and others) have a form or a settings file for a "local", "stdio" or "command" server. Fill it in like this:

| Field | Value |
|---|---|
| Name | `content-engine` |
| Type / transport | `stdio` (or "Command" / "Local") |
| Command | `npx` |
| Arguments | `-y` and `content-engine-mcp` (two separate arguments) |
| Environment: `CONTENT_ENGINE_ROOT` | Full path to your project folder, e.g. `/Users/you/content-engine` (Mac) or `C:\Users\you\content-engine` (Windows) |
| Environment (optional, for sending) | `RESEND_API_KEY` and `RESEND_FROM`, **or** `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Leave these out unless you want Content Engine to send newsletters. |

If you skip `CONTENT_ENGINE_ROOT`, Content Engine uses a `content-engine` folder inside whatever folder the app starts it from. Setting it avoids surprises.

### Copy-paste JSON

If your app asks for JSON, paste this. Replace the folder path with your own. Add the email keys only in your app's private settings, never in a shared or committed file.

```json
{
  "mcpServers": {
    "content-engine": {
      "command": "npx",
      "args": ["-y", "content-engine-mcp"],
      "env": {
        "CONTENT_ENGINE_ROOT": "/full/path/to/your/content-engine"
      }
    }
  }
}
```

### Check it worked

> Call the content-engine `list_themes` tool, then `get_setup`. Tell me which setup steps are missing.

### Troubleshooting

- **"npx" or "node" not found.** Install Node.js LTS from [nodejs.org](https://nodejs.org/en/download), then fully restart the app.
- **Tools don't show up.** Restart the app. Some apps only load servers at startup.
- **The project folder is in an odd place.** Set `CONTENT_ENGINE_ROOT` to a full path.
- **Sending fails.** `send_newsletter` needs the Resend or SMTP settings above, and it only sends when you explicitly confirm.

---

## What to do next

Once the tools show up, ask your agent to walk you through a first issue:

> Using Content Engine: apply the `default` theme, then help me run `setup_vision_and_audience`, `setup_brand`, `setup_voice` and `setup_sourcing`. Then `capture_seed` with this idea: "…your 2–5 line idea…". Then build a research brief, find sources, and draft the newsletter and an X thread. Don't send anything.

See the [README walkthrough](../README.md#walkthrough) for the full flow.

## Docs used to check this guide (checked November 13, 2026)

- Anthropic: [Getting started with local MCP servers on Claude Desktop](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop), [Build a desktop extension with MCPB](https://claude.com/docs/connectors/building/mcpb), [Get started with custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [Use connectors](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)
- OpenAI: [Add custom MCP server](https://developers.openai.com/api/docs/guides/custom-mcp-server), [Connect and test your plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt)
- Cursor: [Model Context Protocol](https://cursor.com/docs/mcp), [MCP install links](https://cursor.com/docs/mcp/install-links)
- Grok Bot: no public page about custom connectors could be loaded. Grok Bot's chat-based connector flow is described from the product's own behavior.
