"use client"

import * as React from "react"
import { endOfDay, startOfDay } from "date-fns"
import type { Matcher } from "react-day-picker"

import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { Label } from "../../ui/label"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { DatePicker } from "./date-picker"
import { DateTimePicker } from "./date-time-picker"
import { DetachFromFormField, HiddenInput, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { toISODate, toISODateTime, type DateRangeValue } from "./_utils"

export interface DateRangePickerProps extends Omit<
  PickerFieldProps,
  "open" | "defaultOpen" | "onOpenChange" | "placeholder" | "classNames" | "ref"
> {
  /** `{ from, to }` (controlled). Either end may be `null` for an open-ended range. */
  value?: DateRangeValue
  defaultValue?: DateRangeValue
  /** Without `withTime`, `to` is the end of its day (23:59:59.999). */
  onChange?: (value: DateRangeValue) => void
  /** Pick a time as well as a date for each end. */
  withTime?: boolean
  format?: string
  min?: Date
  max?: Date
  disabledDates?: Matcher | Matcher[]
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  weekendDays?: number[]
  hourCycle?: 12 | 24
  minuteStep?: number
  /** Hidden input names. Default: `name[from]` and `name[to]`. */
  names?: { from?: string; to?: string }
  /** Override the "From" / "To" labels. */
  labels?: { from?: React.ReactNode; to?: React.ReactNode }
  placeholders?: { from?: string; to?: string }
  classNames?: { root?: string; field?: string; label?: string; trigger?: string; error?: string }
  ref?: React.Ref<HTMLDivElement>
}

const EMPTY: DateRangeValue = { from: null, to: null }

/**
 * Two side-by-side fields, From and To, each opening a date (or date-time)
 * picker (§25.4). Either end may be empty; an end before the start shows
 * "End date is before start date".
 */
export function DateRangePicker({
  value: valueProp,
  defaultValue = EMPTY,
  onChange,
  withTime = false,
  format,
  min,
  max,
  disabledDates,
  weekStartsOn,
  weekendDays,
  hourCycle,
  minuteStep,
  names,
  labels,
  placeholders,
  className,
  classNames,
  ref,
  ...props
}: DateRangePickerProps) {
  const { t } = useOnu()
  const field = useFormField()
  const control = useFormFieldControl(props as Record<string, unknown>) as PickerFieldProps & {
    "aria-describedby"?: string
  }
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const uid = React.useId()
  const fromId = control.id ?? `${uid}-from`
  const toId = `${fromId}-to`
  const errorId = `${uid}-error`

  const reversed = !!value.from && !!value.to && startOfDay(value.to) < startOfDay(value.from)
  const reversedTime = withTime && !!value.from && !!value.to && value.to < value.from
  const invalid = reversed || reversedTime
  const describedBy = [control["aria-describedby"], invalid ? errorId : null].filter(Boolean).join(" ") || undefined

  const normaliseTo = (to: Date | null) => (to && !withTime ? endOfDay(to) : to)
  const update = (next: Partial<DateRangeValue>) => {
    const merged = { ...value, ...next }
    setValue({ from: merged.from, to: "to" in next ? normaliseTo(next.to ?? null) : merged.to })
  }

  const common = {
    format,
    min,
    max,
    disabledDates,
    weekStartsOn,
    weekendDays,
    disabled: control.disabled,
    required: control.required,
    clearable: props.clearable,
    sheet: props.sheet,
    size: props.size,
    today: props.today,
    "aria-describedby": describedBy,
    "aria-invalid": (control["aria-invalid"] || invalid || undefined) as boolean | undefined,
    classNames: { trigger: classNames?.trigger },
  }
  const timeProps = { hourCycle, minuteStep }
  const iso = (d: Date | null) => (d ? (withTime ? toISODateTime(d) : toISODate(d)) : "")
  const name = control.name

  const renderField = (end: "from" | "to") => {
    const id = end === "from" ? fromId : toId
    const labelId = `${id}-label`
    const pickerProps = {
      ...common,
      id,
      "aria-labelledby": field ? `${field.labelId} ${labelId}` : labelId,
      placeholder: placeholders?.[end] ?? t(withTime ? "date.selectDateTime" : "date.selectDate"),
      value: value[end],
      onChange: (d: Date | null) => update({ [end]: d }),
    }
    return (
      <div data-slot={`date-range-${end}`} className={cn("gap-1.5 min-w-0 grid", classNames?.field)}>
        <Label id={labelId} htmlFor={id} className={cn("text-xs font-normal text-muted-foreground", classNames?.label)}>
          {labels?.[end] ?? t(end === "from" ? "date.from" : "date.to")}
        </Label>
        {withTime ? (
          <DateTimePicker
            {...pickerProps}
            {...timeProps}
            defaultTime={end === "to" ? { hours: 23, minutes: 59 } : undefined}
          />
        ) : (
          <DatePicker {...pickerProps} />
        )}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={field?.labelId}
      aria-label={field ? undefined : (props["aria-label"] ?? t("date.dateRange"))}
      data-slot="date-range-picker"
      data-invalid={invalid || undefined}
      className={cn("@container/date-range w-full", classNames?.root, className)}
    >
      <DetachFromFormField>
        <div className="gap-2 @sm/date-range:grid-cols-2 grid">
          {renderField("from")}
          {renderField("to")}
        </div>
      </DetachFromFormField>
      {invalid ? (
        <p
          id={errorId}
          role="alert"
          data-slot="date-range-error"
          className={cn("mt-1.5 text-sm text-destructive", classNames?.error)}
        >
          {t("date.endBeforeStart")}
        </p>
      ) : null}
      {name ? (
        <>
          <HiddenInput name={names?.from ?? `${name}[from]`} value={iso(value.from)} />
          <HiddenInput name={names?.to ?? `${name}[to]`} value={iso(value.to)} />
        </>
      ) : null}
    </div>
  )
}
