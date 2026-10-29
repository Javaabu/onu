---
title: TimeSeriesChart
sidebar_position: 4
---

A line, area or bar chart on a real time axis, optionally stacked. Dates are formatted with the active locale (Dhivehi month names in `dv`), missing steps can be filled in as gaps, and a brush lets people zoom into a range.

```tsx
import { TimeSeriesChart } from "@javaabu/onu/charts"

;<TimeSeriesChart
  title="Velana International Airport, daily passengers"
  data={[
    { date: "2026-09-01", arrivals: 5120, departures: 4980 },
    { date: "2026-09-02", arrivals: 5310, departures: 5040 },
    { date: "2026-09-04", arrivals: 6010, departures: 5770 },
  ]}
  config={{ arrivals: { label: "Arrivals" }, departures: { label: "Departures" } }}
  interval="day"
  brush
/>
```

Rows may come in any order; they are sorted oldest first. Dates can be `Date` objects, ISO strings or timestamps. Rows with an invalid date are dropped.

## Gaps

`null` values break the line. With `interval` (`"hour" | "day" | "week" | "month"`), missing steps are inserted too (3 September above), so a missing day is a visible gap rather than a straight line across it. `connectNulls` bridges gaps instead.

## Stacked areas and bars

`stacked` adds the series up, so the top edge is the total: use `variant="area"` for stacked areas or `variant="bar"` for stacked bars (a stacked `"line"` chart is drawn as stacked areas). Bars are centred on their date, and the axis is padded by half a step so the first and last bars are whole. The data table and summary still list each series on its own, and the time axis is mirrored in RTL as usual.

```tsx
<TimeSeriesChart
  title="Tourist arrivals by stay type"
  variant="bar"
  stacked
  data={rows}
  config={{ resorts: { label: "Resorts" }, guesthouses: { label: "Guesthouses" } }}
  interval="month"
/>
```

## Comparison

Pass `comparison` to set the current period against the previous one: headline totals with a delta percentage and an up/down [`DeltaIndicator`](./delta-indicator) above the chart, the two periods overlaid (the previous one dashed, or as muted bars with `variant="bar"`), and a **Change** column per step in the data table. The chart's first series is the current period; `previousKey` names the previous period's value in each row.

```tsx
<TimeSeriesChart
  title="Applications, this year and last"
  data={[
    { date: "2026-07-01", applications: 4120, lastYear: 3800 },
    { date: "2026-08-01", applications: 5380, lastYear: 4710 },
    { date: "2026-09-01", applications: 4970, lastYear: 5020 },
  ]}
  config={{ applications: { label: "2026" }, lastYear: { label: "2025" } }}
  interval="month"
  comparison={{ previousKey: "lastYear" }}
/>
```

For costs, wait times or complaints, set `positiveIsGood: false` so a fall is shown as good (green) and a rise as bad. The labels default to the series' `config` labels, else "This period" and "Previous period". The two periods overlap, so `stacked` is ignored. When the steps are categories rather than dates (days of the week, week numbers), use the same prop on [`CategoryChart`](./category-chart#comparison).

| `comparison` field | Type                           | Default                    | Description                         |
| ------------------ | ------------------------------ | -------------------------- | ----------------------------------- |
| `previousKey`      | `string`                       | required                   | Key of the previous period's value  |
| `currentLabel`     | `ReactNode`                    | `config` label, "This period" | Label of the current period      |
| `previousLabel`    | `ReactNode`                    | `config` label, "Previous period" | Label of the previous period |
| `aggregate`        | `"sum" \| "average" \| "last"` | `"sum"`                    | How the headline totals are computed |
| `positiveIsGood`   | `boolean`                      | `true`                     | Whether an increase is good         |
| `hideTotals`       | `boolean`                      | `false`                    | Hide the headline totals            |

`rowChange(datum, currentKey, previousKey)` (the change per step as a ratio) and the `ChartComparison` type are exported.

## Gradient fills

Areas fade from the series colour to almost clear at the baseline (stacked bands fade less), and bars run from a lighter base to the full colour at the top. Plain lines have no fill. Pass `gradient={false}` for flat fills, or set it for an area with `ChartStyleProvider`; see [CategoryChart](./category-chart#gradient-fills).

## Zoom

`brush` adds a range slider under the chart. Drag the handles, or focus one and use the arrow keys. While zoomed, a **Reset zoom** button appears and "Showing 2 Sep 2026 to 4 Sep 2026" is announced in a polite live region.

## Props

Also takes the common chart props (`title`, `description`, `config`, `series`, `valueFormat`, `showLegend`, `showGrid`, `height`, `view`, `defaultView`, `onViewChange`, `showTableToggle`, `loading`, `emptyMessage`, `summary`, `animate`, `actions`, `className`, `classNames`); see [CategoryChart](./category-chart).

| Prop                | Type                                   | Default     | Description                             |
| ------------------- | -------------------------------------- | ----------- | --------------------------------------- |
| `data`              | `Record<string, unknown>[]`            | required    | One object per point in time            |
| `dateKey`           | `string`                               | `"date"`    | Key of the date                         |
| `interval`          | `"hour" \| "day" \| "week" \| "month"` |             | Fill missing steps with gaps            |
| `dateFormat`        | `string` (date-fns)                    | by interval | Tick format (`d MMM`, `MMM yyyy`, time) |
| `tooltipDateFormat` | `string` (date-fns)                    | by interval | Tooltip and table format                |
| `variant`           | `"line" \| "area" \| "bar"`            | `"line"`    | How series are drawn                    |
| `area`              | `boolean`                              | `false`     | Filled areas (same as `variant="area"`) |
| `stacked`           | `boolean`                              | `false`     | Stack the series (areas or bars)        |
| `brush`             | `boolean`                              | `false`     | Brush to zoom                           |
| `connectNulls`      | `boolean`                              | `false`     | Bridge gaps                             |
| `gradient`          | `boolean`                              | `true`      | Gradient area and bar fills             |
| `comparison`        | `ChartComparison`                      |             | This period against the previous one; see [Comparison](#comparison) |

Hourly data uses the locale's `hourCycle`. `normalizeTimeSeries(data, dateKey, interval)` and `toTimestamp(value)` are exported.

## RTL

Time runs right to left in RTL: the newest date is on the left, the value axis is on the right and the brush is mirrored to match. The data table always lists dates oldest first.

## Accessibility

- The summary includes the date range ("From 1 Sep 2026 to 30 Sep 2026.") and each series' lowest and highest value.
- The table lists every date, with "No data" for gaps.
- With `comparison`, the change is shown with an arrow icon, a sign and a colour, never colour alone; screen readers hear "Up 8%" / "Down 2%" / "No change". The summary states both totals and the change, and the table has a **Change** column per step.

| Key                                          | Action                                                                |
| -------------------------------------------- | --------------------------------------------------------------------- |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | On the chart: move between points. On a brush handle: move the handle |
| <kbd>Enter</kbd>                             | Show or hide the tooltip                                              |
