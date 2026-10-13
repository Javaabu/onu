---
title: FilterTabs
sidebar_position: 15
---

Status tabs above a listing, with counts: "All 312 · Active 280 · Banned 32". Built on shadcn `Tabs`; on narrow screens the tabs scroll sideways. The default `line` variant looks like Ant Design's line tabs: 32px apart over a hairline, brand-coloured text and a 2px ink bar on the active tab, and grey count pills that turn to the brand colour on the active tab.

```tsx
import { FilterTabs } from "@javaabu/onu"

;<FilterTabs
  controls="users-table"
  value={(state.filters.status as string) ?? "all"}
  onValueChange={(v) => state.setFilter("status", v === "all" ? undefined : v)}
  tabs={[
    { value: "all", label: "All", count: 312 },
    { value: "active", label: "Active", count: 280 },
    { value: "banned", label: "Banned", count: 32 },
  ]}
/>
```

[`ListingPage`](listing-page) does this for you with its `tabs` prop.

## Props

| Prop                     | Type                                    | Default  | Description                                |
| ------------------------ | --------------------------------------- | -------- | ------------------------------------------ |
| `tabs`                   | `{ value, label, count?, disabled? }[]` |          |                                            |
| `value` / `defaultValue` | `string`                                |          |                                            |
| `onValueChange`          | `(value) => void`                       |          |                                            |
| `variant`                | `"line" \| "default"`                   | `"line"` | Underline or pills                         |
| `controls`               | `string`                                |          | Id of the listing (set as `aria-controls`) |
| `classNames`             | `{ list, tab, count }`                  |          |                                            |

## Accessibility

A `tablist` named "Filter by status"; the selected tab has `aria-selected`, and counts are part of each tab's name ("Active (280)"). Arrow keys move between tabs (mirrored in RTL), <kbd>Home</kbd>/<kbd>End</kbd> go to the first and last.
