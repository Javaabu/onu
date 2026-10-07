---
title: DropzoneUploader
sidebar_position: 5
---

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

## Paste

Files pasted while the zone (or its button) has focus are added. With `pasteFromDocument`, files pasted anywhere on the page are added too, which is handy for screenshots.

## Props

| Prop                                       | Type                                                       | Default | Description                                          |
| ------------------------------------------ | ---------------------------------------------------------- | ------- | ---------------------------------------------------- |
| `upload` / `url` / `uploadOptions`         |                                                            |         | Same as [`InstantFileUpload`](./instant-file-upload) |
| `accept`, `maxSize`, `minSize`, `maxFiles` |                                                            |         | Validation, as for [`FileInput`](./file-input)       |
| `multiple`                                 | `boolean`                                                  | `true`  | Allow several files                                  |
| `disabled`                                 | `boolean`                                                  |         | Disable dropping, browsing and pasting               |
| `onFilesAdded`                             | `(files: File[]) => void`                                  |         | Every accepted batch                                 |
| `onChange`                                 | `(files: File[]) => void`                                  |         | Collected files (without an uploader)                |
| `onReject`                                 | `(rejections) => void`                                     |         | Files that failed validation                         |
| `onUploaded`, `onError`, `onItemsChange`   |                                                            |         | Upload callbacks                                     |
| `pasteFromDocument`                        | `boolean`                                                  | `false` | Accept files pasted anywhere on the page             |
| `title`, `description`, `icon`             | `ReactNode`                                                |         | Zone content                                         |
| `showList`                                 | `boolean`                                                  | `true`  | Show the file / progress list                        |
| `name`, `getValue`                         |                                                            |         | Hidden inputs for uploaded ids                       |
| `size`                                     | `"sm" \| "default" \| "lg"`                                |         | Padding (`dropzoneVariants`)                         |
| `classNames`                               | `{ zone, icon, title, description, button, list, errors }` |         | Classes for each part                                |

## Accessibility

- The zone itself is not a tab stop; the "Browse files" button inside it is, and carries the FormField's label, description and invalid state.
- While dragging, the zone shows "Drop to upload" with a highlighted border (not colour alone: the text changes too).
- Validation messages and upload results are announced politely.

| Key                                         | Action                         |
| ------------------------------------------- | ------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd>         | Open the file picker (button)  |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>V</kbd> | Paste files from the clipboard |

## RTL and Dhivehi

Content is centred, so it reads the same in both directions; all text comes from the `file` namespace.
