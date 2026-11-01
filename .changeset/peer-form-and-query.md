---
"@javaabu/onu": minor
---

`react-hook-form` and `@tanstack/react-query` are now peer dependencies. `getOnuQueryClient` is gone: the fallback client belongs to each `OnuProvider`, and `invalidateApiOptions` takes the client first.
