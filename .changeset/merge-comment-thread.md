---
"@javaabu/onu": minor
---

`CommentThread` takes `variant` (`"thread"` or `"list"`), `replies` (show Reply buttons), `composerPosition` (`"bottom"` or `"top"`) and `labels` to change its strings. `variant="list"` is a flat, bordered list of internal notes: note strings, no Reply buttons and the box on top by default. `Notes`, `NotesProps` and `NoteData` are removed: use `<CommentThread variant="list" comments={…}>` with `CommentData` (author `id` is required). `onAdd` gets `(body, null)`, and as in the thread only the author may delete unless you pass `canDelete`. The `notes` and `note` data-slots are now `comment-thread` and `comment`.
