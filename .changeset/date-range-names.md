---
"@javaabu/onu": patch
---

`DateRangePicker` submits under `names` (for example `{ from: "start", to: "end" }`) without `name` too. It used to submit nothing unless `name` was also set.
