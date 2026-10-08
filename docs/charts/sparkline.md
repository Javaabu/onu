---
title: Sparkline
sidebar_position: 6
---

A tiny inline line or area chart with no axes, labels or tooltip, for trends in tables, stat tiles and text.

```tsx
import { Sparkline } from "@javaabu/onu/charts"

;<Sparkline label="Daily sign-ups" data={[12, 14, 13, null, 18, 21, 19, 24]} />
<Sparkline label="Revenue" variant="area" color="var(--chart-2)" height={48} data={values} />
```

`data` is a list of numbers (`null` leaves a gap) or objects with a `valueKey`.

## Props

| Prop          | Type                             | Default          | Description                                      |
| ------------- | -------------------------------- | ---------------- | ------------------------------------------------ |
| `data`        | `(number \| null)[] \| object[]` | required         | Values                                           |
| `valueKey`    | `string`                         | `"value"`        | Key of the value for object data                 |
| `label`       | `string`                         | required         | What the values are; used in the accessible name |
| `variant`     | `"line" \| "area"`               | `"line"`         | Line or filled area                              |
| `color`       | `string`                         | `var(--chart-1)` | Any token or CSS colour                          |
| `height`      | `number`                         | `32`             | Height in px; width follows the container        |
| `valueFormat` | `ValueFormat`                    | `"number"`       | Formats the values in the summary                |
| `animate`     | `boolean`                        | `false`          | Animate (off under reduced motion, see below)    |
| `className`   | `string`                         |                  | Classes for the wrapper                          |

Other `<div>` props are passed to the wrapper.

## RTL

The line runs right to left in RTL, so the latest value is on the left, matching the other charts.

## Accessibility

A sparkline is too small for a data table toggle. Instead the wrapper is `role="img"` with a full summary as its name, e.g. "Daily sign-ups: 8 values, from 12 to 24. Lowest 12, highest 24." It is not focusable. When a sparkline is the only place a figure appears, show the figure as text next to it too.

Animation follows the same rules as the other charts: never under `prefers-reduced-motion`, and not inside `<ChartAnimationProvider animate={false}>` (see [BarChart](./bar-chart#animation)).
