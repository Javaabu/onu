---
"@javaabu/onu": minor
---

Every component that reports a value now uses `onValueChange(value)`; `onChange` only ever means the native event. `FileInput` loses `onChange(files)` (use `onValueChange(entries)`), and `onReject` always takes an array.
