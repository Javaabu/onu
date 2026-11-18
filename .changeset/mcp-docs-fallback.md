---
"@javaabu/onu-mcp": patch
---

If the project's docs don't load (a wrong `ONU_DOCS_DIR`, a malformed `index.json`, a missing page), the server now warns on stderr and serves its bundled docs instead of crashing. An empty `ONU_DOCS_DIR` counts as unset.
