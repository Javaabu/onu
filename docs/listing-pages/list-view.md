# ListView

Records as a vertical list: media (avatar, icon), title, description and details, with optional checkboxes and a ⋯ menu per item. Clicking an item opens it. With `layout="grid"` the same records show as a [grid of cards](#grid-layout).

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

`layout` takes the same `"list"` and `"grid"` values as the [view switcher](../choice-inputs/segmented-control.md#view-switcher), so a listing can pass its view straight through:

```tsx
<ListView layout={state.view === "grid" ? "grid" : "list"} items={rows} title={(u) => u.name} />
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
| `layout`                          | `"list" \| "grid"`                                  | `"list"`          | Rows, or a [grid of cards](#grid-layout)  |
| `variant`                         | `"divided" \| "cards"`                              | `"divided"`       | List layout only                          |
| `minItemWidth`                    | `string`                                            | `"16rem"`         | Grid layout only                          |
| `aria-label`                      | `string`                                            |                   | Name of the list                          |
| `className`                       | `string`                                            |                   | Classes for the list                      |
| `classNames`                      | `{ item, media, body, meta }`                       |                   |                                           |

## Grid layout

`layout="grid"` shows the records as a responsive grid of cards. Columns follow the space available (`repeat(auto-fill, minmax(…))`), not the viewport, so the grid also works in a sidebar or a narrow column.

```tsx
<ListView
  layout="grid"
  aria-label="Council offices"
  items={offices}
  title={(o) => o.name}
  description={(o) => o.address}
  media={(o) => <img src={o.photo} alt="" />}
  getHref={(o) => `/offices/${o.id}`}
  minItemWidth="14rem"
/>
```

Props are the same as above, plus `minItemWidth` and without `variant`. `media` fills a 16:9 area at the top of the card, the description is cut to two lines, selection checkboxes sit on the card's start corner, and `loading` shows six skeleton cards.

| Prop           | Type     | Default   | Description                                        |
| -------------- | -------- | --------- | -------------------------------------------------- |
| `minItemWidth` | `string` | `"16rem"` | Smallest card width before the grid drops a column |

The grid is still a list (`ul`) of cards named by your `aria-label`. Images in `media` are usually decorative next to the title: give them `alt=""`. Cards keep the DOM order in the grid, so reading and tab order match what is on screen in both directions; the start corner (checkbox) mirrors in RTL.

## Accessibility

A list (`ul`) with your `aria-label`, in both layouts; each item's title is a real link, so keyboard users reach it with <kbd>Tab</kbd>. Clicking elsewhere on the item is a mouse shortcut for that link. While `loading`, the list has `aria-busy="true"`.
