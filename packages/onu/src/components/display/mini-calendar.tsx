"use client"

import * as React from "react"
import { format as formatDate } from "date-fns"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { Calendar, CalendarDayButton } from "../../ui/calendar"
import { toDate, type DateInput } from "./_utils"
import { ConditionalLink } from "./conditional-link"
import { registerEnglish } from "../../i18n/english"
import { display as en_display } from "../../locales/en/display"

registerEnglish({ display: en_display })

export type MiniCalendarEventTone = "primary" | "success" | "warning" | "destructive" | "info" | "muted"

export interface MiniCalendarEvent {
  id?: string | number
  date: DateInput
  title: React.ReactNode
  tone?: MiniCalendarEventTone
  /** Link for the event in the day list. */
  href?: string
}

const DOT: Record<MiniCalendarEventTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  muted: "bg-muted-foreground",
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export interface MiniCalendarProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  events?: MiniCalendarEvent[]
  /** Month shown first (controlled with `onMonthChange`). Default: the current month. */
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  /** Called when a day is clicked, with that day's events. */
  onDayClick?: (date: Date, events: MiniCalendarEvent[]) => void
  /** List the clicked day's events under the calendar. Default `true`. */
  showEventList?: boolean
  /** Up to this many dots per day. Default 3. */
  maxDots?: number
  classNames?: { calendar?: string; list?: string; dot?: string }
}

/**
 * A compact, read-only month calendar with event dots, for portal sidebars and
 * dashboards ("Upcoming events"). Built on shadcn's `Calendar`. Not a date
 * picker: clicking a day lists its events.
 */
export function MiniCalendar({
  events = [],
  month,
  defaultMonth,
  onMonthChange,
  onDayClick,
  showEventList = true,
  maxDots = 3,
  className,
  classNames,
  ...props
}: MiniCalendarProps) {
  const { locale, t, dir } = useOnu()
  const [active, setActive] = React.useState<Date | undefined>(undefined)

  const byDay = React.useMemo(() => {
    const map = new Map<string, MiniCalendarEvent[]>()
    for (const event of events) {
      const date = toDate(event.date)
      if (!date) continue
      const key = dayKey(date)
      map.set(key, [...(map.get(key) ?? []), event])
    }
    return map
  }, [events])

  const eventDays = React.useMemo(
    () => events.map((e) => toDate(e.date)).filter((d): d is Date => d !== null),
    [events],
  )
  const activeEvents = active ? (byDay.get(dayKey(active)) ?? []) : []

  return (
    <div data-slot="mini-calendar" className={cn("gap-3 inline-grid", className)} {...props}>
      <Calendar
        mode="single"
        selected={active}
        onSelect={(date) => {
          const day = date ?? active
          setActive(date)
          if (day) onDayClick?.(day, byDay.get(dayKey(day)) ?? [])
        }}
        month={month}
        defaultMonth={defaultMonth}
        onMonthChange={onMonthChange}
        locale={locale.dateFns}
        weekStartsOn={locale.weekStartsOn}
        dir={dir}
        modifiers={{ hasEvents: eventDays }}
        labels={{
          labelDayButton: (date, modifiers) => {
            const count = byDay.get(dayKey(date))?.length ?? 0
            const label = formatDate(date, "PPPP", { locale: locale.dateFns })
            return count || modifiers.today ? `${label}, ${t("display.events", { count })}` : label
          },
        }}
        className={cn("rounded-lg border", classNames?.calendar)}
        components={{
          // shadcn's calendar already rotates the nav chevrons in RTL, so don't mirror them again.
          Chevron: ({ orientation, className }) => (
            <Icon
              name={
                orientation === "left" ? "chevron-left" : orientation === "right" ? "chevron-right" : "chevron-down"
              }
              flip={false}
              className={cn("size-4", className)}
            />
          ),
          DayButton: ({ children, ...dayProps }) => {
            const dayEvents = byDay.get(dayKey(dayProps.day.date)) ?? []
            return (
              <CalendarDayButton locale={locale.dateFns} {...dayProps}>
                {children}
                <span aria-hidden className="gap-0.5 h-1 flex justify-center opacity-100!">
                  {dayEvents.slice(0, maxDots).map((event, i) => (
                    <span
                      key={event.id ?? i}
                      data-slot="mini-calendar-dot"
                      className={cn("size-1 rounded-full", DOT[event.tone ?? "primary"], classNames?.dot)}
                    />
                  ))}
                </span>
              </CalendarDayButton>
            )
          },
        }}
      />
      {showEventList && active ? (
        <div aria-live="polite" data-slot="mini-calendar-events" className={cn("gap-1 text-sm grid", classNames?.list)}>
          <p className="font-medium">
            {t("display.eventsOn", { date: formatDate(active, "PPP", { locale: locale.dateFns }) })}
          </p>
          {activeEvents.length ? (
            <ul className="gap-1 grid">
              {activeEvents.map((event, i) => (
                <li key={event.id ?? i} className="gap-2 flex items-center">
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[event.tone ?? "primary"])} />
                  <ConditionalLink href={event.href}>{event.title}</ConditionalLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t("display.events", { count: 0 })}</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
