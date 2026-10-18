# DropzoneUploader

A drag-and-drop zone built on [`react-dropzone`](https://react-dropzone.js.org), with a "Browse files" button as the keyboard and touch alternative, paste from the clipboard, validation messages, and an upload progress list when given an uploader.

```tsx
import { DropzoneUploader } from "@javaabu/onu"

;<FormField label="Project photos" name="photos">
  <DropzoneUploader
    url="/api/uploads"
    uploadOptions={{ headers: { "X-CSRF-TOKEN": token } }}
    accept="image/*,.pdf"
    maxFiles={6}
    maxSize={8 * 1024 * 1024}
    description="Images or PDF, up to 8 MB each"
  />
</FormField>
```

Without `upload` or `url` it just collects files:

```tsx
<DropzoneUploader multiple onChange={setFiles} pasteFromDocument />
```

## Existing files and a controlled value

Pass the files already saved on the record as `defaultValue` (or `value` with `onValueChange` to control it). Each is `{ id, name, size?, type?, url?, thumbnailUrl? }` — the same shape as [`AdditionalFilesUpload`](./additional-files-upload.md)'s `existing` attachments. They are listed with an "Open" link (when `url` is set) and a remove button, and their ids are submitted as hidden inputs under `name` (`name[]` when `multiple`), so an edit page shows the saved files and the server receives the ones the user kept.

```tsx
const [documents, setDocuments] = useState<DropzoneFile[]>(application.documents)

<FormField label="Supporting documents" name="documents">
  <DropzoneUploader url="/api/uploads" value={documents} onValueChange={setDocuments} />
</FormField>
```

- **With an uploader** (`upload` / `url`), a finished upload is added to the value as `{ id, name, size, type, file, response }`, where `id` comes from `getValue(response)` (default: `id`, `uuid` or `data.id`). Uploads still in progress are not in the value. Removing a finished upload, or the parent dropping it from `value`, removes it from the list. With `multiple={false}` a finished upload replaces the value.
- **Without an uploader**, picked `File`s are added to the value next to the existing entries (`onChange` still receives just the `File`s).
- Existing files count toward `maxFiles`.
- Without `value` and `defaultValue` the uploader works as before.

## Paste

Files pasted while the zone (or its button) has focus are added. With `pasteFromDocument`, files pasted anywhere on the page are added too, which is handy for screenshots.

## Props

| Prop                                       | Type                                                       | Default | Description                                          |
| ------------------------------------------ | ---------------------------------------------------------- | ------- | ---------------------------------------------------- |
| `upload` / `url` / `uploadOptions`         |                                                            |         | Same as [`InstantFileUpload`](./instant-file-upload.md) |
| `accept`, `maxSize`, `minSize`, `maxFiles` |                                                            |         | Validation, as for [`FileInput`](./file-input.md)       |
| `multiple`                                 | `boolean`                                                  | `true`  | Allow several files                                  |
| `disabled`                                 | `boolean`                                                  |         | Disable dropping, browsing and pasting               |
| `onFilesAdded`                             | `(files: File[]) => void`                                  |         | Every accepted batch                                 |
| `onChange`                                 | `(files: File[]) => void`                                  |         | Collected files (without an uploader)                |
| `value` / `defaultValue`                   | `DropzoneFile[]`                                           |         | Files the field holds: `File`s and `{ id, name, … }` |
| `onValueChange`                            | `(value: DropzoneFile[]) => void`                          |         | Files added, finished uploading or removed           |
| `onReject`                                 | `(rejections) => void`                                     |         | Files that failed validation                         |
| `onUploaded`, `onError`, `onItemsChange`   |                                                            |         | Upload callbacks                                     |
| `pasteFromDocument`                        | `boolean`                                                  | `false` | Accept files pasted anywhere on the page             |
| `title`, `description`, `icon`             | `ReactNode`                                                |         | Zone content                                         |
| `showList`                                 | `boolean`                                                  | `true`  | Show the file / progress list                        |
| `name`, `getValue`                         |                                                            |         | Hidden inputs for uploaded and existing ids          |
| `size`                                     | `"sm" \| "default" \| "lg"`                                |         | Padding (`dropzoneVariants`)                         |
| `classNames`                               | `{ zone, icon, title, description, button, list, errors }` |         | Classes for each part                                |

## Accessibility

- The zone itself is not a tab stop; the "Browse files" button inside it is, and carries the FormField's label, description and invalid state.
- While dragging, the zone shows "Drop to upload" with a highlighted border (not colour alone: the text changes too).
- Validation messages and upload results are announced politely.
- Every file has a "Remove {name}" button. After removing one, focus returns to the "Browse files" button and "{name} removed" is announced.

| Key                                         | Action                         |
| ------------------------------------------- | ------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd>         | Open the file picker (button)  |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>V</kbd> | Paste files from the clipboard |

## RTL and Dhivehi

Content is centred, so it reads the same in both directions; all text comes from the `file` namespace.
