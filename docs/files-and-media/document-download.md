---
title: DocumentDownload
sidebar_position: 15
---

A downloadable document card with its type, size and a download link, optionally in several language versions (English and Dhivehi).

```tsx
import { DocumentDownload } from "@javaabu/onu"

<DocumentDownload
  title="Decentralisation Act (Law No. 7/2010)"
  description="Consolidated with amendments up to 2025"
  versions={[
    { lang: "dv", href: "/laws/7-2010-dv.pdf", size: 1_240_000 },
    { lang: "en", href: "/laws/7-2010-en.pdf", size: 980_000 },
  ]}
/>

<DocumentDownload title="Tender form" href="/files/tender.docx" fileName="tender-form.docx" size={56_000} />
```

Language buttons show the language's own name ("ދިވެހި", "English") with `lang` and `hreflang`; pass `label` for other languages.

## Props

| Prop          | Type                                          | Description                                                   |
| ------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `title`       | `ReactNode`                                   | Document title                                                |
| `titleText`   | `string`                                      | Plain title for accessible names when `title` is not a string |
| `description` | `ReactNode`                                   | Secondary text                                                |
| `href`        | `string`                                      | Download URL (single version)                                 |
| `fileName`    | `string`                                      | Name to save as                                               |
| `size`        | `number`                                      | Size in bytes                                                 |
| `type`        | `string`                                      | MIME type                                                     |
| `versions`    | `DocumentVersion[]`                           | `{ lang, href, label?, size?, type? }`                        |
| `meta`        | `ReactNode`                                   | Extra details (date, reference number)                        |
| `classNames`  | `{ icon, title, description, meta, actions }` | Classes for each part                                         |

## Accessibility

The card is a group labelled by its title. Links are named "Download {title}" or "Download {title} in {language}", which contains the visible text.

| Key              | Action   |
| ---------------- | -------- |
| <kbd>Enter</kbd> | Download |

## RTL and Dhivehi

Titles are isolated with `<bdi>`; buttons fill the width in narrow containers and size to content in wide ones.
