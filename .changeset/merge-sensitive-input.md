---
"@javaabu/onu": minor
---

`SensitiveInput` takes `masked` (default `true`; `false` shows the value as is, with no reveal button and the page direction unless `dir` is passed) and `mono` (default `true`). `CopyInput` is removed: use `<SensitiveInput masked={false}>`, adding `mono={false}` where the value is not a code (`CopyInput` was not monospace by default).
