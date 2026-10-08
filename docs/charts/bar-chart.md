---
title: BarChart
sidebar_position: 1
---

A bar graph built on shadcn's [chart](https://ui.shadcn.com/docs/components/chart) (`ChartContainer` + Recharts). Columns or horizontal bars, grouped or stacked, with a "View as table" toggle, keyboard navigation, locale-aware numbers and axes that mirror in RTL.

:::info
Charts live in the `@javaabu/onu/charts` entry and need the optional peer dependency `recharts` (v3): `pnpm add recharts`.
:::

```tsx
import { BarChart, type ChartConfig } from "@javaabu/onu/charts"

const config = {
  revenue: { label: "Revenue" },
  expenses: { label: "Expenses" },
} satisfies ChartConfig

;<BarChart
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
<BarChart orientation="horizontal" … />   // categories down the side
<BarChart stacked … />                    // series stacked instead of grouped
<BarChart series={["revenue"]} … />       // draw only some keys of config
```

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

| Prop                   | Type                                                         | Default              | Description                                           |
| ---------------------- | ------------------------------------------------------------ | -------------------- | ----------------------------------------------------- |
| `title`                | `ReactNode`                                                  | required             | Accessible name, shown above the chart                |
| `description`          | `ReactNode`                                                  |                      | Shown under the title, linked with `aria-describedby` |
| `hideTitle`            | `boolean`                                                    | `false`              | Visually hide the title (kept for screen readers)     |
| `data`                 | `Record<string, unknown>[]`                                  | required             | One object per category                               |
| `categoryKey`          | `string`                                                     | required             | Key of the category                                   |
| `config`               | `ChartConfig`                                                |                      | Labels and colours per series                         |
| `series`               | `string[]`                                                   | keys of `config`     | Series to draw                                        |
| `orientation`          | `"vertical" \| "horizontal"`                                 | `"vertical"`         | Columns or bars                                       |
| `stacked`              | `boolean`                                                    | `false`              | Stack series                                          |
| `radius`               | `number`                                                     | `4` (`0` stacked)    | Bar corner radius                                     |
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

`ref` points at the `<figure>`. Every Onu chart (`LineChart`, `PieChart`, `TimeSeriesChart`, `PeriodComparisonChart`, `MapChart`) shares the props from `title` to `classNames` that are not specific to bars.

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

In RTL the category axis is reversed (the last category sits on the left) and the value axis moves to the start (right) side. Legends follow the text direction. Arrow-key navigation follows the visual order.

## Accessibility

- The chart is a `<figure>` named by its title. The SVG has `role="application"`, is focusable, is labelled by the title and described by a generated summary (series count, data points, lowest and highest value per series).
- **View as table** swaps the chart for a real `<table>` with column and row headers, in a focusable scroll region.
- Tooltips open on hover and keyboard focus, and on tap on touch screens.
- Series are told apart by legend labels and the table, not colour alone.

| Key                                          | Action                                           |
| -------------------------------------------- | ------------------------------------------------ |
| <kbd>Tab</kbd>                               | Focus the chart, then the table toggle           |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | Move between categories and show their tooltip   |
| <kbd>Enter</kbd>                             | Show or hide the tooltip for the active category |
