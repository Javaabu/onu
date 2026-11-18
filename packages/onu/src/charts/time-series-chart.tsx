"use client"

import * as React from "react"
import {
  addDays,
  addHours,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  format as formatDate,
  startOfDay,
  startOfHour,
  startOfMonth,
} from "date-fns"
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  Brush,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import { Button } from "../ui/button"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart"
import { cartesianSummary, cartesianTable, rtlAxes } from "./_cartesian"
import {
  areaSeriesFills,
  barSeriesFills,
  ChartGradients,
  GRADIENT_FALLBACK,
  useChartGradient,
  useGradientId,
} from "./_gradient"
import {
  ChartFrame,
  comparisonParts,
  comparisonSeries,
  resolveSeries,
  seriesConfig,
  SVG_LTR,
  useChartAnimation,
  useTooltipTrigger,
  type ChartBaseProps,
  type ChartComparison,
  type ChartDatum,
} from "./_shared"
import { useChartFormat, type ValueFormat } from "./format"
import { registerEnglish } from "../i18n/english"
import { chart as en_chart } from "../locales/en/chart"

registerEnglish({ chart: en_chart })

export type TimeInterval = "hour" | "day" | "week" | "month"

export interface TimeSeriesChartProps extends ChartBaseProps {
  /** One object per point in time, e.g. `{ date: "2026-01-01", arrivals: 5120 }`. Order does not matter. */
  data: ChartDatum[]
  /** Key of the date (a `Date`, ISO string or timestamp). Default `"date"`. */
  dateKey?: string
  config?: ChartConfig
  series?: string[]
  valueFormat?: ValueFormat
  /**
   * Group the data by hour, day, week (counted from the first date) or month: each point sits at
   * the start of its step, rows in the same step are combined (see `aggregate`), and empty points
   * are inserted for missing steps so gaps show as breaks in the line.
   */
  interval?: TimeInterval
  /** With `interval`, how values in the same step are combined: added up or averaged. Default `"sum"`. */
  aggregate?: TimeAggregate
  /** date-fns pattern for axis ticks. Defaults by `interval` (`d MMM`). */
  dateFormat?: string
  /** date-fns pattern for tooltips and the data table. Defaults by `interval` (`d MMM yyyy`). */
  tooltipDateFormat?: string
  /** How series are drawn. Default `"line"` (`"area"` when `area` is set). */
  variant?: "line" | "area" | "bar"
  /** Fill the area under each line. Same as `variant="area"`. */
  area?: boolean
  /**
   * Stack the series on top of each other (e.g. arrivals by atoll adding up to the total).
   * Areas or bars stack; a line chart is drawn as stacked areas.
   */
  stacked?: boolean
  /** Show a brush under the chart to zoom into a range. */
  brush?: boolean
  /** Draw across missing values instead of leaving a gap. Default `false`. */
  connectNulls?: boolean
  showLegend?: boolean
  showGrid?: boolean
  /**
   * Fill areas and bars with a soft gradient in the series colour. Default `true`, or the
   * nearest `ChartStyleProvider`. Solid in forced-colours mode.
   */
  gradient?: boolean
  /**
   * Compare the current period (the first series) with the previous one (`previousKey`): the
   * previous period is dashed (muted bars with `variant="bar"`), headline totals above the
   * chart show the change, and the table gets a "Change" column. Series are not stacked.
   */
  comparison?: ChartComparison
}

/** Converts a date-like value to a timestamp (ms), or `null`. */
export function toTimestamp(value: unknown): number | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime()
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  if (typeof value === "string") {
    const time = Date.parse(value)
    return Number.isNaN(time) ? null : time
  }
  return null
}

const STEP: Record<TimeInterval, (date: Date, amount: number) => Date> = {
  hour: addHours,
  day: addDays,
  week: addWeeks,
  month: addMonths,
}

/** The start of the step `time` falls in. Weeks count from the first row's day. */
function stepStart(interval: TimeInterval, time: number, origin: Date): Date {
  const date = new Date(time)
  switch (interval) {
    case "hour":
      return startOfHour(date)
    case "day":
      return startOfDay(date)
    case "week":
      return addWeeks(origin, Math.floor(differenceInCalendarDays(date, origin) / 7))
    case "month":
      return startOfMonth(date)
  }
}

/** How rows that fall in the same step are combined. */
export type TimeAggregate = "sum" | "mean"

/** Combines the rows of one step: numbers are added up (or averaged), anything else comes from the first row. */
function combineStep(rows: ChartDatum[], dateKey: string, aggregate: TimeAggregate): ChartDatum {
  if (rows.length === 1) return { ...rows[0] }
  const combined: ChartDatum = { [dateKey]: rows[0]![dateKey] }
  const totals = new Map<string, { sum: number; count: number }>()
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (key === dateKey || key === TIME_KEY) continue
      if (typeof value === "number" && Number.isFinite(value)) {
        const total = totals.get(key) ?? { sum: 0, count: 0 }
        totals.set(key, { sum: total.sum + value, count: total.count + 1 })
      } else if (!(key in combined)) {
        combined[key] = value
      }
    }
  }
  for (const [key, { sum, count }] of totals) combined[key] = aggregate === "mean" ? sum / count : sum
  return combined
}

/** Steps filled in at most; a longer range is shown without gap rows rather than cut short. */
const MAX_STEPS = 10000

export const TIME_KEY = "__time"

/**
 * Normalises time-series rows: adds a numeric `__time` key, drops rows without a valid date and
 * sorts oldest first. With `interval`, each row is placed at the start of its hour/day/week/month,
 * rows in the same step are combined (`aggregate`: added up by default, or averaged), and empty
 * rows are inserted for missing steps (gaps).
 */
export function normalizeTimeSeries(
  data: ChartDatum[],
  dateKey: string,
  interval?: TimeInterval,
  aggregate: TimeAggregate = "sum",
): ChartDatum[] {
  const rows = data
    .map((d) => ({ ...d, [TIME_KEY]: toTimestamp(d[dateKey]) }))
    .filter((d): d is ChartDatum & { [TIME_KEY]: number } => d[TIME_KEY] !== null)
    .sort((a, b) => a[TIME_KEY] - b[TIME_KEY])
  if (!interval || rows.length === 0) return rows

  const origin = startOfDay(new Date(rows[0]![TIME_KEY]))
  const steps = new Map<number, ChartDatum[]>()
  for (const row of rows) {
    const time = stepStart(interval, row[TIME_KEY], origin).getTime()
    steps.set(time, [...(steps.get(time) ?? []), row])
  }
  const byStep = new Map(
    [...steps].map(([time, group]) => [time, { ...combineStep(group, dateKey, aggregate), [TIME_KEY]: time }]),
  )

  const times = [...byStep.keys()]
  const last = times[times.length - 1]!
  const filled: ChartDatum[] = []
  let cursor = new Date(times[0]!)
  while (cursor.getTime() <= last) {
    // Too many steps to fill: keep every row and skip the gap rows.
    if (filled.length === MAX_STEPS) return [...byStep.values()]
    const time = cursor.getTime()
    filled.push(byStep.get(time) ?? { [dateKey]: new Date(time), [TIME_KEY]: time })
    cursor = STEP[interval](cursor, 1)
  }
  return filled
}

function defaultFormats(interval: TimeInterval | undefined, hourCycle: 12 | 24) {
  const time = hourCycle === 12 ? "h:mm a" : "HH:mm"
  switch (interval) {
    case "hour":
      return { tick: time, full: `d MMM yyyy, ${time}` }
    case "month":
      return { tick: "MMM yyyy", full: "MMMM yyyy" }
    default:
      return { tick: "d MMM", full: "d MMM yyyy" }
  }
}

/** The smallest gap between consecutive points (ms), used to size bars and pad the axis. */
function smallestStep(rows: ChartDatum[]): number {
  let step = Infinity
  for (let i = 1; i < rows.length; i++) {
    const gap = (rows[i]![TIME_KEY] as number) - (rows[i - 1]![TIME_KEY] as number)
    if (gap > 0) step = Math.min(step, gap)
  }
  return Number.isFinite(step) ? step : 24 * 60 * 60 * 1000
}

/**
 * Time-series chart on shadcn's chart (Recharts): a real time axis formatted with the active
 * locale, gaps for missing data, an optional brush to zoom, and newest-on-the-left in RTL.
 */
export function TimeSeriesChart({
  data,
  dateKey = "date",
  config,
  series: seriesKeys,
  valueFormat = "number",
  interval,
  aggregate = "sum",
  dateFormat,
  tooltipDateFormat,
  variant: variantProp,
  area = false,
  stacked = false,
  brush = false,
  connectNulls = false,
  showLegend,
  showGrid = true,
  gradient: gradientProp,
  comparison,
  animate,
  height = 300,
  classNames,
  actions,
  ...frameProps
}: TimeSeriesChartProps) {
  const { t, dir, locale } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const isAnimationActive = useChartAnimation(animate)
  const trigger = useTooltipTrigger()
  const resolved = React.useMemo(() => resolveSeries(config, seriesKeys), [config, seriesKeys])
  const series = comparison ? comparisonSeries(config, resolved, comparison, t) : resolved
  const previousKey = comparison?.previousKey
  const chartConfig = React.useMemo(() => seriesConfig(config, series), [config, series])
  const rtl = dir === "rtl"
  const axes = rtlAxes(rtl)
  const legend = showLegend ?? series.length > 1
  const formats = defaultFormats(interval, locale.hourCycle)
  const tickPattern = dateFormat ?? formats.tick
  const fullPattern = tooltipDateFormat ?? formats.full

  const rows = React.useMemo(
    () => normalizeTimeSeries(data, dateKey, interval, aggregate),
    [data, dateKey, interval, aggregate],
  )
  // In RTL the newest point is drawn on the left; reversing the rows keeps the brush in the same order.
  const displayRows = React.useMemo(() => (rtl ? [...rows].reverse() : rows), [rows, rtl])

  const formatTime = React.useCallback(
    (value: unknown, pattern: string) => {
      const time = toTimestamp(value)
      return time === null ? "" : formatDate(new Date(time), pattern, { locale: locale.dateFns })
    },
    [locale.dateFns],
  )

  const [range, setRange] = React.useState<{ start: number; end: number } | null>(null)
  const [brushKey, setBrushKey] = React.useState(0)
  const zoomed = range !== null && (range.start > 0 || range.end < displayRows.length - 1)
  const resetZoom = () => {
    setRange(null)
    setBrushKey((k) => k + 1)
  }

  const first = rows[0]?.[TIME_KEY]
  const last = rows[rows.length - 1]?.[TIME_KEY]
  const seriesTable = cartesianTable(
    t,
    rows,
    TIME_KEY,
    series,
    fmt.value,
    (value) => formatTime(value, fullPattern),
    t("chart.date"),
  )
  const compared = comparison
    ? comparisonParts({
        comparison,
        data: rows,
        series: [series[0]!, series[1]!],
        table: seriesTable,
        format: fmt.value,
        percent: fmt.percent,
        t,
      })
    : null
  const table = compared?.table ?? seriesTable
  const summary = [
    cartesianSummary(t, t("chart.typeTimeSeries"), series, rows, fmt.value),
    rows.length
      ? t("chart.timeRange", { start: formatTime(first, fullPattern), end: formatTime(last, fullPattern) })
      : "",
    compared?.summary,
  ]
    .filter(Boolean)
    .join(" ")

  const visible = zoomed && range ? displayRows.slice(range.start, range.end + 1) : null
  const visibleTimes = visible?.map((r) => r[TIME_KEY] as number)

  const requested = variantProp ?? (area ? "area" : "line")
  // The two periods of a comparison overlap; they never stack.
  const stack = stacked && !comparison
  // Stacked lines read as stacked areas: each band is one series' share of the total.
  const variant = stack && requested === "line" ? "area" : requested
  const Chart = variant === "bar" ? RechartsBarChart : variant === "area" ? RechartsAreaChart : RechartsLineChart
  const stackId = stack ? "stack" : undefined
  // Bars are centred on their time, so pad the axis by half a step to keep the first and last whole.
  const halfStep = variant === "bar" ? smallestStep(rows) / 2 : 0
  const gradient = useChartGradient(gradientProp) && variant !== "line"
  const gradientId = useGradientId()
  const fills =
    variant === "bar"
      ? barSeriesFills({ gradient, gradientId, series, data: displayRows, base: stack ? 0.8 : undefined })
      : areaSeriesFills({ gradient, gradientId, series, data: displayRows, stacked: stack })
  // Previous-period bars come first, so each current bar sits at the end of its pair.
  const drawn = previousKey && variant === "bar" ? [...series].reverse() : series

  return (
    <ChartFrame
      {...frameProps}
      dataSlot="time-series-chart"
      height={height}
      classNames={classNames}
      autoSummary={summary}
      table={table}
      lead={compared?.lead}
      isEmpty={!rows.length || !series.length}
      actions={
        <>
          {actions}
          {brush && zoomed ? (
            <Button type="button" variant="ghost" size="sm" data-part="chart-reset-zoom" onClick={resetZoom}>
              <Icon name="zoom-out" />
              {t("chart.resetZoom")}
            </Button>
          ) : null}
        </>
      }
      footer={
        brush ? (
          <p data-slot="chart-zoom-status" className="text-xs text-muted-foreground" aria-live="polite">
            {visibleTimes?.length
              ? t("chart.showingRange", {
                  start: formatTime(Math.min(...visibleTimes), fullPattern),
                  end: formatTime(Math.max(...visibleTimes), fullPattern),
                })
              : null}
          </p>
        ) : null
      }
    >
      {({ titleId, summaryId }) => (
        <ChartContainer
          config={chartConfig}
          data-fill={variant === "line" ? undefined : gradient ? "gradient" : "solid"}
          className={cn("aspect-auto w-full", SVG_LTR, gradient && GRADIENT_FALLBACK, classNames?.chart)}
          style={{ height: brush ? height + 40 : height }}
        >
          <Chart
            data={displayRows}
            accessibilityLayer
            aria-labelledby={titleId}
            aria-describedby={summaryId}
            margin={{ top: 8, right: 12, bottom: 0, left: 12 }}
          >
            <ChartGradients defs={fills.defs} />
            {showGrid ? <CartesianGrid vertical={false} /> : null}
            <XAxis
              dataKey={TIME_KEY}
              type="number"
              scale="time"
              domain={halfStep ? [`dataMin - ${halfStep}`, `dataMax + ${halfStep}`] : ["dataMin", "dataMax"]}
              reversed={axes.reversed}
              tickFormatter={(value: number) => formatTime(value, tickPattern)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              orientation={axes.valueAxisOrientation}
              tickFormatter={(value: number) => fmt.axis(value)}
              tickLine={false}
              axisLine={false}
              width="auto"
            />
            <ChartTooltip
              isAnimationActive={isAnimationActive}
              trigger={trigger}
              cursor={variant === "bar" ? false : undefined}
              content={
                <ChartTooltipContent
                  indicator={variant === "bar" ? "dot" : "line"}
                  labelFormatter={(_, payload) => formatTime(payload?.[0]?.payload?.[TIME_KEY], fullPattern)}
                  valueFormatter={(value) => (typeof value === "number" ? fmt.value(value) : String(value))}
                />
              }
            />
            {legend ? (
              <ChartLegend itemSorter={null} verticalAlign="top" content={<ChartLegendContent verticalAlign="top" />} />
            ) : null}
            {drawn.map((s) => {
              const i = series.indexOf(s)
              const previous = s.key === previousKey
              if (variant === "bar") {
                const top = !stack || i === series.length - 1
                return (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.key}
                    fill={fills.fill[i]}
                    fillOpacity={previous ? 0.35 : undefined}
                    stackId={stackId}
                    radius={top ? [4, 4, 0, 0] : 0}
                    maxBarSize={48}
                    isAnimationActive={isAnimationActive}
                  >
                    {fills.cells[i]}
                  </Bar>
                )
              }
              const common = {
                dataKey: s.key,
                name: s.key,
                type: "monotone" as const,
                stroke: `var(--color-${s.key})`,
                strokeWidth: 2,
                strokeDasharray: previous ? "5 4" : undefined,
                connectNulls,
                isAnimationActive,
                dot: false as const,
                activeDot: { r: 4 },
              }
              return variant === "area" ? (
                <Area
                  key={s.key}
                  {...common}
                  fill={fills.fill[i]}
                  fillOpacity={previous ? 0 : fills.fillOpacity}
                  stackId={stackId}
                />
              ) : (
                <Line key={s.key} {...common} />
              )
            })}
            {brush ? (
              <Brush
                key={brushKey}
                dataKey={TIME_KEY}
                height={28}
                stroke="var(--color-border, var(--border))"
                fill="var(--background)"
                travellerWidth={10}
                ariaLabel={t("chart.zoomRange")}
                tickFormatter={(value: number) => formatTime(value, tickPattern)}
                onChange={(next) => {
                  if (typeof next?.startIndex === "number" && typeof next.endIndex === "number") {
                    setRange({ start: next.startIndex, end: next.endIndex })
                  }
                }}
              />
            ) : null}
          </Chart>
        </ChartContainer>
      )}
    </ChartFrame>
  )
}
