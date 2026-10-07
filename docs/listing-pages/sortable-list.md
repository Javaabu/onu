---
title: SortableList
sidebar_position: 22
---

A list the user can put in order (menu items, steps, priorities), on `@dnd-kit/react`: drag the handle with a mouse or by touch (press and hold), use the keyboard on the handle, or use the **Move up / Move down** buttons.

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

## Props

| Prop          | Type                                                              | Default   |
| ------------- | ----------------------------------------------------------------- | --------- |
| `items`       | `T[]`                                                             |           |
| `getId`       | `(item) => string`                                                | `item.id` |
| `getName`     | `(item) => string`                                                |           |
| `renderItem`  | `(item, { handle, moveButtons, index, isDragging }) => ReactNode` |           |
| `onReorder`   | `(items, { id, from, to }) => void`                               |           |
| `moveButtons` | `boolean`                                                         | `true`    |
| `disabled`    | `boolean`                                                         |           |
| `classNames`  | `{ item, handle }`                                                |           |

## Accessibility

| Key (on a handle)                        | Action                    |
| ---------------------------------------- | ------------------------- |
| <kbd>Space</kbd> / <kbd>Enter</kbd>      | Pick up / drop            |
| Arrow keys                               | Move while picked up      |
| <kbd>Escape</kbd>                        | Cancel                    |
| <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> | Move by one straight away |

The new position is announced ("Home moved to position 2 of 4") in the active locale.
