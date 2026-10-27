"use client"

import * as React from "react"
import {
  addMonths,
  addYears,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isSameYear,
  setMonth as setMonthOf,
  setYear,
  startOfMonth,
} from "date-fns"
import type { DateRange, Matcher, Modifiers, WeekNumberProps } from "react-day-picker"

import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { Calendar, CalendarDayButton } from "../../ui/calendar"
import { ConditionalLink } from "../display/conditional-link"
import { CalendarHeader } from "./_calendar-header"
import { PeriodGrid, type GridItem } from "./_period-grid"
import { useControllableState } from "./_use-controllable-state"
import { decadeSpanStart, formatDate, isOutOfRange, yearBlockStart, type DateRangeValue } from "./_utils"
import { registerEnglish } from "../../i18n/english"
import { date as en_date } from "../../locales/en/date"

registerEnglish({ date: en_date })

/** Zoom levels of the calendar (§25.1 "Zooming out"). */
export type CalendarView = "day" | "month" | "year" | "decade"

const ZOOM_ORDER: CalendarView[] = ["day", "month", "year", "decade"]

/** Maldivian weekend: Friday and Saturday. */
export const DEFAULT_WEEKEND_DAYS = [5, 6]

export type DateCalendarEventTone = "primary" | "success" | "warning" | "destructive" | "info" | "muted"

/** An event shown as a dot on its day. */
export interface DateCalendarEvent {
  id?: string | number
  /** A `Date`, ISO string or timestamp; invalid dates are skipped. */
  date: Date | string | number
  title: React.ReactNode
  tone?: DateCalendarEventTone
  /** Link for the event in the day's event list. */
  href?: string
}

const EVENT_DOT: Record<DateCalendarEventTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  muted: "bg-muted-foreground",
}

type SelectionProps =
  | {
      /** One date (default). */
      mode?: "single"
      selected?: Date | null
      onSelect?: (date: Date) => void
    }
  | {
      /** Any number of dates. */
      mode: "multiple"
      selected?: Date[]
      onSelect?: (dates: Date[]) => void
      /** Most dates that can be picked. */
      maxSelected?: number
    }
  | {
      /** A from–to range. */
      mode: "range"
      selected?: DateRangeValue | null
      onSelect?: (range: DateRangeValue) => void
    }
  | {
      /** No built-in selection: handle `onDayClick` yourself (e.g. week picker). */
      mode: "none"
      selected?: undefined
      onSelect?: undefined
    }

export type DateCalendarProps = SelectionProps & {
  /** Earliest selectable date. */
  min?: Date
  /** Latest selectable date. */
  max?: Date
  /** Extra disabled days (react-day-picker matchers). */
  disabledDates?: Matcher | Matcher[]
  /** Displayed month (controlled). */
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  /** Zoom level (controlled). */
  view?: CalendarView
  defaultView?: CalendarView
  onViewChange?: (view: CalendarView) => void
  /** Lowest zoom level. `month` or `year` turns the calendar into a month or year picker. */
  minView?: "day" | "month" | "year"
  /** Called when a month (or year) is picked at `minView`. */
  onPeriodSelect?: (date: Date) => void
  /** Overrides the locale's first day of the week. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Days of the week styled as weekend (0 = Sunday). Defaults to Friday and Saturday. */
  weekendDays?: number[]
  showOutsideDays?: boolean
  showWeekNumber?: boolean
  /** Extra day modifiers (react-day-picker). */
  modifiers?: Record<string, Matcher | Matcher[] | undefined>
  modifiersClassNames?: Record<string, string>
  /** Called when a day is clicked, with its modifiers and its `events`. */
  onDayClick?: (date: Date, modifiers: Modifiers, events: DateCalendarEvent[]) => void
  /** Events shown as dots under their day; the day's accessible name says how many. */
  events?: DateCalendarEvent[]
  /** Most dots per day. Default 3. */
  maxDots?: number
  /**
   * Not a picker: `mode`, `selected` and `onSelect` are ignored, and clicking a
   * day highlights it and lists its `events` underneath (for sidebars and
   * dashboards, e.g. "Upcoming events").
   */
  readOnly?: boolean
  /** With `readOnly`, list the clicked day's events under the calendar. Default `true`. */
  showEventList?: boolean
  /** `sm` is a compact calendar with smaller day cells (larger again on touch screens). */
  size?: "default" | "sm"
  /** Pins "today" (tests, demos, or server time). */
  today?: Date
  /** Focus the active day (or cell) when mounted. */
  initialFocus?: boolean
  className?: string
  classNames?: {
    header?: string
    caption?: string
    nav?: string
    grid?: string
    cell?: string
    dot?: string
    eventList?: string
  }
  ref?: React.Ref<HTMLDivElement>
}

/**
 * Month calendar with zoom levels: days → months → years → ranges of years
 * (§25.1). The days view is shadcn's `Calendar` (react-day-picker); the other
 * views are accessible grids with the same keyboard model. With `events` it
 * shows event dots, and with `readOnly` it is a month view that lists the
 * clicked day's events instead of picking a date.
 */
export function DateCalendar(props: DateCalendarProps) {
  const {
    min,
    max,
    disabledDates,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    view: viewProp,
    defaultView,
    onViewChange,
    minView = "day",
    onPeriodSelect,
    weekStartsOn,
    weekendDays = DEFAULT_WEEKEND_DAYS,
    showOutsideDays = true,
    showWeekNumber,
    modifiers,
    modifiersClassNames,
    onDayClick,
    events,
    maxDots = 3,
    readOnly = false,
    showEventList = true,
    size = "default",
    today: todayProp,
    initialFocus,
    className,
    classNames,
    ref,
  } = props
  const { locale, dir, t } = useOnu()
  const today = todayProp ?? new Date()
  const anchor = readOnly ? null : selectionAnchor(props)
  const [activeDay, setActiveDay] = React.useState<Date | undefined>(undefined)

  const eventsByDay = React.useMemo(() => {
    const map = new Map<string, DateCalendarEvent[]>()
    for (const event of events ?? []) {
      const date = toValidDate(event.date)
      if (!date) continue
      const key = dayKey(date)
      map.set(key, [...(map.get(key) ?? []), event])
    }
    return map
  }, [events])
  const eventsOn = (date: Date) => eventsByDay.get(dayKey(date)) ?? []
  const eventContext = React.useMemo(
    () => (events ? { byDay: eventsByDay, maxDots, dotClassName: classNames?.dot } : null),
    [events, eventsByDay, maxDots, classNames?.dot],
  )

  const [month, setMonthState] = useControllableState(
    monthProp,
    startOfMonth(clampDate(defaultMonth ?? anchor ?? today, min, max)),
    onMonthChange,
  )
  const [view, setViewState] = useControllableState<CalendarView>(viewProp, defaultView ?? minView, onViewChange)
  const [focusGrid, setFocusGrid] = React.useState(!!initialFocus)

  const setMonth = (next: Date) => setMonthState(startOfMonth(next))
  const zoomTo = (next: CalendarView, focus: boolean) => {
    setFocusGrid(focus)
    setViewState(next)
  }

  const year = month.getFullYear()
  const blockStart = yearBlockStart(year)
  const spanStart = decadeSpanStart(year)
  const minYear = min?.getFullYear() ?? -Infinity
  const maxYear = max?.getFullYear() ?? Infinity

  const nav = {
    day: {
      prev: () => setMonth(addMonths(month, -1)),
      next: () => setMonth(addMonths(month, 1)),
      canPrev: !min || endOfMonth(addMonths(month, -1)) >= min,
      canNext: !max || addMonths(month, 1) <= max,
      prevLabel: t("date.previousMonth"),
      nextLabel: t("date.nextMonth"),
      caption: formatDate(month, "LLLL yyyy", locale.dateFns),
      zoomLabel: "date.showMonths",
    },
    month: {
      prev: () => setMonth(addYears(month, -1)),
      next: () => setMonth(addYears(month, 1)),
      canPrev: year - 1 >= minYear,
      canNext: year + 1 <= maxYear,
      prevLabel: t("date.previousYear"),
      nextLabel: t("date.nextYear"),
      caption: String(year),
      zoomLabel: "date.showYears",
    },
    year: {
      prev: () => setMonth(addYears(month, -12)),
      next: () => setMonth(addYears(month, 12)),
      canPrev: blockStart - 1 >= minYear,
      canNext: blockStart + 12 <= maxYear,
      prevLabel: t("date.previousYears", { count: 12 }),
      nextLabel: t("date.nextYears", { count: 12 }),
      caption: `${blockStart}–${blockStart + 11}`,
      zoomLabel: "date.showDecades",
    },
    decade: {
      prev: () => setMonth(addYears(month, -144)),
      next: () => setMonth(addYears(month, 144)),
      canPrev: spanStart - 1 >= minYear,
      canNext: spanStart + 144 <= maxYear,
      prevLabel: t("date.previousYears", { count: 144 }),
      nextLabel: t("date.nextYears", { count: 144 }),
      caption: `${spanStart}–${spanStart + 143}`,
      zoomLabel: "",
    },
  }[view]

  const canZoomOut = view !== "decade"
  const zoomOut = () => zoomTo(ZOOM_ORDER[ZOOM_ORDER.indexOf(view) + 1]!, false)
  const zoomIn = (target: Date) => {
    setMonth(target)
    const below = ZOOM_ORDER[ZOOM_ORDER.indexOf(view) - 1]!
    zoomTo(below, true)
  }

  const selectedDates = readOnly ? (activeDay ? [activeDay] : []) : selectedList(props)

  let body: React.ReactNode
  if (view === "day") {
    body = (
      <Calendar
        {...(readOnly ? { mode: "single", selected: activeDay, onSelect: setActiveDay } : dayPickerSelection(props))}
        month={month}
        onMonthChange={setMonth}
        hideNavigation
        startMonth={min}
        endMonth={max}
        today={today}
        // Moves focus into the calendar when a picker opens (APG dialog pattern), not on page load.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={focusGrid}
        dir={dir}
        locale={locale.dateFns}
        weekStartsOn={weekStartsOn ?? locale.weekStartsOn}
        showOutsideDays={showOutsideDays}
        showWeekNumber={showWeekNumber}
        disabled={[
          ...(min ? [{ before: min }] : []),
          ...(max ? [{ after: max }] : []),
          ...toArray(disabledDates),
          ...(!readOnly && props.mode === "multiple" && props.maxSelected && selectedDates.length >= props.maxSelected
            ? [(d: Date) => !selectedDates.some((s) => isSameDay(s, d))]
            : []),
        ]}
        modifiers={{ weekend: { dayOfWeek: weekendDays }, ...modifiers }}
        modifiersClassNames={{
          weekend: "[&:not([data-outside])]:text-destructive",
          ...modifiersClassNames,
        }}
        onDayClick={onDayClick ? (date, mods) => onDayClick(date, mods, eventsOn(date)) : undefined}
        components={CALENDAR_COMPONENTS}
        labels={{
          labelDayButton: (date, mods) => {
            const count = eventsOn(date).length
            return [
              mods.today ? t("date.today") : null,
              formatDate(date, "PPPP", locale.dateFns),
              count ? t("date.events", { count }) : null,
            ]
              .filter(Boolean)
              .join(", ")
          },
          labelGrid: (date) => formatDate(date, "LLLL yyyy", locale.dateFns),
          labelWeekNumber: (week) => t("date.weekNumber", { week }),
          labelWeekNumberHeader: () => t("date.week"),
        }}
        className={cn("p-0 bg-transparent", classNames?.grid)}
        classNames={{
          month_caption: "sr-only",
          today:
            "[&>button]:font-semibold [&>button]:underline [&>button]:underline-offset-4 [&>button]:decoration-primary [&>button]:decoration-2",
          weekday:
            "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none touch:text-sm",
          ...(classNames?.cell ? { day: classNames.cell } : {}),
        }}
      />
    )
  } else {
    const items = periodItems(view, { month, today, min, max, selectedDates, locale: locale.dateFns })
    const atBottom = view === minView
    body = (
      <PeriodGrid
        key={view}
        items={items.map((i) => i.item)}
        activeIndex={activeIndexFor(view, month, selectedDates)}
        columns={3}
        label={t(view === "month" ? "date.months" : view === "year" ? "date.years" : "date.decades")}
        initialFocus={focusGrid}
        onPage={(delta) => (delta < 0 ? nav.prev() : nav.next())}
        onSelect={(index) => {
          const target = items[index]!.date
          if (atBottom) {
            setMonth(target)
            onPeriodSelect?.(target)
          } else zoomIn(target)
        }}
        className={cn("w-[calc(var(--cell-size)*7)]", classNames?.grid)}
        cellClassName={cn("h-[calc(var(--cell-size)*1.6)]", classNames?.cell)}
      />
    )
  }

  const listEvents = readOnly && showEventList && !!events
  const activeEvents = activeDay ? eventsOn(activeDay) : []

  return (
    <div
      ref={ref}
      data-slot="date-calendar"
      data-view={view}
      data-size={size}
      className={cn(
        "p-2 gap-2 touch:[--cell-size:--spacing(11)] flex w-fit flex-col [--cell-radius:var(--radius-md)]",
        size === "sm" ? "[--cell-size:--spacing(7)]" : "[--cell-size:--spacing(9)]",
        className,
      )}
    >
      <CalendarHeader
        caption={nav.caption}
        captionLabel={canZoomOut ? t(nav.zoomLabel, { label: nav.caption }) : undefined}
        onCaptionClick={canZoomOut ? zoomOut : undefined}
        prevLabel={nav.prevLabel}
        nextLabel={nav.nextLabel}
        onPrev={nav.prev}
        onNext={nav.next}
        canPrev={nav.canPrev}
        canNext={nav.canNext}
        live={view !== "day"}
        className={classNames?.header}
        classNames={{ caption: classNames?.caption, nav: classNames?.nav }}
      />
      <EventsContext.Provider value={eventContext}>{body}</EventsContext.Provider>
      {listEvents ? (
        // Always rendered (empty until a day is clicked) so screen readers announce the first list too.
        <div
          aria-live="polite"
          data-slot="date-calendar-events"
          className={cn("gap-1 text-sm empty:-mt-2 grid max-w-[calc(var(--cell-size)*7)]", classNames?.eventList)}
        >
          {activeDay ? (
            <>
              <p className="font-medium">
                {t("date.eventsOn", { date: formatDate(activeDay, "PPP", locale.dateFns) })}
              </p>
              {activeEvents.length ? (
                <ul className="gap-1 grid">
                  {activeEvents.map((event, i) => (
                    <li key={event.id ?? i} className="gap-2 flex items-center">
                      <span
                        aria-hidden
                        className={cn("size-2 shrink-0 rounded-full", EVENT_DOT[event.tone ?? "primary"])}
                      />
                      <ConditionalLink href={event.href}>{event.title}</ConditionalLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{t("date.events", { count: 0 })}</p>
              )}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

interface EventsContextValue {
  byDay: Map<string, DateCalendarEvent[]>
  maxDots: number
  dotClassName?: string
}

const EventsContext = React.createContext<EventsContextValue | null>(null)

/** The day button, with a row of event dots when the calendar has `events`. */
function EventDayButton({ children, ...props }: React.ComponentProps<typeof CalendarDayButton>) {
  const events = React.useContext(EventsContext)
  const { locale } = useOnu()
  const dayEvents = events?.byDay.get(dayKey(props.day.date)) ?? []
  return (
    <CalendarDayButton locale={locale.dateFns} {...props}>
      {children}
      {events ? (
        <span aria-hidden className="gap-0.5 h-1 flex justify-center opacity-100!">
          {dayEvents.slice(0, events.maxDots).map((event, i) => (
            <span
              key={event.id ?? i}
              data-slot="date-calendar-dot"
              className={cn("size-1 rounded-full", EVENT_DOT[event.tone ?? "primary"], events.dotClassName)}
            />
          ))}
        </span>
      ) : null}
    </CalendarDayButton>
  )
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function toValidDate(value: Date | string | number): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Week numbers are row headers (`<th scope="row">`); shadcn renders a `<td>`, which axe rejects. */
function WeekNumberCell({ children, week: _week, ...props }: WeekNumberProps) {
  return (
    <th {...props}>
      <div className="font-normal flex size-(--cell-size) items-center justify-center text-center text-[0.8rem] text-muted-foreground">
        {children}
      </div>
    </th>
  )
}

const CALENDAR_COMPONENTS = { WeekNumber: WeekNumberCell, DayButton: EventDayButton }

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function clampDate(date: Date, min?: Date, max?: Date) {
  if (min && date < min) return min
  if (max && date > max) return max
  return date
}

function selectionAnchor(props: SelectionProps): Date | null {
  switch (props.mode) {
    case "multiple":
      return props.selected?.[0] ?? null
    case "range":
      return props.selected?.from ?? props.selected?.to ?? null
    case "none":
      return null
    default:
      return props.selected ?? null
  }
}

function selectedList(props: SelectionProps): Date[] {
  switch (props.mode) {
    case "multiple":
      return props.selected ?? []
    case "range":
      return [props.selected?.from, props.selected?.to].filter((d): d is Date => !!d)
    case "none":
      return []
    default:
      return props.selected ? [props.selected] : []
  }
}

/** Maps Onu's selection props onto react-day-picker's. */
function dayPickerSelection(props: SelectionProps): Record<string, unknown> {
  switch (props.mode) {
    case "multiple":
      return {
        mode: "multiple",
        selected: props.selected ?? [],
        max: props.maxSelected,
        onSelect: (dates: Date[] | undefined) => props.onSelect?.(dates ?? []),
      }
    case "range":
      return {
        mode: "range",
        selected: props.selected
          ? ({ from: props.selected.from ?? undefined, to: props.selected.to ?? undefined } as DateRange)
          : undefined,
        onSelect: (range: DateRange | undefined) =>
          props.onSelect?.({ from: range?.from ?? null, to: range?.to ?? null }),
      }
    case "none":
      return {}
    default:
      return {
        mode: "single",
        required: true,
        selected: props.selected ?? undefined,
        onSelect: (date: Date) => props.onSelect?.(date),
      }
  }
}

/** The cell to focus first in a zoom view: the selected one if shown, else the displayed month / year. */
function activeIndexFor(view: CalendarView, month: Date, selected: Date[]) {
  const year = month.getFullYear()
  if (view === "month") {
    const hit = selected.find((d) => d.getFullYear() === year)
    return (hit ?? month).getMonth()
  }
  if (view === "year") {
    const start = yearBlockStart(year)
    const hit = selected.find((d) => d.getFullYear() >= start && d.getFullYear() < start + 12)
    return (hit ?? month).getFullYear() - start
  }
  return Math.floor((year - decadeSpanStart(year)) / 12)
}

interface PeriodContext {
  month: Date
  today: Date
  min?: Date
  max?: Date
  selectedDates: Date[]
  locale: import("date-fns").Locale | undefined
}

function periodItems(view: CalendarView, ctx: PeriodContext): { item: GridItem; date: Date }[] {
  const year = ctx.month.getFullYear()
  if (view === "month") {
    return Array.from({ length: 12 }, (_, m) => {
      const date = setMonthOf(new Date(year, 0, 1), m)
      return {
        date,
        item: {
          key: `m${m}`,
          label: formatDate(date, "LLL", ctx.locale),
          ariaLabel: formatDate(date, "LLLL yyyy", ctx.locale),
          disabled: isOutOfRange(date, ctx.min, ctx.max, "month"),
          selected: ctx.selectedDates.some((d) => isSameMonth(d, date)),
          current: isSameMonth(ctx.today, date),
        },
      }
    })
  }
  if (view === "year") {
    const start = yearBlockStart(year)
    return Array.from({ length: 12 }, (_, i) => {
      const date = setYear(ctx.month, start + i)
      return {
        date,
        item: {
          key: `y${start + i}`,
          label: String(start + i),
          disabled: isOutOfRange(new Date(start + i, 0, 1), ctx.min, ctx.max, "year"),
          selected: ctx.selectedDates.some((d) => isSameYear(d, date)),
          current: ctx.today.getFullYear() === start + i,
        },
      }
    })
  }
  const start = decadeSpanStart(year)
  return Array.from({ length: 12 }, (_, i) => {
    const from = start + i * 12
    const to = from + 11
    const inBlock = (y: number) => y >= from && y <= to
    return {
      date: setYear(ctx.month, from + (year - yearBlockStart(year))),
      item: {
        key: `d${from}`,
        label: `${from}–${to}`,
        disabled: (!!ctx.min && to < ctx.min.getFullYear()) || (!!ctx.max && from > ctx.max.getFullYear()),
        selected: ctx.selectedDates.some((d) => inBlock(d.getFullYear())),
        current: inBlock(ctx.today.getFullYear()),
        className: "text-xs",
      },
    }
  })
}
