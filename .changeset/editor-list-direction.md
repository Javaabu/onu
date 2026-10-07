---
"@javaabu/onu": patch
---

Editor and BlockRenderer: lists and quotes now get the direction of their first strong character instead of `dir="auto"` (which the browser resolved to LTR because every paragraph inside has its own `dir`), so bullets, numbers and the quote border sit on the right of Dhivehi text. The direction updates while typing and is included in `getHTML()`.
