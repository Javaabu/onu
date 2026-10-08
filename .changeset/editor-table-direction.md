---
"@javaabu/onu": patch
---

Editor and BlockRenderer: tables now take the direction of their first strong text, like lists and quotes. The table and its scroll wrapper get the resolved `dir` (in `BlockRenderer`, `getHTML()` and, updated while typing, both editors), so a Dhivehi table puts its first column on the right even on an English page. Table cells align to their logical start. An explicit `dir` in the content still wins; a table with no strong text yet stays `dir="auto"`.
