---
"@javaabu/onu": patch
---

`applyListingState` returns every matching row when `perPage` is `Infinity` (it returned none), so "export all rows" exports work.
