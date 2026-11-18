---
title: ColumnVisibility
sidebar_position: 14
---

A "Columns" menu with a checkbox per column, to show or hide table columns. The menu stays open while toggling.

```tsx
import { ColumnVisibility } from "@javaabu/onu"

;<ColumnVisibility columns={columns} value={state.columnVisibility} onValueChange={state.setColumnVisibility} />
```

[`DataTable`](data-table) hides columns set to `false` in `state.columnVisibility` (TanStack's column visibility). The record column (the `primary` one, else the first) carries the row link, so the menu never offers it and the table keeps it visible; columns with `hideable: false` aren't offered either.

## Props

| Prop            | Type                                    | Default | Description                            |
| --------------- | --------------------------------------- | ------- | -------------------------------------- |
| `columns`       | `{ id, header, hideable?, primary? }[]` |         | `DataTableColumn`s work as they are    |
| `value`         | `Record<string, boolean>`               |         | `false` hides; missing ids are visible |
| `onValueChange` | `(value) => void`                       |         |                                        |
| `showLabel`     | `boolean`                               | `true`  | "Columns" text (from 640px)            |
| `classNames`    | `{ trigger, content, item }`            |         |                                        |

Primary columns and columns with `hideable: false` are not listed.

## Accessibility

Items are `menuitemcheckbox`es. Arrow keys move, <kbd>Space</kbd>/<kbd>Enter</kbd> toggles, <kbd>Escape</kbd> closes and returns focus to the button.
