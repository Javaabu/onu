---
"@javaabu/onu": minor
---

`Callout` takes an `appearance`: `"box"` (default, unchanged) or the inline `"plain"`, `"subtle"` and `"bordered"` notices, which use `role="note"` and leave out title, actions and dismiss. `Notice` and `NoticeProps` are removed: use `<Callout appearance="plain" variant="info">` (Notice's `tone` is `variant`, with `neutral` as `default`; its `variant` is `appearance`). `noticeVariants` is renamed `calloutInlineVariants`, keyed by `variant` and `appearance`. The `notice` data-slot and `data-tone` are gone: inline callouts have `data-slot="callout"` and `data-variant`.
