# SortableList

A list, or a table, the user can put in order (menu items, steps, route stops, priorities), on `@dnd-kit/react`: drag the handle with a mouse or by touch (press and hold), use the keyboard on the handle, or use the **Move up / Move down** buttons.

```tsx
import { SortableList } from "@javaabu/onu"

;<SortableList
  aria-label="Menu items"
  items={items}
  getName={(i) => i.title}
  onReorder={(next, { id, from, to }) => setItems(next)}
  renderItem={(item, { handle, moveButtons }) => (
    <div className="gap-2 p-2 flex items-center rounded-lg border">
      {handle}
      <span className="flex-1">{item.title}</span>
      {moveButtons}
    </div>
  )}
/>
```

## Table layout

Pass `columns` instead of `renderItem` to reorder the rows of a table (shadcn `Table`). The first column holds each row's drag handle and its Move up / Move down buttons (`moveButtons={false}` leaves just the handle), under a header named "Reorder" for screen readers. `aria-label` names the table through a visually hidden caption.

```tsx
<SortableList
  aria-label="Ferry route stops"
  items={stops}
  getName={(s) => s.island}
  onReorder={(next) => setStops(next)}
  columns={[
    { id: "island", header: "Island", cell: (s) => s.island },
    { id: "time", header: "Departs", cell: (s) => s.time, className: "tabular-nums" },
  ]}
/>
```

Reordering is manual ordering, so the table has no sorting, paging or selection: use [`DataTable`](./data-table.md) for those.

## Props

| Prop          | Type                                                              | Default   | Description                                                  |
| ------------- | ----------------------------------------------------------------- | --------- | ------------------------------------------------------------ |
| `items`       | `T[]`                                                             |           |                                                              |
| `getId`       | `(item) => string`                                                | `item.id` | Stable id                                                    |
| `getName`     | `(item) => string`                                                |           | Name in the handle's label and in announcements              |
| `renderItem`  | `(item, { handle, moveButtons, index, isDragging }) => ReactNode` |           | List layout: each item                                       |
| `columns`     | `{ id, header, cell, className? }[]`                              |           | Table layout instead of `renderItem`                         |
| `onReorder`   | `(items, { id, from, to }) => void`                               |           | Called with the new order                                    |
| `moveButtons` | `boolean`                                                         | `true`    | Move up / Move down buttons                                  |
| `disabled`    | `boolean`                                                         |           | Turn reordering off                                          |
| `aria-label`  | `string`                                                          |           | Name of the list, or of the table (as a hidden caption)      |
| `className`   | `string`                                                          |           | Classes for the `ul`, or the table's bordered wrapper        |
| `classNames`  | `{ item, handle, table }`                                         |           | Classes for each `li` or table row, the handles, the `table` |

## Accessibility

Handles are buttons named "Drag to reorder Home" with `aria-keyshortcuts`. The Move up / Move down buttons ("Move up: Home") are the alternative to dragging (WCAG 2.5.7), on by default in both layouts.

| Key (on a handle)                        | Action                    |
| ---------------------------------------- | ------------------------- |
| <kbd>Space</kbd> / <kbd>Enter</kbd>      | Pick up / drop            |
| Arrow keys                               | Move while picked up      |
| <kbd>Escape</kbd>                        | Cancel                    |
| <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> | Move by one straight away |

Drags and the new position are announced ("Home moved to position 2 of 4") in the active locale, with item names.
