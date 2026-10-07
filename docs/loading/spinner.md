---
title: Spinner
sidebar_position: 1
---

A spinning loading indicator with a screen-reader label. It is a polite live region (`role="status"`), so the label ("Loading…" by default, translated) is announced when it appears.

```tsx
import { Spinner } from "@javaabu/onu"

<Spinner />
<Spinner size="lg" tone="primary" />
<Spinner showLabel label="Fetching permits…" />

<Button disabled={saving}>
  {saving ? <Spinner label="Saving…" /> : null}
  Save
</Button>
```

This replaces the shadcn `Spinner` exported from the package root. The vendored primitive is still available from `@javaabu/onu/primitives`. Differences: `className` and `ref` go to the wrapping `<span>` (use `size` or `classNames.icon` to size the icon), and the label is translated and actually exposed to screen readers.

## Props

| Prop         | Type                                   | Default     | Description                                 |
| ------------ | -------------------------------------- | ----------- | ------------------------------------------- |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm'`      | Icon size (12–32px)                         |
| `tone`       | `'current' \| 'primary' \| 'muted'`    | `'current'` | Colour (`current` inherits the text colour) |
| `label`      | `ReactNode`                            | "Loading…"  | Screen-reader text                          |
| `showLabel`  | `boolean`                              | `false`     | Show the label beside the spinner           |
| `className`  | `string`                               |             | Classes for the root `<span>`               |
| `classNames` | `{ icon, label }`                      |             | Classes for the parts                       |

Other `<span>` props and `ref` go to the root. `spinnerVariants` is exported.

## Accessibility

- `role="status"` with a visually hidden label; the icon is `aria-hidden`.
- Don't put a spinner where nothing is loading, and don't stack several announcements: inside a button that already changes its text to "Saving…", pass the same `label`.
- Under `prefers-reduced-motion` the icon stops spinning; the label still tells users that something is loading.

## RTL

The spinner is non-directional and doesn't mirror. With `showLabel`, the label sits at the inline end.
