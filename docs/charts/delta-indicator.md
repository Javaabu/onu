# DeltaIndicator

A change indicator: an arrow icon, a signed percentage and a semantic colour. Used by [StatTile](./stat-tile.md) and [PeriodComparisonChart](./period-comparison-chart.md), and handy in tables.

```tsx
import { DeltaIndicator } from "@javaabu/onu/charts"

;<DeltaIndicator value={0.124} />                          // ↑ +12.4%
<DeltaIndicator current={182000} previous={171500} />      // computed
<DeltaIndicator value={0.08} positiveIsGood={false} variant="badge" context="vs last month" />
```

## Props

| Prop             | Type                | Default  | Description                                      |
| ---------------- | ------------------- | -------- | ------------------------------------------------ |
| `value`          | `number \| null`    |          | Change as a ratio (`0.12` = +12%)                |
| `current`        | `number`            |          | With `previous`, the change is computed          |
| `previous`       | `number`            |          | Previous value (0 gives no percentage)           |
| `positiveIsGood` | `boolean`           | `true`   | `false` for costs, wait times, complaints        |
| `variant`        | `"text" \| "badge"` | `"text"` | Plain or with a tinted background                |
| `context`        | `ReactNode`         |          | Muted text after the delta, e.g. "vs last month" |
| `className`      | `string`            |          | Classes for the root `<span>`                    |

`deltaIndicatorVariants` (cva) is exported. The root carries `data-direction` (`up | down | flat`) and `data-sentiment` (`positive | negative | neutral`).

## RTL

The percentage is rendered `dir="ltr"` so the sign stays before the number in Dhivehi text.

## Accessibility

Direction is shown by the icon and the sign as well as colour (WCAG 1.4.1). The visible figure is hidden from screen readers and replaced by words: "Up 12.4%", "Down 5%" or "No change" (translated in `dv`).
