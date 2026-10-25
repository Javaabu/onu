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
import { ChartFrame, resolveSeries, seriesConfig, SVG_LTR, useChartAnimation, useTooltipTrigger } from "./_shared"
import { useChartFormat } from "./format"
import { registerEnglish } from "../i18n/english"
import { chart as en_chart } from "../locales/en/chart"

registerEnglish({ chart: en_chart })

export type LineCurve = "monotone" | "linear" | "step" | "natural"

export type CategoryChartVariant = "line" | "area" | "bar"

/** Options for lines and areas. */
interface LineSeriesOptions {
  /** Line interpolation. Default `"monotone"`. */
  curve?: LineCurve
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

export interface LineChartProps extends CartesianChartProps, LineSeriesOptions {
  /**
   * Fill the area under each line.
   * @deprecated Use `variant="area"` on `CategoryChart`, or `AreaChart`.
   */
  area?: boolean
  /** Stack areas on top of each other (with `area`). */
  stacked?: boolean
}

export type AreaChartProps = Omit<LineChartProps, "area">

export interface BarChartProps extends CartesianChartProps, BarSeriesOptions {
  /** Stack series on top of each other instead of grouping them side by side. */
  stacked?: boolean
}

interface LineVariantProps extends LineChartProps, Without<BarSeriesOptions> {
  /** How series are drawn. Default `"line"` (`"area"` with `area`). */
  variant?: "line" | "area"
}

interface BarVariantProps extends BarChartProps, Without<LineSeriesOptions> {
  /** How series are drawn. */
  variant: "bar"
  area?: never
}

/** `curve`, `dots`, `connectNulls` and `dashedSeries` are for lines and areas; `orientation` and `radius` for bars. */
export type CategoryChartProps = LineVariantProps | BarVariantProps

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
  variant: variantProp,
  area = false,
  stacked = false,
  curve = "monotone",
  dots,
  connectNulls = false,
  dashedSeries,
  orientation = "vertical",
  radius,
  gradient: gradientProp,
  animate,
  height = 300,
  classNames,
  ...frameProps
}: CategoryChartProps) {
  const { t, dir } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const isAnimationActive = useChartAnimation(animate)
  const trigger = useTooltipTrigger()
  const series = React.useMemo(() => resolveSeries(config, seriesKeys), [config, seriesKeys])
  const chartConfig = React.useMemo(() => seriesConfig(config, series), [config, series])
  const rtl = dir === "rtl"
  const axes = rtlAxes(rtl)
  const variant = variantProp ?? (area ? "area" : "line")
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

  const summary = cartesianSummary(t, t(TYPE_KEY[variant]), series, data, fmt.value)
  const table = cartesianTable(
    t,
    data,
    categoryKey,
    series,
    fmt.value,
    categoryFormat,
    categoryLabel ?? t("chart.category"),
  )

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
            {series.map((s, i) => {
              if (bar) {
                return (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.key}
                    fill={fills.fill[i]}
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
                strokeDasharray: dashedSeries?.includes(s.key) ? "5 4" : undefined,
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
                  fillOpacity={fills.fillOpacity}
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

/** `CategoryChart` with `variant="line"` (or `"area"` with the deprecated `area`). */
export function LineChart(props: LineChartProps) {
  return <CategoryChart {...props} variant={props.area ? "area" : "line"} />
}

/** `CategoryChart` with `variant="area"`. */
export function AreaChart(props: AreaChartProps) {
  return <CategoryChart {...props} variant="area" />
}

/** `CategoryChart` with `variant="bar"`. */
export function BarChart(props: BarChartProps) {
  return <CategoryChart {...props} variant="bar" />
}
