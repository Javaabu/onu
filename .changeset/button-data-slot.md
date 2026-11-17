---
"@javaabu/onu": patch
---

`Button` and `LinkButton` keep `data-slot="button"` when a caller passes its own `data-slot`, so the 44px touch-target rule still applies. Use `data-part` to tag a button.
