# useAnnouncer and announce

Announces messages to screen-reader users: "Row moved to position 3", "Settings saved", "4 results". `useAnnouncer` gives a component its own [`LiveRegion`](./live-region.md) and an `announce(message)` function; `announce()` does the same from anywhere through one page-wide region. Onu's sortable lists, reorderable tables, Kanban board, data table, editable grid, dual listbox, quick-create selects and map components use `useAnnouncer`.

```tsx
import { announce, useAnnouncer } from "@javaabu/onu"

function SortableRows({ rows }: { rows: Row[] }) {
  const { t } = useTranslation()
  const { announce, region } = useAnnouncer()
  const move = (from: number, to: number) => {
    onMove(from, to)
    announce(t("listing.movedToPosition", { name: rows[from].name, position: to + 1, total: rows.length }))
  }
  return <>…{region}</>
}

// Outside a component, or where there is nowhere to render a region:
await saveSettings()
announce("Settings saved")
announce("Connection lost", { politeness: "assertive" })
```

## Parameters

`useAnnouncer(options?)` takes the [`LiveRegion` props](./live-region.md#props) for its region (without `children`):

| Option       | Type                                                   | Default    | Description                     |
| ------------ | ------------------------------------------------------ | ---------- | ------------------------------- |
| `politeness` | `"polite" \| "assertive"`                              | `"polite"` |                                 |
| `role`       | `"status" \| "alert" \| "log" \| "timer" \| "marquee"` |            | e.g. `"status"`                 |
| `atomic`     | `boolean`                                              | `true`     |                                 |
| `visible`    | `boolean`                                              | `false`    | Show the last message on screen |
| `className`  | `string`                                               |            | Classes for the region          |

`announce(message, options?)` takes `{ politeness?: "polite" | "assertive" }` (default `polite`).

## Returns

`useAnnouncer` returns:

| Field      | Type                        | Description                                                         |
| ---------- | --------------------------- | ------------------------------------------------------------------- |
| `announce` | `(message: string) => void` | Puts `message` in the region. The same message twice is read twice. |
| `clear`    | `() => void`                | Empties the region                                                  |
| `message`  | `string`                    | The text in the region now, e.g. to pass to a region you render     |
| `region`   | `ReactElement`              | The `LiveRegion`. Render it once and keep it mounted.               |

`announce()` returns nothing.

## How repeats work

A screen reader reads a live region when its text changes. A new message is set straight away. The same message again is first cleared, then set 100 ms later, so "Row moved to position 2" twice in a row is read twice. A newer message cancels a pending repeat, and nothing is set after the component unmounts.

`announce()` keeps one hidden region per politeness level at the end of `<body>` (`data-onu-announcer="polite"` / `"assertive"`), created on first use. Its first message is set 100 ms after the region is created, since a region that appears with its text is often not read. The region is hidden with inline styles, so it does not depend on the `sr-only` utility being in your CSS.

## Accessibility

- Announce what happened, not what is happening, and keep it short: "Jane Doe moved to Approved", "3 files added". Translate it with `t()`.
- Use announcements for changes the user cannot see from where their focus is. When focus moves to the change (a dialog opens, an error field is focused), the screen reader already reads it; announcing too would read it twice.
- Prefer `useAnnouncer` inside components: the region is part of the component, so it inherits the component's `lang` and `dir` and is removed with it. Use `announce()` from non-React code, or from handlers that run as a component unmounts (after "Delete", for example).
- Use `politeness: "assertive"` only for messages that must interrupt, such as a lost connection.
- Visible status text (a "Saving…" label, an upload count) can be a [`LiveRegion`](./live-region.md) with `visible` instead of a separate announcement.
