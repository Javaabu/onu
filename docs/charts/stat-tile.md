---
title: StatTile
sidebar_position: 7
---

KPI tiles: a label, a formatted value, a delta (arrow + sign + semantic colour), an optional icon and sparkline, and a loading skeleton. `StatTiles` lays them out in a responsive grid.

```tsx
import { StatTile, StatTiles } from "@javaabu/onu/charts"

;<StatTiles>
  <StatTile label="Applications" value={1284} previousValue={1102} icon="file-text" sparkline={[80, 92, 88, 104]} />
  <StatTile label="Revenue" value={2481500} previousValue={2610200} valueFormat="currency" icon="credit-card" />
  <StatTile label="Average wait" value="3.4 days" delta={-0.18} positiveIsGood={false} deltaContext="vs last month" />
  <StatTile label="Active users" value={18240} loading={isLoading} />
</StatTiles>
```

## Chart card (Ant Design Pro)

The tile is Ant Design Pro's **ChartCard**: a muted label row, a 30px regular-weight figure, a 46px chart slot and a footer row under a line. Add an info button after the label with `tip`, and put any mini chart (bars, a `ProgressBar`, trend text) in the slot with `chart` instead of `sparkline`:

```tsx
<StatTile
  label="Service target"
  tip="Applications closed within 14 days"
  value={0.78}
  valueFormat="percent"
  chart={<ProgressBar value={78} size="sm" aria-label="Service target: 78%" />}
  footer="Daily average 12"
/>
```

## As a link

```tsx
<StatTile asChild label="Pending approvals" value={17}>
  <a href="/approvals">Pending approvals</a>
</StatTile>
```

The child element becomes the tile and the tile content is placed inside it.

## StatTile props

| Prop               | Type                                               | Default              | Description                                |
| ------------------ | -------------------------------------------------- | -------------------- | ------------------------------------------ |
| `label`            | `ReactNode`                                        | required             | What the figure is                         |
| `value`            | `number \| string \| null`                         | required             | Numbers are formatted with `valueFormat`   |
| `valueFormat`      | `ValueFormat`                                      | `"number"`           | See [CategoryChart](./category-chart#number-formats) |
| `previousValue`    | `number`                                           |                      | Compute the delta from it                  |
| `delta`            | `number \| null`                                   |                      | Change as a ratio, when you have it        |
| `deltaContext`     | `ReactNode`                                        | "vs previous period" | Text after the delta                       |
| `positiveIsGood`   | `boolean`                                          | `true`               | Whether an increase is good                |
| `icon`             | `SemanticIconName \| ReactNode`                    |                      | Icon at the inline end of the header       |
| `sparkline`        | `(number \| null)[]`                               |                      | Small trend under the figure               |
| `sparklineVariant` | `"line" \| "area"`                                 | `"area"`             | Sparkline style                            |
| `sparklineGradient` | `boolean`                                         | `true`               | Gradient sparkline area (see [Sparkline](./sparkline#gradient-fills)) |
| `loading`          | `boolean`                                          | `false`              | Skeletons, `aria-busy`                     |
| `chart`            | `ReactNode`                                        |                      | A mini chart in the 46px slot (instead of `sparkline`) |
| `tip`              | `ReactNode`                                        |                      | Info button with a tooltip after the label |
| `footer`           | `ReactNode`                                        |                      | Footer row under a line                    |
| `size`             | `"sm" \| "default" \| "lg"`                        | `"default"`          | Padding and figure size                    |
| `asChild`          | `boolean`                                          | `false`              | Render as the child element                |
| `className`        | `string`                                           |                      | Classes for the root                       |
| `classNames`       | `{ label, value, icon, delta, sparkline, footer }` |                      | Classes per part                           |

`statTileVariants` (cva) is exported.

## StatTiles props

| Prop        | Type          | Default | Description                     |
| ----------- | ------------- | ------- | ------------------------------- |
| `columns`   | `2 \| 3 \| 4` | `4`     | Most columns on wide containers |
| `className` | `string`      |         | Classes for the grid            |

The grid uses container queries: one column in narrow containers, two from 28rem, and three or four on wide ones, so it also works in sidebars and narrow cards.

## RTL and Dhivehi

The icon sits at the inline end and the delta keeps its sign before the number. String values use `dir="auto"`.

## Accessibility

- A tile is a `role="group"` named by its label (a link when `asChild`).
- The delta is conveyed by icon, sign and colour, and announced as "Up 16.5%" / "Down 4.9%".
- Figures use tabular numerals.
- While loading, the tile is `aria-busy` and announces "Loading…".
