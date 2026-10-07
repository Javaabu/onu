---
title: CommandPalette
sidebar_position: 9
---

A <kbd>⌘</kbd><kbd>K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd> command palette for jumping to pages, records and commands from the keyboard. Built on shadcn's `Command` (cmdk) inside an Onu [`Modal`](./modal). Static groups filter instantly; an async `search` is debounced and aborts stale requests. It remembers recent choices, supports Thaana input, and announces result counts.

```tsx
import { CommandPalette, type CommandPaletteGroup } from "@javaabu/onu"

const groups: CommandPaletteGroup[] = [
  {
    heading: "Pages",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "home", href: "/" },
      { id: "staff", label: "Staff", icon: "users", href: "/staff", keywords: ["employees", "މުވައްޒަފުން"] },
    ],
  },
  {
    heading: "Actions",
    items: [{ id: "new-permit", label: "New permit", icon: "add", shortcut: "⌘N", onSelect: createPermit }],
  },
]

;<CommandPalette
  groups={groups}
  search={(query, { signal }) =>
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal })
      .then((r) => r.json())
      .then((json) => json.data.map((u) => ({ id: `user-${u.id}`, label: u.name, href: `/users/${u.id}` })))
  }
  searchHeading="Staff"
  onNavigate={(href) => router.visit(href)}
/>
```

Mount it once (e.g. in your layout). The shortcut toggles it from anywhere; you can also pass a `trigger` or control `open`.

## Searching

- Static items match when every word of the query appears in `value` (or the string `label`) or `keywords`. Case and Latin accents are ignored ("male" finds "Malé").
- `search(query, { signal })` runs after `debounce` ms (default 250) once the query has `minQueryLength` characters (default 1). A newer query, or closing the palette, aborts the earlier request through `signal`, and late answers are ignored (R16.5).
- Return items (shown under `searchHeading`) or groups. Errors show "Search failed" with a **Retry** button.

## Recent items

Chosen items are remembered in `localStorage` (`recent={{ storageKey, max }}`, default 5) and shown under "Recent" when the query is empty. Pass `recent={false}` to turn it off. Storage failures are ignored.

## Props

| Prop                                  | Type                                                | Default            | Description                         |
| ------------------------------------- | --------------------------------------------------- | ------------------ | ----------------------------------- |
| `groups`                              | `CommandPaletteGroup[]`                             | `[]`               | Static items, filtered locally      |
| `search`                              | `(query, { signal }) => Promise<Item[] \| Group[]>` |                    | Async search                        |
| `searchHeading`                       | `ReactNode`                                         |                    | Heading for async items             |
| `debounce`                            | `number`                                            | `250`              | Debounce in ms                      |
| `minQueryLength`                      | `number`                                            | `1`                | Minimum query length for `search`   |
| `recent`                              | `boolean \| { storageKey?, max? }`                  | `true`             | Remember chosen items               |
| `shortcut`                            | `string \| false`                                   | `'k'`              | Key used with ⌘ / Ctrl              |
| `thaana`                              | `boolean \| ThaanaOptions`                          |                    | Type Thaana in the search box       |
| `placeholder`                         | `string`                                            | translated         | Search box placeholder              |
| `title`                               | `string`                                            | "Command palette"  | Accessible name                     |
| `emptyMessage`                        | `(query) => ReactNode`                              | "No results for …" | Empty state                         |
| `footer`                              | `boolean`                                           | `true`             | Key hints (hidden on touch screens) |
| `onNavigate`                          | `(href) => void`                                    | `location.assign`  | Router for `href` items             |
| `onItemSelect`                        | `(item) => void`                                    |                    | Called for every chosen item        |
| `closeOnSelect`                       | `boolean`                                           | `true`             | Close after choosing                |
| `trigger`                             | `ReactNode`                                         |                    | Element that opens the palette      |
| `open`, `defaultOpen`, `onOpenChange` |                                                     |                    | Open state                          |
| `classNames`                          | `{ input, list, group, item, empty, footer }`       |                    | Classes for each part               |

`CommandPaletteItem`: `{ id, label, value?, keywords?, icon?, description?, shortcut?, href?, onSelect?, disabled? }`. `matchesQuery` and `normalizeSearch` are exported for custom filtering.

## Accessibility

- A modal dialog with a combobox and listbox (cmdk); the active option is tracked with `aria-activedescendant`.
- "Searching…", the result count and "Search failed" are announced through a polite live region.
- Focus returns to whatever had it before the palette opened, including when opened with the shortcut.
- On phones it is full screen with a close button.

| Key                                                      | Action                       |
| -------------------------------------------------------- | ---------------------------- |
| <kbd>⌘</kbd>+<kbd>K</kbd> / <kbd>Ctrl</kbd>+<kbd>K</kbd> | Open or close                |
| <kbd>↑</kbd> / <kbd>↓</kbd>                              | Move between results (wraps) |
| <kbd>Enter</kbd>                                         | Choose                       |
| <kbd>Escape</kbd>                                        | Close                        |

## RTL and Thaana

With `thaana`, the search box types Thaana from a Latin keyboard (with a toggle). Add Dhivehi names to `keywords` so both scripts find an item. Shortcut hints keep their Latin order in RTL.
