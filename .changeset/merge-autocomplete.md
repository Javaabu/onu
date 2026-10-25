---
"@javaabu/onu": minor
---

`Autocomplete` takes `showToggleButton` (a chevron that opens the full list), `showCustomOption` ("Use “…”" for unmatched text), `autoHighlight`, `emptyMessage` and a controllable `open`/`defaultOpen`/`onOpenChange`; `onValueChange` now also gets the picked option (or `null` for typed text), `renderOption` gets `selected`, and suggestions may carry `keywords` (so `ChoiceOption`s fit). `EditableSelect` remains as a preset, now exported from the text inputs; its docs and demo are now part of Autocomplete. Behaviour changes: Autocomplete (and TagsInput suggestions) now match static lists with `Intl.Collator` like the select components, so "male" finds "Malé" and `keywords` match; Enter no longer picks a disabled suggestion. In `EditableSelect`, opening with ↓/↑ now filters by the current text (the chevron still opens the full list), a second Escape clears the text, the chevron sits before the Thaana toggle, and the listbox is named "Suggestions".
