"use client"

import * as React from "react"

import { useOnu } from "../../providers/onu-provider"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { defaultTimeFormat, formatDate, getTimeValue, toISOTime, withTime } from "./_utils"
import { TimePanel } from "./time-panel"
import { registerEnglish } from "../../i18n/english"
import { date as en_date } from "../../locales/en/date"

registerEnglish({ date: en_date })

export interface TimePickerProps extends PickerFieldProps {
  /** Selected time as a `Date` (its date part is kept as-is). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  /** 12-hour (AM/PM) or 24-hour. Defaults to the locale's hour cycle. */
  hourCycle?: 12 | 24
  /** Minutes between cells in the minute grid. Default 5. */
  minuteStep?: number
  /** date-fns display format. Defaults to `h:mm a` or `HH:mm`. */
  format?: string
  /** Date used when an empty field gets its first time. Defaults to today. */
  referenceDate?: Date
}

/**
 * A time field that opens steppers, an hour clock and a minute grid (§25.2).
 * The hidden input (with `name`) holds `HH:mm`.
 */
export function TimePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  hourCycle: hourCycleProp,
  minuteStep,
  format,
  referenceDate,
  placeholder,
  ...props
}: TimePickerProps) {
  const { locale, t } = useOnu()
  const hourCycle = hourCycleProp ?? locale.hourCycle
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const pattern = format ?? defaultTimeFormat(hourCycle)
  const display = value ? formatDate(value, pattern, locale.dateFns) : null

  return (
    <PickerShell
      {...props}
      icon="clock"
      dataSlot="time-picker"
      display={display}
      placeholder={placeholder ?? t("date.selectTime")}
      panelLabel={t("date.chooseTime")}
      announcement={display ? t("date.selected", { value: display }) : ""}
      hidden={(name) => <HiddenInput name={name} value={value ? toISOTime(value) : ""} />}
      onClear={() => setValue(null)}
    >
      <TimePanel
        value={value ? getTimeValue(value) : null}
        onChange={(time) => setValue(withTime(value ?? referenceDate ?? props.today ?? new Date(), time))}
        hourCycle={hourCycle}
        minuteStep={minuteStep}
        initialFocus
      />
    </PickerShell>
  )
}
