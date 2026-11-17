---
"@javaabu/onu": patch
---

`Form` passes the button that submitted it to `onSubmit`'s values, so `<button type="submit" name="action" value="draft">` gives `{ action: "draft" }`, as a native submit would.
