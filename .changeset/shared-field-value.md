---
"@javaabu/onu": patch
---

Composite controls (`NumberInput`, `TagsInput`, `SearchableSelect`, `ApiSelect`, the date and time pickers, `ColorPicker`, `IconPicker`, `SegmentedControl`, `DualListbox`, `Rating`) now submit their value through one shared hidden field. It is left out of the submission when the surrounding `FormField` is disabled, not only when the control itself is. `Form` clears a field's server error when such a control's value changes, and `ValidationSummary` links focus the visible control. A multiple `DatePicker` with no days chosen submits nothing (it used to submit an empty `name`), like `TagsInput` and `DualListbox`.
