---
"@javaabu/onu": minor
---

Searchable select now covers multi-select, quick-create and dependent selects. `SearchableSelect` accepts `onCreate`/`renderCreateDialog` and `parentValue`/`parentLabel` (with `options` as a map or function of the parent value), and with `multiple` it shows "Select all" and a clear button by default. `ApiSelect` accepts `parentValue`, `parentLabel` and `parentParam`. `MultiSelect` is removed: use `<SearchableSelect multiple>`. `QuickCreateSelect` is removed: use `<SearchableSelect onCreate>` (or `renderCreateDialog`). `DependentSelect` is removed: use `<SearchableSelect parentValue>` for local options, or `<ApiSelect parentValue url parentParam>` / `<ApiSelect parentValue fetcher>` for remote ones (`loadOptions(parent, ctx)` becomes a `fetcher` that reads the parent from scope).
