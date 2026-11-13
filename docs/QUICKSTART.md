# Quickstart: connect Content Engine without a terminal

This guide is for people who don't use a terminal. You click through your AI app's settings, paste a few fields, and then talk to your agent. Developers who want the command line can use the [README](../README.md#60-second-quickstart).

**What you get:** Content Engine gives your AI agent 33 tools for turning a short idea into a newsletter plus X, Instagram, and LinkedIn drafts. Your agent does the writing. Content Engine saves your voice, sources, drafts, and calendar in a folder on your computer, checks citations, and formats the final copy. It never posts anything by itself.

**Pick your app:**

| App | Works? | Jump to |
|---|---|---|
| Claude Desktop (Mac or Windows) | Yes. Easiest path | [Claude Desktop](#1-claude-desktop) |
| Claude on the web (claude.ai) | No. Web Claude only connects to servers on the internet | [claude.ai web](#claudeai-on-the-web) |
| ChatGPT | Not directly. ChatGPT only connects to servers on the internet | [ChatGPT](#2-chatgpt) |

---

## Before you start

- **Your project folder.** Content Engine saves everything in one folder. This guide uses a folder called `content-engine` inside your home folder. You don't need to create it. Content Engine creates it the first time it runs. Claude Desktop's install screen calls this **Project folder**.
- **Email sending is optional.** You can leave every email setting blank. You only need them if you want Content Engine to send the newsletter for you through Resend or Gmail SMTP, and even then it sends only when you say yes. Type keys only into your app's settings screen. Never paste them into a chat or a shared file.
- **Claude Desktop includes its own Node.js**, so you don't install anything else for section 1. ([source](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop))

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

**Simplest option:** use [Claude Desktop](#1-claude-desktop). It runs Content Engine on your computer with no extra setup.

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

## What to do next

Once the tools show up, ask your agent to walk you through a first issue:

> Using Content Engine: apply the `default` theme, then help me run `setup_vision_and_audience`, `setup_brand`, `setup_voice` and `setup_sourcing`. Then `capture_seed` with this idea: "…your 2–5 line idea…". Then build a research brief, find sources, and draft the newsletter and an X thread. Don't send anything.

See the [README walkthrough](../README.md#walkthrough) for the full flow.

## Docs used to check this guide (checked November 13, 2026)

- Anthropic: [Getting started with local MCP servers on Claude Desktop](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop), [Build a desktop extension with MCPB](https://claude.com/docs/connectors/building/mcpb), [Get started with custom connectors using remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [Use connectors](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities)
- OpenAI: [Add custom MCP server](https://developers.openai.com/api/docs/guides/custom-mcp-server), [Connect and test your plugin](https://developers.openai.com/plugins/deploy/connect-chatgpt)
