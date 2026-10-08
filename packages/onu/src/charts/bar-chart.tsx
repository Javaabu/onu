"use client"

import * as React from "react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { barSeriesFills, ChartGradients, GRADIENT_FALLBACK, useChartGradient, useGradientId } from "./_gradient"
import { ChartFrame, resolveSeries, seriesConfig, SVG_LTR, useChartAnimation, useTooltipTrigger } from "./_shared"
import { useChartFormat } from "./format"

export interface BarChartProps extends CartesianChartProps {
  /** `"vertical"` draws columns (categories along the bottom); `"horizontal"` draws bars (categories down the side). */
  orientation?: "vertical" | "horizontal"
  /** Stack series on top of each other instead of grouping them side by side. */
  stacked?: boolean
  /** Corner radius of the bars in px. Default `4` (`0` when stacked). */
  radius?: number
}

/**
 * Bar graph on shadcn's chart (Recharts). Vertical or horizontal, grouped or stacked,
 * with a data-table alternative, keyboard navigation and RTL-mirrored axes.
 */
export function BarChart({
  data,
  config,
  categoryKey,
  series: seriesKeys,
  valueFormat = "number",
  categoryFormat = defaultCategoryFormat,
  categoryLabel,
  showLegend,
  showGrid = true,
  orientation = "vertical",
  stacked = false,
  radius,
  gradient: gradientProp,
  animate,
  height = 300,
  classNames,
  ...frameProps
}: BarChartProps) {
  const { t, dir } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const isAnimationActive = useChartAnimation(animate)
  const trigger = useTooltipTrigger()
  const series = React.useMemo(() => resolveSeries(config, seriesKeys), [config, seriesKeys])
  const chartConfig = React.useMemo(() => seriesConfig(config, series), [config, series])
  const rtl = dir === "rtl"
  const axes = rtlAxes(rtl)
  const horizontal = orientation === "horizontal"
  const legend = showLegend ?? series.length > 1
  const barRadius = radius ?? (stacked ? 0 : 4)
  const gradient = useChartGradient(gradientProp)
  const gradientId = useGradientId()
  const fills = barSeriesFills({ gradient, gradientId, series, data, horizontal, rtl, base: stacked ? 0.8 : undefined })

  const summary = cartesianSummary(t, t("chart.typeBar"), series, data, fmt.value)
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

  return (
    <ChartFrame
      {...frameProps}
      dataSlot="bar-chart"
      height={height}
      classNames={classNames}
      autoSummary={summary}
      table={table}
      isEmpty={!data.length || !series.length}
    >
      {({ titleId, summaryId }) => (
        <ChartContainer
          config={chartConfig}
          data-orientation={orientation}
          data-fill={gradient ? "gradient" : "solid"}
          className={cn("aspect-auto w-full", SVG_LTR, gradient && GRADIENT_FALLBACK, classNames?.chart)}
          style={{ height }}
        >
          <RechartsBarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            accessibilityLayer
            aria-labelledby={titleId}
            aria-describedby={summaryId}
            margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
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
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => categoryFormat(payload?.[0]?.payload?.[categoryKey])}
                  valueFormatter={(value) => (typeof value === "number" ? fmt.value(value) : String(value))}
                />
              }
            />
            {legend ? <ChartLegend itemSorter={null} content={<ChartLegendContent />} /> : null}
            {series.map((s, i) => (
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
            ))}
          </RechartsBarChart>
        </ChartContainer>
      )}
    </ChartFrame>
  )
}
