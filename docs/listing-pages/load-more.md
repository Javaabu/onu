---
title: LoadMore
sidebar_position: 26
---

A **Load more** button for lists and grids, with "Showing 1–20 of 312" and an announcement of how many items arrived. With `auto` it also loads when it scrolls into view (the button stays as a fallback).

```tsx
import { LoadMore } from "@javaabu/onu"

;<LoadMore
  loaded={items.length}
  total={meta.total}
  onLoadMore={fetchNextPage}
  loading={isFetchingNextPage}
  noun={{ one: "user", other: "users" }}
/>
```

If `onLoadMore` returns a promise, the button shows a spinner until it settles (no `loading` prop needed).

## Props

| Prop         | Type                    | Default          |
| ------------ | ----------------------- | ---------------- |
| `loaded`     | `number`                |                  |
| `total`      | `number`                |                  |
| `hasMore`    | `boolean`               | `loaded < total` |
| `loading`    | `boolean`               |                  |
| `onLoadMore` | `() => void \| Promise` |                  |
| `auto`       | `boolean`               | `false`          |
| `noun`       | `{ one, other }`        | records          |
| `classNames` | `{ button, summary }`   |                  |

## Accessibility

The button has `aria-busy` while loading; "Loaded 20 more users" is announced through a polite live region, and "All 312 users shown" replaces the button at the end.
