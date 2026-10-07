"use client"

import * as React from "react"
import { addDays, endOfWeek, getWeek, getWeekYear, startOfWeek } from "date-fns"

import { useOnu } from "../../providers/onu-provider"
import { DateCalendar } from "./date-calendar"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { formatDate, toISODate } from "./_utils"

export interface WeekPickerProps extends PickerFieldProps {
  /** First day of the selected week (controlled). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  /** Called with the first day of the week. */
  onChange?: (value: Date | null) => void
  /** Overrides the locale's first day of the week. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Custom field text. Defaults to "Week 11, 2026 (8 Mar – 14 Mar)". */
  formatWeek?: (start: Date, end: Date) => string
  min?: Date
  max?: Date
  weekendDays?: number[]
}

/**
 * Picks a whole week: clicking any day selects its week (§22). Week numbers
 * follow the locale's week start. The hidden input holds the first day (`yyyy-MM-dd`).
 */
export function WeekPicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  weekStartsOn: weekStartsOnProp,
  formatWeek,
  min,
  max,
  weekendDays,
  placeholder,
  today,
  ...props
}: WeekPickerProps) {
  const { locale, t } = useOnu()
  const weekStartsOn = weekStartsOnProp ?? locale.weekStartsOn
  const options = { weekStartsOn, locale: locale.dateFns }
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const [hovered, setHovered] = React.useState<Date | null>(null)

  const start = value ? startOfWeek(value, options) : null
  const end = start ? endOfWeek(start, options) : null
  const describe = (s: Date, e: Date) =>
    formatWeek
      ? formatWeek(s, e)
      : `${t("date.weekLabel", { week: getWeek(s, options), year: getWeekYear(s, options) })} (${formatDate(s, "d MMM", locale.dateFns)} – ${formatDate(e, "d MMM", locale.dateFns)})`
  const display = start && end ? describe(start, end) : null

  const hoverStart = hovered ? startOfWeek(hovered, options) : null
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
          today={today}
          defaultMonth={start ?? undefined}
          initialFocus
          modifiers={{
            ...modifiers,
            hoverWeek: hoverStart ? { from: hoverStart, to: addDays(hoverStart, 6) } : undefined,
          }}
          modifiersClassNames={{ hoverWeek: "bg-muted/60" }}
          onDayMouseEnter={setHovered}
          onDayMouseLeave={() => setHovered(null)}
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
