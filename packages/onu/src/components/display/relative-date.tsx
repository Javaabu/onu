"use client"

import * as React from "react"
import { format as formatDate, formatDistanceStrict } from "date-fns"

import { useNoHover } from "../../hooks/use-media-query"
import type { OnuLocale, Translate } from "../../i18n/types"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip"
import { toDate, useNow, type DateInput } from "./_utils"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ common: en_common, display: en_display })

/** Below this many seconds either side of now, the date reads "just now". */
const JUST_NOW_SECONDS = 45

/**
 * Relative wording for a date ("just now", "5 minutes ago", "in 2 hours") in
 * the locale's language, using its date-fns `formatDistance`.
 */
export function formatRelativeDate(date: Date, now: Date | number, locale: OnuLocale, t: Translate): string {
  const seconds = (date.getTime() - Number(now)) / 1000
  if (Math.abs(seconds) < JUST_NOW_SECONDS) return t("display.justNow")
  return formatDistanceStrict(date, now, { addSuffix: true, locale: locale.dateFns, roundingMethod: "round" })
}

/** How often to refresh: often for recent dates, rarely for old ones. */
export function autoUpdateInterval(date: Date, now: number): number {
  const seconds = Math.abs(date.getTime() - now) / 1000
  if (seconds < 60) return 10_000
  if (seconds < 3600) return 30_000
  if (seconds < 86_400) return 300_000
  return 3_600_000
}

export interface RelativeDateProps extends Omit<React.ComponentProps<"time">, "children" | "dateTime"> {
  /** The date: a `Date`, ISO string or timestamp. Empty values show "—". */
  value: DateInput
  /** Reference time. Defaults to the current time, which keeps updating. */
  now?: DateInput
  /** Refresh interval in ms, or `false` to never refresh. Default: automatic. */
  updateInterval?: number | false
  /** date-fns format for the exact date and time. Default `"PPPp"` (e.g. "October 7th, 2026 at 3:04 PM"). */
  format?: string
  /** Show the exact date in a tooltip (or underneath on touch screens). Default `true`. */
  showExact?: boolean
  /** Delay before the tooltip opens on hover, in ms. Default 300. */
  tooltipDelay?: number
  classNames?: { exact?: string; tooltip?: string; empty?: string }
}

/**
 * A date shown relative to now, such as "5 minutes ago" or "in 2 hours"
 * (REQUIREMENTS §25.5). Hovering or focusing it shows the exact date and time;
 * on touch screens the exact date is shown underneath instead. It keeps itself
 * up to date and renders a semantic `<time dateTime>`.
 */
export function RelativeDate({
  value,
  now: nowProp,
  updateInterval,
  format = "PPPp",
  showExact = true,
  tooltipDelay = 300,
  className,
  classNames,
  ...props
}: RelativeDateProps) {
  const { t, locale } = useTranslation()
  const noHover = useNoHover()
  const date = toDate(value)
  const fixedNow = toDate(nowProp)
  const [interval, setIntervalMs] = React.useState<number | null>(null)
  const liveNow = useNow(fixedNow || updateInterval === false || !date ? null : interval)
  const now = fixedNow?.getTime() ?? liveNow

  const nextInterval =
    date && !fixedNow && updateInterval !== false ? (updateInterval ?? autoUpdateInterval(date, now)) : null
  if (nextInterval !== interval) setIntervalMs(nextInterval)

  if (!date) {
    return (
      <span
        data-slot="relative-date"
        data-empty=""
        className={cn("text-muted-foreground", className, classNames?.empty)}
      >
        <span aria-hidden>{t("common.emptyValue")}</span>
        <span className="sr-only">{t("display.notSet")}</span>
      </span>
    )
  }

  const relative = formatRelativeDate(date, now, locale, t)
  const exact = formatDate(date, format, { locale: locale.dateFns })

  if (!showExact) {
    return (
      <time data-slot="relative-date" dateTime={date.toISOString()} title={exact} className={className} {...props}>
        {relative}
      </time>
    )
  }

  if (noHover) {
    return (
      <span data-slot="relative-date" data-touch="" className={cn("inline-flex flex-col", className)}>
        <time dateTime={date.toISOString()} {...props}>
          {relative}
        </time>
        <span data-slot="relative-date-exact" className={cn("text-xs text-muted-foreground", classNames?.exact)}>
          {exact}
        </span>
      </span>
    )
  }

  return (
    <TooltipProvider delayDuration={tooltipDelay}>
      <Tooltip>
        <TooltipTrigger asChild>
          <time
            data-slot="relative-date"
            dateTime={date.toISOString()}
            // Focusable so keyboard users can reveal the exact date (WCAG 1.4.13, §25.5).
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className={cn(
              "rounded-sm underline decoration-muted-foreground/50 decoration-dotted underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              className,
            )}
            {...props}
          >
            {relative}
          </time>
        </TooltipTrigger>
        <TooltipContent className={classNames?.tooltip}>{exact}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
