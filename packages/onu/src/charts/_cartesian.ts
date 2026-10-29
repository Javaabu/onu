"use client"

import * as React from "react"

import type { Translate } from "../i18n/types"
import type { ChartConfig } from "../ui/chart"
import type { ValueFormat } from "./format"
import {
  numericValue,
  seriesRange,
  type ChartBaseProps,
  type ChartComparison,
  type ChartDatum,
  type DataTableModel,
  type SeriesInfo,
} from "./_shared"
import { registerEnglish } from "../i18n/english"
import { chart as en_chart } from "../locales/en/chart"

registerEnglish({ chart: en_chart })

/** Props shared by category charts (line, area, bar). */
export interface CartesianChartProps extends ChartBaseProps {
  /** One object per category, e.g. `{ month: "Jan", revenue: 1200, expenses: 800 }`. */
  data: ChartDatum[]
  /** Series labels and colours keyed by data key (shadcn `ChartConfig`). Colours default to `--chart-1…8`. */
  config?: ChartConfig
  /** Key of the category (x) value in each datum. */
  categoryKey: string
  /** Which keys to draw. Defaults to every key in `config`. */
  series?: string[]
  /** How values are formatted in ticks, tooltips, the table and the summary. Default `"number"`. */
  valueFormat?: ValueFormat
  /** Formats category values (ticks, tooltip label, table rows). */
  categoryFormat?: (value: unknown) => string
  /** Column header for categories in the data table. */
  categoryLabel?: React.ReactNode
  /** Show the legend. Defaults to on for more than one series. */
  showLegend?: boolean
  /** Show grid lines. Default `true`. */
  showGrid?: boolean
  /**
   * Fill areas and bars with a soft gradient in the series colour. Default `true`, or the
   * nearest `ChartStyleProvider`. Solid in forced-colours mode.
   */
  gradient?: boolean
  /**
   * Compare the current period (the first series) with the previous one (`previousKey`), step by
   * step (days of the week, weeks, months): the previous period is dashed (muted bars with
   * `variant="bar"`), headline totals above the chart show the change, and the table gets a
   * "Change" column. Series are not stacked.
   */
  comparison?: ChartComparison
}

/** Screen-reader summary of a category chart: type, size and each series' range. */
export function cartesianSummary(
  t: Translate,
  type: string,
  series: SeriesInfo[],
  data: ChartDatum[],
  format: (value: number) => string,
) {
  const parts = [t("chart.summary", { type, series: series.length, count: data.length })]
  for (const s of series) {
    const range = seriesRange(data, s.key)
    if (range) parts.push(t("chart.seriesRange", { series: s.text, min: format(range.min), max: format(range.max) }))
  }
  return parts.join(" ")
}

/** Table model for a category chart: one row per category, one column per series. */
export function cartesianTable(
  t: Translate,
  data: ChartDatum[],
  categoryKey: string,
  series: SeriesInfo[],
  format: (value: number) => string,
  categoryFormat: (value: unknown) => string,
  categoryLabel: React.ReactNode,
): DataTableModel {
  return {
    columns: [categoryLabel, ...series.map((s) => s.label)],
    rows: data.map((datum, index) => ({
      key: String(index),
      header: categoryFormat(datum[categoryKey]),
      cells: series.map((s) => {
        const value = numericValue(datum, s.key)
        return value === null ? t("chart.noValue") : format(value)
      }),
    })),
  }
}

/** Default category formatter: strings as-is, numbers and dates as text. */
export function defaultCategoryFormat(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value === null || value === undefined ? "" : String(value)
}

/**
 * Axis placement for RTL (R11.6): the category axis is reversed so the last
 * category sits on the left, and the value axis moves to the start (right) side.
 */
export function rtlAxes(rtl: boolean) {
  return {
    reversed: rtl,
    valueAxisOrientation: (rtl ? "right" : "left") as "right" | "left",
  }
}
