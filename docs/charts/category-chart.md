---
title: CategoryChart
sidebar_position: 1
---

A line, area or bar graph over categories (months, islands, councils), built on shadcn's [chart](https://ui.shadcn.com/docs/components/chart) (`ChartContainer` + Recharts). `variant` picks how series are drawn: lines with optional dashed series, filled (and stacked) areas, or columns and horizontal bars, grouped or stacked. Every variant has a "View as table" toggle, keyboard navigation, locale-aware numbers, gaps for missing values and axes that mirror in RTL. `LineChart`, `AreaChart` and `BarChart` are presets of it.

:::info
Charts live in the `@javaabu/onu/charts` entry and need the optional peer dependency `recharts` (v3): `pnpm add recharts`.
:::

```tsx
import { CategoryChart, type ChartConfig } from "@javaabu/onu/charts"

const config = {
  revenue: { label: "Revenue" },
  expenses: { label: "Expenses" },
} satisfies ChartConfig

;<CategoryChart
  variant="bar"
  title="Council revenue and expenses"
  description="In Maldivian Rufiyaa"
  data={[
    { island: "Malé", revenue: 4820000, expenses: 3110000 },
    { island: "Addu City", revenue: 1450000, expenses: 1220000 },
  ]}
  categoryKey="island"
  config={config}
  valueFormat="currency"
/>
```

`config` is shadcn's `ChartConfig`: one entry per data key with a `label` and an optional `color` (or `theme: { light, dark }`). Colours default to the `--chart-1` … `--chart-8` tokens, so charts follow the theme and dark mode.

## Variants

```tsx
<CategoryChart … />                  // lines (default)
<CategoryChart variant="area" … />   // filled areas
<CategoryChart variant="bar" … />    // columns or bars
```

| Variant  | Preset      | Summary says | `data-slot`  |
| -------- | ----------- | ------------ | ------------ |
| `"line"` | `LineChart` | "Line chart" | `line-chart` |
| `"area"` | `AreaChart` | "Area chart" | `area-chart` |
| `"bar"`  | `BarChart`  | "Bar chart"  | `bar-chart`  |

The presets are `CategoryChart` with the variant set, so `<BarChart … />` is `<CategoryChart variant="bar" … />`. `LineChart` still takes `area` (deprecated: use `variant="area"` or `AreaChart`); on `CategoryChart`, `variant` wins over `area`.

`CategoryChartProps` is a union on `variant`: the line and area options below are type errors on `variant="bar"`, and the bar options on lines and areas.

## Lines and areas

`LineChart` (`variant="line"`) and `AreaChart` (`variant="area"`): multiple series, dashed series for targets or forecasts, and gaps where values are missing.

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

```tsx
<CategoryChart variant="area" … />           // fill under each line
<CategoryChart variant="area" stacked … />   // stacked areas
<CategoryChart connectNulls … />             // draw across null values instead of a gap
```

A `null` (or missing) value leaves a break in the line and shows as "No data" in the table. `stacked` stacks areas; plain lines are not stacked.

Line and area only:

| Prop           | Type                                            | Default         | Description                                       |
| -------------- | ----------------------------------------------- | --------------- | ------------------------------------------------- |
| `curve`        | `"monotone" \| "linear" \| "step" \| "natural"` | `"monotone"`    | Interpolation                                     |
| `dots`         | `boolean`                                       | up to 31 points | Dot on each point                                 |
| `connectNulls` | `boolean`                                       | `false`         | Bridge missing values                             |
| `dashedSeries` | `string[]`                                      |                 | Series drawn dashed (differs by more than colour) |
| `area`         | `boolean`                                       | `false`         | Deprecated: same as `variant="area"`              |

## Bars

`BarChart` (`variant="bar"`): columns or horizontal bars, grouped or stacked.

```tsx
<CategoryChart variant="bar" orientation="horizontal" … />   // categories down the side
<CategoryChart variant="bar" stacked … />                    // series stacked instead of grouped
<CategoryChart variant="bar" series={["revenue"]} … />       // draw only some keys of config
```

Bar only:

| Prop          | Type                         | Default           | Description       |
| ------------- | ---------------------------- | ----------------- | ----------------- |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"`      | Columns or bars   |
| `radius`      | `number`                     | `4` (`0` stacked) | Bar corner radius |

## Number formats

`valueFormat` sets how values appear in ticks, tooltips, the table and the screen-reader summary. Numbers always use `useOnu().locale.numberLocale`.

| Value                       | Example                                |
| --------------------------- | -------------------------------------- |
| `"number"` (default)        | `12,345.6` (ticks are compact: `12K`)  |
| `"integer"`                 | `12,346`                               |
| `"compact"`                 | `12.3K`                                |
| `"percent"`                 | `0.256` → `25.6%`                      |
| `"currency"`                | `MVR 1,250.00` (`ރ. 1,250.00` in `dv`) |
| `Intl.NumberFormatOptions`  | any options                            |
| `(value: number) => string` | any function                           |

The helpers `formatMVR(value, numberLocale?)`, `formatValue`, `computeDelta` and the hook `useChartFormat(format)` are exported too.

## Props

The variant-specific props are listed under [Lines and areas](#lines-and-areas) and [Bars](#bars).

| Prop                   | Type                                                         | Default              | Description                                           |
| ---------------------- | ------------------------------------------------------------ | -------------------- | ----------------------------------------------------- |
| `variant`              | `"line" \| "area" \| "bar"`                                  | `"line"`             | How series are drawn                                  |
| `title`                | `ReactNode`                                                  | required             | Accessible name, shown above the chart                |
| `description`          | `ReactNode`                                                  |                      | Shown under the title, linked with `aria-describedby` |
| `hideTitle`            | `boolean`                                                    | `false`              | Visually hide the title (kept for screen readers)     |
| `data`                 | `Record<string, unknown>[]`                                  | required             | One object per category                               |
| `categoryKey`          | `string`                                                     | required             | Key of the category                                   |
| `config`               | `ChartConfig`                                                |                      | Labels and colours per series                         |
| `series`               | `string[]`                                                   | keys of `config`     | Series to draw                                        |
| `stacked`              | `boolean`                                                    | `false`              | Stack areas or bars                                   |
| `gradient`             | `boolean`                                                    | `true`               | Gradient area and bar fills; `false` for flat fills   |
| `valueFormat`          | `ValueFormat`                                                | `"number"`           | See above                                             |
| `categoryFormat`       | `(value) => string`                                          |                      | Formats categories                                    |
| `categoryLabel`        | `ReactNode`                                                  | "Category"           | Table column header for categories                    |
| `showLegend`           | `boolean`                                                    | more than one series | Legend                                                |
| `showGrid`             | `boolean`                                                    | `true`               | Grid lines                                            |
| `height`               | `number`                                                     | `300`                | Height in px; width follows the container             |
| `view` / `defaultView` | `"chart" \| "table"`                                         | `"chart"`            | Controlled / initial view                             |
| `onViewChange`         | `(view) => void`                                             |                      | Called when the toggle is used                        |
| `showTableToggle`      | `boolean`                                                    | `true`               | Show the "View as table" button                       |
| `loading`              | `boolean`                                                    | `false`              | Skeleton instead of the chart                         |
| `emptyMessage`         | `ReactNode`                                                  | "No data to show"    | Shown without data                                    |
| `summary`              | `string`                                                     | generated            | Replace the screen-reader summary                     |
| `animate`              | `boolean`                                                    | `true`               | Off under reduced motion or `ChartAnimationProvider`  |
| `actions`              | `ReactNode`                                                  |                      | Extra header controls                                 |
| `className`            | `string`                                                     |                      | Classes for the `<figure>`                            |
| `classNames`           | `{ root, header, title, description, toggle, chart, table }` |                      | Classes per part                                      |

`ref` points at the `<figure>`. `LineChartProps`, `AreaChartProps` and `BarChartProps` are the presets' props (without `variant`). Every Onu chart (`PieChart`, `TimeSeriesChart`, `PeriodComparisonChart`, `MapChart`) shares the props from `title` to `classNames` that are not specific to categories.

## Gradient fills

Bars are filled with a subtle gradient in the series colour: the full colour at the value end, fading to about 70% at the base (80% for stacked segments, so stacks do not look striped). Negative bars are mirrored, and horizontal bars run towards the inline end, so the gradient flips with the axis in RTL.

Areas fade from the series colour (about 50% opacity under the line) to almost clear at the baseline; areas below zero fade towards the zero line from below. Stacked bands fade less (60% to 20%) so each band stays readable where it meets the next. Plain lines have no fill and stay solid.

Pass `gradient={false}` for flat fills:

```tsx
<CategoryChart variant="bar" gradient={false} … />
```

Every Onu chart with areas or bars takes the same `gradient` prop (`CategoryChart` and `TimeSeriesChart` areas and bars, `PeriodComparisonChart`, `Sparkline`, and `sparklineGradient` on `StatTile`). To change the default for a whole area, wrap it in `ChartStyleProvider`; a chart's own `gradient` prop still wins:

```tsx
import { ChartStyleProvider } from "@javaabu/onu/charts"

<ChartStyleProvider gradient={false}>
  <PrintableReport />
</ChartStyleProvider>
```

Gradients are SVG `<linearGradient>`s with ids unique to each chart instance (`React.useId`), so many charts can share a page. Their stops use the series colour (`var(--color-<key>)`, set by `ChartContainer` from `config` or `--chart-1…8`), so they follow the theme, dark mode and `--onu-primary`. In forced-colours (high contrast) mode every fill falls back to solid. Lines, legends, tooltip swatches, the data table and accessible names are unchanged. Pie and donut slices stay solid: adjacent slices need clear, even colours to stay distinguishable and to match the legend.

`useChartGradient(gradient?)` returns the combined setting for custom charts. The chart container carries `data-fill="gradient"` or `data-fill="solid"` for areas and bars (none for plain lines), and bar charts carry `data-orientation`.

## Animation

Charts animate on mount unless `animate={false}`. Animation is always off when the user prefers reduced motion (`prefers-reduced-motion: reduce`, R14.8): every Onu chart then passes `isAnimationActive={false}` to its Recharts series and tooltip. To turn it off for a whole area, for example print views, kiosks or screenshot tests, wrap it in `ChartAnimationProvider`:

```tsx
import { ChartAnimationProvider } from "@javaabu/onu/charts"

<ChartAnimationProvider animate={false}>
  <Dashboard />
</ChartAnimationProvider>
```

Reduced motion still wins inside `<ChartAnimationProvider animate>`. `useChartAnimation(animate?)` returns the combined result for custom charts built on the primitives below. The visual regression tests emulate reduced motion (Playwright `reducedMotion: "reduce"`), so chart screenshots are stable.

## Primitives

The shadcn primitives are exported from the same entry for custom charts: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` (with an Onu `valueFormatter` prop), `ChartLegend`, `ChartLegendContent`, `ChartStyle` and the `ChartConfig` type. They are not exported from the package root, so `recharts` stays optional.

## RTL

In RTL the category axis is reversed (the last category sits on the left, so the newest month is on the left) and the value axis moves to the start (right) side. Horizontal bars grow towards the left. Legends follow the text direction. Arrow-key navigation follows the visual order.

## Accessibility

The same for every variant:

- The chart is a `<figure>` named by its title. The SVG has `role="application"`, is focusable, is labelled by the title and described by a generated summary (chart type, series count, data points, lowest and highest value per series).
- **View as table** swaps the chart for a real `<table>` with column and row headers, in a focusable scroll region. Missing values read "No data".
- Tooltips open on hover and keyboard focus, and on tap on touch screens.
- Series are told apart by legend labels and the table, not colour alone; dashed series differ by more than colour too.
- Reduced motion turns animation off.

| Key                                          | Action                                                   |
| -------------------------------------------- | -------------------------------------------------------- |
| <kbd>Tab</kbd>                               | Focus the chart, then the table toggle                   |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | Move between categories or points and show their tooltip |
| <kbd>Enter</kbd>                             | Show or hide the tooltip for the active category         |
