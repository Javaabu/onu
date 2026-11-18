---
"@javaabu/onu": patch
---

`TimeSeriesChart` with `brush` resets its zoom when `data` changes to cover other dates, instead of keeping a range (and "Showing …" read-out) from the old data. Inline `data` with the same dates keeps the zoom.
