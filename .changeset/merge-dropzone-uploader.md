---
"@javaabu/onu": minor
---

`DropzoneUploader` takes `appearance="input"`, which renders a compact `FileInput` trigger instead of the drop area while sharing the value, upload queue, lists and hidden inputs, plus `inputProps` and `inputRef`. `InstantFileUpload` is removed: use `<DropzoneUploader appearance="input" multiple={false}>`, with the `FileInput` props (`aria-label`, `buttonLabel`, …) in `inputProps`, `inputRef` for the `<input>`, and `classNames.zone` / `classNames.list` for the old `root` / `progress`. `defaultUploadValue` is still exported. Compared with `InstantFileUpload`, `maxFiles` counts files already uploaded, a removal is announced ("a.pdf removed"), and without `upload`/`url` the picked files are collected instead of queued forever.
