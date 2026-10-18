# ListView

Records as a vertical list: media (avatar, icon), title, description and details, with optional checkboxes and a ⋯ menu per item. Clicking an item opens it.

```tsx
import { ListView } from "@javaabu/onu"

;<ListView
  aria-label="Users"
  items={rows}
  title={(u) => u.name}
  description={(u) => u.email}
  media={(u) => <Avatar>…</Avatar>}
  meta={(u) => <Badge>{u.status}</Badge>}
  getHref={(u) => `/users/${u.id}`}
  selection={state.selection}
  onSelectionChange={state.setSelection}
  itemActions={(u) => [{ id: "edit", label: "Edit", href: `/users/${u.id}/edit` }]}
/>
```

## Props

| Prop                              | Type                                                | Default           | Description                               |
| --------------------------------- | --------------------------------------------------- | ----------------- | ----------------------------------------- |
| `items`                           | `T[]`                                               |                   |                                           |
| `getId` / `getName`               | `(item) => string`                                  | `item.id` / title | Id and accessible name                    |
| `title`                           | `(item) => ReactNode`                               |                   | Links to the record when `getHref` is set |
| `description`, `meta`, `media`    | `(item) => ReactNode`                               |                   |                                           |
| `renderItem`                      | `(item, { checkbox, actions, title }) => ReactNode` |                   | Replace the layout                        |
| `getHref` / `onItemClick`         | `(item) => string` / `(item) => void`               |                   | Opening an item                           |
| `itemActions`                     | `(item) => RecordAction[]`                          |                   | ⋯ menu                                    |
| `selection` / `onSelectionChange` | `string[]` / `(ids) => void`                        |                   | Checkboxes                                |
| `loading`, `empty`                | `boolean`, `ReactNode`                              |                   | Skeletons, empty state                    |
| `variant`                         | `"divided" \| "cards"`                              | `"divided"`       |                                           |
| `classNames`                      | `{ item, media, body, meta }`                       |                   |                                           |

## Accessibility

A list (`ul`) with your `aria-label`; each item's title is a real link, so keyboard users reach it with <kbd>Tab</kbd>. Clicking elsewhere on the item is a mouse shortcut for that link.
