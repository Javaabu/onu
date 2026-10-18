# AdditionalFilesUpload

Manages a record's attachments on an edit page: existing files can be removed (and restored before saving), and new files can be added, each with an optional display name and description.

```tsx
import { AdditionalFilesUpload, type AdditionalFilesValue } from "@javaabu/onu"

const [value, setValue] = React.useState<AdditionalFilesValue>({ removed: [], added: [] })

<FormField label="Attachments">
  <AdditionalFilesUpload
    existing={[{ id: 11, name: "Lease agreement.pdf", url: "/media/11", size: 482_000 }]}
    value={value}
    onChange={setValue}
    maxFiles={6}
    thaana
  />
</FormField>
```

`value.removed` holds the ids of existing files to delete and `value.added` the new files as `{ key, file, name, description }`.

## Plain form submits

Set `name` to also render native fields: `name[removed][]` (hidden ids), `name[added][0][file]` (a hidden file input holding the file), `name[added][0][name]` and `name[added][0][description]`. Laravel reads these as nested arrays.

## Props

| Prop                                       | Type                                    | Default | Description                                                     |
| ------------------------------------------ | --------------------------------------- | ------- | --------------------------------------------------------------- |
| `existing`                                 | `ExistingAttachment[]`                  | `[]`    | `{ id, name, url?, size?, type?, thumbnailUrl?, description? }` |
| `value`                                    | `AdditionalFilesValue`                  |         | Controlled value                                                |
| `defaultValue`                             | `AdditionalFilesValue`                  |         | Initial value                                                   |
| `onChange`                                 | `(value) => void`                       |         | Called on every change                                          |
| `withName`                                 | `boolean`                               | `true`  | Ask for a display name per new file                             |
| `withDescription`                          | `boolean`                               | `true`  | Ask for a description per new file                              |
| `thaana`                                   | `boolean \| ThaanaOptions`              |         | Thaana typing in the name and description fields                |
| `accept`, `maxSize`, `minSize`, `onReject` |                                         |         | Validation                                                      |
| `maxFiles`                                 | `number`                                |         | Most attachments in total (kept + new)                          |
| `disabled`                                 | `boolean`                               |         | Disable all actions                                             |
| `name`                                     | `string`                                |         | Prefix for native form fields                                   |
| `classNames`                               | `{ list, item, fields, picker, empty }` |         | Classes for each part                                           |

## Accessibility

- Each file's buttons are named with the file ("Remove Lease agreement.pdf", "Restore …").
- Marking a file for removal shows "Will be removed" as text (not only a strike-through), announces it, and moves focus to the Restore button.
- Removing a new file returns focus to the "Add files" picker.

| Key                                          | Action                                                 |
| -------------------------------------------- | ------------------------------------------------------ |
| <kbd>Enter</kbd> / <kbd>Space</kbd>          | Add files, remove, restore                             |
| <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd> | Toggle Thaana in the text fields (when `thaana` is on) |

## RTL and Dhivehi

The name and description fields sit side by side in wide containers and stack in narrow ones (container query). With `thaana`, they type Thaana and switch to `dir="rtl"`.
