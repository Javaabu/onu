---
"@javaabu/onu": minor
---

`SaveBar` takes `layout="floating"`: only the Save button, floating at the bottom of the screen while the form's main submit button (or `target`) is scrolled out of view, with `target`, `forceVisible` and the new `classNames.save`. `FloatingSubmit` is removed: use `<SaveBar layout="floating" saveLabel="Submit" />` inside the form, with `className` for the old `classNames.root` and `classNames.save` for `classNames.button`. Compared with `FloatingSubmit`, the button has the save icon and "Save" by default, can call `onSave` instead of submitting, finds the form named by `form` when it sits outside it, and, given `changes` or `dirty`, stays disabled until something changed and warns before leaving with unsaved changes.
