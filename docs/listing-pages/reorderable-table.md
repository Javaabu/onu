# ReorderableTable

Drag-and-drop row reordering for tables (route stops, menu items, priorities), on `@dnd-kit/react` and shadcn's `Table`. Each row has a drag handle that works with a mouse, by touch (press and hold) and with the keyboard; <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> on a handle moves the row by one.

```tsx
import { ReorderableTable } from "@javaabu/onu"

;<ReorderableTable
  caption="Ferry route stops"
  rows={stops}
  getName={(s) => s.island}
  onReorder={(next) => setStops(next)}
  columns={[
    { id: "island", header: "Island", cell: (s) => s.island },
    { id: "time", header: "Departs", cell: (s) => s.time },
  ]}
/>
```

## Props

| Prop         | Type                                 | Default  |
| ------------ | ------------------------------------ | -------- |
| `columns`    | `{ id, header, cell, className? }[]` |          |
| `rows`       | `T[]`                                |          |
| `getId`      | `(row) => string`                    | `row.id` |
| `getName`    | `(row) => string`                    |          |
| `onReorder`  | `(rows, { id, from, to }) => void`   |          |
| `disabled`   | `boolean`                            |          |
| `caption`    | `string`                             |          |
| `classNames` | `{ table, row, handle }`             |          |

## Accessibility

Handles are buttons named "Drag to reorder Malé" with `aria-keyshortcuts`. Keyboard dragging works as in [SortableList](./sortable-list.md); moves are announced.
