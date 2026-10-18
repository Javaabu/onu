# FileInput

A styled native file input. The real `<input type="file">` covers the trigger, so clicking, tapping, the keyboard (<kbd>Enter</kbd>/<kbd>Space</kbd>) and dropping a file onto it all work natively. It validates type and size with translated messages, lists the selection with remove buttons, and keeps the input's `files` in sync so a plain form submit sends what the user sees.

```tsx
import { FileInput } from "@javaabu/onu"

;<FileInput aria-label="Passport copy" accept=".pdf,image/*" maxSize={2 * 1024 * 1024} />
```

Inside a [`FormField`](../form-scaffolding/form-field.md) the input gets its `id`, `name`, `aria-describedby`, `aria-invalid`, `aria-required` and `disabled` from the field:

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

## Validation

Picked files are checked against `accept`, `maxSize`, `minSize` and `maxFiles`. Rejected files are listed under the input in a polite live region ("photo.png is larger than 2 MB."), and passed to `onReject` as `{ file, code }` with `code` one of `file-too-large`, `file-too-small`, `file-invalid-type`, `too-many-files`. Sizes use the active locale (`1.5 MB`).

The helpers are exported too: `validateFile`, `validateFiles`, `matchesAccept`, `formatFileSize`, `getFileKind`, and the `useFormatFileSize()` hook.

## Props

| Prop           | Type                                                     | Default     | Description                                                             |
| -------------- | -------------------------------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `value`        | `File[]`                                                 |             | Selected files (controlled)                                             |
| `defaultValue` | `File[]`                                                 | `[]`        | Initial files (uncontrolled)                                            |
| `onChange`     | `(files: File[]) => void`                                |             | Called with the full selection after a pick or a removal                |
| `onReject`     | `(rejections: FileRejection[]) => void`                  |             | Files that failed validation                                            |
| `accept`       | `string`                                                 |             | Accepted types, as for `<input accept>`                                 |
| `maxSize`      | `number`                                                 |             | Largest size in bytes                                                   |
| `minSize`      | `number`                                                 |             | Smallest size in bytes                                                  |
| `maxFiles`     | `number`                                                 |             | Most files in total                                                     |
| `multiple`     | `boolean`                                                | `false`     | Allow several files                                                     |
| `append`       | `boolean`                                                | `false`     | Add picks to the selection instead of replacing it (implies `multiple`) |
| `showList`     | `boolean`                                                | `true`      | Show the selected files with remove buttons                             |
| `size`         | `"sm" \| "default" \| "lg"`                              | `"default"` | Trigger size (`fileInputVariants`)                                      |
| `buttonLabel`  | `ReactNode`                                              |             | Button text (default "Choose file(s)")                                  |
| `placeholder`  | `string`                                                 |             | Text when nothing is selected                                           |
| `summary`      | `ReactNode`                                              |             | Replace the summary next to the button                                  |
| `pickDisabled` | `boolean`                                                | `false`     | Stop picking more files but keep removal working                        |
| `countOffset`  | `number`                                                 | `0`         | Files already counted towards `maxFiles` elsewhere                      |
| `classNames`   | `{ root, trigger, button, summary, list, item, errors }` |             | Classes for each part                                                   |

All other `<input>` props are passed to the input, and `ref` points at the `<input>`.

## Accessibility

- Give the input a label: a `FormField`, a `<label>`, or `aria-label`. The summary ("2 files selected") and any validation messages are linked with `aria-describedby`.
- Each selected file has a "Remove {name}" button; after removing, focus returns to the input.
- The trigger is at least 44px tall on touch screens.

| Key                                 | Action                     |
| ----------------------------------- | -------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open the file picker       |
| <kbd>Tab</kbd>                      | Move to the remove buttons |

## RTL and Dhivehi

The button sits at the inline start, so it moves to the right in RTL. File names are isolated with `<bdi>`, so Thaana and Latin names display correctly in either direction. All strings come from the `file` locale namespace.
