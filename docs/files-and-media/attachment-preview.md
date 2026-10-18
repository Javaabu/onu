# AttachmentPreview

A file attachment: thumbnail or type icon, name, type and size, with open, download and remove actions. Images and PDFs can be previewed in a dialog.

```tsx
import { AttachmentPreview } from "@javaabu/onu"

<AttachmentPreview name="Council gazette.pdf" url="/media/gazette.pdf" size={240_000} onRemove={remove} />
<AttachmentPreview variant="card" name="Harbour.jpg" url="/media/harbour.jpg" alt="Malé harbour at dusk" />
```

## Props

| Prop           | Type                                         | Default | Description                            |
| -------------- | -------------------------------------------- | ------- | -------------------------------------- |
| `name`         | `string`                                     |         | File name                              |
| `url`          | `string`                                     |         | Where the file opens / previews        |
| `downloadUrl`  | `string`                                     | `url`   | Download link                          |
| `size`         | `number`                                     |         | Size in bytes                          |
| `type`         | `string`                                     |         | MIME type (else the extension is used) |
| `thumbnailUrl` | `string`                                     |         | Thumbnail; images use `url`            |
| `alt`          | `string`                                     | `name`  | Thumbnail alt text                     |
| `preview`      | `boolean`                                    | `true`  | Preview images and PDFs in a dialog    |
| `onRemove`     | `() => void`                                 |         | Show a remove button                   |
| `actions`      | `ReactNode`                                  |         | Extra actions                          |
| `variant`      | `"row" \| "card"`                            | `"row"` | Layout (`attachmentPreviewVariants`)   |
| `classNames`   | `{ thumbnail, name, meta, actions, dialog }` |         | Classes for each part                  |

## Accessibility

Actions are named with the file ("Preview Council gazette.pdf", "Download …"). The preview is a dialog titled with the file name; it traps focus, closes with <kbd>Escape</kbd> or the Close button, and returns focus to the Preview button. PDFs are shown in a titled `<iframe>`.

| Key                                 | Action                    |
| ----------------------------------- | ------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Preview, download, remove |
| <kbd>Escape</kbd>                   | Close the preview         |

## RTL and Dhivehi

Thaana file names are isolated with `<bdi>` so extensions stay in the right place.
