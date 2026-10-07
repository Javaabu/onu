"use client"

import * as React from "react"
import { Label, Pie, PieChart as RechartsPieChart } from "recharts"

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
import {
  chartColor,
  ChartFrame,
  nodeText,
  numericValue,
  SVG_LTR,
  useChartAnimation,
  useTooltipTrigger,
  type ChartBaseProps,
  type ChartDatum,
} from "./_shared"
import { useChartFormat, type ValueFormat } from "./format"

export interface PieChartProps extends ChartBaseProps {
  /** One object per slice, e.g. `{ name: "Malé", value: 212000 }`. */
  data: ChartDatum[]
  /** Key of the slice name. Default `"name"`. */
  nameKey?: string
  /** Key of the slice value. Default `"value"`. */
  valueKey?: string
  /** Labels and colours keyed by slice name. Colours default to `--chart-1…8`. */
  config?: ChartConfig
  /** `"donut"` leaves a hole in the middle with a centre label. */
  variant?: "pie" | "donut"
  /** Donut centre content: defaults to the formatted total and "Total". Pass `null` to hide. */
  centerLabel?: { value: React.ReactNode; label?: React.ReactNode } | null
  valueFormat?: ValueFormat
  /** Show the legend. Default `true`. */
  showLegend?: boolean
  /** Column header for slice names in the data table. */
  nameLabel?: React.ReactNode
}

export interface PieSlice {
  key: string
  name: string
  value: number
  share: number
  color: string
}

/** Slices with their share of the total and a colour. Non-numeric values count as 0. */
export function pieSlices(data: ChartDatum[], nameKey: string, valueKey: string, config: ChartConfig = {}): PieSlice[] {
  const values = data.map((d) => Math.max(0, numericValue(d, valueKey) ?? 0))
  const total = values.reduce((a, b) => a + b, 0)
  return data.map((datum, index) => {
    const name = String(datum[nameKey] ?? "")
    const entry = config[name]
    const value = values[index]!
    return {
      key: `slice-${index}`,
      name: nodeText(entry?.label, name),
      value,
      share: total ? value / total : 0,
      color: entry?.color ?? chartColor(index),
    }
  })
}

/**
 * Pie or donut chart on shadcn's chart (Recharts), with a centre total, a legend,
 * share percentages in the data table, and slices that run counter-clockwise in RTL.
 */
export function PieChart({
  data,
  nameKey = "name",
  valueKey = "value",
  config,
  variant = "pie",
  centerLabel,
  valueFormat = "number",
  showLegend = true,
  nameLabel,
  animate,
  height = 300,
  classNames,
  ...frameProps
}: PieChartProps) {
  const { t, dir } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const isAnimationActive = useChartAnimation(animate)
  const trigger = useTooltipTrigger()
  const slices = React.useMemo(() => pieSlices(data, nameKey, valueKey, config), [data, nameKey, valueKey, config])
  const total = slices.reduce((a, s) => a + s.value, 0)
  const donut = variant === "donut"
  const rtl = dir === "rtl"

  const chartConfig = React.useMemo<ChartConfig>(
    () => Object.fromEntries(slices.map((s) => [s.key, { label: s.name, color: s.color }])),
    [slices],
  )
  const pieData = slices.map((s) => ({ __key: s.key, name: s.name, value: s.value, fill: `var(--color-${s.key})` }))

  const largest = slices.reduce<PieSlice | undefined>((max, s) => (!max || s.value > max.value ? s : max), undefined)
  const summary = largest
    ? t("chart.pieSummary", {
        type: t(donut ? "chart.typeDonut" : "chart.typePie"),
        count: slices.length,
        total: fmt.value(total),
        name: largest.name,
        value: fmt.value(largest.value),
        percent: fmt.percent(largest.share),
      })
    : ""

  const table = {
    columns: [nameLabel ?? t("chart.category"), t("chart.value"), t("chart.share")],
    rows: slices.map((s) => ({ key: s.key, header: s.name, cells: [fmt.value(s.value), fmt.percent(s.share)] })),
  }

  const center = centerLabel === undefined ? { value: fmt.value(total), label: t("chart.total") } : centerLabel

  return (
    <ChartFrame
      {...frameProps}
      dataSlot="pie-chart"
      height={height}
      classNames={classNames}
      autoSummary={summary}
      table={table}
      isEmpty={!slices.length || total === 0}
    >
      {({ titleId, summaryId }) => (
        <ChartContainer
          config={chartConfig}
          data-variant={variant}
          className={cn("aspect-auto w-full", SVG_LTR, classNames?.chart)}
          style={{ height }}
        >
          <RechartsPieChart accessibilityLayer aria-labelledby={titleId} aria-describedby={summaryId}>
            <ChartTooltip
              trigger={trigger}
              content={
                <ChartTooltipContent
                  hideLabel
                  nameKey="__key"
                  valueFormatter={(value) => (typeof value === "number" ? fmt.value(value) : String(value))}
                />
              }
            />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              // Clockwise from 12 o'clock in LTR, counter-clockwise in RTL (R11.6).
              startAngle={90}
              endAngle={rtl ? 450 : -270}
              innerRadius={donut ? "60%" : 0}
              outerRadius="80%"
              strokeWidth={2}
              stroke="var(--background)"
              isAnimationActive={isAnimationActive}
            >
              {donut && center ? (
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox)) return null
                    const { cx, cy } = viewBox as { cx: number; cy: number }
                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" data-slot="pie-center-label">
                        <tspan x={cx} y={cy} className="text-2xl font-semibold fill-foreground tabular-nums">
                          {center.value}
                        </tspan>
                        {center.label ? (
                          <tspan x={cx} y={cy + 22} className="text-xs fill-muted-foreground">
                            {center.label}
                          </tspan>
                        ) : null}
                      </text>
                    )
                  }}
                />
              ) : null}
            </Pie>
            {showLegend ? (
              <ChartLegend
                itemSorter={null}
                content={<ChartLegendContent nameKey="__key" className="gap-x-4 gap-y-1 flex-wrap" />}
              />
            ) : null}
          </RechartsPieChart>
        </ChartContainer>
      )}
    </ChartFrame>
  )
}
