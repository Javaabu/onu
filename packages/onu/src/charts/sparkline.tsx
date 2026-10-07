"use client"

import * as React from "react"
import { Area, AreaChart, Line, LineChart, XAxis, YAxis } from "recharts"

import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import { ChartContainer } from "../ui/chart"
import { chartColor, SVG_LTR, useChartAnimation, type ChartDatum } from "./_shared"
import { useChartFormat, type ValueFormat } from "./format"

export interface SparklineProps extends Omit<React.ComponentProps<"div">, "children" | "color"> {
  /** Numbers, or objects with a `valueKey`. `null` leaves a gap. */
  data: (number | null)[] | ChartDatum[]
  /** Key of the value when `data` holds objects. Default `"value"`. */
  valueKey?: string
  /** What the sparkline shows, e.g. "Daily arrivals". Used in the accessible summary. */
  label: string
  /** `"area"` fills under the line. */
  variant?: "line" | "area"
  /** Any CSS colour or token, e.g. `var(--chart-2)`. Default `var(--chart-1)`. */
  color?: string
  /** Height in px. Width follows the container. Default `32`. */
  height?: number
  valueFormat?: ValueFormat
  /** Animate on mount (off under reduced motion). Default `false`. */
  animate?: boolean
}

/** Pulls the numbers out of sparkline data. */
export function sparklineValues(data: SparklineProps["data"], valueKey = "value"): (number | null)[] {
  return data.map((d) => {
    const v = typeof d === "object" && d !== null ? d[valueKey] : d
    return typeof v === "number" && !Number.isNaN(v) ? v : null
  })
}

/**
 * A tiny inline line or area chart with no axes, labels or tooltip. Exposed to screen readers
 * as an image whose name summarises the series (first, last, lowest, highest).
 */
export function Sparkline({
  data,
  valueKey = "value",
  label,
  variant = "line",
  color = chartColor(0),
  height = 32,
  valueFormat = "number",
  animate = false,
  className,
  style,
  ...props
}: SparklineProps) {
  const { t, dir } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const isAnimationActive = useChartAnimation(animate)
  const values = React.useMemo(() => sparklineValues(data, valueKey), [data, valueKey])
  const rows = values.map((value, index) => ({ index, value }))
  const nums = values.filter((v): v is number => v !== null)

  const summary = nums.length
    ? t("chart.sparklineSummary", {
        label,
        count: nums.length,
        first: fmt.value(nums[0]),
        last: fmt.value(nums[nums.length - 1]),
        min: fmt.value(Math.min(...nums)),
        max: fmt.value(Math.max(...nums)),
      })
    : `${label}: ${t("chart.noData")}`

  const Chart = variant === "area" ? AreaChart : LineChart
  const common = {
    dataKey: "value",
    type: "monotone" as const,
    stroke: "var(--color-value)",
    strokeWidth: 1.5,
    dot: false as const,
    activeDot: false as const,
    isAnimationActive,
  }

  return (
    <div
      role="img"
      aria-label={summary}
      data-slot="sparkline"
      data-variant={variant}
      className={cn("min-w-12 inline-block w-full", className)}
      style={{ height, ...style }}
      {...props}
    >
      {nums.length ? (
        <ChartContainer
          config={{ value: { label, color } }}
          className={cn("aspect-auto size-full", SVG_LTR)}
          aria-hidden="true"
        >
          <Chart data={rows} accessibilityLayer={false} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <XAxis dataKey="index" hide reversed={dir === "rtl"} />
            <YAxis hide domain={["dataMin", "dataMax"]} />
            {variant === "area" ? (
              <Area {...common} fill="var(--color-value)" fillOpacity={0.2} />
            ) : (
              <Line {...common} />
            )}
          </Chart>
        </ChartContainer>
      ) : null}
    </div>
  )
}
