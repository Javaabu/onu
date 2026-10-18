# KanbanBoard

A board of columns with cards that move between them, on [`@dnd-kit/react`](https://dndkit.com). Cards can be dragged with a mouse, by touch (press and hold, so the page still scrolls), or with the keyboard, and every card also has a **Move to…** menu as a non-drag alternative (R3.27).

```tsx
import { KanbanBoard } from "@javaabu/onu"

;<KanbanBoard
  columns={[
    { id: "submitted", title: "Submitted", accentClassName: "bg-chart-1" },
    { id: "review", title: "In review" },
    { id: "approved", title: "Approved" },
  ]}
  items={applicationsByStatus}
  getName={(a) => a.reference}
  canMove={(move) => move.to !== "submitted"}
  onItemsChange={(next, move) => {
    setApplications(next)
    api.move(move.id, move.to, move.index)
  }}
  renderCard={(a, { handle, moveMenu }) => (
    <div className="gap-2 p-2 flex items-center">
      {handle}
      <span>{a.reference}</span>
      {moveMenu}
    </div>
  )}
/>
```

## Props

| Prop            | Type                                                    | Description                       |
| --------------- | ------------------------------------------------------- | --------------------------------- |
| `columns`       | `{ id, title, accentClassName?, actions? }[]`           |                                   |
| `items`         | `Record<columnId, T[]>`                                 |                                   |
| `getId`         | `(item) => string`                                      | Default `item.id`                 |
| `getName`       | `(item) => string`                                      | Handle label and announcements    |
| `renderCard`    | `(item, { handle, moveMenu, isDragging }) => ReactNode` |                                   |
| `onItemsChange` | `(items, { id, from, to, index }) => void`              | After a drop or a Move to… choice |
| `canMove`       | `(move) => boolean`                                     | Refuse moves (workflow rules)     |
| `emptyColumn`   | `ReactNode`                                             | Text in empty columns             |
| `disabled`      | `boolean`                                               |                                   |
| `classNames`    | `{ column, header, list, card }`                        |                                   |

## Accessibility

Each column is a region named by its title with a count ("3 items"). Moves are announced in the active locale, with item names.

| Key                                 | Action (on a drag handle) |
| ----------------------------------- | ------------------------- |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Pick up / drop            |
| Arrow keys                          | Move while picked up      |
| <kbd>Escape</kbd>                   | Cancel the move           |

## RTL

Columns flow from the right in RTL; on phones the board scrolls sideways with snap points.
