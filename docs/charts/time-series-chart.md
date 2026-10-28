# TimeSeriesChart

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

## Gradient fills

Areas fade from the series colour to almost clear at the baseline (stacked bands fade less), and bars run from a lighter base to the full colour at the top. Plain lines have no fill. Pass `gradient={false}` for flat fills, or set it for an area with `ChartStyleProvider`; see [CategoryChart](./category-chart.md#gradient-fills).

## Zoom

`brush` adds a range slider under the chart. Drag the handles, or focus one and use the arrow keys. While zoomed, a **Reset zoom** button appears and "Showing 2 Sep 2026 to 4 Sep 2026" is announced in a polite live region.

## Props

Also takes the common chart props (`title`, `description`, `config`, `series`, `valueFormat`, `showLegend`, `showGrid`, `height`, `view`, `defaultView`, `onViewChange`, `showTableToggle`, `loading`, `emptyMessage`, `summary`, `animate`, `actions`, `className`, `classNames`); see [CategoryChart](./category-chart.md).

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

Hourly data uses the locale's `hourCycle`. `normalizeTimeSeries(data, dateKey, interval)` and `toTimestamp(value)` are exported.

## RTL

Time runs right to left in RTL: the newest date is on the left, the value axis is on the right and the brush is mirrored to match. The data table always lists dates oldest first.

## Accessibility

- The summary includes the date range ("From 1 Sep 2026 to 30 Sep 2026.") and each series' lowest and highest value.
- The table lists every date, with "No data" for gaps.

| Key                                          | Action                                                                |
| -------------------------------------------- | --------------------------------------------------------------------- |
| <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> | On the chart: move between points. On a brush handle: move the handle |
| <kbd>Enter</kbd>                             | Show or hide the tooltip                                              |
