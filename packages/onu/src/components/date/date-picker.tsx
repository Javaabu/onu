"use client"

import * as React from "react"
import {
  compareAsc,
  endOfWeek,
  format as formatFns,
  getWeek,
  getWeekYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"
import type { Matcher } from "react-day-picker"

import { useOnu } from "../../providers/onu-provider"
import { DateCalendar } from "./date-calendar"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { DEFAULT_DATE_FORMAT, formatDate, toISODate } from "./_utils"
import { registerEnglish } from "../../i18n/english"
import { date as en_date } from "../../locales/en/date"

registerEnglish({ date: en_date })

interface DayGridProps {
  /** Earliest selectable date. */
  min?: Date
  /** Latest selectable date. */
  max?: Date
  /** Extra disabled days (react-day-picker matchers, e.g. `{ dayOfWeek: [5] }`). */
  disabledDates?: Matcher | Matcher[]
  /** Overrides the locale's first day of the week. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Weekend days (0 = Sunday). Defaults to Friday and Saturday. */
  weekendDays?: number[]
}

export interface SingleDatePickerProps extends PickerFieldProps, DayGridProps {
  mode?: "single"
  /** Selected date (controlled). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  /** date-fns display format. Defaults to `dd/MM/yyyy`. */
  format?: string
  showWeekNumber?: boolean
}

export interface MultipleDatePickerProps extends PickerFieldProps, DayGridProps {
  /** Selected dates (controlled), kept in ascending order. */
  value?: Date[]
  defaultValue?: Date[]
  onChange?: (value: Date[]) => void
  /** date-fns format for each date in the field. Defaults to `d MMM yyyy`. */
  format?: string
  /** Show the dates in the field up to this many, then "N dates selected". Default 2. */
  maxShown?: number
  /** Most dates that can be picked. */
  maxSelected?: number
}

export interface WeekPickerProps extends PickerFieldProps, DayGridProps {
  /** First day of the selected week (controlled). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  /** Called with the first day of the week. */
  onChange?: (value: Date | null) => void
  /** Custom field text. Defaults to "Week 11, 2026 (8 Mar – 14 Mar)". */
  formatWeek?: (start: Date, end: Date) => string
}

export interface MonthPickerProps extends PickerFieldProps {
  /** First day of the selected month (or year) (controlled). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  /** Called with the first day of the month (or year). */
  onChange?: (value: Date | null) => void
  /** date-fns display format. Defaults to `MMMM yyyy` (or `yyyy` for years). */
  format?: string
  min?: Date
  max?: Date
}

export type YearPickerProps = MonthPickerProps

/** `mode` picks what the field holds; `value` and `onChange` follow it. */
export type DatePickerProps =
  | SingleDatePickerProps
  | (MultipleDatePickerProps & { mode: "multiple" })
  | (WeekPickerProps & { mode: "week" })
  | (MonthPickerProps & { mode: "month" | "year" })

/**
 * A date field that opens a calendar (§25.1, §22). Popover on desktop, bottom
 * sheet on phones. Works controlled, uncontrolled, inside a `FormField`, and in
 * plain HTML forms via `name` (hidden inputs).
 *
 * - `mode="single"` (default): one date; the hidden input holds `yyyy-MM-dd`.
 * - `mode="multiple"`: any number of dates; clicking a day toggles it and the
 *   panel stays open until Done. Posts `name[]` inputs.
 * - `mode="week"`: clicking any day selects its week; the value and hidden
 *   input are the first day of the week.
 * - `mode="month"` / `"year"`: a 12-month (or 12-year) grid; the value is the
 *   first day of the period and the hidden input holds `yyyy-MM` (or `yyyy`).
 */
export function DatePicker(props: DatePickerProps) {
  switch (props.mode) {
    case "multiple":
      return <MultipleDates {...props} />
    case "week":
      return <WeekDates {...props} />
    case "month":
    case "year":
      return <PeriodDates {...props} granularity={props.mode} />
    default:
      return <SingleDate {...props} />
  }
}

/** `DatePicker` with `mode="multiple"`. */
export function MultipleDatePicker(props: MultipleDatePickerProps) {
  return <DatePicker {...props} mode="multiple" />
}

/** `DatePicker` with `mode="week"`. */
export function WeekPicker(props: WeekPickerProps) {
  return <DatePicker {...props} mode="week" />
}

/** `DatePicker` with `mode="month"`. */
export function MonthPicker(props: MonthPickerProps) {
  return <DatePicker {...props} mode="month" />
}

/** `DatePicker` with `mode="year"`. */
export function YearPicker(props: YearPickerProps) {
  return <DatePicker {...props} mode="year" />
}

function SingleDate({
  mode: _mode,
  value: valueProp,
  defaultValue = null,
  onChange,
  format,
  min,
  max,
  disabledDates,
  weekStartsOn,
  weekendDays,
  showWeekNumber,
  placeholder,
  today,
  ...props
}: SingleDatePickerProps) {
  const { locale, t } = useOnu()
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const display = value ? formatDate(value, format ?? DEFAULT_DATE_FORMAT, locale.dateFns) : null

  return (
    <PickerShell
      {...props}
      today={today}
      dataSlot="date-picker"
      display={display}
      placeholder={placeholder ?? t("date.selectDate")}
      panelLabel={t("date.chooseDate")}
      announcement={value ? t("date.selected", { value: formatDate(value, "PPPP", locale.dateFns) }) : ""}
      hidden={(name) => <HiddenInput name={name} value={value ? toISODate(value) : ""} />}
      onClear={() => setValue(null)}
    >
      {({ close }) => (
        <DateCalendar
          selected={value}
          onSelect={(date) => {
            setValue(date)
            close()
          }}
          min={min}
          max={max}
          disabledDates={disabledDates}
          weekStartsOn={weekStartsOn}
          weekendDays={weekendDays}
          showWeekNumber={showWeekNumber}
          today={today}
          initialFocus
        />
      )}
    </PickerShell>
  )
}

const NONE: Date[] = []

function MultipleDates({
  mode: _mode,
  value: valueProp,
  defaultValue = NONE,
  onChange,
  format = "d MMM yyyy",
  maxShown = 2,
  maxSelected,
  min,
  max,
  disabledDates,
  weekStartsOn,
  weekendDays,
  placeholder,
  today,
  ...props
}: MultipleDatePickerProps & { mode: "multiple" }) {
  const { locale, t } = useOnu()
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const count = value.length
  const summary = t("date.datesSelected", { count })
  const display =
    count === 0 ? null : count > maxShown ? summary : value.map((d) => formatDate(d, format, locale.dateFns)).join(", ")

  return (
    <PickerShell
      {...props}
      today={today}
      dataSlot="multiple-date-picker"
      display={display}
      placeholder={placeholder ?? t("date.selectDates")}
      panelLabel={t("date.chooseDates")}
      announcement={count ? summary : ""}
      hidden={(name) =>
        value.length ? (
          value.map((d) => <HiddenInput key={d.getTime()} name={`${name}[]`} value={toISODate(d)} />)
        ) : (
          <HiddenInput name={name} value="" />
        )
      }
      onClear={() => setValue([])}
    >
      <DateCalendar
        mode="multiple"
        selected={value}
        onSelect={(dates) => setValue([...dates].sort(compareAsc))}
        maxSelected={maxSelected}
        min={min}
        max={max}
        disabledDates={disabledDates}
        weekStartsOn={weekStartsOn}
        weekendDays={weekendDays}
        today={today}
        initialFocus
      />
    </PickerShell>
  )
}

function WeekDates({
  mode: _mode,
  value: valueProp,
  defaultValue = null,
  onChange,
  weekStartsOn: weekStartsOnProp,
  formatWeek,
  min,
  max,
  disabledDates,
  weekendDays,
  placeholder,
  today,
  ...props
}: WeekPickerProps & { mode: "week" }) {
  const { locale, t } = useOnu()
  const weekStartsOn = weekStartsOnProp ?? locale.weekStartsOn
  const options = { weekStartsOn, locale: locale.dateFns }
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)

  const start = value ? startOfWeek(value, options) : null
  const end = start ? endOfWeek(start, options) : null
  const describe = (s: Date, e: Date) =>
    formatWeek
      ? formatWeek(s, e)
      : `${t("date.weekLabel", { week: getWeek(s, options), year: String(getWeekYear(s, options)) })} (${formatDate(s, "d MMM", locale.dateFns)} – ${formatDate(e, "d MMM", locale.dateFns)})`
  const display = start && end ? describe(start, end) : null

  const modifiers = start
    ? {
        selected: { from: start, to: end! },
        range_start: start,
        range_end: end!,
        range_middle: { after: start, before: end! },
      }
    : {}

  return (
    <PickerShell
      {...props}
      today={today}
      dataSlot="week-picker"
      display={display}
      placeholder={placeholder ?? t("date.selectWeek")}
      panelLabel={t("date.chooseWeek")}
      announcement={display ? t("date.selected", { value: display }) : ""}
      hidden={(name) => <HiddenInput name={name} value={start ? toISODate(start) : ""} />}
      onClear={() => setValue(null)}
    >
      {({ close }) => (
        <DateCalendar
          mode="none"
          showWeekNumber
          weekStartsOn={weekStartsOn}
          weekendDays={weekendDays}
          min={min}
          max={max}
          disabledDates={disabledDates}
          today={today}
          defaultMonth={start ?? undefined}
          initialFocus
          modifiers={modifiers}
          // Hovering any day previews its whole week (CSS only, so the grid never re-renders under the pointer).
          classNames={{ grid: "[&_.rdp-week:hover_.rdp-day:not([data-outside])]:bg-muted/60" }}
          onDayClick={(day, mods) => {
            if (mods.disabled) return
            setValue(startOfWeek(day, options))
            close()
          }}
        />
      )}
    </PickerShell>
  )
}

function PeriodDates({
  mode: _mode,
  granularity,
  value: valueProp,
  defaultValue = null,
  onChange,
  format,
  min,
  max,
  placeholder,
  today,
  ...props
}: MonthPickerProps & { mode: "month" | "year"; granularity: "month" | "year" }) {
  const { locale, t } = useOnu()
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const month = granularity === "month"
  const display = value ? formatDate(value, format ?? (month ? "LLLL yyyy" : "yyyy"), locale.dateFns) : null

  return (
    <PickerShell
      {...props}
      today={today}
      dataSlot={month ? "month-picker" : "year-picker"}
      display={display}
      placeholder={placeholder ?? t(month ? "date.selectMonth" : "date.selectYear")}
      panelLabel={t(month ? "date.chooseMonth" : "date.chooseYear")}
      announcement={display ? t("date.selected", { value: display }) : ""}
      hidden={(name) => <HiddenInput name={name} value={value ? formatFns(value, month ? "yyyy-MM" : "yyyy") : ""} />}
      onClear={() => setValue(null)}
    >
      {({ close }) => (
        <DateCalendar
          selected={value}
          minView={granularity}
          min={min}
          max={max}
          today={today}
          initialFocus
          onPeriodSelect={(date) => {
            setValue(month ? startOfMonth(date) : startOfYear(date))
            close()
          }}
        />
      )}
    </PickerShell>
  )
}
