"use client"

import * as React from "react"
import type {
  CalendarApi,
  CalendarOptions,
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin, { type DateClickArg, type EventResizeDoneArg } from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import FullCalendarBase from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { addDays, isSameMonth, isSameYear } from "date-fns"

import { DEFAULT_WEEKEND_DAYS } from "../components/date/date-calendar"
import { useControllableState } from "../components/date/_use-controllable-state"
import { formatDate } from "../components/date/_utils"
import { useIsMobile } from "../hooks/use-mobile"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import { Button } from "../ui/button"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import { fullCalendarLocale } from "./full-calendar-locale"

export type FullCalendarView = "month" | "week" | "day" | "agenda"

/** FullCalendar's view names for Onu's views. Only MIT "standard" plugins are used (R4.3). */
export const FULL_CALENDAR_VIEWS: Record<FullCalendarView, string> = {
  month: "dayGridMonth",
  week: "timeGridWeek",
  day: "timeGridDay",
  agenda: "listMonth",
}

/** Theme colours an event can use. They follow light/dark mode and `--onu-primary`. */
export type CalendarEventColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "chart-7"
  | "chart-8"

export interface CalendarEvent extends Omit<EventInput, "color"> {
  id?: string
  title: string
  start: Date | string
  end?: Date | string
  allDay?: boolean
  color?: CalendarEventColor
}

export interface FullCalendarProps {
  events?: CalendarEvent[]
  /** Current view (controlled). */
  view?: FullCalendarView
  /** Initial view. Defaults to `month`, or `agenda` on phones. */
  defaultView?: FullCalendarView
  onViewChange?: (view: FullCalendarView) => void
  /** Views offered in the switcher. */
  views?: FullCalendarView[]
  /** Date to show first. Defaults to today. */
  initialDate?: Date
  /** Called when the visible range changes. */
  onRangeChange?: (range: { start: Date; end: Date; view: FullCalendarView }) => void
  /** Allow dragging and resizing events. */
  editable?: boolean
  /** Allow selecting a range of days or times. */
  selectable?: boolean
  onDateClick?: (arg: { date: Date; allDay: boolean }) => void
  onSelect?: (arg: { start: Date; end: Date; allDay: boolean }) => void
  onEventClick?: (arg: EventClickArg) => void
  /** An event was dragged to a new time. Call `arg.revert()` to undo. */
  onEventDrop?: (arg: EventDropArg) => void
  /** An event was resized. Call `arg.revert()` to undo. */
  onEventResize?: (arg: EventResizeDoneArg) => void
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Weekend days (0 = Sunday), shaded. Defaults to Friday and Saturday. */
  weekendDays?: number[]
  hourCycle?: 12 | 24
  /** Height of the calendar: `"auto"` (default), a CSS length or pixels. */
  height?: CalendarOptions["height"]
  /** Hide Onu's toolbar (e.g. to build your own with `apiRef`). */
  hideToolbar?: boolean
  /** Any other FullCalendar option. Onu's props win over these. */
  options?: CalendarOptions
  /** Receives FullCalendar's API (navigation, adding events, …). */
  apiRef?: React.Ref<CalendarApi | null>
  /** Pins "today" (tests, demos). */
  today?: Date
  className?: string
  classNames?: { toolbar?: string; title?: string; calendar?: string }
  ref?: React.Ref<HTMLDivElement>
}

const COLOR_VARS: Record<CalendarEventColor, [string, string]> = {
  primary: ["var(--primary)", "var(--primary-foreground)"],
  secondary: ["var(--secondary)", "var(--secondary-foreground)"],
  success: ["var(--success)", "var(--success-foreground)"],
  warning: ["var(--warning)", "var(--warning-foreground)"],
  destructive: ["var(--destructive)", "var(--destructive-foreground)"],
  info: ["var(--info)", "var(--info-foreground)"],
  "chart-1": ["color-mix(in oklab, var(--chart-1) 22%, var(--background))", "var(--foreground)"],
  "chart-2": ["color-mix(in oklab, var(--chart-2) 22%, var(--background))", "var(--foreground)"],
  "chart-3": ["color-mix(in oklab, var(--chart-3) 22%, var(--background))", "var(--foreground)"],
  "chart-4": ["color-mix(in oklab, var(--chart-4) 22%, var(--background))", "var(--foreground)"],
  "chart-5": ["color-mix(in oklab, var(--chart-5) 22%, var(--background))", "var(--foreground)"],
  "chart-6": ["color-mix(in oklab, var(--chart-6) 22%, var(--background))", "var(--foreground)"],
  "chart-7": ["color-mix(in oklab, var(--chart-7) 22%, var(--background))", "var(--foreground)"],
  "chart-8": ["color-mix(in oklab, var(--chart-8) 22%, var(--background))", "var(--foreground)"],
}

/** Maps an Onu event onto FullCalendar's input, resolving theme colours. */
export function toEventInput({ color, ...event }: CalendarEvent): EventInput {
  if (!color) return event
  const [bg, fg] = COLOR_VARS[color]
  return { backgroundColor: bg, borderColor: bg, textColor: fg, ...event, classNames: [`onu-event-${color}`] }
}

/** Visible-range title: "March 2026", "8 – 14 Mar 2026", "Thursday, 12 March 2026". */
export function rangeTitle(view: FullCalendarView, start: Date, end: Date, locale: import("date-fns").Locale) {
  const last = addDays(end, -1)
  if (view === "day") return formatDate(start, "EEEE, d MMMM yyyy", locale)
  if (view === "week") {
    if (isSameMonth(start, last)) return `${formatDate(start, "d", locale)} – ${formatDate(last, "d MMM yyyy", locale)}`
    if (isSameYear(start, last))
      return `${formatDate(start, "d MMM", locale)} – ${formatDate(last, "d MMM yyyy", locale)}`
    return `${formatDate(start, "d MMM yyyy", locale)} – ${formatDate(last, "d MMM yyyy", locale)}`
  }
  return formatDate(start, "LLLL yyyy", locale)
}

/** Theme FullCalendar with Onu tokens: borders, surfaces, today, events, light and dark. */
const THEME = [
  "[--fc-border-color:var(--border)] [--fc-page-bg-color:var(--background)]",
  "[--fc-neutral-bg-color:var(--muted)] [--fc-neutral-text-color:var(--muted-foreground)]",
  "[--fc-today-bg-color:color-mix(in_oklch,var(--primary)_8%,transparent)]",
  "[--fc-highlight-color:color-mix(in_oklch,var(--primary)_18%,transparent)]",
  "[--fc-non-business-color:color-mix(in_oklch,var(--muted)_60%,transparent)]",
  "[--fc-event-bg-color:var(--primary)] [--fc-event-border-color:var(--primary)] [--fc-event-text-color:var(--primary-foreground)]",
  "[--fc-event-selected-overlay-color:color-mix(in_oklch,var(--foreground)_20%,transparent)]",
  "[--fc-now-indicator-color:var(--destructive)] [--fc-list-event-hover-bg-color:var(--muted)]",
  "[--fc-more-link-bg-color:var(--muted)] [--fc-more-link-text-color:var(--foreground)]",
  "[--fc-small-font-size:0.75rem]",
  "[&_.fc]:font-sans [&_.fc]:text-sm [&_.fc]:text-foreground",
  "[&_.fc_a]:text-inherit [&_.fc_a]:no-underline",
  "[&_.fc-scrollgrid]:overflow-hidden [&_.fc-scrollgrid]:rounded-lg",
  "[&_.fc-col-header-cell]:py-1.5 [&_.fc-col-header-cell]:text-xs [&_.fc-col-header-cell]:font-medium [&_.fc-col-header-cell]:text-muted-foreground",
  "[&_.fc-daygrid-day-number]:p-1.5 [&_.fc-daygrid-day-number]:text-xs [&_.fc-daygrid-day-number]:tabular-nums",
  "[&_.fc-day-today_.fc-daygrid-day-number]:m-1 [&_.fc-day-today_.fc-daygrid-day-number]:rounded-full [&_.fc-day-today_.fc-daygrid-day-number]:bg-primary [&_.fc-day-today_.fc-daygrid-day-number]:text-primary-foreground [&_.fc-day-today_.fc-daygrid-day-number]:font-semibold",
  "[&_.fc-day-other]:text-muted-foreground",
  // FullCalendar dims other-month day numbers to 30% opacity, which fails contrast.
  "[&_.fc-day-other_.fc-daygrid-day-top]:opacity-100!",
  "[&_.onu-weekend]:bg-muted/40",
  "[&_.fc-event]:rounded-md [&_.fc-event]:px-1 [&_.fc-event]:text-xs [&_.fc-event]:shadow-none",
  "[&_.fc-event:focus-visible]:outline-none [&_.fc-event:focus-visible]:ring-3 [&_.fc-event:focus-visible]:ring-ring/50",
  // Narrow day cells on phones: events clip inside their own cell instead of spilling into the next one.
  "[&_.fc-daygrid-event]:overflow-hidden",
  "[&_.fc-daygrid-dot-event]:text-foreground [&_.fc-daygrid-dot-event:hover]:bg-muted",
  "[&_.fc-timegrid-slot]:h-10 [&_.fc-timegrid-slot-label]:text-xs [&_.fc-timegrid-slot-label]:text-muted-foreground",
  "[&_.fc-list]:rounded-lg [&_.fc-list-day-cushion]:bg-muted/60 [&_.fc-list-event-time]:tabular-nums",
  // The agenda's visually hidden header sits at `left: -10000px`. In RTL that is the
  // scrollable side, so it made the list (and the page) over 10,000px wide. Hide it in place.
  "[&_.fc-list-table_thead]:sr-only [&_.fc-list-table_thead]:inset-x-auto!",
  "[&_.fc-popover]:rounded-lg [&_.fc-popover]:border-border [&_.fc-popover]:bg-popover [&_.fc-popover]:text-popover-foreground [&_.fc-popover]:shadow-md",
  "[&_.fc-popover-header]:bg-muted [&_.fc-list-empty]:bg-transparent [&_.fc-list-empty]:text-muted-foreground",
].join(" ")

/**
 * A full calendar (month, week, day and agenda) on FullCalendar's MIT plugins,
 * themed with Onu tokens, RTL-aware, translated (Dhivehi included) and with a
 * responsive toolbar. Import from `@javaabu/onu/calendar`.
 */
export function FullCalendar({
  events,
  view: viewProp,
  defaultView,
  onViewChange,
  views = ["month", "week", "day", "agenda"],
  initialDate,
  onRangeChange,
  editable = false,
  selectable = false,
  onDateClick,
  onSelect,
  onEventClick,
  onEventDrop,
  onEventResize,
  weekStartsOn,
  weekendDays = DEFAULT_WEEKEND_DAYS,
  hourCycle,
  height = "auto",
  hideToolbar = false,
  options,
  apiRef,
  today,
  className,
  classNames,
  ref,
}: FullCalendarProps) {
  const { locale, dir, t } = useOnu()
  const isMobile = useIsMobile()
  const calendarRef = React.useRef<FullCalendarBase>(null)
  const [view, setView] = useControllableState<FullCalendarView>(
    viewProp,
    defaultView ?? (isMobile ? "agenda" : "month"),
    onViewChange,
  )
  const [range, setRange] = React.useState<{ start: Date; end: Date } | null>(null)

  const fcLocale = React.useMemo(
    () => fullCalendarLocale(locale, { weekStartsOn, hourCycle }),
    [locale, weekStartsOn, hourCycle],
  )
  const fcEvents = React.useMemo(() => (events ?? []).map(toEventInput), [events])

  React.useImperativeHandle<CalendarApi | null, CalendarApi | null>(
    apiRef,
    () => calendarRef.current?.getApi() ?? null,
    [],
  )

  // Keep FullCalendar in step with a controlled `view`.
  React.useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (api && api.view.type !== FULL_CALENDAR_VIEWS[view]) api.changeView(FULL_CALENDAR_VIEWS[view])
  }, [view])

  const api = () => calendarRef.current?.getApi()
  const title = range ? rangeTitle(view, range.start, range.end, locale.dateFns) : ""

  const onDatesSet = (arg: DatesSetArg) => {
    // The title follows the period itself (`currentStart`), not the padded grid (`start`).
    setRange({ start: arg.view.currentStart, end: arg.view.currentEnd })
    const current = (Object.keys(FULL_CALENDAR_VIEWS) as FullCalendarView[]).find(
      (k) => FULL_CALENDAR_VIEWS[k] === arg.view.type,
    )
    onRangeChange?.({ start: arg.start, end: arg.end, view: current ?? view })
  }

  return (
    <div
      ref={ref}
      data-slot="full-calendar"
      data-view={view}
      className={cn("gap-3 min-w-0 @container/full-calendar flex w-full flex-col", className)}
    >
      {hideToolbar ? null : (
        <div
          data-slot="full-calendar-toolbar"
          className={cn(
            "gap-2 @2xl/full-calendar:flex-nowrap flex flex-wrap items-center justify-between",
            classNames?.toolbar,
          )}
        >
          <div className="gap-1 flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="touch:size-11"
              aria-label={t("date.previousPeriod")}
              onClick={() => api()?.prev()}
            >
              <Icon name="chevron-left" />
            </Button>
            <Button variant="outline" className="touch:h-11" onClick={() => api()?.today()}>
              {t("date.today")}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="touch:size-11"
              aria-label={t("date.nextPeriod")}
              onClick={() => api()?.next()}
            >
              <Icon name="chevron-right" />
            </Button>
          </div>
          <h2
            data-slot="full-calendar-title"
            aria-live="polite"
            className={cn(
              "text-base font-semibold @2xl/full-calendar:order-none @2xl/full-calendar:w-auto order-last w-full text-center",
              classNames?.title,
            )}
          >
            {title}
          </h2>
          {views.length > 1 ? (
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={0}
              value={view}
              onValueChange={(next) => next && setView(next as FullCalendarView)}
              aria-label={t("date.calendarView")}
            >
              {views.map((v) => (
                <ToggleGroupItem key={v} value={v} className="px-3 touch:h-11">
                  {t(`date.${v}View`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : null}
        </div>
      )}
      <div data-slot="full-calendar-body" className={cn("min-w-0", THEME, classNames?.calendar)}>
        <FullCalendarBase
          {...options}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, ...(options?.plugins ?? [])]}
          initialView={FULL_CALENDAR_VIEWS[view]}
          initialDate={initialDate}
          now={today}
          headerToolbar={false}
          locale={fcLocale}
          direction={dir}
          height={height}
          events={fcEvents}
          editable={editable}
          selectable={selectable}
          selectMirror={selectable}
          eventInteractive={!!onEventClick}
          nowIndicator
          dayMaxEvents={options?.dayMaxEvents ?? true}
          navLinks={options?.navLinks ?? views.includes("day")}
          navLinkDayClick={(date) => {
            api()?.changeView(FULL_CALENDAR_VIEWS.day, date)
            setView("day")
          }}
          dayCellClassNames={(arg) => (weekendDays.includes(arg.date.getDay()) ? ["onu-weekend"] : [])}
          datesSet={onDatesSet}
          dateClick={
            onDateClick ? (arg: DateClickArg) => onDateClick({ date: arg.date, allDay: arg.allDay }) : undefined
          }
          select={
            onSelect
              ? (arg: DateSelectArg) => onSelect({ start: arg.start, end: arg.end, allDay: arg.allDay })
              : undefined
          }
          eventClick={onEventClick}
          eventDrop={onEventDrop}
          eventResize={onEventResize}
        />
      </div>
    </div>
  )
}
