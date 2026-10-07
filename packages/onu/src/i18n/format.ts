"use client"

import * as React from "react"
import { format as formatDateFns, isValid, parseISO } from "date-fns"

import { useOnu } from "../providers/onu-provider"

/** A date as a `Date`, a timestamp, or an ISO string (`"2026-03-12"`, `"2026-03-12T09:30:00Z"`). */
export type DateInput = Date | number | string

function toDate(value: DateInput): Date {
  return typeof value === "string" ? parseISO(value) : new Date(value)
}

const numberFormats = new Map<string, Intl.NumberFormat>()

function numberFormat(numberLocale: string, options: Intl.NumberFormatOptions) {
  const key = `${numberLocale}|${JSON.stringify(options)}`
  let formatter = numberFormats.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(numberLocale, options)
    numberFormats.set(key, formatter)
  }
  return formatter
}

/**
 * Formats dates with the active locale's date-fns locale, so Dhivehi gets
 * Dhivehi month and weekday names. Returns `(date, pattern?) => string`;
 * `pattern` is a date-fns pattern (default `"PP"`: "Mar 12, 2026" /
 * "12 މާރޗް 2026"). Invalid or missing dates give `""`.
 *
 * ```tsx
 * const formatDate = useFormatDate()
 * formatDate(application.submitted_at)            // "Mar 12, 2026"
 * formatDate(application.submitted_at, "PPP p")   // "March 12th, 2026 9:30 AM"
 * ```
 */
export function useFormatDate() {
  const { locale } = useOnu()
  const dateLocale = locale.dateFns
  const weekStartsOn = locale.weekStartsOn
  return React.useCallback(
    (date: DateInput | null | undefined, pattern = "PP"): string => {
      if (date === null || date === undefined || date === "") return ""
      const value = toDate(date)
      if (!isValid(value)) return ""
      return formatDateFns(value, pattern, { locale: dateLocale, weekStartsOn })
    },
    [dateLocale, weekStartsOn],
  )
}

/**
 * Formats numbers with `Intl.NumberFormat` and the active locale's number
 * locale (Western digits in Dhivehi, R12.6). Returns `(value, options?) => string`.
 */
export function useFormatNumber() {
  const { locale } = useOnu()
  const numberLocale = locale.numberLocale
  return React.useCallback(
    (value: number | null | undefined, options: Intl.NumberFormatOptions = {}): string =>
      value === null || value === undefined || Number.isNaN(value)
        ? ""
        : numberFormat(numberLocale, options).format(value),
    [numberLocale],
  )
}

export interface FormatCurrencyOptions {
  /** Decimal places. Default `2`. */
  decimals?: number
  /** Short form: `MVR 1.2K`. */
  compact?: boolean
}

/**
 * Formats Maldivian Rufiyaa amounts in the active locale's wording:
 * `MVR 1,250.00` in English, `ރ. 1,250.00` in Dhivehi (the `common.currency`
 * string). Returns `(value, options?) => string`.
 */
export function useFormatCurrency() {
  const { t } = useOnu()
  const formatNumber = useFormatNumber()
  return React.useCallback(
    (value: number | null | undefined, { decimals = 2, compact = false }: FormatCurrencyOptions = {}): string => {
      const amount = formatNumber(
        value,
        compact
          ? { notation: "compact", maximumFractionDigits: 1 }
          : { minimumFractionDigits: decimals, maximumFractionDigits: decimals },
      )
      // Unicode isolates keep the amount in order next to Thaana text.
      return amount ? t("common.currency", { amount: `⁨${amount}⁩` }) : ""
    },
    [formatNumber, t],
  )
}
