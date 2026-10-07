---
title: ExportMenu
sidebar_position: 16
---

An **Export** button with a menu of formats (CSV, Excel, PDF). Onu never builds the file: your `onExport(format)` does, usually by asking the server with the current filters. While the returned promise is pending the button shows a spinner and is disabled.

```tsx
import { ExportMenu } from "@javaabu/onu"

<ExportMenu onExport={(format) => download(`/users/export?format=${format}&${state.toSearchParams()}`)} />
<ExportMenu onExport={exportFile} scopeLabel="312 users, current filters"
  options={["csv", { format: "json", label: "JSON", icon: "code", description: "For developers" }]} />
```

## Props

| Prop         | Type                                                                     | Default                   |
| ------------ | ------------------------------------------------------------------------ | ------------------------- |
| `onExport`   | `(format) => void \| Promise`                                            |                           |
| `options`    | `(ExportFormat \| { format, label?, icon?, description?, disabled? })[]` | `["csv", "excel", "pdf"]` |
| `scopeLabel` | `ReactNode`                                                              | Text above the options    |
| `classNames` | `{ trigger, content, item }`                                             |                           |

## Accessibility

A menu button. "Exporting…" and "Export ready" are announced through a polite live region; the button has `aria-busy` while working.
