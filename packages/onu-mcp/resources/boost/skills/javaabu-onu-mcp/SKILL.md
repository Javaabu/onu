---
name: javaabu-onu-mcp
description: Look up Onu (@javaabu/onu) components, props and rules with the Onu MCP server's tools (onu_get_rules, onu_list_components, onu_get_doc, onu_search_docs). Use whenever the project has @javaabu/onu-mcp and the task writes or changes React UI with Onu, or asks which Onu component or prop to use.
license: MIT
metadata:
  author: Javaabu
---

# Looking up Onu with the MCP server

`@javaabu/onu-mcp` serves the docs of the `@javaabu/onu` installed in the project, so its answers match that version. Use it instead of guessing props from other UI kits.

## Tools

| Tool                  | Use it to                                                                      |
| --------------------- | ------------------------------------------------------------------------------ |
| `onu_get_rules`       | Load the rules for writing Onu code. Call it once, before writing any Onu code |
| `onu_list_components` | See every page by section with a one-line description; `section` lists one     |
| `onu_search_docs`     | Find the component for a need, e.g. `"date range laravel"` or `"thaana input"` |
| `onu_get_doc`         | Read a page by component name (`PasswordInput`), file name or path             |

The rules are also the resource `onu://rules`.

## How to use them

1. Call `onu_get_rules` and follow the rules over habits from other UI kits.
2. Before writing a component yourself, search (`onu_search_docs`) or list (`onu_list_components`): Onu probably has it.
3. Call `onu_get_doc` for each component before using it. Use the import from the page's first code block and only the props in its **Props** table, and follow its **Accessibility** notes.

## When the tools aren't available

Read the same docs from the package: the rules and the index are in `node_modules/@javaabu/onu/llms.txt`, and each page is at `node_modules/@javaabu/onu/docs/<group>/<name>.md`. The `javaabu-onu` skill (shipped with `@javaabu/onu`) covers writing the code.

## Setup, if the server isn't configured

Claude Code: `claude mcp add --scope project --transport stdio onu -- npx -y @javaabu/onu-mcp`. Other clients: `{ "mcpServers": { "onu": { "command": "npx", "args": ["-y", "@javaabu/onu-mcp"] } } }`. Set `ONU_DOCS_DIR` to read the docs from another folder.
