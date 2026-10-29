---
title: AttachmentPreview
sidebar_position: 14
---

A file attachment: thumbnail or type icon, name, type and size, with open, download and remove actions. Images and PDFs can be previewed in a dialog. A document published in several languages gets one download button per [language version](#language-versions).

```tsx
import { AttachmentPreview } from "@javaabu/onu"

<AttachmentPreview name="Council gazette.pdf" url="/media/gazette.pdf" size={240_000} onRemove={remove} />
<AttachmentPreview variant="card" name="Harbour.jpg" url="/media/harbour.jpg" alt="Malé harbour at dusk" />
```

## Language versions

Pass `versions` for a document published in more than one language, such as a law or a form in Dhivehi and English. Each version gets its own download button under the file, showing the language's own name ("ދިވެހި", "English") with `lang` and `hreflang`, and its size; pass `label` for other languages. `description` adds a line under the name.

```tsx
<AttachmentPreview
  name="Decentralisation Act (Law No. 7/2010)"
  description="Consolidated with amendments up to 2025"
  meta="Law No. 7/2010"
  versions={[
    { lang: "dv", href: "/laws/7-2010-dv.pdf", size: 1_240_000, type: "application/pdf" },
    { lang: "en", href: "/laws/7-2010-en.pdf", size: 980_000, type: "application/pdf" },
  ]}
/>
```

Without `url`, the type comes from the first version's `type` or file extension.

## Props

| Prop           | Type                                         | Default | Description                            |
| -------------- | -------------------------------------------- | ------- | -------------------------------------- |
| `name`         | `string`                                     |         | File name                              |
| `description`  | `ReactNode`                                  |         | A line under the name                  |
| `url`          | `string`                                     |         | Where the file opens / previews        |
| `downloadUrl`  | `string`                                     | `url`   | Download link                          |
| `size`         | `number`                                     |         | Size in bytes                          |
| `type`         | `string`                                     |         | MIME type (else the extension is used) |
| `thumbnailUrl` | `string`                                     |         | Thumbnail; images use `url`            |
| `alt`          | `string`                                     | `name`  | Thumbnail alt text                     |
| `preview`      | `boolean`                                    | `true`  | Preview images and PDFs in a dialog    |
| `onRemove`     | `() => void`                                 |         | Show a remove button                   |
| `actions`      | `ReactNode`                                  |         | Extra actions                          |
| `meta`         | `ReactNode`                                  |         | Details after the type and size        |
| `versions`     | `DocumentVersion[]`                          |         | `{ lang, href, label?, size?, type? }`: a download button per language |
| `variant`      | `"row" \| "card"`                            | `"row"` | Layout (`attachmentPreviewVariants`)   |
| `classNames`   | `{ thumbnail, name, description, meta, actions, versions, dialog }` |         | Classes for each part                  |

## Accessibility

Actions are named with the file ("Preview Council gazette.pdf", "Download …"). With `versions`, the attachment is a group labelled by its name, and each language button is named "Download {name} in {language}", which contains its visible text. The preview is a dialog titled with the file name; it traps focus, closes with <kbd>Escape</kbd> or the Close button, and returns focus to the Preview button. PDFs are shown in a titled `<iframe>`.

| Key                                 | Action                    |
| ----------------------------------- | ------------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Preview, download, remove |
| <kbd>Escape</kbd>                   | Close the preview         |

## RTL and Dhivehi

Thaana file names are isolated with `<bdi>` so extensions stay in the right place.
