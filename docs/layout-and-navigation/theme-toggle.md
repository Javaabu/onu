---
title: ThemeToggle
sidebar_position: 22
---

Light / dark / system switch using `useTheme()` from [`ThemeProvider`](../guides) (R10.3). The choice is persisted to `localStorage` by the provider and announced to screen readers ("Theme: Dark").

```tsx
import { ThemeProvider, ThemeToggle } from "@javaabu/onu"

;<ThemeProvider>
  <ThemeToggle />
</ThemeProvider>
```

## Variants

- `menu` (default): an icon button (sun or moon, following the resolved theme) with a Light / Dark / System menu.
- `segmented`: three toggle buttons.
- `cycle`: one button that cycles Light → Dark → System.

## Props

| Prop         | Type                               | Default     | Description             |
| ------------ | ---------------------------------- | ----------- | ----------------------- |
| `variant`    | `'menu' \| 'segmented' \| 'cycle'` | `'menu'`    | Presentation            |
| `showSystem` | `boolean`                          | `true`      | Offer the System option |
| `size`       | `'sm' \| 'default'`                | `'default'` | Size                    |
| `className`  | `string`                           |             | Classes for the control |

## Accessibility

- The button is named "Theme: Light" (the current choice); options are radio items / radio buttons.
- A polite live region announces the new theme.
- Buttons are 44px on touch screens.

| Key                                 | Action                |
| ----------------------------------- | --------------------- |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Open the menu / cycle |
| <kbd>↑</kbd> / <kbd>↓</kbd>         | Move in the menu      |
| <kbd>Escape</kbd>                   | Close the menu        |
