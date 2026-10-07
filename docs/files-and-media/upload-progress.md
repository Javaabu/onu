---
title: UploadProgress
sidebar_position: 4
---

A list of uploads, each with its name, size, progress bar, status (waiting, uploading, uploaded, failed, cancelled) and cancel / retry / remove buttons. Pair it with `useUploadQueue`, or render your own states.

```tsx
import { UploadProgress, useUploadQueue } from "@javaabu/onu"

const queue = useUploadQueue({ url: "/api/uploads", uploadOptions: { headers } })

<input type="file" multiple onChange={(e) => queue.add(Array.from(e.target.files ?? []))} />
<UploadProgress
  items={queue.items}
  onCancel={queue.cancel}
  onRetry={queue.retry}
  onRemove={queue.remove}
  announcement={queue.announcement}
/>
```

A single row is available as `UploadProgressItem`:

```tsx
<ul>
  <UploadProgressItem name="Budget.xlsx" size={140_000} progress={0} status="error" error="Too big" onRetry={retry} />
</ul>
```

## Props

`UploadProgress`

| Prop           | Type                                  | Description                                         |
| -------------- | ------------------------------------- | --------------------------------------------------- |
| `items`        | `UploadItem[]`                        | `{ id, file, status, progress, error?, response? }` |
| `onCancel`     | `(id) => void`                        | Shown while queued/uploading                        |
| `onRetry`      | `(id) => void`                        | Shown after an error or cancel                      |
| `onRemove`     | `(id) => void`                        | Shown when not busy                                 |
| `announcement` | `string`                              | Text for a polite `role="status"` region            |
| `classNames`   | `{ item, progress, status, actions }` | Classes for each part                               |

`UploadProgressItem` takes `name`, `size`, `type`, `file` (for a thumbnail), `progress`, `status`, `error`, `onCancel`, `onRetry`, `onRemove` and `classNames`.

`useUploadQueue({ upload | url, uploadOptions, onUploaded, onError, onItemsChange })` returns `{ items, add, cancel, retry, remove, clear, announcement, canUpload }`.

## Accessibility

The list is labelled "Uploads"; each progress bar is named and exposes its value; errors use an icon and text, not colour alone. Buttons are named with the file.

| Key                                 | Action                  |
| ----------------------------------- | ----------------------- |
| <kbd>Tab</kbd>                      | Move between buttons    |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Cancel, retry or remove |

## RTL and Dhivehi

Progress bars fill from the inline start; names are isolated with `<bdi>`.
