"use client"

import * as React from "react"
import { compareAsc } from "date-fns"
import type { Matcher } from "react-day-picker"

import { useOnu } from "../../providers/onu-provider"
import { DateCalendar } from "./date-calendar"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { formatDate, toISODate } from "./_utils"

export interface MultipleDatePickerProps extends PickerFieldProps {
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
  min?: Date
  max?: Date
  disabledDates?: Matcher | Matcher[]
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weekendDays?: number[]
}

const NONE: Date[] = []

/**
 * Picks any number of dates from one calendar (§22). Clicking a day toggles
 * it; the panel stays open until Done. With `name`, posts `name[]` inputs.
 */
export function MultipleDatePicker({
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
}: MultipleDatePickerProps) {
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
