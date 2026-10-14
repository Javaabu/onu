"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import type { Translate } from "../../i18n/types"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { toDate, useNow, type DateInput } from "./_utils"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** Total milliseconds left (0 when finished). */
  total: number
}

/** Splits the time left until `target` into days, hours, minutes and seconds. */
export function getCountdownParts(target: Date, now: number): CountdownParts {
  const total = Math.max(0, target.getTime() - now)
  const s = Math.ceil(total / 1000)
  return {
    days: Math.floor(s / 86_400),
    hours: Math.floor((s % 86_400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    total,
  }
}

/** "2 days, 3 hours, 5 minutes" for screen readers. Seconds only under a minute. */
export function describeDuration(totalSeconds: number, t: Translate): string {
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []
  if (days) parts.push(t("display.daysCount", { count: days }))
  if (hours) parts.push(t("display.hoursCount", { count: hours }))
  if (minutes) parts.push(t("display.minutesCount", { count: minutes }))
  if (totalSeconds < 60) parts.push(t("display.secondsCount", { count: seconds }))
  return parts.join(", ")
}

export const countdownVariants = cva("tabular-nums", {
  variants: {
    variant: {
      boxes: "gap-2 inline-flex flex-wrap items-stretch",
      inline: "gap-1 font-medium inline-flex items-baseline",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: { variant: "boxes", size: "md" },
})

const VALUE_SIZES = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" } as const

export interface CountdownProps
  extends Omit<React.ComponentProps<"div">, "children">, VariantProps<typeof countdownVariants> {
  /** The date and time to count down to. */
  to: DateInput
  /** Called once when the countdown reaches zero (straight away if `to` is already past). */
  onComplete?: () => void
  /** Show the days unit. `"auto"` (default) hides it when there are no days left. */
  showDays?: boolean | "auto"
  showSeconds?: boolean
  /**
   * How often screen readers hear the time left, in seconds (default 60). The
   * visible clock ticks every second but is not announced each time.
   */
  announceEvery?: number
  /** Shown when finished. Default "Time's up". */
  completeText?: React.ReactNode
  classNames?: { unit?: string; value?: string; label?: string; complete?: string }
}

/**
 * Counts down to a date: days, hours, minutes and seconds with tabular
 * numbers. Screen reader announcements are throttled (`announceEvery`) so the
 * ticking clock doesn't flood them.
 */
export function Countdown({
  to,
  onComplete,
  showDays = "auto",
  showSeconds = true,
  announceEvery = 60,
  completeText,
  variant,
  size,
  className,
  classNames,
  ...props
}: CountdownProps) {
  const { t, locale } = useTranslation()
  const target = toDate(to)
  const [done, setDone] = React.useState(false)
  const now = useNow(target && !done ? 1000 : null)
  const parts = target ? getCountdownParts(target, now) : null
  const finished = !!parts && parts.total === 0
  if (finished && !done) setDone(true)
  if (!finished && done && parts) setDone(false)

  const completeRef = React.useRef(onComplete)
  React.useEffect(() => {
    completeRef.current = onComplete
  })
  React.useEffect(() => {
    if (done) completeRef.current?.()
  }, [done])

  if (!parts) return null

  const totalSeconds = Math.ceil(parts.total / 1000)
  const step = Math.max(1, announceEvery)
  const bucket = Math.ceil(totalSeconds / step) * step
  // Announce in steps (e.g. once a minute): the text only changes when the step changes.
  const spoken = finished
    ? t("display.countdownComplete")
    : t("display.timeRemaining", { time: describeDuration(bucket, t) })

  const pad = (n: number) => new Intl.NumberFormat(locale.numberLocale, { minimumIntegerDigits: 2 }).format(n)
  const units: { key: keyof Omit<CountdownParts, "total">; label: string }[] = []
  if (showDays === true || (showDays === "auto" && parts.days > 0)) units.push({ key: "days", label: "display.days" })
  units.push({ key: "hours", label: "display.hours" }, { key: "minutes", label: "display.minutes" })
  if (showSeconds) units.push({ key: "seconds", label: "display.seconds" })
  // Without the days unit, show the full hour count (e.g. 30:00:00).
  const value = (key: keyof Omit<CountdownParts, "total">) =>
    key === "hours" && !units.some((u) => u.key === "days") ? parts.hours + parts.days * 24 : parts[key]

  return (
    <div
      data-slot="countdown"
      data-state={finished ? "complete" : "running"}
      className={cn("gap-1 inline-grid", className)}
      {...props}
    >
      <div
        role="timer"
        aria-label={t("display.countdown")}
        // A clock reads left to right (hh:mm:ss) even in RTL; the boxes follow the page direction.
        dir={variant === "inline" ? "ltr" : undefined}
        className={countdownVariants({ variant, size })}
      >
        {finished && completeText !== undefined ? (
          <span className={classNames?.complete}>{completeText}</span>
        ) : (
          units.map((unit, i) =>
            variant === "inline" ? (
              <React.Fragment key={unit.key}>
                {i > 0 ? <span aria-hidden>:</span> : null}
                <span data-unit={unit.key} className={classNames?.value}>
                  {pad(value(unit.key))}
                  <span className="sr-only"> {t(unit.label, { count: value(unit.key) })}</span>
                </span>
              </React.Fragment>
            ) : (
              <span
                key={unit.key}
                data-unit={unit.key}
                className={cn(
                  "min-w-16 px-3 py-2 flex flex-col items-center rounded-lg border bg-card text-card-foreground",
                  classNames?.unit,
                )}
              >
                <span className={cn("font-semibold leading-none", VALUE_SIZES[size ?? "md"], classNames?.value)}>
                  {pad(value(unit.key))}
                </span>
                <span className={cn("mt-1 text-xs text-muted-foreground", classNames?.label)}>
                  {t(unit.label, { count: value(unit.key) })}
                </span>
              </span>
            ),
          )
        )}
      </div>
      <div aria-live="polite" aria-atomic className="sr-only" data-slot="countdown-announcer">
        {spoken}
      </div>
    </div>
  )
}
