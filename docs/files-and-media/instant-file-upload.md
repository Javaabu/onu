---
title: InstantFileUpload
sidebar_position: 3
---

Uploads each file as soon as it is chosen, with a progress bar per file, cancel, retry and remove. When an upload succeeds its id is written to a hidden input, so the surrounding form submits ids instead of files (the usual "temporary upload" pattern in Laravel apps).

```tsx
import { InstantFileUpload } from "@javaabu/onu"

// Built-in XHR uploader (XHR is the only browser API that reports upload progress)
;<FormField label="Transfer slip" name="slip_id">
  <InstantFileUpload
    url="/api/uploads"
    uploadOptions={{ headers: { "X-CSRF-TOKEN": csrfToken }, fieldName: "file" }}
    accept="image/*,.pdf"
    maxSize={5 * 1024 * 1024}
  />
</FormField>
```

Or bring your own uploader (axios, Inertia, S3 pre-signed URLs, …):

```tsx
<InstantFileUpload
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

## Built-in uploader

`url` uses `xhrUpload` / `createXhrUploader`: it posts `FormData` with the file under `fieldName` (default `file`) plus `data`, sends `Accept: application/json` and `X-Requested-With: XMLHttpRequest`, and resolves with the parsed JSON. Non-2xx responses reject with an `UploadError` carrying `status`, Laravel's `errors`, and a message taken from `errors[fieldName][0]` (or `message`). That message is shown on the file. CSRF and auth are the app's concern (pass headers or `withCredentials`).

The hidden input's value comes from `getValue(response)`, or by default from `id`, `uuid` or `data.id`.

## Props

Takes the [`FileInput`](./file-input) props (`accept`, `maxSize`, `multiple`, `size`, …) except `value`/`onChange`, plus:

| Prop            | Type                                                    | Default                   | Description                                          |
| --------------- | ------------------------------------------------------- | ------------------------- | ---------------------------------------------------- |
| `upload`        | `(file, { onProgress, signal }) => Promise`             |                           | Your uploader                                        |
| `url`           | `string`                                                |                           | Endpoint for the built-in XHR uploader               |
| `uploadOptions` | `{ method, fieldName, headers, data, withCredentials }` |                           | Options for the built-in uploader                    |
| `onUploaded`    | `(item: UploadItem) => void`                            |                           | A file finished; `item.response` holds the response  |
| `onError`       | `(item, error) => void`                                 |                           | A file failed (not called on cancel)                 |
| `onItemsChange` | `(items: UploadItem[]) => void`                         |                           | The upload list changed                              |
| `name`          | `string`                                                | FormField's `name`        | Name for hidden id inputs (`name[]` when `multiple`) |
| `getValue`      | `(response) => string \| number \| null`                | `id` / `uuid` / `data.id` | Value submitted for each upload                      |
| `classNames`    | FileInput's `classNames` + `{ progress }`               |                           | Classes for each part                                |

`useUploadQueue(options)` exposes the same logic (`items`, `add`, `cancel`, `retry`, `remove`, `clear`, `announcement`) for custom layouts. Uploads still running when the component unmounts are aborted.

## Accessibility

- Progress bars are named "Upload progress for {name}" and expose `aria-valuenow`.
- Starts, completions, cancellations and failures are announced in a polite live region.
- Cancel, retry and remove buttons are named with the file ("Retry upload of slip.pdf"). Removing returns focus to the input.

| Key                                 | Action                                                |
| ----------------------------------- | ----------------------------------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Choose files / press a cancel, retry or remove button |

## RTL and Dhivehi

Progress bars fill from the inline start, so from the right in RTL. All strings come from the `file` namespace.
