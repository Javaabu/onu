---
"@javaabu/onu": minor
---

Searchable select now covers multi-select, quick-create and dependent selects. `SearchableSelect` accepts `onCreate`/`renderCreateDialog` and `parentValue`/`parentLabel` (with `options` as a map or function of the parent value), and with `multiple` it shows "Select all" and a clear button by default. `ApiSelect` accepts `parentValue`, `parentLabel` and `parentParam`. `MultiSelect`, `QuickCreateSelect` and `DependentSelect` remain as presets; their docs and demos are now part of Searchable select.
