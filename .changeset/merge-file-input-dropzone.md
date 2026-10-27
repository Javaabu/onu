---
"@javaabu/onu": minor
---

`DropzoneUploader` is merged into `FileInput` and removed. `FileInput` takes `appearance="dropzone"` for the large drop area, and both appearances now take dropped and pasted files (`pasteFromDocument` too), uploads with a progress list (`upload` / `url` / `uploadOptions`, `getValue`, `onUploaded`, `onError`, `onItemsChange`), files already on the server in `value` / `defaultValue` with `onValueChange`, hidden inputs for stored ids under `name`, `onFilesAdded`, and removal announcements. The `react-dropzone` dependency is dropped: the native file input now covers the drop zone too, so it is the zone's only tab stop and carries the label.

Replace

```tsx
<DropzoneUploader url="/api/uploads" maxFiles={6} description="Images, up to 8 MB" />
<DropzoneUploader appearance="input" multiple={false} inputProps={{ "aria-label": "Slip" }} url="/api/uploads" />
```

with

```tsx
<FileInput appearance="dropzone" multiple url="/api/uploads" maxFiles={6} description="Images, up to 8 MB" />
<FileInput aria-label="Slip" url="/api/uploads" />
```

- `multiple` defaults to `false` on `FileInput` (it was `true` on `DropzoneUploader`): add `multiple` to keep several files. The drop zone and an uploader always add files; without an uploader the compact input needs `append` to add instead of replace.
- `appearance="input"` is the default; `inputProps` go directly on `FileInput`, and `inputRef` becomes `ref` (which points at the `<input>`; the root `div` ref is gone).
- `DropzoneFile` → `FileInputEntry`, `DropzoneUploaderProps` → `FileInputProps`, `DropzoneInputProps` is removed, `dropzoneVariants` → `fileInputVariants({ appearance: "dropzone", size })`. `UploadedFile` and `defaultUploadValue` are unchanged.
- `classNames.zone` → `classNames.trigger` (and `classNames.root` for the compact input's root); `icon`, `title`, `description`, `button`, `list` and `errors` are unchanged.
- `data-slot="dropzone-uploader"` / `"instant-file-upload"` → `data-slot="file-input"` with `data-appearance`; `data-slot="dropzone"` → `data-slot="file-input-trigger"`.
- The "Browse files" button is now part of the input's label instead of a separate `<button>`; tests that query `getByRole("button", { name: "Browse files" })` should use `getByLabelText("Browse files")` (or the field's label).
- With an uploader, a `required` field no longer sets the native `required` attribute (the files go to the server, not the form); `aria-required` stays. Picking also stops once `maxFiles` is reached, as with `append`.
