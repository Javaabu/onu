---
title: ActiveFilterChips
sidebar_position: 5
---

One pill per applied filter under the toolbar (REQUIREMENTS §25.7): "Status: Active", "Created: 1 Mar → 31 Mar", "Created: from 1 Mar". ✕ removes that filter; **Clear all** appears with two or more pills. Nothing renders when no filters are applied.

```tsx
import { ActiveFilterChips } from "@javaabu/onu"

;<ActiveFilterChips
  filters={filters}
  value={state.filters}
  onRemove={state.removeFilter}
  onClearAll={state.clearFilters}
/>
```

Dates show as "1 Mar" (with the year when it isn't this year), using the active locale. Use a definition's `format(value)` to customise a pill or return `null` to hide it. `useActiveFilterChips(filters, value)` and `formatFilter(definition, value, t, dateLocale)` give you the same text for your own UI.

## Props

| Prop         | Type                               | Description                            |
| ------------ | ---------------------------------- | -------------------------------------- |
| `filters`    | `FilterDefinition[]`               | Definitions (labels and options)       |
| `value`      | `FilterValues`                     | Applied filters                        |
| `onRemove`   | `(key) => void`                    | ✕ on a pill                            |
| `onClearAll` | `() => void`                       | Shows Clear all with two or more pills |
| `classNames` | `{ list, chip, remove, clearAll }` | Classes for each part                  |

## Accessibility

The pills are a list inside a region named "Active filters". Each ✕ is a button named "Remove filter Status: Active"; after removing one, focus moves to the next ✕ so keyboard users don't lose their place. Targets grow to 44px on touch screens.
