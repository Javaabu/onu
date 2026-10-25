---
"@javaabu/onu": minor
---

`DropzoneUploader` takes `appearance="input"`, which renders a compact `FileInput` trigger instead of the drop area while sharing the value, upload queue, lists and hidden inputs, plus `inputProps` and `inputRef`. `InstantFileUpload` remains as a preset (`appearance="input"`, single file by default) and now also takes `value`, `defaultValue` and `onValueChange`; `defaultUploadValue` is still exported. Behaviour changes for `InstantFileUpload`: `maxFiles` now counts files already uploaded, a removal is announced ("a.pdf removed"), and without `upload`/`url` it collects the picked files instead of queueing them forever.
