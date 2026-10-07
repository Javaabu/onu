---
title: ProgressBar
sidebar_position: 6
---

A determinate or indeterminate progress bar with an optional label and value text, in semantic colours. Built on Radix `Progress` (shadcn's `Progress` is still exported as a primitive). It fills from the inline start, so it is mirrored in RTL.

```tsx
import { ProgressBar } from "@javaabu/onu"

<ProgressBar label="Uploading permit-2041.pdf" value={40} />
<ProgressBar label="Files imported" value={7} max={12} formatValue={(v, max) => `${v} of ${max}`} color="info" />
<ProgressBar label="Leave balance used" value={96} color="destructive" size="sm" />

// Indeterminate: no value.
<ProgressBar label="Preparing export…" />
```

## Props

| Prop          | Type                                                                        | Default     | Description                                       |
| ------------- | --------------------------------------------------------------------------- | ----------- | ------------------------------------------------- |
| `value`       | `number \| null`                                                            |             | Current value; omit for indeterminate             |
| `max`         | `number`                                                                    | `100`       | Maximum                                           |
| `label`       | `ReactNode`                                                                 |             | Visible label; also the accessible name           |
| `showValue`   | `boolean`                                                                   | with label  | Show the value text                               |
| `formatValue` | `(value, max) => string`                                                    | percent     | Custom value text, also used for `aria-valuetext` |
| `color`       | `'primary' \| 'success' \| 'warning' \| 'destructive' \| 'info' \| 'muted'` | `'primary'` | Indicator colour                                  |
| `size`        | `'sm' \| 'md' \| 'lg'`                                                      | `'md'`      | Track height                                      |
| `aria-label`  | `string`                                                                    | "Progress"  | Name when there is no `label`                     |
| `className`   | `string`                                                                    |             | Classes for the wrapper                           |
| `classNames`  | `{ header, label, value, track, indicator }`                                |             | Classes for each part                             |

Values are clamped to `0…max`. The percent text uses the active locale's number format. `ref` points at the track (`role="progressbar"`). `progressTrackVariants` and `progressIndicatorVariants` are exported.

## Accessibility

- `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and `aria-valuetext` (e.g. "40%" or your `formatValue` text); indeterminate bars omit the value.
- The bar is named by its visible label (`aria-labelledby`) or `aria-label`.
- Colour is never the only signal: pair warning colours with a label or value text (R14.6).
- The indeterminate sweep uses the Web Animations API and is replaced by a static bar under `prefers-reduced-motion`.

## RTL

The indicator fills from the inline start (right in RTL), and the indeterminate sweep runs in the reading direction. Custom value text is isolated (`dir="auto"`) so "7 of 12" stays in order in RTL.
