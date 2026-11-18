---
"@javaabu/onu": patch
---

`useListingState` no longer calls `onValueChange` on every render when `paramNames` is passed inline, or on mount under StrictMode; it fires only when the listing state changes.
