---
"@javaabu/onu": patch
---

Excel exports now write `date` and `datetime` cells in local time, like CSV and PDF. Before, a user east of UTC saw dates a day early and times shifted by their UTC offset.
