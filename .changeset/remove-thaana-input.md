---
"@javaabu/onu": minor
---

`ThaanaInput` and `ThaanaTextarea` (and their `ThaanaInputProps` / `ThaanaTextareaProps` types) are removed: use `<TextInput thaana thaanaToggle />` and `<Textarea thaana thaanaToggle />`. Keyboard options go in `thaana` as before (`<TextInput thaana={{ keymap: "typewriter" }} thaanaToggle />`); drop `thaanaToggle` for Thaana typing without the toggle button. The docs page and demo are folded into `TextInput`, `Textarea` and the Thaana input guide. `ThaanaToggle` and `useThaanaInput` are unchanged.
