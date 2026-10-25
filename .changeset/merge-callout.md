---
"@javaabu/onu": minor
---

`Callout` takes an `appearance`: `"box"` (default, unchanged) or the inline `"plain"`, `"subtle"` and `"bordered"` notices, which use `role="note"` and leave out title, actions and dismiss. `Notice` remains as a preset (`tone` for the colour, with `neutral` as Callout's `default`; `variant` for the appearance); its docs and demo are now part of Callout. `noticeVariants` is still exported. `NoticeProps` no longer accepts the HTML `title` attribute.
