---
"@javaabu/onu": patch
---

`SlugInput`: typing a space by hand now inserts the separator (`my custom slug` gives `my-custom-slug`), including with a custom `separator` such as `_`. `toSlug(text, { preserveTrailing: true })` keeps a trailing word break for any separator.
