---
"@javaabu/onu": patch
---

The Thaana keyboard now attaches to fields that mount later or get replaced, so `CommandPalette thaana` types Thaana and a `TextInput` keeps typing Thaana after an `endAddon` appears. `useThaanaInput(options)` and `useThaanaField(thaana)` now return a callback `ref` to put on the element instead of taking a ref object.
