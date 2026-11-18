---
"@javaabu/onu": patch
---

`NumberInput` reads and edits numbers in a `numberLocale` with its own digits (for example Arabic-Indic `١٢٣` in `ar-EG`). It used to reject them, so it couldn't parse its own draft. `numberSymbols()` also returns the locale's `digits`.
