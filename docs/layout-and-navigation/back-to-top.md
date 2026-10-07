---
title: BackToTop
sidebar_position: 27
---

A floating "Back to top" button that appears after scrolling. It scrolls smoothly, or jumps instantly when the user prefers reduced motion (R3.6, R14.8). It floats at the bottom inline end, above the home indicator.

```tsx
import { BackToTop } from "@javaabu/onu"

;<BackToTop focusTargetId="main-content" />

// In a scroll container
const ref = React.useRef<HTMLDivElement>(null)
<div ref={ref} className="h-96 overflow-y-auto">
  …
  <BackToTop scrollContainer={ref} position="static" showLabel />
</div>
```

## Props

| Prop              | Type                     | Default   | Description                                      |
| ----------------- | ------------------------ | --------- | ------------------------------------------------ |
| `threshold`       | `number`                 | `400`     | Show after scrolling this many pixels            |
| `scrollContainer` | `RefObject<HTMLElement>` |           | Scroll a container instead of the window         |
| `focusTargetId`   | `string`                 |           | Move focus here after scrolling (keyboard users) |
| `showLabel`       | `boolean`                | `false`   | Show "Back to top" next to the icon              |
| `position`        | `'fixed' \| 'static'`    | `'fixed'` | Float or render in place                         |
| `alwaysVisible`   | `boolean`                | `false`   | Ignore the threshold                             |

Other `Button` props are passed through.

## Accessibility

- Icon-only, it is named "Back to top"; 44px on touch screens.
- Use `focusTargetId` so keyboard focus moves with the scroll position.

| Key                                 | Action        |
| ----------------------------------- | ------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Scroll to top |
