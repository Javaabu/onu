---
title: EmptyState
sidebar_position: 12
---

Empty states for listings (REQUIREMENTS §25.6), on shadcn's `Empty`:

- `no-records`: "No users yet", a short explanation and the main action;
- `no-results`: "No users match your search", naming the search and filters, with **Clear search** and/or **Clear filters**;
- `trash`: "Trash is empty".

```tsx
import { EmptyState } from "@javaabu/onu"

<EmptyState noun={{ one: "user", other: "users" }} action={<Button>New user</Button>} />
<EmptyState variant="no-results" noun={noun} search="jane" filters={["Status: Active"]}
  onClearSearch={state.clearSearch} onClearFilters={state.clearFilters} />
```

## Props

| Prop                              | Type                                      | Default        | Description                  |
| --------------------------------- | ----------------------------------------- | -------------- | ---------------------------- |
| `variant`                         | `"no-records" \| "no-results" \| "trash"` | `"no-records"` | `emptyStateVariants`         |
| `bordered`                        | `boolean`                                 | `false`        | Dashed border                |
| `noun`                            | `{ one, other }`                          | records        |                              |
| `title`, `description`            | `ReactNode`                               |                | Replace the built-in text    |
| `icon`                            | `string \| ReactNode \| null`             | per variant    |                              |
| `action`                          | `ReactNode`                               |                | Main action                  |
| `search`, `filters`               | `string`, `string[]`                      |                | Named in the no-results text; [`useActiveFilterLabels`](active-filter-chips#filter-labels-for-your-own-ui) builds `filters` |
| `onClearSearch`, `onClearFilters` | `() => void`                              |                | Show the clear buttons       |
| `classNames`                      | `{ media, title, description, content }`  |                |                              |

## Accessibility

The state is a `status` region, so a search that empties the list is announced.
