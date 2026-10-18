# GridView

Records as a responsive grid of cards. Columns follow the space available (`repeat(auto-fill, minmax(…))`), not the viewport, so the grid also works in a sidebar or a narrow column.

```tsx
import { GridView } from "@javaabu/onu"

;<GridView
  aria-label="Council offices"
  items={offices}
  title={(o) => o.name}
  description={(o) => o.address}
  media={(o) => <img src={o.photo} alt="" />}
  getHref={(o) => `/offices/${o.id}`}
  minItemWidth="14rem"
/>
```

Props are the same as [`ListView`](./list-view.md), plus `minItemWidth` and without `variant`. Selection checkboxes sit on the card's start corner.

## Props

| Prop                              | Type                                                | Default           | Description                                              |
| --------------------------------- | --------------------------------------------------- | ----------------- | -------------------------------------------------------- |
| `items`                           | `T[]`                                               |                   |                                                          |
| `getId` / `getName`               | `(item) => string`                                  | `item.id` / title | Id, and the name used in "Select …" and "Actions for …"  |
| `title`                           | `(item) => ReactNode`                               |                   | Links to the record when `getHref` is set                |
| `description`, `meta`             | `(item) => ReactNode`                               |                   | Body text (two lines at most) and small details          |
| `media`                           | `(item) => ReactNode`                               |                   | 16:9 area at the top of the card, e.g. an `<img alt="">` |
| `renderItem`                      | `(item, { checkbox, actions, title }) => ReactNode` |                   | Replace the card's layout                                |
| `getHref` / `onItemClick`         | `(item) => string` / `(item) => void`               |                   | Opening an item                                          |
| `itemActions`                     | `(item) => RecordAction[]`                          |                   | ⋯ menu                                                   |
| `selection` / `onSelectionChange` | `string[]` / `(ids) => void`                        |                   | Checkboxes (shown when `onSelectionChange` is set)       |
| `loading`, `empty`                | `boolean`, `ReactNode`                              |                   | Six skeleton cards; content for no items                 |
| `minItemWidth`                    | `string`                                            | `"16rem"`         | Smallest card width before the grid drops a column       |
| `aria-label`                      | `string`                                            |                   | Name of the list                                         |
| `className`                       | `string`                                            |                   | Classes for the grid                                     |
| `classNames`                      | `{ item, media, body, meta }`                       |                   | Classes for each part                                    |

## Accessibility

A list (`ul`) of cards named by your `aria-label`; each title is a real link, so keyboard users reach it with <kbd>Tab</kbd>. Clicking elsewhere on a card is a mouse shortcut for that link. While `loading`, the list has `aria-busy="true"`. Images in `media` are usually decorative next to the title: give them `alt=""`. Cards keep the DOM order in the grid, so reading and tab order match what is on screen in both directions.
