---
title: Skeleton presets
sidebar_position: 2
---

Ready-made skeletons for the most common shapes: `SkeletonText`, `SkeletonCard` and `SkeletonTable`. They are built from shadcn's `Skeleton` (also exported for custom shapes) and use the `muted` token, so they work in light and dark mode.

```tsx
import { SkeletonCard, SkeletonTable, SkeletonText } from "@javaabu/onu"

<SkeletonText lines={3} />
<SkeletonCard avatar lines={3} actions={2} />
<SkeletonTable rows={10} columns={5} selectable />
```

## SkeletonText

| Prop         | Type                   | Default        | Description                                |
| ------------ | ---------------------- | -------------- | ------------------------------------------ |
| `lines`      | `number`               | `3`            | Number of lines                            |
| `widths`     | `string[]`             | 100%, last 60% | Widths per line (cycled)                   |
| `size`       | `'sm' \| 'md' \| 'lg'` | `'md'`         | Line height, to match the text it replaces |
| `classNames` | `{ line }`             |                | Classes for each line                      |

## SkeletonCard

| Prop         | Type                                     | Default | Description                   |
| ------------ | ---------------------------------------- | ------- | ----------------------------- |
| `media`      | `boolean`                                | `false` | 16:9 image area at the top    |
| `avatar`     | `boolean`                                | `false` | Round avatar beside the title |
| `lines`      | `number`                                 | `2`     | Body lines                    |
| `actions`    | `number`                                 | `0`     | Button-shaped bars at the end |
| `classNames` | `{ media, avatar, title, line, action }` |         | Classes for each part         |

## SkeletonTable

| Prop         | Type                    | Default | Description           |
| ------------ | ----------------------- | ------- | --------------------- |
| `rows`       | `number`                | `5`     | Body rows             |
| `columns`    | `number`                | `4`     | Columns               |
| `header`     | `boolean`               | `true`  | Header row            |
| `selectable` | `boolean`               | `false` | Checkbox column       |
| `classNames` | `{ header, row, cell }` |         | Classes for each part |

The table is a container (`@container/skeleton-table`): in narrow containers only the first two columns show, as tables turn into cards on phones (R3.20).

All three accept `label` (screen-reader text, default "Loading…"), `className` and other `<div>` props.

## Accessibility

Each preset is one `role="status"` region named "Loading…" (translated); the shapes inside are `aria-hidden`, so screen readers hear one announcement rather than a list of empty boxes. Put `aria-busy="true"` on the region being loaded if it stays mounted. The pulse animation stops under `prefers-reduced-motion`.

## RTL

Shapes use logical properties and fill from the inline start, so they mirror in RTL.
