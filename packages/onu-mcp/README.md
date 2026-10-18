# @javaabu/onu-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI assistants the docs of [Onu](https://github.com/Javaabu/onu) (`@javaabu/onu`), Javaabu's React UI library, and the rules for writing Onu code.

It reads the docs of the `@javaabu/onu` installed in your project (`node_modules/@javaabu/onu/docs`, looked up from the folder the assistant runs in and its parents), so answers match your version. Without one, it uses the docs it was published with. `ONU_DOCS_DIR` points it at another folder.

## Tools

| Tool                  | What it does                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `onu_get_rules`       | The rules for writing Onu code: setup, imports, forms, Thaana and RTL, theming, icons, accessibility |
| `onu_list_components` | Every docs page by section, with a one-line description; `section` lists one                         |
| `onu_get_doc`         | A page as Markdown, by component name (`PasswordInput`), file name or path                           |
| `onu_search_docs`     | Searches every page, e.g. `"date range laravel"`                                                     |

The rules are also a resource, `onu://rules`.

## Setup

Claude Code:

```bash
claude mcp add --scope project --transport stdio onu -- npx -y @javaabu/onu-mcp
```

Cursor (`.cursor/mcp.json`), VS Code (`.vscode/mcp.json`, under `"servers"`), Claude Desktop and other clients:

```json
{
  "mcpServers": {
    "onu": { "command": "npx", "args": ["-y", "@javaabu/onu-mcp"] }
  }
}
```

See [AI assistants](https://github.com/Javaabu/onu/blob/main/docs/guides/ai-assistants.md) for the other ways to give an assistant Onu's docs.

## Development

```bash
pnpm --filter @javaabu/onu-mcp test    # tests (generate the docs into a temp folder)
pnpm --filter @javaabu/onu-mcp build   # bundles the docs into data/ and compiles to dist/
```
