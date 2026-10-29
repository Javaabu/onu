"use client"

import * as React from "react"
import {
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import {
  cartesianSummary,
  cartesianTable,
  defaultCategoryFormat,
  rtlAxes,
  type CartesianChartProps,
} from "./_cartesian"
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
} from "./_shared"
import { useChartFormat } from "./format"
import { registerEnglish } from "../i18n/english"
import { chart as en_chart } from "../locales/en/chart"

registerEnglish({ chart: en_chart })

export type CategoryChartCurve = "monotone" | "linear" | "step" | "natural"

export type CategoryChartVariant = "line" | "area" | "bar"

/** Options for lines and areas. */
interface LineSeriesOptions {
  /** Line interpolation. Default `"monotone"`. */
  curve?: CategoryChartCurve
  /** Show a dot on each data point. Default `true` up to 31 points. */
  dots?: boolean
  /** Draw across missing (`null`) values instead of leaving a gap. Default `false`. */
  connectNulls?: boolean
  /** Dash the given series (e.g. targets or forecasts), so they differ by more than colour. */
  dashedSeries?: string[]
}

/** Options for bars. */
interface BarSeriesOptions {
  /** `"vertical"` draws columns (categories along the bottom); `"horizontal"` draws bars (categories down the side). */
  orientation?: "vertical" | "horizontal"
  /** Corner radius of the bars in px. Default `4` (`0` when stacked). */
  radius?: number
}

/** Rejects the other variant's options. */
type Without<T> = { [K in keyof T]?: never }

/** `CategoryChart` props for `variant="line"` (the default) and `variant="area"`. */
export interface CategoryChartLineProps extends CartesianChartProps, LineSeriesOptions, Without<BarSeriesOptions> {
  /** How series are drawn. Default `"line"`. */
  variant?: "line" | "area"
  /** Stack areas on top of each other (with `variant="area"`). */
  stacked?: boolean
}

/** `CategoryChart` props for `variant="bar"`. */
export interface CategoryChartBarProps extends CartesianChartProps, BarSeriesOptions, Without<LineSeriesOptions> {
  /** How series are drawn. */
  variant: "bar"
  /** Stack series on top of each other instead of grouping them side by side. */
  stacked?: boolean
}

/** `curve`, `dots`, `connectNulls` and `dashedSeries` are for lines and areas; `orientation` and `radius` for bars. */
export type CategoryChartProps = CategoryChartLineProps | CategoryChartBarProps

const TYPE_KEY = { line: "chart.typeLine", area: "chart.typeArea", bar: "chart.typeBar" } as const

/**
 * Category chart on shadcn's chart (Recharts): lines, filled areas or bars (vertical or
 * horizontal), grouped or stacked, with gaps for missing values, a data-table alternative,
 * keyboard navigation and RTL-mirrored axes.
 */
export function CategoryChart({
  data,
  config,
  categoryKey,
  series: seriesKeys,
  valueFormat = "number",
  categoryFormat = defaultCategoryFormat,
  categoryLabel,
  showLegend,
  showGrid = true,
  variant = "line",
  stacked: stackedProp = false,
  curve = "monotone",
  dots,
  connectNulls = false,
  dashedSeries,
  orientation = "vertical",
  radius,
  gradient: gradientProp,
  comparison,
  animate,
  height = 300,
  classNames,
  ...frameProps
}: CategoryChartProps) {
  const { t, dir } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const isAnimationActive = useChartAnimation(animate)
  const trigger = useTooltipTrigger()
  const resolved = React.useMemo(() => resolveSeries(config, seriesKeys), [config, seriesKeys])
  const series = comparison ? comparisonSeries(config, resolved, comparison, t) : resolved
  const previousKey = comparison?.previousKey
  // The two periods of a comparison overlap; they never stack.
  const stacked = stackedProp && !comparison
  const chartConfig = React.useMemo(() => seriesConfig(config, series), [config, series])
  const rtl = dir === "rtl"
  const axes = rtlAxes(rtl)
  const bar = variant === "bar"
  const horizontal = bar && orientation === "horizontal"
  const legend = showLegend ?? series.length > 1
  const showDots = dots ?? data.length <= 31
  const barRadius = radius ?? (stacked ? 0 : 4)
  // Plain lines have no fill to shade.
  const gradient = useChartGradient(gradientProp) && variant !== "line"
  const gradientId = useGradientId()
  const fills = bar
    ? barSeriesFills({ gradient, gradientId, series, data, horizontal, rtl, base: stacked ? 0.8 : undefined })
    : areaSeriesFills({ gradient, gradientId, series, data, stacked })
  // Previous-period bars come first, so each current bar sits at the end of its pair.
  const drawn = previousKey && bar ? [...series].reverse() : series

  const seriesTable = cartesianTable(
    t,
    data,
    categoryKey,
    series,
    fmt.value,
    categoryFormat,
    categoryLabel ?? t("chart.category"),
  )
  const compared = comparison
    ? comparisonParts({
        comparison,
        data,
        series: [series[0]!, series[1]!],
        table: seriesTable,
        format: fmt.value,
        percent: fmt.percent,
        t,
      })
    : null
  const table = compared?.table ?? seriesTable
  const summary = [cartesianSummary(t, t(TYPE_KEY[variant]), series, data, fmt.value), compared?.summary]
    .filter(Boolean)
    .join(" ")

  const categoryTick = (value: unknown) => categoryFormat(value)
  const valueTick = (value: number) => fmt.axis(value)
  const Chart = bar ? RechartsBarChart : variant === "area" ? RechartsAreaChart : RechartsLineChart
  const inset = bar ? 8 : 12

  return (
    <ChartFrame
      {...frameProps}
      dataSlot={`${variant}-chart`}
      height={height}
      classNames={classNames}
      autoSummary={summary}
      table={table}
      lead={compared?.lead}
      isEmpty={!data.length || !series.length}
    >
      {({ titleId, summaryId }) => (
        <ChartContainer
          config={chartConfig}
          data-orientation={bar ? orientation : undefined}
          data-fill={variant === "line" ? undefined : gradient ? "gradient" : "solid"}
          className={cn("aspect-auto w-full", SVG_LTR, gradient && GRADIENT_FALLBACK, classNames?.chart)}
          style={{ height }}
        >
          <Chart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            accessibilityLayer
            aria-labelledby={titleId}
            aria-describedby={summaryId}
            margin={{ top: 8, right: inset, bottom: 0, left: inset }}
          >
            <ChartGradients defs={fills.defs} />
            {showGrid ? <CartesianGrid vertical={horizontal} horizontal={!horizontal} /> : null}
            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  reversed={axes.reversed}
                  tickFormatter={valueTick}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey={categoryKey}
                  orientation={axes.valueAxisOrientation}
                  tickFormatter={categoryTick}
                  tickLine={false}
                  axisLine={false}
                  width="auto"
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={categoryKey}
                  reversed={axes.reversed}
                  tickFormatter={categoryTick}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={bar ? undefined : 16}
                />
                <YAxis
                  orientation={axes.valueAxisOrientation}
                  tickFormatter={valueTick}
                  tickLine={false}
                  axisLine={false}
                  width="auto"
                />
              </>
            )}
            <ChartTooltip
              isAnimationActive={isAnimationActive}
              trigger={trigger}
              cursor={bar ? false : undefined}
              content={
                <ChartTooltipContent
                  indicator={bar ? "dot" : "line"}
                  labelFormatter={(_, payload) => categoryFormat(payload?.[0]?.payload?.[categoryKey])}
                  valueFormatter={(value) => (typeof value === "number" ? fmt.value(value) : String(value))}
                />
              }
            />
            {legend ? <ChartLegend itemSorter={null} content={<ChartLegendContent />} /> : null}
            {drawn.map((s) => {
              const i = series.indexOf(s)
              const previous = s.key === previousKey
              if (bar) {
                return (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.key}
                    fill={fills.fill[i]}
                    fillOpacity={previous ? 0.35 : undefined}
                    stackId={stacked ? "stack" : undefined}
                    radius={barRadius}
                    isAnimationActive={isAnimationActive}
                  >
                    {fills.cells[i]}
                  </Bar>
                )
              }
              const common = {
                dataKey: s.key,
                name: s.key,
                type: curve,
                stroke: `var(--color-${s.key})`,
                strokeWidth: 2,
                strokeDasharray: previous || dashedSeries?.includes(s.key) ? "5 4" : undefined,
                connectNulls,
                isAnimationActive,
                dot: showDots ? { r: 3, fill: `var(--color-${s.key})`, strokeWidth: 0 } : false,
                activeDot: { r: 5 },
              }
              return variant === "area" ? (
                <Area
                  key={s.key}
                  {...common}
                  fill={fills.fill[i]}
                  fillOpacity={previous ? 0 : fills.fillOpacity}
                  stackId={stacked ? "stack" : undefined}
                />
              ) : (
                <Line key={s.key} {...common} />
              )
            })}
          </Chart>
        </ChartContainer>
      )}
    </ChartFrame>
  )
}
