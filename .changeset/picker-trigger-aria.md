---
"@javaabu/onu": patch
---

`ColorPicker` and `IconPicker` no longer put `required` and `aria-required` on their trigger button inside a required `FormField`, which axe reported as `aria-allowed-attr`.
