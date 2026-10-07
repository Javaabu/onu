---
title: MasonryGrid
sidebar_position: 28
---

A masonry layout with CSS columns (no JavaScript layout): items of different heights pack into columns. Column counts follow the **container** width (container queries, R3.19), so the grid adapts inside sidebars and narrow columns too.

```tsx
import { Card, MasonryGrid } from "@javaabu/onu"

;<MasonryGrid columns={{ base: 1, sm: 2, lg: 3 }}>
  {posts.map((post) => (
    <Card key={post.id} title={post.title}>
      {post.excerpt}
    </Card>
  ))}
</MasonryGrid>
```

## Props

| Prop            | Type                                   | Default                     | Description                   |
| --------------- | -------------------------------------- | --------------------------- | ----------------------------- |
| `columns`       | `1–6 \| { base?, sm?, md?, lg?, xl? }` | `{ base: 1, sm: 2, lg: 3 }` | Column counts                 |
| `gap`           | `'sm' \| 'md' \| 'lg'`                 | `'md'`                      | Gap between items             |
| `itemClassName` | `string`                               |                             | Classes for each item wrapper |

Breakpoints are container widths: `sm` ≥ 24rem, `md` ≥ 36rem, `lg` ≥ 56rem, `xl` ≥ 72rem. `masonryGridVariants` and `masonryColumnClasses` are exported. Other `<div>` props go to the inner grid element.

## Accessibility

CSS columns flow top to bottom, then to the next column, so the visual order differs from a row-based grid. The DOM (and tab) order is the source order: make sure it makes sense on its own.

## RTL

Columns fill from the inline start (right to left in RTL).
