"use client"

import * as React from "react"
import { addDays, isSameDay } from "date-fns"

import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { DEFAULT_WEEKEND_DAYS } from "./date-calendar"
import { CalendarHeader } from "./_calendar-header"
import { addHijriMonths, fromHijri, hijriDaysInMonth, toHijri, type HijriParts } from "./_hijri"
import { PeriodGrid } from "./_period-grid"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { DEFAULT_DATE_FORMAT, formatDate, isOutOfRange, toISODate, yearBlockStart } from "./_utils"
import { formatHijriParts, hijriMonthName, type HijriFormat } from "./hijri-date"

export interface HijriCalendarProps {
  /** Selected (Gregorian) date. */
  selected?: Date | null
  onSelect?: (date: Date) => void
  min?: Date
  max?: Date
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weekendDays?: number[]
  /** Show the Gregorian day number under each Hijri day. Default true. */
  showGregorian?: boolean
  today?: Date
  initialFocus?: boolean
  className?: string
  ref?: React.Ref<HTMLDivElement>
}

type HijriView = "day" | "month" | "year"

/**
 * A month of the Umm al-Qura Hijri calendar with the same keyboard model as
 * the Gregorian calendar, zooming out to months and years.
 */
export function HijriCalendar({
  selected,
  onSelect,
  min,
  max,
  weekStartsOn: weekStartsOnProp,
  weekendDays = DEFAULT_WEEKEND_DAYS,
  showGregorian = true,
  today: todayProp,
  initialFocus,
  className,
  ref,
}: HijriCalendarProps) {
  const { locale, t, dir } = useOnu()
  const today = todayProp ?? new Date()
  const weekStartsOn = weekStartsOnProp ?? locale.weekStartsOn
  const [view, setView] = React.useState<HijriView>("day")
  const [month, setMonth] = React.useState<HijriParts>(() => ({ ...toHijri(selected ?? today), day: 1 }))
  const [focused, setFocused] = React.useState<Date>(() => selected ?? today)
  const [focusGrid, setFocusGrid] = React.useState(!!initialFocus)
  const buttons = React.useRef(new Map<string, HTMLButtonElement>())
  const pendingFocus = React.useRef(!!initialFocus)

  const first = fromHijri({ ...month, day: 1 })
  const daysInMonth = hijriDaysInMonth(month.year, month.month)
  const lead = (first.getDay() - weekStartsOn + 7) % 7
  const weeks = Math.ceil((lead + daysInMonth) / 7)
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i - lead))
  const lastDay = addDays(first, daysInMonth - 1)
  const inMonth = (d: Date) => d >= first && d <= lastDay
  const focusTarget = inMonth(focused) ? focused : selected && inMonth(selected) ? selected : first

  React.useEffect(() => {
    if (view !== "day" || !pendingFocus.current) return
    pendingFocus.current = false
    buttons.current.get(toISODate(focusTarget))?.focus()
  })

  const moveFocus = (date: Date) => {
    pendingFocus.current = true
    setFocused(date)
    if (!inMonth(date)) setMonth({ ...toHijri(date), day: 1 })
  }

  const onKeyDown = (e: React.KeyboardEvent, day: Date) => {
    const forward = dir === "rtl" ? -1 : 1
    const column = (day.getDay() - weekStartsOn + 7) % 7
    let next: Date | null = null
    switch (e.key) {
      case "ArrowRight":
        next = addDays(day, forward)
        break
      case "ArrowLeft":
        next = addDays(day, -forward)
        break
      case "ArrowDown":
        next = addDays(day, 7)
        break
      case "ArrowUp":
        next = addDays(day, -7)
        break
      case "Home":
        next = addDays(day, -column)
        break
      case "End":
        next = addDays(day, 6 - column)
        break
      case "PageUp":
      case "PageDown":
        next = fromHijri(addHijriMonths(toHijri(day), e.key === "PageUp" ? -1 : 1))
        break
    }
    if (!next) return
    e.preventDefault()
    moveFocus(next)
  }

  const caption =
    view === "day"
      ? formatHijriParts(month, t, "month-year")
      : view === "month"
        ? String(month.year)
        : `${yearBlockStart(month.year)}–${yearBlockStart(month.year) + 11}`

  const goMonths = (delta: number) => setMonth(addHijriMonths(month, delta))
  const navigation = {
    day: {
      prev: () => goMonths(-1),
      next: () => goMonths(1),
      prevLabel: t("date.previousMonth"),
      nextLabel: t("date.nextMonth"),
    },
    month: {
      prev: () => goMonths(-12),
      next: () => goMonths(12),
      prevLabel: t("date.previousYear"),
      nextLabel: t("date.nextYear"),
    },
    year: {
      prev: () => goMonths(-144),
      next: () => goMonths(144),
      prevLabel: t("date.previousYears", { count: 12 }),
      nextLabel: t("date.nextYears", { count: 12 }),
    },
  }[view]

  const weekdays = Array.from({ length: 7 }, (_, i) => addDays(cells[0]!, i))
  const selectedHijri = selected ? toHijri(selected) : null
  const todayHijri = toHijri(today)

  let body: React.ReactNode
  if (view === "day") {
    body = (
      <table role="grid" aria-label={caption} className="border-collapse">
        <thead>
          <tr>
            {weekdays.map((d) => (
              <th
                key={d.getDay()}
                scope="col"
                abbr={formatDate(d, "cccc", locale.dateFns)}
                className="pb-1 font-normal w-(--cell-size) text-[0.8rem] text-muted-foreground"
              >
                {formatDate(d, "cccccc", locale.dateFns)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: weeks }, (_, w) => (
            <tr key={w}>
              {cells.slice(w * 7, w * 7 + 7).map((d) => {
                const h = toHijri(d)
                const outside = !inMonth(d)
                const disabled = isOutOfRange(d, min, max)
                const isSelected = !!selected && isSameDay(d, selected)
                const isToday = isSameDay(d, today)
                const weekend = weekendDays.includes(d.getDay())
                const iso = toISODate(d)
                return (
                  <td
                    key={iso}
                    role="gridcell"
                    aria-selected={isSelected}
                    data-outside={outside || undefined}
                    data-today={isToday || undefined}
                    data-weekend={weekend || undefined}
                    className="p-0 text-center"
                  >
                    <button
                      ref={(node) => {
                        if (node) buttons.current.set(iso, node)
                        else buttons.current.delete(iso)
                      }}
                      type="button"
                      tabIndex={isSameDay(d, focusTarget) ? 0 : -1}
                      aria-disabled={disabled || undefined}
                      aria-label={[
                        isToday ? t("date.today") : null,
                        formatHijriParts(h, t, "long"),
                        formatDate(d, "PPPP", locale.dateFns),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      aria-current={isToday ? "date" : undefined}
                      data-selected={isSelected || undefined}
                      onClick={() => {
                        setFocused(d)
                        if (!disabled) onSelect?.(d)
                      }}
                      onFocus={() => setFocused(d)}
                      onKeyDown={(e) => onKeyDown(e, d)}
                      className={cn(
                        "gap-0.5 text-sm inline-flex size-(--cell-size) flex-col items-center justify-center rounded-(--cell-radius) leading-none tabular-nums outline-none",
                        "hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-40",
                        weekend && !outside && "text-destructive",
                        outside && "text-muted-foreground opacity-60",
                        isToday && "font-semibold underline decoration-primary decoration-2 underline-offset-4",
                        isSelected && "bg-primary text-primary-foreground opacity-100 hover:bg-primary/90",
                      )}
                    >
                      <span>{h.day}</span>
                      {showGregorian ? <span className="text-[0.6rem] opacity-70">{d.getDate()}</span> : null}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    )
  } else if (view === "month") {
    body = (
      <PeriodGrid
        key="months"
        activeIndex={selectedHijri?.year === month.year ? selectedHijri.month - 1 : month.month - 1}
        label={t("date.months")}
        initialFocus={focusGrid}
        onPage={(delta) => goMonths(delta * 12)}
        items={Array.from({ length: 12 }, (_, i) => ({
          key: `hm${i + 1}`,
          label: hijriMonthName(t, i + 1),
          ariaLabel: `${hijriMonthName(t, i + 1)} ${month.year}`,
          selected: selectedHijri?.year === month.year && selectedHijri.month === i + 1,
          current: todayHijri.year === month.year && todayHijri.month === i + 1,
          className: "text-xs",
        }))}
        onSelect={(i) => {
          setMonth({ year: month.year, month: i + 1, day: 1 })
          setFocused(fromHijri({ year: month.year, month: i + 1, day: 1 }))
          pendingFocus.current = true
          setView("day")
        }}
        className="w-[calc(var(--cell-size)*7)]"
        cellClassName="h-[calc(var(--cell-size)*1.6)]"
      />
    )
  } else {
    const start = yearBlockStart(month.year)
    body = (
      <PeriodGrid
        key="years"
        activeIndex={month.year - start}
        label={t("date.years")}
        initialFocus={focusGrid}
        onPage={(delta) => goMonths(delta * 144)}
        items={Array.from({ length: 12 }, (_, i) => ({
          key: `hy${start + i}`,
          label: String(start + i),
          selected: selectedHijri?.year === start + i,
          current: todayHijri.year === start + i,
        }))}
        onSelect={(i) => {
          setMonth({ ...month, year: start + i })
          setFocusGrid(true)
          setView("month")
        }}
        className="w-[calc(var(--cell-size)*7)]"
        cellClassName="h-[calc(var(--cell-size)*1.6)]"
      />
    )
  }

  return (
    <div
      ref={ref}
      data-slot="hijri-calendar"
      data-view={view}
      className={cn(
        "p-2 gap-2 [--cell-size:--spacing(9)] touch:[--cell-size:--spacing(11)] flex w-fit flex-col [--cell-radius:var(--radius-md)]",
        className,
      )}
    >
      <CalendarHeader
        caption={caption}
        captionLabel={
          view === "day"
            ? t("date.showMonths", { label: caption })
            : view === "month"
              ? t("date.showYears", { label: caption })
              : undefined
        }
        onCaptionClick={
          view === "year"
            ? undefined
            : () => {
                setFocusGrid(false)
                setView(view === "day" ? "month" : "year")
              }
        }
        prevLabel={navigation.prevLabel}
        nextLabel={navigation.nextLabel}
        onPrev={navigation.prev}
        onNext={navigation.next}
      />
      {body}
    </div>
  )
}

export interface HijriDatePickerProps extends PickerFieldProps {
  /** Selected date (Gregorian `Date`, controlled). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  /** Hijri display format. Default `short` ("23 Ramadan 1447"). */
  format?: HijriFormat
  /** Show the Gregorian date in the field too. Default true. */
  showGregorian?: boolean
  gregorianFormat?: string
  min?: Date
  max?: Date
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weekendDays?: number[]
}

/**
 * Picks a date on the Umm al-Qura Hijri calendar. The value and the hidden
 * input stay Gregorian (`yyyy-MM-dd`) so they store like any other date.
 */
export function HijriDatePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  format = "short",
  showGregorian = true,
  gregorianFormat = DEFAULT_DATE_FORMAT,
  min,
  max,
  weekStartsOn,
  weekendDays,
  placeholder,
  today,
  ...props
}: HijriDatePickerProps) {
  const { locale, t } = useOnu()
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const hijri = value ? formatHijriParts(toHijri(value), t, format) : null
  const display = value
    ? showGregorian
      ? `${hijri} (${formatDate(value, gregorianFormat, locale.dateFns)})`
      : hijri
    : null

  return (
    <PickerShell
      {...props}
      today={today}
      dataSlot="hijri-date-picker"
      display={display}
      placeholder={placeholder ?? t("date.selectHijriDate")}
      panelLabel={t("date.chooseDate")}
      announcement={value ? t("date.selected", { value: formatHijriParts(toHijri(value), t, "long") }) : ""}
      hidden={(name) => <HiddenInput name={name} value={value ? toISODate(value) : ""} />}
      onClear={() => setValue(null)}
    >
      {({ close }) => (
        <HijriCalendar
          selected={value}
          onSelect={(d) => {
            setValue(d)
            close()
          }}
          min={min}
          max={max}
          weekStartsOn={weekStartsOn}
          weekendDays={weekendDays}
          today={today}
          initialFocus
        />
      )}
    </PickerShell>
  )
}
