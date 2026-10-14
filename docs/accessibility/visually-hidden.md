---
title: VisuallyHidden
sidebar_position: 1
---

Content for screen readers only. It is taken out of the visual layout with Tailwind's `sr-only` but is still read out, and focusable content inside it stays in the tab order. Use it for icon-button names, extra link context and headings that structure a page without being shown.

```tsx
import { VisuallyHidden } from "@javaabu/onu"

<Button variant="outline" size="icon">
  <Icon name="edit" />
  <VisuallyHidden>Edit application</VisuallyHidden>
</Button>

<a href="/fees">Read more<VisuallyHidden> about passport fees</VisuallyHidden></a>

// Your own element, e.g. a heading
<VisuallyHidden asChild>
  <h2>Search filters</h2>
</VisuallyHidden>

// A skip link that appears while it has focus
<VisuallyHidden focusable asChild>
  <a href="#main">Skip to main content</a>
</VisuallyHidden>
```

For a complete skip link with the right styling, use [`SkipLink`](../layout-and-navigation/skip-link).

## Props

| Prop        | Type                   | Default | Description                                                           |
| ----------- | ---------------------- | ------- | --------------------------------------------------------------------- |
| `asChild`   | `boolean`              | `false` | Render the child element instead of a `<span>` (Radix `Slot`)         |
| `focusable` | `boolean`              | `false` | Show the content while it, or something inside it, has keyboard focus |
| `className` | `string`               |         | Merged with `sr-only`                                                 |
| `ref`       | `Ref<HTMLSpanElement>` |         |                                                                       |

Every other `<span>` prop (`id`, `lang`, …) is passed through. The element has `data-slot="visually-hidden"`.

## Accessibility

- Hidden text is part of the accessible name of whatever contains it: a button with only an icon and `VisuallyHidden` text is named by that text. Mark the icon `aria-hidden` (Onu's `Icon` does this when it has no `label`).
- Prefer `aria-label` when the whole name is hidden and the element supports it; use `VisuallyHidden` when you add to visible text ("Read more" + " about passport fees") or need real content such as a heading.
- Never hide focusable content without `focusable`: a keyboard user would land on something they cannot see (WCAG 2.4.7). With `focusable`, the content shows while it has focus.
- Hidden text is translated like any other text: pass the string from `t()` and add `lang` when it differs from the page.
