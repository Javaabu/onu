---
"@javaabu/onu": patch
---

`TimeSeriesChart` with `interval` no longer drops rows: rows in the same hour, day, week or month are added up (or averaged with the new `aggregate="mean"`), weekly data no longer needs to fall a whole number of weeks after the first date, and a range too long to fill keeps its newest rows.
