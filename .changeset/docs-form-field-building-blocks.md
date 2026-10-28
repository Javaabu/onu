---
"@javaabu/onu": patch
"@javaabu/onu-mcp": patch
---

`Label`, `HelpText`, `RequiredMarker` and `FieldErrors` are now documented on the `FormField` page, under "Building blocks", instead of a page each. The components are unchanged. A docs page can list the components it covers in its `covers` front matter; `docs/index.json` carries the list, and `onu_get_doc` finds the page by any of those names (`onu_get_doc("HelpText")` returns the FormField page).
