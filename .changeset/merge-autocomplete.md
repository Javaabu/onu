---
"@javaabu/onu": minor
---

`Autocomplete` takes `showToggleButton` (a chevron that opens the full list), `showCustomOption` ("Use “…”" for unmatched text), `autoHighlight`, `emptyMessage` and a controllable `open`/`defaultOpen`/`onOpenChange`; `onValueChange` now also gets the picked option (or `null` for typed text), `renderOption` gets `selected`, and suggestions may carry `keywords` (so `ChoiceOption`s fit). `EditableSelect` is removed: use `<Autocomplete showToggleButton showCustomOption autoHighlight suggestions={…}>`. Picking writes the suggestion's `value`, so map `ChoiceOption`s with `{ ...o, value: o.label }` to write the label; pass `emptyMessage` and `renderOption` for the old empty text and check mark. Behaviour changes: Autocomplete (and TagsInput suggestions) now match static lists with `Intl.Collator` like the select components, so "male" finds "Malé" and `keywords` match; Enter no longer picks a disabled suggestion.
