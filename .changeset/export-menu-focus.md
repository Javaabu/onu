---
"@javaabu/onu": patch
---

`ExportMenu` keeps focus on its button while a file is being made: the button is now `aria-disabled` instead of `disabled` while exporting, and its menu won't open until the export finishes.
