---
"@javaabu/onu": patch
---

`Select` uses the same empty value and callback as `SearchableSelect` and `ApiSelect`: `value` and `defaultValue` are `string | null` (`null` shows the placeholder), and `onValueChange(value, option)` gets the chosen option from `options`, or `(null, null)` when cleared. With `SelectItem` children, `option` is `null`. Code that set `""` or read `""` for an empty select now uses `null`.
