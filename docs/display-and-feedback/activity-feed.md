---
title: ActivityFeed
sidebar_position: 18
---

A log of who did what and when: grouped by day (Today, Yesterday, 3 October 2026), with actor avatars, relative timestamps and a "Load more" button.

```tsx
import { ActivityFeed } from "@javaabu/onu"
;<ActivityFeed
  items={[
    { id: 1, actor: { name: "Aishath Shiuna" }, action: "approved the application", timestamp: "2026-03-12T09:12:00Z" },
    { id: 2, icon: "settings", action: "Status changed to Pending", timestamp: "2026-03-11T14:00:00Z" },
  ]}
  hasMore={page < lastPage}
  onLoadMore={() => fetchNextPage()}
/>
```

## Props

| Prop          | Type                                 | Default    | Description                                         |
| ------------- | ------------------------------------ | ---------- | --------------------------------------------------- |
| `items`       | `ActivityItem[]`                     |            | `{ id, actor?, action, timestamp, icon?, detail? }` |
| `hasMore`     | `boolean`                            | `false`    | Show "Load more"                                    |
| `onLoadMore`  | `() => void \| Promise`              |            | Load the next page (spinner while the promise runs) |
| `loadingMore` | `boolean`                            | automatic  | Force the loading state                             |
| `groupByDay`  | `boolean`                            | `true`     | Day headings                                        |
| `dayFormat`   | `string`                             | `'PPP'`    | date-fns format for older days                      |
| `title`       | `ReactNode \| null`                  | "Activity" | Heading; `null` hides it                            |
| `emptyText`   | `ReactNode`                          | translated | Shown with no items                                 |
| `now`         | `Date`                               | live       | Reference time (tests, SSR)                         |
| `classNames`  | `{ group, heading, item, loadMore }` |            | Classes for each part                               |

`groupActivityByDay(items)` is exported.

## Accessibility

- A `<section>` labelled by its heading; each day is an ordered list under an `h3`.
- `aria-busy` is set while loading more; the button is disabled to prevent double loads.

| Key                                 | Action    |
| ----------------------------------- | --------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Load more |

## RTL

Avatars and the timeline line sit at the inline start, so they move to the right in RTL.
