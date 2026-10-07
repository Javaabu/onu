---
title: FilterPanel
sidebar_position: 4
---

The **Filters** button and its panel (REQUIREMENTS §25.7): a dropdown on desktop and a bottom sheet on phones. The button shows how many filters are applied.

```tsx
import { FilterPanel, type FilterDefinition } from "@javaabu/onu"

const filters: FilterDefinition[] = [
  {
    type: "select",
    key: "status",
    label: "Status",
    options: [
      { value: "active", label: "Active" },
      { value: "banned", label: "Banned" },
    ],
  },
  { type: "select", key: "island", label: "Island", options: islands }, // searchable when long
  {
    type: "date-range",
    key: "created",
    label: "Date",
    fields: [
      { value: "created_at", label: "Created" },
      { value: "updated_at", label: "Updated" },
    ],
  },
  { type: "boolean", key: "verified", label: "Verified email" },
  { type: "text", key: "email", label: "Email contains" },
  { type: "trashed", key: "trashed", label: "Deleted records" },
]

;<FilterPanel filters={filters} value={state.filters} onApply={state.setFilters} />
```

## Behaviour

- Changes in the panel are a draft: the list doesn't change until **Apply**.
- **Cancel**, <kbd>Escape</kbd> or clicking outside close the panel and throw the draft away.
- **Clear all** removes every filter straight away and closes the panel.
- Each filter has its own **Clear** link.
- Reopening the panel always shows the filters currently applied.

## Filter types

| `type`       | Control                                                                                                                                 | Value                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `select`     | Checkboxes for short lists; a searchable list (shadcn `Popover` + `Command`) for long ones or `searchable`. `multiple: false` picks one | `string[]` (or `string`) |
| `date-range` | A "Date" select when `fields` has several dates, then From / To pickers (shadcn `Calendar`)                                             | `{ field?, from?, to? }` |
| `boolean`    | Any / Yes / No select                                                                                                                   | `"1"` \| `"0"`           |
| `text`       | A text box (`thaana` supported)                                                                                                         | `string`                 |
| `trashed`    | Hide / Include / Only                                                                                                                   | `"with"` \| `"only"`     |
| `custom`     | Your `render({ value, onChange, id, definition })`                                                                                      | anything                 |

Every definition also accepts `render` (replace the built-in control) and `format(value)` (the pill text).

## Props

| Prop                    | Type                                                       | Default         | Description                            |
| ----------------------- | ---------------------------------------------------------- | --------------- | -------------------------------------- |
| `filters`               | `FilterDefinition[]`                                       |                 | Filters on offer                       |
| `value`                 | `FilterValues`                                             |                 | Applied filters                        |
| `onApply`               | `(filters) => void`                                        |                 | Apply (and `{}` on Clear all)          |
| `open` / `onOpenChange` | `boolean` / `(open) => void`                               |                 | Controlled open state                  |
| `sheet`                 | `boolean`                                                  | below 768px     | Force the bottom sheet or the dropdown |
| `trigger`               | `ReactNode`                                                | Filters + count | Button content                         |
| `align`                 | `"start" \| "center" \| "end"`                             | `"start"`       | Dropdown alignment                     |
| `classNames`            | `{ trigger, badge, content, body, filter, label, footer }` |                 | Classes for each part                  |

## Accessibility

The panel is a `dialog` named "Filters"; each filter's control is labelled by its name. The button's name includes the count ("Filters, 2 applied"). Focus returns to the button when the panel closes.

| Key               | Action                                   |
| ----------------- | ---------------------------------------- |
| <kbd>Escape</kbd> | Close without applying                   |
| <kbd>Tab</kbd>    | Move through the filters and the buttons |

## RTL and Thaana

The panel and the bottom sheet mirror in RTL; the calendar follows the locale's week start and month names. Text filters accept `thaana: true`.
