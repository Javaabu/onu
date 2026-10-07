"use client"

import * as React from "react"

import type { Translate } from "../../i18n/types"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { toHijri, type HijriParts } from "./_hijri"
import { DEFAULT_DATE_FORMAT, formatDate, pad2, toISODate } from "./_utils"

export { addHijriMonths, fromHijri, hijriDaysInMonth, toHijri, type HijriParts } from "./_hijri"

export type HijriFormat = "long" | "short" | "month-year" | "numeric"

/** Localised Hijri month name, 1 = Muharram … 12 = Dhu al-Hijjah. */
export function hijriMonthName(t: Translate, month: number) {
  return t(`date.hijriMonth${month}`)
}

/**
 * Formats Hijri parts: `long` "23 Ramadan 1447 AH", `short` "23 Ramadan 1447",
 * `month-year` "Ramadan 1447", `numeric` "23/09/1447".
 */
export function formatHijriParts(parts: HijriParts, t: Translate, format: HijriFormat = "long") {
  switch (format) {
    case "numeric":
      return `${pad2(parts.day)}/${pad2(parts.month)}/${parts.year}`
    case "month-year":
      return `${hijriMonthName(t, parts.month)} ${parts.year}`
    case "short":
      return `${parts.day} ${hijriMonthName(t, parts.month)} ${parts.year}`
    default:
      return `${parts.day} ${hijriMonthName(t, parts.month)} ${parts.year} ${t("date.hijriEra")}`
  }
}

/** `(date, format?) => string` for the active locale (Dhivehi month names in `dv`). */
export function useHijriFormatter() {
  const { t } = useOnu()
  return React.useCallback((date: Date, format?: HijriFormat) => formatHijriParts(toHijri(date), t, format), [t])
}

export interface HijriDateProps extends Omit<React.ComponentProps<"time">, "children" | "dateTime"> {
  /** The (Gregorian) date to show in the Hijri calendar. */
  date: Date
  format?: HijriFormat
  /** Also show the Gregorian date. */
  showGregorian?: boolean
  /** date-fns format for the Gregorian date. Default `dd/MM/yyyy`. */
  gregorianFormat?: string
  classNames?: { hijri?: string; gregorian?: string }
}

/**
 * Shows a date in the Umm al-Qura Hijri calendar, e.g. "23 Ramadan 1447 AH"
 * (R12.5). Month names are localised; the `<time>` element carries the ISO date.
 */
export function HijriDate({
  date,
  format = "long",
  showGregorian = false,
  gregorianFormat = DEFAULT_DATE_FORMAT,
  className,
  classNames,
  ...props
}: HijriDateProps) {
  const { t, locale } = useOnu()
  return (
    <time data-slot="hijri-date" dateTime={toISODate(date)} className={cn("tabular-nums", className)} {...props}>
      <span className={classNames?.hijri}>{formatHijriParts(toHijri(date), t, format)}</span>
      {showGregorian ? (
        <span className={cn("ms-1 text-muted-foreground", classNames?.gregorian)}>
          ({formatDate(date, gregorianFormat, locale.dateFns)})
        </span>
      ) : null}
    </time>
  )
}
