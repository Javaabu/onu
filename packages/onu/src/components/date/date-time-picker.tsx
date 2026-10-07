"use client"

import * as React from "react"
import type { Matcher } from "react-day-picker"

import { Icon } from "../../icons/icon"
import { useOnu } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { DateCalendar } from "./date-calendar"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import {
  DEFAULT_DATE_FORMAT,
  defaultTimeFormat,
  formatDate,
  getTimeValue,
  toISODateTime,
  withTime,
  type TimeValue,
} from "./_utils"
import { TimePanel } from "./time-panel"

export interface DateTimePickerProps extends PickerFieldProps {
  /** Selected date and time (controlled). `null` is empty. */
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (value: Date | null) => void
  /** date-fns display format. Defaults to `dd/MM/yyyy h:mm a` (or `HH:mm`). */
  format?: string
  hourCycle?: 12 | 24
  minuteStep?: number
  /** Time used when a day is picked before any time, and by "Clear time". Default 00:00. */
  defaultTime?: TimeValue
  min?: Date
  max?: Date
  disabledDates?: Matcher | Matcher[]
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weekendDays?: number[]
}

const MIDNIGHT: TimeValue = { hours: 0, minutes: 0 }

/**
 * Calendar plus a time chip that swaps in the time steppers (§25.3). The hidden
 * input (with `name`) holds a local ISO date-time (`yyyy-MM-ddTHH:mm:ss`).
 */
export function DateTimePicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  format,
  hourCycle: hourCycleProp,
  minuteStep,
  defaultTime = MIDNIGHT,
  min,
  max,
  disabledDates,
  weekStartsOn,
  weekendDays,
  placeholder,
  today,
  ...props
}: DateTimePickerProps) {
  const { locale, t } = useOnu()
  const hourCycle = hourCycleProp ?? locale.hourCycle
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const [view, setView] = React.useState<"calendar" | "time">("calendar")
  const [pendingTime, setPendingTime] = React.useState<TimeValue | null>(null)
  const [focusTarget, setFocusTarget] = React.useState<"calendar" | "chip">("calendar")
  const chipRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (view === "calendar" && focusTarget === "chip") chipRef.current?.focus()
  }, [view, focusTarget])

  const timePattern = defaultTimeFormat(hourCycle)
  const pattern = format ?? `${DEFAULT_DATE_FORMAT} ${timePattern}`
  const display = value ? formatDate(value, pattern, locale.dateFns) : null
  const time = value ? getTimeValue(value) : (pendingTime ?? defaultTime)
  const timeText = formatDate(withTime(today ?? new Date(), time), timePattern, locale.dateFns)

  const setTime = (next: TimeValue) => {
    if (value) setValue(withTime(value, next))
    else setPendingTime(next)
  }

  return (
    <PickerShell
      {...props}
      today={today}
      dataSlot="date-time-picker"
      display={display}
      placeholder={placeholder ?? t("date.selectDateTime")}
      panelLabel={t("date.chooseDateTime")}
      announcement={display ? t("date.selected", { value: display }) : ""}
      hidden={(name) => <HiddenInput name={name} value={value ? toISODateTime(value) : ""} />}
      onClear={() => {
        setValue(null)
        setPendingTime(null)
      }}
      onOpenChange={(open) => {
        if (!open) {
          setView("calendar")
          setFocusTarget("calendar")
        }
        props.onOpenChange?.(open)
      }}
    >
      {view === "calendar" ? (
        <div className="flex flex-col">
          <DateCalendar
            selected={value}
            onSelect={(day) => setValue(withTime(day, value ? getTimeValue(value) : (pendingTime ?? defaultTime)))}
            min={min}
            max={max}
            disabledDates={disabledDates}
            weekStartsOn={weekStartsOn}
            weekendDays={weekendDays}
            today={today}
            initialFocus={focusTarget === "calendar"}
          />
          <div className="gap-2 px-2 pb-2 flex items-center justify-between">
            <Button
              ref={chipRef}
              type="button"
              variant="secondary"
              size="sm"
              className="touch:h-11 rounded-full"
              data-slot="time-chip"
              aria-label={t("date.changeTime", { time: timeText })}
              onClick={() => setView("time")}
            >
              <Icon name="clock" />
              <span className="tabular-nums">{timeText}</span>
            </Button>
            <Button type="button" variant="ghost" size="sm" className="touch:h-11" onClick={() => setTime(defaultTime)}>
              {t("date.clearTime")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="pt-2 flex flex-col">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="ms-2 self-start"
            onClick={() => {
              setFocusTarget("chip")
              setView("calendar")
            }}
          >
            <Icon name="chevron-left" />
            {t("date.backToCalendar")}
          </Button>
          <TimePanel
            value={value || pendingTime ? time : null}
            onChange={setTime}
            hourCycle={hourCycle}
            minuteStep={minuteStep}
            initialFocus
          />
        </div>
      )}
    </PickerShell>
  )
}
