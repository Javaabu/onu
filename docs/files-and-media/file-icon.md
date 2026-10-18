# FileIcon

A coloured icon for a file's type (image, video, audio, PDF, document, spreadsheet, presentation, archive, text), detected from the MIME type or the file extension. It uses semantic icon names, so it follows the configured icon set.

```tsx
import { FileIcon } from "@javaabu/onu"

<FileIcon name="budget.xlsx" />
<FileIcon type="application/pdf" size="lg" label="PDF document" />
```

## Props

| Prop    | Type                        | Default     | Description                                    |
| ------- | --------------------------- | ----------- | ---------------------------------------------- |
| `type`  | `string`                    |             | MIME type                                      |
| `name`  | `string`                    |             | File name or URL (extension used when no type) |
| `kind`  | `FileKind`                  |             | Force a kind                                   |
| `size`  | `"sm" \| "default" \| "lg"` | `"default"` | Size (`fileIconVariants`)                      |
| `label` | `string`                    |             | Accessible label; decorative without it        |

`getFileKind({ type, name })` and `FILE_KIND_ICONS` are exported. Icons used: `file-image`, `file-video`, `file-audio`, `file-text`, `file-spreadsheet`, `file-archive`, `file`.

## Accessibility

Decorative by default (`aria-hidden`); pass `label` when the icon is the only indication of the type.

## RTL and Dhivehi

File icons are not directional and do not mirror.
