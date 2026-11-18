---
"@javaabu/onu": patch
---

Rejected async callbacks no longer surface as unhandled rejections: `Wizard` marks the step as having errors when `validate`, `onValidateStep` or `onComplete` rejects, `LoadMore` shows "Couldn’t load more. Try again." and keeps its button, and the `CommentThread` composer keeps the text and shows an error.
