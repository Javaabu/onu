---
"@javaabu/onu": patch
---

Inputs that forward a ref now honour React 19 ref cleanup functions: a ref callback that returns a cleanup has it called on unmount instead of being called again with `null`.
