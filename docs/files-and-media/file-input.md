---
title: FileInput
sidebar_position: 1
---

A file field built on a native `<input type="file">` that covers its trigger, so clicking, tapping and the keyboard (<kbd>Enter</kbd>/<kbd>Space</kbd>) all work natively. It takes dropped and pasted files, validates type, size and count with translated messages, lists the files with remove buttons, and keeps the input's `files` in sync so a plain form submit sends what the user sees. Give it `upload` or `url` and each file uploads as soon as it is added, with a progress list. `appearance="dropzone"` shows a large drop area instead of the compact trigger.

```tsx
import { FileInput } from "@javaabu/onu"

;<FileInput aria-label="Passport copy" accept=".pdf,image/*" maxSize={2 * 1024 * 1024} />
```

Inside a [`FormField`](../form-scaffolding/form-field) the input gets its `id`, `name`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from the field:

```tsx
<FormField label="National ID card" name="id_card" help="PDF or image, up to 2 MB." required>
  <FileInput accept=".pdf,image/*" maxSize={2 * 1024 * 1024} />
</FormField>
```

## Controlled

```tsx
const [files, setFiles] = React.useState<File[]>([])

<FileInput multiple value={files} onChange={setFiles} onReject={(rejections) => console.log(rejections)} />
```

`onChange` receives the picked `File`s. When the value also holds files already on the server (see [Existing files](#existing-files)) or you use an uploader, use `onValueChange`, which receives the whole value.

## Several files

`multiple` lets the user pick several files at once; each pick replaces the previous one, as a native input does. With `append`, each pick adds to the list instead (duplicates are skipped) and every file has a remove button. The drop zone and an uploader always add. `showLimits` adds a hint with the limits and a live count ("3 of 5"). When `maxFiles` is reached the picker is disabled until a file is removed; extra files from one pick are rejected with "x.pdf was not added: only 5 files are allowed." The count is announced politely as it changes, and the hint uses plural rules for both locales.

```tsx
<FormField label="Tender documents">
  <FileInput append showLimits accept=".pdf,.xlsx,.docx" maxFiles={5} maxSize={10 * 1024 * 1024} />
</FormField>
```

## Drop zone

`appearance="dropzone"` swaps the compact trigger for a large drop area with an icon, a title, a hint (`description`, which is also the input's description) and a "Browse files" button. The input still covers the whole area, so clicking or tapping anywhere opens the picker and the area is a single tab stop. While files are dragged over it, the area is highlighted and the title reads "Drop to upload". A file dropped just outside the zone is ignored instead of replacing the page. Everything else (value, uploads, lists, hidden inputs) works the same in both appearances.

```tsx
<FormField label="Project photos" name="photos">
  <FileInput
    appearance="dropzone"
    multiple
    url="/api/uploads"
    uploadOptions={{ headers: { "X-CSRF-TOKEN": token } }}
    accept="image/*,.pdf"
    maxFiles={6}
    maxSize={8 * 1024 * 1024}
    description="Images or PDF, up to 8 MB each"
  />
</FormField>
```

Files dropped onto the compact trigger are taken too.

## Paste

Files pasted while the field has focus are added (handy for screenshots). With `pasteFromDocument`, files pasted anywhere on the page are added too.

```tsx
<FileInput appearance="dropzone" aria-label="Screenshot" pasteFromDocument />
```

## Uploads

With `upload` or `url`, each file uploads as soon as it is added, with a progress bar per file, cancel, retry and remove. When an upload succeeds its id is written to a hidden input, so the surrounding form submits ids instead of files (the usual "temporary upload" pattern in Laravel apps); the file input itself then has no `name`. The text next to the button counts uploads ("Uploading 2 files…", "3 files uploaded"). Without `multiple`, a new file replaces the current one once it has uploaded.

```tsx
// Built-in XHR uploader (XHR is the only browser API that reports upload progress)
<FormField label="Transfer slip" name="slip_id">
  <FileInput
    url="/api/uploads"
    uploadOptions={{ headers: { "X-CSRF-TOKEN": csrfToken }, fieldName: "file" }}
    accept="image/*,.pdf"
    maxSize={5 * 1024 * 1024}
  />
</FormField>
```

Or bring your own uploader (axios, Inertia, S3 pre-signed URLs, …):

```tsx
<FileInput
  multiple
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

### Built-in uploader

`url` uses `xhrUpload` / `createXhrUploader`: it posts `FormData` with the file under `fieldName` (default `file`) plus `data`, sends `Accept: application/json` and `X-Requested-With: XMLHttpRequest`, and resolves with the parsed JSON. Non-2xx responses reject with an `UploadError` carrying `status`, Laravel's `errors`, and a message taken from `errors[fieldName][0]` (or `message`). That message is shown on the file. CSRF and auth are the app's concern (pass headers or `withCredentials`).

The hidden input's value comes from `getValue(response)`, or by default from `id`, `uuid` or `data.id` (`defaultUploadValue`, exported). A response without an id is shown as uploaded but not added to the value.

`useUploadQueue(options)` exposes the same upload logic (`items`, `add`, `cancel`, `retry`, `remove`, `clear`, `announcement`) for custom layouts, with [`UploadProgress`](./upload-progress) for the list. Uploads still running when the component unmounts are aborted.

## Existing files

Pass the files already saved on the record as `defaultValue` (or `value` with `onValueChange` to control it). Each is `{ id, name, size?, type?, url?, thumbnailUrl? }` — the same shape as [`AdditionalFilesUpload`](./additional-files-upload)'s `existing` attachments. They are listed with an "Open" link (when `url` is set) and a remove button, and their ids are submitted as hidden inputs under `name` (`name[]` when `multiple`), so an edit page shows the saved files and the server receives the ones the user kept.

```tsx
const [documents, setDocuments] = useState<FileInputEntry[]>(application.documents)

<FormField label="Supporting documents" name="documents">
  <FileInput appearance="dropzone" multiple url="/api/uploads" value={documents} onValueChange={setDocuments} />
</FormField>
```

- **With an uploader**, a finished upload is added to the value as `{ id, name, size, type, file, response }`. Uploads still in progress are not in the value. Removing a finished upload, or the parent dropping it from `value`, removes it from the list. Without `multiple`, a finished upload replaces the value.
- **Without an uploader**, picked `File`s are added to the value next to the existing entries (`onChange` still receives just the `File`s), and they are submitted by the file input under `name`.
- Existing files count toward `maxFiles`, and a `required` input is not required while it holds existing files.

## Validation

Picked, dropped and pasted files are checked against `accept`, `maxSize`, `minSize` and `maxFiles`. Rejected files are listed under the input in a polite live region ("photo.png is larger than 2 MB."), and passed to `onReject` as `{ file, code }` with `code` one of `file-too-large`, `file-too-small`, `file-invalid-type`, `too-many-files`. Sizes use the active locale (`1.5 MB`).

The helpers are exported too: `validateFile`, `validateFiles`, `matchesAccept`, `formatFileSize`, `getFileKind`, and the `useFormatFileSize()` hook.

## Props

| Prop                                     | Type                                                                                              | Default     | Description                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `appearance`                             | `"input" \| "dropzone"`                                                                           | `"input"`   | Compact trigger, or a large drop area                                               |
| `value`                                  | `FileInputEntry[]`                                                                                |             | Files the field holds (controlled): `File`s and `{ id, name, … }` stored files      |
| `defaultValue`                           | `FileInputEntry[]`                                                                                | `[]`        | Initial files (uncontrolled)                                                        |
| `onChange`                               | `(files: File[]) => void`                                                                         |             | Without an uploader: the picked files after a pick or a removal                     |
| `onValueChange`                          | `(value: FileInputEntry[]) => void`                                                               |             | The whole value when files are added, finish uploading or are removed               |
| `onFilesAdded`                           | `(files: File[]) => void`                                                                         |             | Every accepted batch (picked, dropped or pasted)                                    |
| `onReject`                               | `(rejections: FileRejection[]) => void`                                                           |             | Files that failed validation                                                        |
| `accept`                                 | `string`                                                                                          |             | Accepted types, as for `<input accept>`                                             |
| `maxSize`                                | `number`                                                                                          |             | Largest size in bytes                                                               |
| `minSize`                                | `number`                                                                                          |             | Smallest size in bytes                                                              |
| `maxFiles`                               | `number`                                                                                          |             | Most files in total, existing files included                                        |
| `multiple`                               | `boolean`                                                                                         | `false`     | Allow several files                                                                 |
| `append`                                 | `boolean`                                                                                         | `false`     | Add picks to the selection instead of replacing it (implies `multiple`)             |
| `showLimits`                             | `boolean`                                                                                         | `false`     | Show "Up to 5 files · 10 MB max each" and a live count                              |
| `showList`                               | `boolean`                                                                                         | `true`      | Show the files and upload progress with remove buttons                              |
| `size`                                   | `"sm" \| "default" \| "lg"`                                                                       | `"default"` | Trigger height, or drop zone padding (`fileInputVariants`)                          |
| `buttonLabel`                            | `ReactNode`                                                                                       |             | Button text (default "Choose file(s)", or "Browse file(s)" for the drop zone)       |
| `placeholder`                            | `string`                                                                                          |             | `input`: text when nothing is selected                                              |
| `summary`                                | `ReactNode`                                                                                       |             | `input`: replace the summary next to the button                                     |
| `title`                                  | `ReactNode`                                                                                       |             | `dropzone`: main text (default "Drag and drop files here")                          |
| `description`                            | `ReactNode`                                                                                       |             | `dropzone`: hint under the title, also the input's description                      |
| `icon`                                   | `ReactNode`                                                                                       |             | `dropzone`: icon element (default: upload icon)                                     |
| `pasteFromDocument`                      | `boolean`                                                                                         | `false`     | Accept files pasted anywhere on the page                                            |
| `upload` / `url` / `uploadOptions`       |                                                                                                   |             | Uploader (see [Built-in uploader](#built-in-uploader))                              |
| `getValue`                               | `(response) => string \| number \| null \| undefined`                                             |             | Id of a finished upload (default `defaultUploadValue`)                              |
| `onUploaded`, `onError`, `onItemsChange` |                                                                                                   |             | Upload callbacks                                                                    |
| `name`                                   | `string`                                                                                          |             | Field name: the input's files, and hidden inputs for stored ids (`name[]` multiple) |
| `pickDisabled`                           | `boolean`                                                                                         | `false`     | Stop picking more files but keep removal working                                    |
| `countOffset`                            | `number`                                                                                          | `0`         | Files already counted towards `maxFiles` elsewhere                                  |
| `classNames`                             | `{ root, trigger, button, summary, icon, title, description, list, item, errors, limits }`        |             | Classes for each part (`trigger` is the drop area with `appearance="dropzone"`)     |

All other `<input>` props are passed to the input, and `ref` points at the `<input>`.

## Accessibility

- The native file input is the only tab stop in either appearance, so it keeps the browser's own keyboard and screen reader behaviour. Give it a label: a `FormField`, a `<label>`, or `aria-label`. Without one, the button text ("Choose file", "Browse files") names it.
- The summary ("2 files selected", "Uploading 1 file…"), or the drop zone's `description`, and any validation messages are linked with `aria-describedby`. Validation messages are announced politely.
- While dragging, the drop zone shows "Drop to upload" with a highlighted border (not colour alone: the text changes too).
- Every file has a "Remove {name}" button. After removing one, focus returns to the input and "{name} removed" is announced.
- With an uploader, progress bars are named "Upload progress for {name}" and expose `aria-valuenow`; starts, completions, cancellations and failures are announced in a polite live region. Cancel, retry and remove buttons are named with the file ("Retry upload of slip.pdf").
- The compact trigger is at least 44px tall on touch screens.

| Key                                         | Action                                     |
| ------------------------------------------- | ------------------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd>         | Open the file picker                       |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>V</kbd> | Paste files from the clipboard             |
| <kbd>Tab</kbd>                              | Move to the open, cancel, retry and remove buttons |

## RTL and Dhivehi

The compact trigger's button sits at the inline start, so it moves to the right in RTL; the drop zone is centred, so it reads the same in both directions. File names are isolated with `<bdi>`, so Thaana and Latin names display correctly in either direction, and progress bars fill from the inline start. All strings come from the `file` locale namespace.
