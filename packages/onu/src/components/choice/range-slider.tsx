"use client"

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_hooks"

export type RangeSliderValue = number | number[]

export interface RangeSliderMark {
  value: number
  label?: React.ReactNode
}

type RootProps = React.ComponentProps<typeof SliderPrimitive.Root>

export interface RangeSliderProps<T extends RangeSliderValue = RangeSliderValue> extends Omit<
  RootProps,
  "value" | "defaultValue" | "onValueChange" | "onValueCommit"
> {
  /** A number for a single thumb, or `[from, to]` for a range. */
  value?: T
  defaultValue?: T
  /** Called with the same shape as the value (number or array). */
  onValueChange?: (value: T) => void
  onValueCommit?: (value: T) => void
  /** Tick marks on the track, optionally labelled. */
  marks?: ReadonlyArray<number | RangeSliderMark>
  /** Show each thumb's value above it: `always`, while `active` (hover/focus/drag), or `never`. */
  showValue?: "always" | "active" | "never"
  /** Format values for labels and screen readers. Defaults to the locale's number format. */
  formatValue?: (value: number) => string
  /** Accessible names of the thumbs. Defaults to "Minimum" / "Maximum" for ranges. */
  thumbLabels?: string[]
  classNames?: {
    root?: string
    track?: string
    range?: string
    thumb?: string
    valueLabel?: string
    mark?: string
    markLabel?: string
  }
}

function percent(value: number, min: number, max: number) {
  return max === min ? 0 : ((value - min) / (max - min)) * 100
}

/**
 * A slider for one value or a range (shadcn slider), with marks, value labels
 * and locale number formatting. It mirrors in RTL and arrow keys follow the
 * visual direction.
 */
export function RangeSlider<T extends RangeSliderValue = RangeSliderValue>({
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  marks,
  showValue = "active",
  formatValue,
  thumbLabels,
  className,
  classNames,
  ...props
}: RangeSliderProps<T>) {
  const { t, locale } = useTranslation()
  const field = useFormField()
  const control = useFormFieldControl(props as Record<string, unknown>) as Omit<RootProps, "value"> & {
    "aria-label"?: string
    "aria-describedby"?: string
    "aria-invalid"?: boolean
    "aria-required"?: boolean
  }
  const {
    id,
    "aria-label": ariaLabel,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
    "aria-required": _ariaRequired,
    required: _required,
    ...rootProps
  } = control as typeof control & { required?: boolean }

  const initial = (defaultValue ?? (valueProp === undefined ? min : valueProp)) as T
  const [value, setValue] = useControllableState<T>(valueProp, initial, onValueChange)
  const isRange = Array.isArray(value)
  const values = isRange ? (value as number[]) : [value as number]
  const toShape = (next: number[]) => (isRange ? next : next[0]) as T

  const format = React.useMemo(() => {
    if (formatValue) return formatValue
    const nf = new Intl.NumberFormat(locale.numberLocale)
    return (v: number) => nf.format(v)
  }, [formatValue, locale.numberLocale])

  const labels = thumbLabels ?? (isRange ? [t("choice.minimum"), t("choice.maximum")] : [])
  const labelIdBase = React.useId()
  const normalizedMarks = (marks ?? []).map((m) => (typeof m === "number" ? { value: m } : m))
  const hasMarkLabels = normalizedMarks.some((m) => m.label !== undefined)

  return (
    <div
      data-slot="range-slider"
      className={cn(
        "relative w-full",
        showValue === "always" && "pt-7",
        normalizedMarks.length > 0 && (hasMarkLabels ? "pb-6" : "pb-2"),
        className,
        classNames?.root,
      )}
    >
      <SliderPrimitive.Root
        data-slot="slider"
        {...rootProps}
        min={min}
        max={max}
        step={step}
        value={values}
        onValueChange={(next) => setValue(toShape(next))}
        onValueCommit={onValueCommit ? (next) => onValueCommit(toShape(next)) : undefined}
        className="data-vertical:min-h-40 relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "data-horizontal:h-1.5 data-vertical:w-1.5 relative grow overflow-hidden rounded-full bg-muted data-horizontal:w-full data-vertical:h-full",
            classNames?.track,
          )}
        >
          <SliderPrimitive.Range
            data-slot="slider-range"
            className={cn("absolute bg-primary data-horizontal:h-full data-vertical:w-full", classNames?.range)}
          />
        </SliderPrimitive.Track>
        {values.map((v, i) => {
          const thumbLabel = labels[i]
          const labelId = `${labelIdBase}-thumb-${i}`
          const named = field && !ariaLabel
          return (
            <SliderPrimitive.Thumb
              key={i}
              data-slot="slider-thumb"
              id={i === 0 ? id : undefined}
              aria-label={
                named ? undefined : ariaLabel && thumbLabel ? `${ariaLabel}, ${thumbLabel}` : (ariaLabel ?? thumbLabel)
              }
              aria-labelledby={
                named ? [field.labelId, thumbLabel ? labelId : null].filter(Boolean).join(" ") : undefined
              }
              aria-describedby={describedBy}
              aria-invalid={invalid}
              aria-valuetext={format(v)}
              className={cn(
                "group/thumb size-4 shadow-sm touch:size-6 relative block shrink-0 rounded-full border border-primary bg-background transition-[color,box-shadow] select-none",
                "after:-inset-2 after:absolute hover:ring-3 hover:ring-ring/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-hidden active:ring-3 active:ring-ring/50",
                "disabled:pointer-events-none aria-invalid:border-destructive",
                classNames?.thumb,
              )}
            >
              {named && thumbLabel ? (
                <span id={labelId} hidden>
                  {thumbLabel}
                </span>
              ) : null}
              {showValue !== "never" ? (
                <span
                  data-slot="slider-value"
                  aria-hidden="true"
                  className={cn(
                    "px-1.5 py-0.5 text-xs font-medium mb-2 absolute start-1/2 bottom-full -translate-x-1/2 rounded-md bg-foreground whitespace-nowrap text-background tabular-nums rtl:translate-x-1/2",
                    showValue === "active" &&
                      "opacity-0 transition-opacity group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100 group-active/thumb:opacity-100",
                    classNames?.valueLabel,
                  )}
                >
                  {format(v)}
                </span>
              ) : null}
            </SliderPrimitive.Thumb>
          )
        })}
      </SliderPrimitive.Root>
      {normalizedMarks.length > 0 ? (
        <div aria-hidden="true" className="mx-2 relative">
          {normalizedMarks.map((m) => (
            <span
              key={m.value}
              data-slot="slider-mark"
              className={cn(
                "top-0 absolute flex -translate-x-1/2 flex-col items-center rtl:translate-x-1/2",
                classNames?.mark,
              )}
              style={{ insetInlineStart: `${percent(m.value, min, max)}%` }}
            >
              <span className="mt-1 h-1.5 w-px bg-border" />
              {m.label !== undefined ? (
                <span
                  className={cn(
                    "mt-0.5 text-xs whitespace-nowrap text-muted-foreground tabular-nums",
                    classNames?.markLabel,
                  )}
                >
                  {m.label}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
