---
"@javaabu/onu": patch
---

`Pagination` builds page links from the URLs a Laravel paginator sends, so the query string (search, filters) and a custom `pageName` are kept instead of being replaced by `path?page=N`.
