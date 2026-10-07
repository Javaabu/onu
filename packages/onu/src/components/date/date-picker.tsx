"use client"

import * as React from "react"
import type { Matcher } from "react-day-picker"

import { useOnu } from "../../providers/onu-provider"
import { DateCalendar } from "./date-calendar"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { DEFAULT_DATE_FORMAT, formatDate, toISODate } from "./_utils"

export interface DatePickerProps extends PickerFieldProps {
  /** Selected date (controlled). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  /** date-fns display format. Defaults to `dd/MM/yyyy`. */
  format?: string
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
  showWeekNumber?: boolean
}

/**
 * A date field that opens a calendar (§25.1). Popover on desktop, bottom sheet
 * on phones. Works controlled, uncontrolled, inside a `FormField`, and in plain
 * HTML forms via `name` (hidden `yyyy-MM-dd` input).
 */
export function DatePicker({
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
}: DatePickerProps) {
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
