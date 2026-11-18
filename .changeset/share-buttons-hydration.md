---
"@javaabu/onu": patch
---

Server-rendered `ShareButtons` without a `url` now get the current page's URL after hydration; before, their share links kept the server's empty URL.
