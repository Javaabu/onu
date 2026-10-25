---
"@javaabu/onu": minor
---

The skeleton presets gain `SkeletonField`, shaped like a form field (`control`, `showLabel`, `help`, `labelLayout`, `label` for the screen-reader text) and following the stacked/inline label layout. `PlaceholderInput` is removed: use `<SkeletonField>` (its `label` boolean is `showLabel`, its `srLabel` is `label`, and the data-slot is `skeleton-field`).
