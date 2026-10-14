"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { PeriodGrid, type GridItem } from "./_period-grid"
import { useControllableState } from "./_use-controllable-state"
import { pad2, wrap, type TimeValue } from "./_utils"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { date as en_date } from "../../locales/en/date"

registerEnglish({ common: en_common, date: en_date })

export type TimePanelView = "steppers" | "hours" | "minutes"

export interface TimePanelProps {
  /** Selected time. `null` shows "--" until the user picks something. */
  value: TimeValue | null
  onChange: (value: TimeValue) => void
  /** 12-hour (with AM/PM) or 24-hour. Defaults to the locale's hour cycle. */
  hourCycle?: 12 | 24
  /** Minutes between cells in the minute grid. Default 5. */
  minuteStep?: number
  view?: TimePanelView
  defaultView?: TimePanelView
  onViewChange?: (view: TimePanelView) => void
  /** Focus the hour when mounted. */
  initialFocus?: boolean
  className?: string
  classNames?: { stepper?: string; number?: string; period?: string; grid?: string }
  ref?: React.Ref<HTMLDivElement>
}

const EMPTY: TimeValue = { hours: 0, minutes: 0 }

/**
 * Time steppers with ▲/▼, an AM/PM switch, a clock-face hour grid and a minute
 * grid (§25.2). Used by `TimePicker` and `DateTimePicker`, or on its own.
 */
export function TimePanel({
  value,
  onChange,
  hourCycle: hourCycleProp,
  minuteStep = 5,
  view: viewProp,
  defaultView = "steppers",
  onViewChange,
  initialFocus,
  className,
  classNames,
  ref,
}: TimePanelProps) {
  const { locale, t } = useOnu()
  const hourCycle = hourCycleProp ?? locale.hourCycle
  const twelve = hourCycle === 12
  const [view, setViewState] = useControllableState(viewProp, defaultView, onViewChange)
  const hourRef = React.useRef<HTMLDivElement>(null)
  const minuteRef = React.useRef<HTMLDivElement>(null)
  const returnFocus = React.useRef<"hour" | "minute" | null>(initialFocus ? "hour" : null)

  React.useEffect(() => {
    if (view !== "steppers" || !returnFocus.current) return
    ;(returnFocus.current === "hour" ? hourRef : minuteRef).current?.focus()
    returnFocus.current = null
  }, [view])

  const current = value ?? EMPTY
  const pm = current.hours >= 12
  const displayHour = twelve ? (current.hours % 12 === 0 ? 12 : current.hours % 12) : current.hours
  const periodLabel = pm ? t("date.pm") : t("date.am")

  const set = (next: Partial<TimeValue>) => onChange({ ...current, ...next })
  const stepHour = (delta: number) => set({ hours: wrap(current.hours + delta, 24) })
  const stepMinute = (delta: number) => set({ minutes: wrap(current.minutes + delta, 60) })
  const setPeriod = (toPm: boolean) => {
    if (toPm === pm && value) return
    set({ hours: (current.hours % 12) + (toPm ? 12 : 0) })
  }
  const showGrid = (next: "hours" | "minutes") => setViewState(next)
  const back = (from: "hour" | "minute") => {
    returnFocus.current = from
    setViewState("steppers")
  }

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (!twelve || e.ctrlKey || e.metaKey || e.altKey) return
    const key = e.key.toLowerCase()
    if (key === "a" || key === "p") {
      e.preventDefault()
      setPeriod(key === "p")
    }
  }

  if (view !== "steppers") {
    const hours = view === "hours"
    let items: GridItem[]
    let pick: (index: number) => void
    if (hours) {
      const values = twelve ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] : Array.from({ length: 24 }, (_, h) => h)
      items = values.map((h) => ({
        key: `h${h}`,
        label: twelve ? String(h) : pad2(h),
        ariaLabel: twelve ? `${h} ${periodLabel}` : pad2(h),
        selected: !!value && displayHour === h,
      }))
      pick = (index) => {
        const h = values[index]!
        set({ hours: twelve ? (h % 12) + (pm ? 12 : 0) : h })
        back("hour")
      }
    } else {
      const values: number[] = []
      for (let m = 0; m < 60; m += Math.max(1, minuteStep)) values.push(m)
      items = values.map((m) => ({ key: `m${m}`, label: pad2(m), selected: !!value && current.minutes === m }))
      pick = (index) => {
        set({ minutes: values[index]! })
        back("minute")
      }
    }
    return (
      // A/P shortcuts are delegated from the focusable cells inside.
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        ref={ref}
        data-slot="time-panel"
        data-view={view}
        className={cn("p-3 gap-2 flex flex-col", className)}
        onKeyDown={onPanelKeyDown}
      >
        <div className="gap-2 flex items-center justify-between">
          <Button variant="link" size="sm" className="px-0" onClick={() => back(hours ? "hour" : "minute")}>
            <Icon name="chevron-left" />
            {t("common.back")}
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            {hours ? t("date.hours") : t("date.minutes")}
          </span>
        </div>
        <PeriodGrid
          items={items}
          label={hours ? t("date.hours") : t("date.minutes")}
          layout={hours ? "clock" : "grid"}
          columns={hours ? 12 : items.length <= 12 ? 4 : 6}
          currentKind="time"
          initialFocus
          onSelect={pick}
          className={cn(!hours && "w-60 touch:w-72", classNames?.grid)}
        />
      </div>
    )
  }

  const number = cn(
    "h-12 w-16 text-3xl font-semibold inline-flex cursor-pointer items-center justify-center rounded-lg tabular-nums outline-none select-none",
    "touch:h-14 hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
    classNames?.number,
  )
  const arrow = "size-9 touch:size-11"
  const numberKeys = (step: (d: number) => void, open: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
      step(e.key === "ArrowUp" ? 1 : -1)
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      open()
    }
  }

  return (
    // A/P shortcuts are delegated from the spinbuttons and buttons inside.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={ref}
      role="group"
      aria-label={t("date.time")}
      data-slot="time-panel"
      data-view="steppers"
      className={cn("p-3 gap-3 flex items-center justify-center", className)}
      onKeyDown={onPanelKeyDown}
    >
      <div data-slot="time-stepper" className={cn("gap-1 flex flex-col items-center", classNames?.stepper)}>
        <Button
          variant="ghost"
          size="icon"
          className={arrow}
          tabIndex={-1}
          aria-label={t("date.increaseHour")}
          onClick={() => stepHour(1)}
        >
          <Icon name="chevron-up" />
        </Button>
        <div
          ref={hourRef}
          role="spinbutton"
          tabIndex={0}
          aria-label={t("date.hour")}
          aria-valuenow={value ? displayHour : undefined}
          aria-valuetext={value ? (twelve ? `${displayHour} ${periodLabel}` : pad2(displayHour)) : undefined}
          aria-valuemin={twelve ? 1 : 0}
          aria-valuemax={twelve ? 12 : 23}
          title={t("date.chooseHour")}
          data-slot="time-hour"
          className={number}
          onClick={() => showGrid("hours")}
          onKeyDown={numberKeys(stepHour, () => showGrid("hours"))}
        >
          {value ? (twelve ? displayHour : pad2(displayHour)) : "--"}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={arrow}
          tabIndex={-1}
          aria-label={t("date.decreaseHour")}
          onClick={() => stepHour(-1)}
        >
          <Icon name="chevron-down" />
        </Button>
      </div>
      <span aria-hidden="true" className="text-3xl font-semibold text-muted-foreground">
        :
      </span>
      <div data-slot="time-stepper" className={cn("gap-1 flex flex-col items-center", classNames?.stepper)}>
        <Button
          variant="ghost"
          size="icon"
          className={arrow}
          tabIndex={-1}
          aria-label={t("date.increaseMinute")}
          onClick={() => stepMinute(1)}
        >
          <Icon name="chevron-up" />
        </Button>
        <div
          ref={minuteRef}
          role="spinbutton"
          tabIndex={0}
          aria-label={t("date.minute")}
          aria-valuenow={value ? current.minutes : undefined}
          aria-valuetext={value ? pad2(current.minutes) : undefined}
          aria-valuemin={0}
          aria-valuemax={59}
          title={t("date.chooseMinute")}
          data-slot="time-minute"
          className={number}
          onClick={() => showGrid("minutes")}
          onKeyDown={numberKeys(stepMinute, () => showGrid("minutes"))}
        >
          {value ? pad2(current.minutes) : "--"}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={arrow}
          tabIndex={-1}
          aria-label={t("date.decreaseMinute")}
          onClick={() => stepMinute(-1)}
        >
          <Icon name="chevron-down" />
        </Button>
      </div>
      {twelve ? (
        <div
          role="group"
          aria-label={t("date.period")}
          data-slot="time-period"
          className={cn("gap-1 ms-1 flex flex-col", classNames?.period)}
        >
          {[false, true].map((isPm) => (
            <Button
              key={String(isPm)}
              type="button"
              size="sm"
              variant={value && pm === isPm ? "default" : "outline"}
              aria-pressed={!!value && pm === isPm}
              className="min-w-12 touch:h-11"
              onClick={() => setPeriod(isPm)}
            >
              {isPm ? t("date.pm") : t("date.am")}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
