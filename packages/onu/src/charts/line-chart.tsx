"use client"

import * as React from "react"
import {
  Area,
  AreaChart as RechartsAreaChart,
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
import { areaSeriesFills, ChartGradients, GRADIENT_FALLBACK, useChartGradient, useGradientId } from "./_gradient"
import { ChartFrame, resolveSeries, seriesConfig, SVG_LTR, useChartAnimation, useTooltipTrigger } from "./_shared"
import { useChartFormat } from "./format"

export type LineCurve = "monotone" | "linear" | "step" | "natural"

export interface LineChartProps extends CartesianChartProps {
  /** Fill the area under each line. */
  area?: boolean
  /** Stack areas on top of each other (with `area`). */
  stacked?: boolean
  /** Line interpolation. Default `"monotone"`. */
  curve?: LineCurve
  /** Show a dot on each data point. Default `true` up to 31 points. */
  dots?: boolean
  /** Draw across missing (`null`) values instead of leaving a gap. Default `false`. */
  connectNulls?: boolean
  /** Dash the given series (e.g. targets or forecasts), so they differ by more than colour. */
  dashedSeries?: string[]
}

/**
 * Line graph on shadcn's chart (Recharts): multiple series, optional filled areas,
 * gaps for missing values, data-table alternative and RTL-mirrored axes.
 */
export function LineChart({
  data,
  config,
  categoryKey,
  series: seriesKeys,
  valueFormat = "number",
  categoryFormat = defaultCategoryFormat,
  categoryLabel,
  showLegend,
  showGrid = true,
  area = false,
  stacked = false,
  curve = "monotone",
  dots,
  connectNulls = false,
  dashedSeries,
  gradient: gradientProp,
  animate,
  height = 300,
  classNames,
  ...frameProps
}: LineChartProps) {
  const { t, dir } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const isAnimationActive = useChartAnimation(animate)
  const trigger = useTooltipTrigger()
  const series = React.useMemo(() => resolveSeries(config, seriesKeys), [config, seriesKeys])
  const chartConfig = React.useMemo(() => seriesConfig(config, series), [config, series])
  const axes = rtlAxes(dir === "rtl")
  const legend = showLegend ?? series.length > 1
  const showDots = dots ?? data.length <= 31
  const gradient = useChartGradient(gradientProp) && area
  const gradientId = useGradientId()
  const fills = areaSeriesFills({ gradient, gradientId, series, data, stacked })

  const summary = cartesianSummary(t, t(area ? "chart.typeArea" : "chart.typeLine"), series, data, fmt.value)
  const table = cartesianTable(
    t,
    data,
    categoryKey,
    series,
    fmt.value,
    categoryFormat,
    categoryLabel ?? t("chart.category"),
  )

  const Chart = area ? RechartsAreaChart : RechartsLineChart

  return (
    <ChartFrame
      {...frameProps}
      dataSlot={area ? "area-chart" : "line-chart"}
      height={height}
      classNames={classNames}
      autoSummary={summary}
      table={table}
      isEmpty={!data.length || !series.length}
    >
      {({ titleId, summaryId }) => (
        <ChartContainer
          config={chartConfig}
          data-fill={area ? (gradient ? "gradient" : "solid") : undefined}
          className={cn("aspect-auto w-full", SVG_LTR, gradient && GRADIENT_FALLBACK, classNames?.chart)}
          style={{ height }}
        >
          <Chart
            data={data}
            accessibilityLayer
            aria-labelledby={titleId}
            aria-describedby={summaryId}
            margin={{ top: 8, right: 12, bottom: 0, left: 12 }}
          >
            <ChartGradients defs={fills.defs} />
            {showGrid ? <CartesianGrid vertical={false} /> : null}
            <XAxis
              dataKey={categoryKey}
              reversed={axes.reversed}
              tickFormatter={(value: unknown) => categoryFormat(value)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
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
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) => categoryFormat(payload?.[0]?.payload?.[categoryKey])}
                  valueFormatter={(value) => (typeof value === "number" ? fmt.value(value) : String(value))}
                />
              }
            />
            {legend ? <ChartLegend itemSorter={null} content={<ChartLegendContent />} /> : null}
            {series.map((s, i) => {
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
              return area ? (
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
