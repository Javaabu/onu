"use client"

import * as React from "react"
import { format as formatFns, startOfMonth, startOfYear } from "date-fns"

import { useOnu } from "../../providers/onu-provider"
import { DateCalendar } from "./date-calendar"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { formatDate } from "./_utils"
import { registerEnglish } from "../../i18n/english"
import { date as en_date } from "../../locales/en/date"

registerEnglish({ date: en_date })

export interface MonthPickerProps extends PickerFieldProps {
  /** First day of the selected month (controlled). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  /** Called with the first day of the month (or year). */
  onChange?: (value: Date | null) => void
  /** date-fns display format. Defaults to `MMMM yyyy` (or `yyyy` for years). */
  format?: string
  min?: Date
  max?: Date
}

function PeriodPicker({
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
}: MonthPickerProps & { granularity: "month" | "year" }) {
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

/**
 * Picks a month and year from a 12-month grid that zooms out to years (§22).
 * The hidden input (with `name`) holds `yyyy-MM`.
 */
export function MonthPicker(props: MonthPickerProps) {
  return <PeriodPicker {...props} granularity="month" />
}

export type YearPickerProps = MonthPickerProps

/** Picks a year from a 12-year grid. The hidden input holds `yyyy`. */
export function YearPicker(props: YearPickerProps) {
  return <PeriodPicker {...props} granularity="year" />
}
