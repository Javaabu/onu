---
title: PeriodComparisonChart
sidebar_position: 5
---

Compares the current period with the previous one: headline totals with a delta percentage and an up/down indicator, the two periods overlaid (previous dashed, or as muted bars), and a table with the change per step.

```tsx
import { PeriodComparisonChart } from "@javaabu/onu/charts"

;<PeriodComparisonChart
  title="Applications this week"
  data={[
    { day: "Sun", current: 412, previous: 380 },
    { day: "Mon", current: 538, previous: 471 },
    { day: "Tue", current: 497, previous: 502 },
  ]}
  categoryKey="day"
  currentLabel="This week"
  previousLabel="Last week"
/>
```

## Lower is better

For costs, wait times or complaints, set `positiveIsGood={false}` so a fall is shown as good (green) and a rise as bad.

```tsx
<PeriodComparisonChart variant="bar" valueFormat="currency" positiveIsGood={false} … />
```

## Gradient fills

With the default `gradient`, the line variant washes the area under the current period's line with a soft gradient (it is not a separate series: no legend entry or tooltip row), and the bar variant fills bars from a lighter base to the full colour. `gradient={false}` draws plain lines and flat bars; see [CategoryChart](./category-chart#gradient-fills).

## Props

Also takes the common chart props (`title`, `description`, `valueFormat`, `categoryFormat`, `categoryLabel`, `height`, `view`, `defaultView`, `onViewChange`, `showTableToggle`, `loading`, `emptyMessage`, `summary`, `animate`, `actions`, `className`, `classNames`); see [CategoryChart](./category-chart).

| Prop             | Type                           | Default           | Description                      |
| ---------------- | ------------------------------ | ----------------- | -------------------------------- |
| `data`           | `Record<string, unknown>[]`    | required          | One object per step              |
| `categoryKey`    | `string`                       | required          | Key of the step label            |
| `currentKey`     | `string`                       | `"current"`       | Current period value key         |
| `previousKey`    | `string`                       | `"previous"`      | Previous period value key        |
| `currentLabel`   | `ReactNode`                    | "This period"     | Label of the current period      |
| `previousLabel`  | `ReactNode`                    | "Previous period" | Label of the previous period     |
| `variant`        | `"line" \| "bar"`              | `"line"`          | Lines or grouped bars            |
| `aggregate`      | `"sum" \| "average" \| "last"` | `"sum"`           | How headline totals are computed |
| `positiveIsGood` | `boolean`                      | `true`            | Whether an increase is good      |
| `hideTotals`     | `boolean`                      | `false`           | Hide the headline totals         |
| `gradient`       | `boolean`                      | `true`            | Gradient wash and bar fills      |

## RTL

The step axis is reversed in RTL and the value axis sits on the right. Percentages keep their sign before the number (`+8%`).

## Accessibility

- The change is shown with an arrow icon, a sign and a colour, never colour alone. Screen readers hear "Up 8%" / "Down 2%" / "No change".
- The summary states both totals and the change; the table has a **Change** column per step.

| Key                                          | Action                   |
| -------------------------------------------- | ------------------------ |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | Move between steps       |
| <kbd>Enter</kbd>                             | Show or hide the tooltip |
