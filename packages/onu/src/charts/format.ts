import * as React from "react"

import { useOnu } from "../providers/onu-provider"
import { registerEnglish } from "../i18n/english"
import { chart as en_chart } from "../locales/en/chart"

registerEnglish({ chart: en_chart })

/**
 * How a chart formats its values.
 * - `"number"`: grouped number (`12,345.6`)
 * - `"integer"`: rounded grouped number
 * - `"compact"`: short form (`12K`, `1.2M`)
 * - `"percent"`: value is a ratio (`0.25` → `25%`)
 * - `"currency"`: Maldivian Rufiyaa via the locale (`MVR 1,250.00`, `ރ. 1,250.00`)
 * - `Intl.NumberFormatOptions` or a function for anything else.
 */
export type ValueFormat =
  "number" | "integer" | "compact" | "percent" | "currency" | Intl.NumberFormatOptions | ((value: number) => string)

const PRESETS: Record<
  Exclude<ValueFormat, object | ((value: number) => string) | "currency">,
  Intl.NumberFormatOptions
> = {
  number: { maximumFractionDigits: 2 },
  integer: { maximumFractionDigits: 0 },
  compact: { notation: "compact", maximumFractionDigits: 1 },
  percent: { style: "percent", maximumFractionDigits: 1 },
}

const formatterCache = new Map<string, Intl.NumberFormat>()

function numberFormat(numberLocale: string, options: Intl.NumberFormatOptions) {
  const key = `${numberLocale}|${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(numberLocale, options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

/** Formats a number with `Intl.NumberFormat` and the given locale. */
export function formatNumber(value: number, numberLocale = "en", options: Intl.NumberFormatOptions = {}) {
  return numberFormat(numberLocale, options).format(value)
}

/**
 * Formats an amount in Maldivian Rufiyaa as `MVR 1,250.00`.
 * Inside components prefer `useChartFormat("currency")`, which uses the active locale's wording (`ރ. 1,250.00` in Dhivehi).
 */
export function formatMVR(
  value: number,
  numberLocale = "en",
  { decimals = 2, compact = false }: { decimals?: number; compact?: boolean } = {},
) {
  const amount = formatNumber(
    value,
    numberLocale,
    compact
      ? { notation: "compact", maximumFractionDigits: 1 }
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals },
  )
  return `MVR ${amount}`
}

/** Formats a value with a `ValueFormat`. `currencyTemplate` wraps the amount for `"currency"` (default `MVR {amount}`). */
export function formatValue(
  value: number | null | undefined,
  format: ValueFormat = "number",
  numberLocale = "en",
  currencyTemplate: (amount: string) => string = (amount) => `MVR ${amount}`,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return ""
  if (typeof format === "function") return format(value)
  if (format === "currency") {
    return currencyTemplate(formatNumber(value, numberLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  }
  const options = typeof format === "string" ? PRESETS[format] : format
  return formatNumber(value, numberLocale, options)
}

/** A short axis-tick variant of a format: currency and plain numbers become compact. */
export function axisFormat(format: ValueFormat = "number"): ValueFormat {
  if (format === "number" || format === "integer") return "compact"
  return format
}

export type DeltaDirection = "up" | "down" | "flat"

export interface Delta {
  /** `current - previous`. */
  change: number
  /** Relative change as a ratio (`0.12` = +12%), or `null` when the previous value is 0. */
  ratio: number | null
  direction: DeltaDirection
}

/** Change between two values. Values within `epsilon` count as flat. */
export function computeDelta(current: number, previous: number, epsilon = 1e-9): Delta {
  const change = current - previous
  const ratio = previous === 0 ? null : change / Math.abs(previous)
  const direction: DeltaDirection = Math.abs(change) <= epsilon ? "flat" : change > 0 ? "up" : "down"
  return { change, ratio, direction }
}

/** Whether a delta is good, bad or neutral, given whether "up" is good. */
export function deltaSentiment(direction: DeltaDirection, positiveIsGood = true): "positive" | "negative" | "neutral" {
  if (direction === "flat") return "neutral"
  return (direction === "up") === positiveIsGood ? "positive" : "negative"
}

/** Total, average or last value of a list (nulls skipped). */
export function aggregate(values: (number | null | undefined)[], mode: "sum" | "average" | "last" = "sum"): number {
  const nums = values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v))
  if (!nums.length) return 0
  if (mode === "last") return nums[nums.length - 1]!
  const sum = nums.reduce((a, b) => a + b, 0)
  return mode === "average" ? sum / nums.length : sum
}

/**
 * Locale-aware formatters for charts: numbers use `useOnu().locale.numberLocale`,
 * and `"currency"` uses the locale's MVR wording.
 */
export function useChartFormat(format: ValueFormat = "number") {
  const { locale, t } = useOnu()
  const numberLocale = locale.numberLocale
  return React.useMemo(() => {
    // The amount is wrapped in Unicode isolates so it keeps its order next to Thaana text ("ރ. 1,250.00").
    const currency = (amount: string) => t("chart.currency", { amount: `\u2068${amount}\u2069` })
    return {
      numberLocale,
      /** Formats a value with the chart's format. */
      value: (value: number | null | undefined) => formatValue(value, format, numberLocale, currency),
      /** Short form for axis ticks. */
      axis: (value: number) =>
        format === "currency"
          ? currency(formatNumber(value, numberLocale, PRESETS.compact))
          : formatValue(value, axisFormat(format), numberLocale, currency),
      /** Formats a ratio as a percentage. */
      percent: (ratio: number) => formatValue(ratio, "percent", numberLocale),
      /** Formats a value with any format. */
      with: (value: number | null | undefined, other: ValueFormat) => formatValue(value, other, numberLocale, currency),
    }
  }, [format, numberLocale, t])
}
