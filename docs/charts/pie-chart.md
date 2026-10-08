---
title: PieChart
sidebar_position: 3
---

A pie or donut chart on shadcn's chart (Recharts). The donut shows the total (or your own label) in the middle; the table lists each slice's value and share.

```tsx
import { PieChart } from "@javaabu/onu/charts"

;<PieChart
  title="Applications by channel"
  variant="donut"
  data={[
    { name: "eFaas portal", value: 6420 },
    { name: "Island council", value: 2190 },
    { name: "Walk-in", value: 1340 },
  ]}
/>
```

## Centre label

```tsx
<PieChart variant="donut" centerLabel={{ value: "MVR 4.2M", label: "Budget" }} … />
<PieChart variant="donut" centerLabel={null} … />   // no centre label
```

## Gradient fills

Pie and donut slices stay solid, also when other charts use gradient fills: adjacent slices need even, clearly different colours to stay distinguishable and to match the legend.

## Props

Also takes the common chart props (`title`, `description`, `valueFormat`, `height`, `view`, `defaultView`, `onViewChange`, `showTableToggle`, `loading`, `emptyMessage`, `summary`, `animate`, `actions`, `className`, `classNames`); see [BarChart](./bar-chart).

| Prop          | Type                        | Default        | Description                             |
| ------------- | --------------------------- | -------------- | --------------------------------------- |
| `data`        | `Record<string, unknown>[]` | required       | One object per slice                    |
| `nameKey`     | `string`                    | `"name"`       | Slice name key                          |
| `valueKey`    | `string`                    | `"value"`      | Slice value key                         |
| `config`      | `ChartConfig`               |                | Labels/colours keyed by slice name      |
| `variant`     | `"pie" \| "donut"`          | `"pie"`        | Donut leaves a hole with a centre label |
| `centerLabel` | `{ value, label? } \| null` | total, "Total" | Donut centre content                    |
| `showLegend`  | `boolean`                   | `true`         | Legend                                  |
| `nameLabel`   | `ReactNode`                 | "Category"     | Table header for slice names            |

`pieSlices(data, nameKey, valueKey, config)` returns the computed slices (share, colour) if you need them elsewhere.

## RTL

Slices start at 12 o'clock and run clockwise in LTR, counter-clockwise in RTL. The legend follows the text direction.

## Accessibility

- The summary names the chart type, number of slices, total and the largest slice with its share.
- **View as table** lists value and share per slice.
- Slices are named in the legend and the tooltip, so colour is not the only cue.

| Key                                          | Action                           |
| -------------------------------------------- | -------------------------------- |
| <kbd>Tab</kbd>                               | Focus the chart, then the toggle |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | Move between slices              |
