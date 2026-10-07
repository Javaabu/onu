---
title: EditableDataGrid
sidebar_position: 24
---

A spreadsheet-like table for quick edits (order lines, stock counts, rates), following the WAI-ARIA grid pattern. Values are validated before they are saved; `onCellChange` can also reject a value (e.g. after a server check).

```tsx
import { EditableDataGrid } from "@javaabu/onu"

;<EditableDataGrid
  aria-label="Supply order"
  rows={lines}
  columns={[
    { id: "item", header: "Item", editable: true, required: true },
    { id: "itemDv", header: "ބައިގެ ނަން", editable: true, thaana: true },
    {
      id: "qty",
      header: "Qty",
      editable: true,
      type: "number",
      align: "end",
      validate: (v) => (Number(v) <= 0 ? "Must be more than 0" : undefined),
    },
    { id: "unit", header: "Unit", editable: true, type: "select", options: units },
    { id: "total", header: "Total", align: "end", accessor: (l) => l.qty * l.price },
  ]}
  onCellChange={async ({ rowId, columnId, value }) => {
    const error = await api.update(rowId, columnId, value)
    if (error) return error // stays in edit mode and shows the message
    setLines(/* … */)
  }}
/>
```

## Props

| Prop           | Type                                                             | Description                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `columns`      | `EditableColumn[]`                                               | `id`, `header`, `accessor?`, `cell?`, `editable?`, `type?` (`text` \| `number` \| `select`), `options?`, `required?`, `validate?`, `thaana?`, `align?`, `className?` |
| `rows`         | `T[]`                                                            |                                                                                                                                                                      |
| `getRowId`     | `(row) => string`                                                | Default `row.id`                                                                                                                                                     |
| `onCellChange` | `({ rowId, columnId, value, row }) => void \| string \| Promise` | Return an error message to reject                                                                                                                                    |
| `classNames`   | `{ table, header, cell, editor, error }`                         |                                                                                                                                                                      |

## Keyboard

| Key                                                        | Action                                                           |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| Arrow keys                                                 | Move between cells (left/right follow RTL)                       |
| <kbd>Home</kbd> / <kbd>End</kbd>                           | First / last cell in the row (with <kbd>Ctrl</kbd>: in the grid) |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd>                    | Up / down 10 rows                                                |
| <kbd>Enter</kbd> / <kbd>F2</kbd>                           | Edit the cell                                                    |
| Typing                                                     | Start editing with that character                                |
| <kbd>Enter</kbd> (editing)                                 | Save and move down                                               |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> (editing) | Save and move to the next / previous cell                        |
| <kbd>Escape</kbd> (editing)                                | Cancel                                                           |

## Accessibility

Only one cell is in the tab order (roving `tabindex`). Read-only cells have `aria-readonly`; an invalid edit sets `aria-invalid`, links the message with `aria-describedby`, and announces it. Saves are announced. Thaana columns type Thaana.
