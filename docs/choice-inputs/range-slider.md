---
title: Range slider
sidebar_position: 13
---

A slider for one value or a range (shadcn slider), with marks, value labels and locale number formatting. It mirrors in RTL.

```tsx
import { RangeSlider } from '@javaabu/onu';

<RangeSlider aria-label="Volume" defaultValue={40} />
<RangeSlider min={0} max={20000} step={500} defaultValue={[1500, 6000]} formatValue={(v) => `MVR ${v}`} showValue="always" />
<RangeSlider min={1} max={10} defaultValue={4} marks={[{ value: 1, label: '1' }, { value: 10, label: '10+' }]} />
```

## Props

All Radix slider props (`min`, `max`, `step`, `minStepsBetweenThumbs`, `orientation`, `disabled`, `name`, `inverted`), plus:

| Prop                              | Type                                                         | Default              | Description                                      |
| --------------------------------- | ------------------------------------------------------------ | -------------------- | ------------------------------------------------ |
| `value` / `defaultValue`          | `number \| number[]`                                         | `min`                | A number for one thumb, `[from, to]` for a range |
| `onValueChange` / `onValueCommit` | `(value) => void`                                            |                      | Same shape as the value                          |
| `marks`                           | `(number \| { value, label })[]`                             |                      | Tick marks (horizontal sliders)                  |
| `showValue`                       | `"always" \| "active" \| "never"`                            | `"active"`           | Value bubble above each thumb                    |
| `formatValue`                     | `(value: number) => string`                                  | locale number format | Labels and `aria-valuetext`                      |
| `thumbLabels`                     | `string[]`                                                   | "Minimum", "Maximum" | Thumb names for ranges                           |
| `classNames`                      | `{ root, track, range, thumb, valueLabel, mark, markLabel }` |                      |                                                  |

## Accessibility

Each thumb is a `slider` with `aria-valuetext` from `formatValue`; range thumbs are named "Price, Minimum" / "Price, Maximum".

| Key                 | Action                                   |
| ------------------- | ---------------------------------------- |
| ← / →, ↓ / ↑        | Step (← / → follow the visual direction) |
| Page Up / Page Down | Larger step                              |
| Home / End          | Minimum / maximum                        |

Thumbs grow on touch screens.
