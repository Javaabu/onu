# AI assistants

Onu's docs are written so AI coding assistants (Claude Code, Cursor, Copilot, ChatGPT and others) can use them: every page is plain Markdown with a Props table and an Accessibility section, and there is a short list of [rules for writing Onu code](./rules-for-ai.md). Give your assistant the docs in one of these ways.

# Docs in the package

The npm package ships its docs, so they always match the version you have installed:

| File | What |
| --- | --- |
| `node_modules/@javaabu/onu/llms.txt` | The rules, then every component, hook and guide with one line on what it is for and the path to its page |
| `node_modules/@javaabu/onu/docs/<group>/<name>.md` | One page, e.g. `docs/text-inputs/password-input.md` |
| `node_modules/@javaabu/onu/llms-full.txt` | Every page in one file (about 850 kB; for tools that index docs, not for a chat) |
| `node_modules/@javaabu/onu/docs/index.json` | The index as JSON |

Point your assistant at them from the project's instructions file (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules`, `.github/copilot-instructions.md`):

```md
## UI

This app uses Onu (@javaabu/onu) for all UI. Before writing UI code, read the Rules section of
node_modules/@javaabu/onu/llms.txt. Before using a component, read its page in
node_modules/@javaabu/onu/docs/ (paths are listed in llms.txt) and use only the props it lists.
```

# On the docs site

The site serves the same files at its root: [`/llms.txt`](https://onu.on-forge.com/llms.txt), [`/llms-full.txt`](https://onu.on-forge.com/llms-full.txt) and `/docs/<group>/<name>.md`. Each component page has a **Copy page** button that copies the page as Markdown, with a menu to view the Markdown or open the page in Claude or ChatGPT.

`llms.txt` on the site also lists the sample pages (whole screens such as sign in, listing and settings pages) with links to their source.

# MCP server

`@javaabu/onu-mcp` is a [Model Context Protocol](https://modelcontextprotocol.io) server for assistants that support MCP. It reads the docs of the `@javaabu/onu` installed in your project (from the folder the assistant runs in, or a parent folder), and falls back to the docs it was published with.

| Tool | What it does |
| --- | --- |
| `onu_get_rules` | The rules for writing Onu code |
| `onu_list_components` | Every page by section, with a one-line description; `section` lists one |
| `onu_get_doc` | A page as Markdown, by component name (`PasswordInput`), file name or path |
| `onu_search_docs` | Searches every page, e.g. `"date range laravel"` |

Claude Code:

```bash
claude mcp add --scope project --transport stdio onu -- npx -y @javaabu/onu-mcp
```

Other clients (Cursor's `.cursor/mcp.json`, VS Code's `.vscode/mcp.json`, Claude Desktop):

```json
{
  "mcpServers": {
    "onu": { "command": "npx", "args": ["-y", "@javaabu/onu-mcp"] }
  }
}
```

Set `ONU_DOCS_DIR` to read the docs from another folder.

# Claude Code plugin

The Onu repository is a Claude Code plugin marketplace. The `onu` plugin adds a skill that tells Claude to load the rules and read each component's page before using it, and sets up the MCP server:

```text
/plugin marketplace add Javaabu/onu
/plugin install onu@javaabu-onu
```
