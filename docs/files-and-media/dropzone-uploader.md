---
title: DropzoneUploader
sidebar_position: 5
---

A drag-and-drop zone built on [`react-dropzone`](https://react-dropzone.js.org), with a "Browse files" button as the keyboard and touch alternative, paste from the clipboard, validation messages, and an upload progress list when given an uploader. With `appearance="input"` the zone is a compact file input instead (see [Compact input](#compact-input-instant-upload)).

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

Pass the files already saved on the record as `defaultValue` (or `value` with `onValueChange` to control it). Each is `{ id, name, size?, type?, url?, thumbnailUrl? }` — the same shape as [`AdditionalFilesUpload`](./additional-files-upload)'s `existing` attachments. They are listed with an "Open" link (when `url` is set) and a remove button, and their ids are submitted as hidden inputs under `name` (`name[]` when `multiple`), so an edit page shows the saved files and the server receives the ones the user kept.

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

## Compact input (instant upload)

`appearance="input"` swaps the drop area for a [`FileInput`](./file-input) trigger. Everything else is shared: the value, the upload queue, the lists and the hidden inputs. With an uploader, each file uploads as soon as it is chosen, with a progress bar per file, cancel, retry and remove; when an upload succeeds its id is written to a hidden input, so the surrounding form submits ids instead of files (the usual "temporary upload" pattern in Laravel apps). The text next to the button counts uploads ("Uploading 2 files…", "3 files uploaded"). With `multiple={false}`, picking is disabled while a file is uploading or uploaded; remove it (or let it fail) to pick another. `inputProps` go to the `FileInput` (`aria-label`, `buttonLabel`, `placeholder`, …) and `inputRef` points at its `<input>`. `title`, `description` and `icon` are not used. Files dropped on the input are taken natively.

```tsx
// Built-in XHR uploader (XHR is the only browser API that reports upload progress)
<FormField label="Transfer slip" name="slip_id">
  <DropzoneUploader
    appearance="input"
    multiple={false}
    url="/api/uploads"
    uploadOptions={{ headers: { "X-CSRF-TOKEN": csrfToken }, fieldName: "file" }}
    accept="image/*,.pdf"
    maxSize={5 * 1024 * 1024}
  />
</FormField>
```

Or bring your own uploader (axios, Inertia, S3 pre-signed URLs, …):

```tsx
<DropzoneUploader
  appearance="input"
  upload={async (file, { onProgress, signal }) => {
    const { data } = await axios.post("/uploads", toFormData(file), {
      signal,
      onUploadProgress: (e) => onProgress(Math.round((e.loaded / (e.total ?? 1)) * 100)),
    })
    return data
  }}
  onUploaded={(item) => console.log(item.response)}
/>
```

Progress bars are named "Upload progress for {name}" and expose `aria-valuenow`; starts, completions, cancellations and failures are announced in a polite live region. Cancel, retry and remove buttons are named with the file ("Retry upload of slip.pdf"), and removing a file returns focus to the input. The input keeps the [`FileInput`](./file-input) keyboard behaviour (<kbd>Enter</kbd> / <kbd>Space</kbd> opens the picker). Progress bars fill from the inline start, so from the right in RTL.

## Built-in uploader

`url` uses `xhrUpload` / `createXhrUploader`: it posts `FormData` with the file under `fieldName` (default `file`) plus `data`, sends `Accept: application/json` and `X-Requested-With: XMLHttpRequest`, and resolves with the parsed JSON. Non-2xx responses reject with an `UploadError` carrying `status`, Laravel's `errors`, and a message taken from `errors[fieldName][0]` (or `message`). That message is shown on the file. CSRF and auth are the app's concern (pass headers or `withCredentials`).

The hidden input's value comes from `getValue(response)`, or by default from `id`, `uuid` or `data.id` (`defaultUploadValue`, exported).

`useUploadQueue(options)` exposes the same upload logic (`items`, `add`, `cancel`, `retry`, `remove`, `clear`, `announcement`) for custom layouts. Uploads still running when the component unmounts are aborted.

## Paste

Files pasted while the zone (or its button) has focus are added. With `pasteFromDocument`, files pasted anywhere on the page are added too, which is handy for screenshots.

## Props

| Prop                                       | Type                                                       | Default | Description                                          |
| ------------------------------------------ | ---------------------------------------------------------- | ------- | ---------------------------------------------------- |
| `appearance`                               | `"dropzone" \| "input"`                                    | `"dropzone"` | Drop area, or a compact [`FileInput`](./file-input) |
| `inputProps`                               | `FileInput` props                                          |         | With `appearance="input"`: `aria-label`, `buttonLabel`, … |
| `inputRef`                                 | `Ref<HTMLInputElement>`                                    |         | The `<input type="file">`                            |
| `upload` / `url` / `uploadOptions`         |                                                            |         | Uploader (see [Built-in uploader](#built-in-uploader)) |
| `accept`, `maxSize`, `minSize`, `maxFiles` |                                                            |         | Validation, as for [`FileInput`](./file-input)       |
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
| `size`                                     | `"sm" \| "default" \| "lg"`                                |         | Padding (`dropzoneVariants`), or the input's size    |
| `classNames`                               | `{ zone, trigger, summary, icon, title, description, button, list, errors }` | | Classes for each part (`trigger`, `summary`: input only) |

## Accessibility

- The zone itself is not a tab stop; the "Browse files" button inside it is, and carries the FormField's label, description and invalid state.
- While dragging, the zone shows "Drop to upload" with a highlighted border (not colour alone: the text changes too).
- Validation messages and upload results are announced politely.
- Every file has a "Remove {name}" button. After removing one, focus returns to the "Browse files" button (the input with `appearance="input"`) and "{name} removed" is announced.
- With an uploader, progress bars are named "Upload progress for {name}", and upload results are announced politely.

| Key                                         | Action                         |
| ------------------------------------------- | ------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd>         | Open the file picker (button)  |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>V</kbd> | Paste files from the clipboard |

## RTL and Dhivehi

Content is centred, so it reads the same in both directions; the compact input follows [`FileInput`](./file-input), and progress bars fill from the inline start. All text comes from the `file` namespace.
