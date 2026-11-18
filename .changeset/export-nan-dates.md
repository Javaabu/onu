---
"@javaabu/onu": patch
---

A `NaN` or out-of-range timestamp in a `date` or `datetime` export column now leaves the cell empty. It used to stop the PDF export with an error and write `NaN-NaN-NaN` to CSV.
