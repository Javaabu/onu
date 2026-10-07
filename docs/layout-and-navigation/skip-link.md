---
title: SkipLink
sidebar_position: 26
---

A "Skip to content" link (R14.4). Render it as the first focusable element on the page: it is visually hidden until it receives keyboard focus, then moves focus to the main content. [`AppLayout`](./app-layout) includes one.

```tsx
import { SkipLink } from "@javaabu/onu"

;<>
  <SkipLink />
  <Header />
  <main id="main-content">…</main>
</>
```

## Props

| Prop        | Type        | Default           | Description          |
| ----------- | ----------- | ----------------- | -------------------- |
| `href`      | `string`    | `"#main-content"` | Target element       |
| `children`  | `ReactNode` | "Skip to content" | Link text            |
| `className` | `string`    |                   | Classes for the link |

Other `<a>` props (including `ref`) are passed through.

## Behaviour

On activation the target gets `tabindex="-1"` (if it has none) and receives focus, so the next <kbd>Tab</kbd> continues from the content. This works even where browsers do not move focus on in-page links.

## Accessibility

| Key                    | Action                    |
| ---------------------- | ------------------------- |
| <kbd>Tab</kbd> (first) | Shows the link            |
| <kbd>Enter</kbd>       | Jumps to the main content |

## RTL

Appears at the top inline start (top right in RTL).
