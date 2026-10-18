# LineChart

A line graph on shadcn's chart (Recharts). Multiple series, optional filled (and stacked) areas, dashed series for targets or forecasts, and gaps where values are missing.

```tsx
import { LineChart } from "@javaabu/onu/charts"

;<LineChart
  title="Tourist arrivals against target"
  data={[
    { month: "Jan", arrivals: 212400, target: 200000 },
    { month: "Feb", arrivals: 208900, target: 205000 },
    { month: "Mar", arrivals: 196300, target: 205000 },
  ]}
  categoryKey="month"
  config={{ arrivals: { label: "Arrivals" }, target: { label: "Target" } }}
  dashedSeries={["target"]}
  valueFormat="compact"
/>
```

## Areas and gaps

```tsx
<LineChart area … />                  // fill under each line
<LineChart area stacked … />          // stacked areas
<LineChart connectNulls … />          // draw across null values instead of a gap
```

A `null` (or missing) value leaves a break in the line and shows as "No data" in the table.

## Gradient fills

Areas fade from the series colour (about 50% opacity under the line) to almost clear at the baseline; areas below zero fade towards the zero line from below. Stacked bands fade less (60% to 20%) so each band stays readable where it meets the next. Lines stay solid. Pass `gradient={false}` for the flat fills, or wrap charts in `<ChartStyleProvider gradient={false}>`; see [BarChart](./bar-chart.md#gradient-fills). Forced-colours mode always draws flat fills.

## Props

Shares the common chart props (`title`, `description`, `data`, `categoryKey`, `config`, `series`, `valueFormat`, `categoryFormat`, `categoryLabel`, `showLegend`, `showGrid`, `height`, `view`, `defaultView`, `onViewChange`, `showTableToggle`, `loading`, `emptyMessage`, `summary`, `animate`, `actions`, `className`, `classNames`); see [BarChart](./bar-chart.md).

| Prop           | Type                                            | Default         | Description                                       |
| -------------- | ----------------------------------------------- | --------------- | ------------------------------------------------- |
| `area`         | `boolean`                                       | `false`         | Fill the area under each line                     |
| `stacked`      | `boolean`                                       | `false`         | Stack areas (with `area`)                         |
| `curve`        | `"monotone" \| "linear" \| "step" \| "natural"` | `"monotone"`    | Interpolation                                     |
| `dots`         | `boolean`                                       | up to 31 points | Dot on each point                                 |
| `connectNulls` | `boolean`                                       | `false`         | Bridge missing values                             |
| `dashedSeries` | `string[]`                                      |                 | Series drawn dashed (differs by more than colour) |
| `gradient`     | `boolean`                                       | `true`          | Gradient area fills (with `area`)                 |

## RTL

The category axis is reversed in RTL (newest on the left) and the value axis sits on the right. Legends follow the text direction.

## Accessibility

Same as [BarChart](./bar-chart.md#accessibility): a named `<figure>`, a focusable SVG described by a summary, a "View as table" toggle, tooltips on focus and tap, and reduced motion respected.

| Key                                          | Action                                   |
| -------------------------------------------- | ---------------------------------------- |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | Move between points and show the tooltip |
| <kbd>Enter</kbd>                             | Show or hide the tooltip                 |
