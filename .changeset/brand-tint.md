---
"@javaabu/onu": minor
---

Setting `--onu-primary` now re-brands the whole UI, not just buttons. The neutral tokens (`accent`, `secondary`, `muted`, `border`, `input` and the sidebar ones) are tinted with a little of the primary colour, and brand-coloured states use it: the active sidebar item (with a bar on sub-items), tab underlines, selected table rows, the current pagination page, calendar ranges and today, nav pills and stacked tabs, outline and ghost button hovers, pressed toggles, command items and text selection. Dark-mode `primary-subtle` is stronger so it shows on cards, and scoped `data-onu-theme` sections inside dark mode now get the lifted dark primary. Turn the tint down or off with `--onu-tint` (e.g. `0%`) or `data-onu-tint="none"`; setting a token such as `--onu-accent` still replaces it, and the untinted values are available as `--onu-neutral-*`. The light `muted-foreground` is slightly darker (`oklch(0.5 0 0)`) to keep AA contrast on tinted surfaces.
