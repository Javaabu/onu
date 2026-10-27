---
"@javaabu/onu": minor
---

`InstantFileUpload` is removed: `FileInput` uploads files itself when given `upload` or `url`. Replace `<InstantFileUpload url="/api/uploads" … />` with `<FileInput url="/api/uploads" … />`; the `FileInput` props (`aria-label`, `buttonLabel`, `accept`, `maxSize`, `multiple`, …), `upload`, `uploadOptions`, `name`, `getValue`, `onUploaded`, `onError` and `onItemsChange` keep their names, `ref` still points at the `<input>`, and `classNames.progress` becomes `classNames.list`. `defaultUploadValue` is still exported. Compared with `InstantFileUpload`, `maxFiles` counts files already uploaded, a removal is announced ("a.pdf removed"), files can be dropped and pasted, and without `multiple` a new file replaces the uploaded one instead of being blocked until it is removed.
