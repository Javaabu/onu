# @javaabu/onu-mcp

## 0.2.0

### Patch Changes

- 7b32cb8: `Label`, `HelpText`, `RequiredMarker` and `FieldErrors` are now documented on the `FormField` page, under "Building blocks", instead of a page each. The components are unchanged. A docs page can list the components it covers in its `covers` front matter; `docs/index.json` carries the list, and `onu_get_doc` finds the page by any of those names (`onu_get_doc("HelpText")` returns the FormField page).

## 0.1.0

### Minor Changes

- 595acb3: Docs for AI assistants. The package now ships `llms.txt` (the rules for writing Onu code, then every component, hook and guide with one line on what it is for), `llms-full.txt` (every page in one file) and `docs/<group>/<name>.md` (one Markdown page per component, plus `docs/index.json`), so assistants read the docs of the installed version from `node_modules/@javaabu/onu`. New package `@javaabu/onu-mcp`: an MCP server with `onu_get_rules`, `onu_list_components`, `onu_get_doc` and `onu_search_docs`, reading the project's installed docs and falling back to its own copy. See the new "AI assistants" and "Rules for AI assistants" guides.
