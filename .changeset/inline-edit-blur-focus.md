---
"@javaabu/onu": patch
---

`InlineEdit`: saving or cancelling on blur no longer pulls focus back to the value, so clicking another field after editing lands there. A failing `validate` on blur keeps the error showing without trapping focus in the editor.
