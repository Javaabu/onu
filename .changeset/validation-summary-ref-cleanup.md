---
"@javaabu/onu": patch
---

`ValidationSummary` attaches a forwarded ref once instead of on every render, and calls a React 19 ref cleanup on unmount.
