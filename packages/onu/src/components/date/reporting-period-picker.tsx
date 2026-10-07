"use client"

import * as React from "react"
import { addMonths, endOfDay, endOfMonth, startOfDay, startOfMonth } from "date-fns"

import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { DateCalendar } from "./date-calendar"
import { CalendarHeader } from "./_calendar-header"
import { PeriodGrid } from "./_period-grid"
import { HiddenInput, PickerShell, type PickerFieldProps } from "./_picker-shell"
import { useControllableState } from "./_use-controllable-state"
import { DEFAULT_DATE_FORMAT, formatDate, toISODate, yearBlockStart, type DateRangeValue } from "./_utils"

export type ReportingPeriodType = "monthly" | "quarterly" | "yearly" | "custom"

/** A reporting period: its kind and the first and last day it covers. */
export interface ReportingPeriod {
  type: ReportingPeriodType
  from: Date
  /** End of the last day (23:59:59.999). */
  to: Date
}

export interface ReportingPeriodPickerProps extends PickerFieldProps {
  value?: ReportingPeriod | null
  defaultValue?: ReportingPeriod | null
  onChange?: (value: ReportingPeriod | null) => void
  /** Which kinds to offer, in order. Default: all four. */
  types?: ReportingPeriodType[]
  /** Kind shown first when the field is empty. */
  defaultType?: ReportingPeriodType
  /** First month of the financial year, 0 = January … 11 = December. Default 0. */
  fiscalYearStartMonth?: number
  /** Date format for custom ranges. */
  format?: string
  min?: Date
  max?: Date
}

const ALL_TYPES: ReportingPeriodType[] = ["monthly", "quarterly", "yearly", "custom"]

/** Financial-year helpers for a given start month. */
export function fiscalYear(startMonth: number) {
  const startOf = (year: number) => new Date(year, startMonth, 1)
  const yearOf = (date: Date) => (date.getMonth() >= startMonth ? date.getFullYear() : date.getFullYear() - 1)
  const label = (year: number) =>
    startMonth === 0 ? String(year) : `${year}/${String((year + 1) % 100).padStart(2, "0")}`
  const quarter = (year: number, q: number) => {
    const from = addMonths(startOf(year), (q - 1) * 3)
    return { from, to: endOfMonth(addMonths(from, 2)) }
  }
  const quarterOf = (date: Date) => Math.floor(((((date.getMonth() - startMonth) % 12) + 12) % 12) / 3) + 1
  const range = (year: number) => ({ from: startOf(year), to: endOfMonth(addMonths(startOf(year), 11)) })
  return { startOf, yearOf, label, quarter, quarterOf, range }
}

/**
 * Picks a monthly, quarterly, yearly or custom reporting period, with a
 * configurable financial-year start (§22). With `name`, posts `name[type]`,
 * `name[from]` and `name[to]` (`yyyy-MM-dd`).
 */
export function ReportingPeriodPicker({
  value: valueProp,
  defaultValue = null,
  onChange,
  types = ALL_TYPES,
  defaultType,
  fiscalYearStartMonth = 0,
  format = DEFAULT_DATE_FORMAT,
  min,
  max,
  placeholder,
  today: todayProp,
  ...props
}: ReportingPeriodPickerProps) {
  const { locale, t } = useOnu()
  const today = todayProp ?? new Date()
  const fy = fiscalYear(fiscalYearStartMonth)
  const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)
  const [type, setType] = React.useState<ReportingPeriodType>(value?.type ?? defaultType ?? types[0] ?? "monthly")
  const [year, setYear] = React.useState(() => fy.yearOf(value?.from ?? today))
  const [pending, setPending] = React.useState<DateRangeValue | null>(null)

  const fyName = (y: number) => (fiscalYearStartMonth === 0 ? String(y) : t("date.fiscalYear", { year: fy.label(y) }))
  const short = (d: Date) => formatDate(d, "MMM", locale.dateFns)

  const describe = (p: ReportingPeriod) => {
    switch (p.type) {
      case "monthly":
        return formatDate(p.from, "LLLL yyyy", locale.dateFns)
      case "quarterly":
        return `${t("date.quarterLabel", { quarter: fy.quarterOf(p.from), year: fy.label(fy.yearOf(p.from)) })} (${short(p.from)} – ${short(p.to)})`
      case "yearly":
        return fyName(fy.yearOf(p.from))
      default:
        return `${formatDate(p.from, format, locale.dateFns)} – ${formatDate(p.to, format, locale.dateFns)}`
    }
  }
  const display = value ? describe(value) : null

  const commit = (next: ReportingPeriod, close: () => void) => {
    setValue({ ...next, from: startOfDay(next.from), to: endOfDay(next.to) })
    close()
  }

  const outside = (from: Date, to: Date) => (!!min && to < startOfDay(min)) || (!!max && from > endOfDay(max))

  return (
    <PickerShell
      {...props}
      dataSlot="reporting-period-picker"
      display={display}
      placeholder={placeholder ?? t("date.selectPeriod")}
      panelLabel={t("date.choosePeriod")}
      announcement={display ? t("date.selected", { value: display }) : ""}
      hidden={(name) => (
        <>
          <HiddenInput name={`${name}[type]`} value={value?.type ?? ""} />
          <HiddenInput name={`${name}[from]`} value={value ? toISODate(value.from) : ""} />
          <HiddenInput name={`${name}[to]`} value={value ? toISODate(value.to) : ""} />
        </>
      )}
      onClear={() => {
        setValue(null)
        setPending(null)
      }}
      onOpenChange={(open) => {
        // Closing with half a custom range keeps it as a one-day (or open-to-from) range.
        if (!open && pending?.from) {
          setValue({ type: "custom", from: startOfDay(pending.from), to: endOfDay(pending.to ?? pending.from) })
          setPending(null)
        }
        props.onOpenChange?.(open)
      }}
    >
      {({ close }) => (
        <div className="gap-2 p-2 [--cell-size:--spacing(9)] touch:[--cell-size:--spacing(11)] flex flex-col">
          {types.length > 1 ? (
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={type}
              onValueChange={(next) => next && setType(next as ReportingPeriodType)}
              aria-label={t("date.periodType")}
              className="w-full"
            >
              {types.map((kind) => (
                <ToggleGroupItem key={kind} value={kind} className="px-2 touch:h-11 flex-1">
                  {t(`date.${kind}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : null}

          {type === "monthly" ? (
            <DateCalendar
              className="p-0"
              minView="month"
              selected={value?.type === "monthly" ? value.from : null}
              min={min}
              max={max}
              today={today}
              initialFocus
              onPeriodSelect={(d) => commit({ type: "monthly", from: startOfMonth(d), to: endOfMonth(d) }, close)}
            />
          ) : null}

          {type === "quarterly" ? (
            <div className="gap-2 flex flex-col">
              <CalendarHeader
                caption={fyName(year)}
                prevLabel={t("date.previousYear")}
                nextLabel={t("date.nextYear")}
                onPrev={() => setYear(year - 1)}
                onNext={() => setYear(year + 1)}
              />
              <PeriodGrid
                columns={2}
                label={t("date.quarters")}
                initialFocus
                onPage={(delta) => setYear((y) => y + delta)}
                items={[1, 2, 3, 4].map((q) => {
                  const range = fy.quarter(year, q)
                  return {
                    key: `q${q}`,
                    label: (
                      <span className="gap-0.5 flex flex-col items-center">
                        <span className="font-medium">{t("date.quarter", { quarter: q })}</span>
                        <span className="text-xs opacity-80">
                          {short(range.from)} – {short(range.to)}
                        </span>
                      </span>
                    ),
                    ariaLabel: t("date.quarterLabel", { quarter: q, year: fy.label(year) }),
                    disabled: outside(range.from, range.to),
                    selected: value?.type === "quarterly" && value.from.getTime() === startOfDay(range.from).getTime(),
                    current: today >= range.from && today <= endOfDay(range.to),
                  }
                })}
                onSelect={(index) => commit({ type: "quarterly", ...fy.quarter(year, index + 1) }, close)}
                className="w-[calc(var(--cell-size)*7)]"
                cellClassName="h-16"
              />
            </div>
          ) : null}

          {type === "yearly" ? (
            <YearlyGrid
              fy={fy}
              fyName={fyName}
              initialYear={year}
              today={today}
              selectedYear={value?.type === "yearly" ? fy.yearOf(value.from) : null}
              outside={outside}
              onPick={(y) => commit({ type: "yearly", ...fy.range(y) }, close)}
            />
          ) : null}

          {type === "custom" ? (
            <DateCalendar
              className="p-0"
              mode="range"
              min={min}
              max={max}
              today={today}
              initialFocus
              selected={pending ?? (value?.type === "custom" ? { from: value.from, to: value.to } : null)}
              onSelect={(range) => {
                setPending(range)
                if (range.from && range.to && range.from.getTime() !== range.to.getTime()) {
                  setPending(null)
                  commit({ type: "custom", from: range.from, to: range.to }, close)
                }
              }}
            />
          ) : null}
        </div>
      )}
    </PickerShell>
  )
}

function YearlyGrid({
  fy,
  fyName,
  initialYear,
  today,
  selectedYear,
  outside,
  onPick,
}: {
  fy: ReturnType<typeof fiscalYear>
  fyName: (year: number) => string
  initialYear: number
  today: Date
  selectedYear: number | null
  outside: (from: Date, to: Date) => boolean
  onPick: (year: number) => void
}) {
  const { t } = useOnu()
  const [block, setBlock] = React.useState(() => yearBlockStart(selectedYear ?? initialYear))
  const current = fy.yearOf(today)
  return (
    <div className="gap-2 flex flex-col">
      <CalendarHeader
        caption={`${fy.label(block)} – ${fy.label(block + 11)}`}
        prevLabel={t("date.previousYears", { count: 12 })}
        nextLabel={t("date.nextYears", { count: 12 })}
        onPrev={() => setBlock(block - 12)}
        onNext={() => setBlock(block + 12)}
      />
      <PeriodGrid
        columns={3}
        label={t("date.fiscalYears")}
        initialFocus
        onPage={(delta) => setBlock((b) => b + delta * 12)}
        items={Array.from({ length: 12 }, (_, i) => {
          const y = block + i
          const range = fy.range(y)
          return {
            key: `fy${y}`,
            label: fy.label(y),
            ariaLabel: fyName(y),
            disabled: outside(range.from, range.to),
            selected: selectedYear === y,
            current: current === y,
          }
        })}
        onSelect={(index) => onPick(block + index)}
        className={cn("w-[calc(var(--cell-size)*7)]")}
        cellClassName="h-[calc(var(--cell-size)*1.6)] text-xs"
      />
    </div>
  )
}
