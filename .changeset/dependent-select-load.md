---
"@javaabu/onu": patch
---

Dependent `SearchableSelect` and `ApiSelect` fields (`parentValue`) keep a value that arrives together with the parent, as with react-hook-form's `reset(data)` or an edit page that fetches both, and a value set while the field waits for its parent. They still clear when the parent changes after the value was settled.
