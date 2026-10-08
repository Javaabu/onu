"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart"
import { cartesianSummary, defaultCategoryFormat, rtlAxes } from "./_cartesian"
import {
  chartColor,
  ChartFrame,
  numericValue,
  resolveSeries,
  SVG_LTR,
  useChartAnimation,
  useTooltipTrigger,
  type ChartBaseProps,
  type ChartDatum,
} from "./_shared"
import { DeltaIndicator } from "./delta-indicator"
import { aggregate, computeDelta, useChartFormat, type ValueFormat } from "./format"

export interface PeriodComparisonChartProps extends ChartBaseProps {
  /** One object per step of the period, e.g. `{ day: "Sun", current: 120, previous: 98 }`. */
  data: ChartDatum[]
  /** Key of the step label (day, week, month). */
  categoryKey: string
  /** Key of the current period's value. Default `"current"`. */
  currentKey?: string
  /** Key of the previous period's value. Default `"previous"`. */
  previousKey?: string
  /** Default "This period". */
  currentLabel?: React.ReactNode
  /** Default "Previous period". */
  previousLabel?: React.ReactNode
  /** Draw lines (previous dashed) or grouped bars (previous muted). Default `"line"`. */
  variant?: "line" | "bar"
  valueFormat?: ValueFormat
  categoryFormat?: (value: unknown) => string
  categoryLabel?: React.ReactNode
  /** How the headline figures are computed. Default `"sum"`. */
  aggregate?: "sum" | "average" | "last"
  /** Whether an increase is good. Default `true`. */
  positiveIsGood?: boolean
  /** Hide the headline totals above the chart. */
  hideTotals?: boolean
}

/** Per-row change between the current and previous value, as a ratio (`null` when not computable). */
export function rowChange(datum: ChartDatum, currentKey: string, previousKey: string): number | null {
  const current = numericValue(datum, currentKey)
  const previous = numericValue(datum, previousKey)
  if (current === null || previous === null) return null
  return computeDelta(current, previous).ratio
}

/**
 * Compares the current period with the previous one: headline totals with delta % and an
 * up/down indicator, the two periods overlaid (previous dashed or muted), and a table with per-step change.
 */
export function PeriodComparisonChart({
  data,
  categoryKey,
  currentKey = "current",
  previousKey = "previous",
  currentLabel,
  previousLabel,
  variant = "line",
  valueFormat = "number",
  categoryFormat = defaultCategoryFormat,
  categoryLabel,
  aggregate: mode = "sum",
  positiveIsGood = true,
  hideTotals = false,
  animate,
  height = 280,
  classNames,
  ...frameProps
}: PeriodComparisonChartProps) {
  const { t, dir } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const isAnimationActive = useChartAnimation(animate)
  const trigger = useTooltipTrigger()
  const axes = rtlAxes(dir === "rtl")

  const config = React.useMemo<ChartConfig>(
    () => ({
      [currentKey]: { label: currentLabel ?? t("chart.currentPeriod"), color: chartColor(0) },
      [previousKey]: { label: previousLabel ?? t("chart.previousPeriod"), color: "var(--muted-foreground)" },
    }),
    [currentKey, previousKey, currentLabel, previousLabel, t],
  )
  const series = resolveSeries(config)

  const currentTotal = aggregate(
    data.map((d) => numericValue(d, currentKey)),
    mode,
  )
  const previousTotal = aggregate(
    data.map((d) => numericValue(d, previousKey)),
    mode,
  )
  const delta = computeDelta(currentTotal, previousTotal)

  const deltaText =
    delta.direction === "flat"
      ? t("chart.noChange")
      : delta.ratio === null
        ? ""
        : t(delta.direction === "up" ? "chart.increase" : "chart.decrease", {
            value: fmt.percent(Math.abs(delta.ratio)),
          })
  const summary = [
    cartesianSummary(t, t("chart.typePeriodComparison"), series, data, fmt.value),
    `${series[0]!.text}: ${fmt.value(currentTotal)}. ${series[1]!.text}: ${fmt.value(previousTotal)}.`,
    deltaText,
  ]
    .filter(Boolean)
    .join(" ")

  const table = {
    columns: [categoryLabel ?? t("chart.category"), series[0]!.label, series[1]!.label, t("chart.change")],
    rows: data.map((datum, index) => {
      const cell = (key: string) => {
        const value = numericValue(datum, key)
        return value === null ? t("chart.noValue") : fmt.value(value)
      }
      const change = rowChange(datum, currentKey, previousKey)
      return {
        key: String(index),
        header: categoryFormat(datum[categoryKey]),
        cells: [
          cell(currentKey),
          cell(previousKey),
          change === null ? (
            t("chart.noValue")
          ) : (
            <DeltaIndicator key="delta" value={change} positiveIsGood={positiveIsGood} className="justify-end" />
          ),
        ],
      }
    }),
  }

  const lead = hideTotals ? null : (
    <div data-slot="period-totals" className="gap-x-6 gap-y-2 flex flex-wrap items-end">
      <div className="gap-0.5 grid">
        <span className="text-xs text-muted-foreground">{series[0]!.label}</span>
        <span data-slot="period-current-total" className="text-2xl font-semibold leading-none tabular-nums">
          {fmt.value(currentTotal)}
        </span>
      </div>
      <div className="gap-0.5 grid">
        <span className="text-xs text-muted-foreground">{series[1]!.label}</span>
        <span data-slot="period-previous-total" className="text-lg leading-none text-muted-foreground tabular-nums">
          {fmt.value(previousTotal)}
        </span>
      </div>
      <DeltaIndicator
        variant="badge"
        current={currentTotal}
        previous={previousTotal}
        positiveIsGood={positiveIsGood}
        className="mb-0.5"
      />
    </div>
  )

  const Chart = variant === "bar" ? BarChart : LineChart

  return (
    <ChartFrame
      {...frameProps}
      dataSlot="period-comparison-chart"
      height={height}
      classNames={classNames}
      autoSummary={summary}
      table={table}
      lead={lead}
      isEmpty={!data.length}
    >
      {({ titleId, summaryId }) => (
        <ChartContainer
          config={config}
          data-variant={variant}
          className={cn("aspect-auto w-full", SVG_LTR, classNames?.chart)}
          style={{ height }}
        >
          <Chart
            data={data}
            accessibilityLayer
            aria-labelledby={titleId}
            aria-describedby={summaryId}
            margin={{ top: 8, right: 12, bottom: 0, left: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={categoryKey}
              reversed={axes.reversed}
              tickFormatter={(value: unknown) => categoryFormat(value)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
                  labelFormatter={(_, payload) => categoryFormat(payload?.[0]?.payload?.[categoryKey])}
                  valueFormatter={(value) => (typeof value === "number" ? fmt.value(value) : String(value))}
                />
              }
            />
            <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
            {variant === "bar" ? (
              <>
                <Bar
                  dataKey={previousKey}
                  name={previousKey}
                  fill={`var(--color-${previousKey})`}
                  fillOpacity={0.35}
                  radius={4}
                  isAnimationActive={isAnimationActive}
                />
                <Bar
                  dataKey={currentKey}
                  name={currentKey}
                  fill={`var(--color-${currentKey})`}
                  radius={4}
                  isAnimationActive={isAnimationActive}
                />
              </>
            ) : (
              <>
                <Line
                  dataKey={previousKey}
                  name={previousKey}
                  type="monotone"
                  stroke={`var(--color-${previousKey})`}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  isAnimationActive={isAnimationActive}
                />
                <Line
                  dataKey={currentKey}
                  name={currentKey}
                  type="monotone"
                  stroke={`var(--color-${currentKey})`}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: `var(--color-${currentKey})`, strokeWidth: 0 }}
                  isAnimationActive={isAnimationActive}
                />
              </>
            )}
          </Chart>
        </ChartContainer>
      )}
    </ChartFrame>
  )
}
