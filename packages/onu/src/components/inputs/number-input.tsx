"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { InputGroupButton } from "../../ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_shared"
import { TextInput, type TextInputProps } from "./text-input"
import { registerEnglish } from "../../i18n/english"
import { input as en_input } from "../../locales/en/input"

registerEnglish({ input: en_input })

/** Sizes of the `stepper` field. */
export const numberInputVariants = cva("", {
  variants: {
    size: {
      sm: "h-8 w-28",
      default: "h-10 w-36",
      lg: "h-12 w-44 text-lg",
    },
  },
  defaultVariants: { size: "default" },
})

const stepperButtonSizes = {
  sm: "size-7 touch:size-11",
  default: "size-9 touch:size-11",
  lg: "size-11",
} as const

export interface NumberInputUnitOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

interface NumberInputBaseProps extends Omit<
  TextInputProps,
  "type" | "thaana" | "thaanaToggle" | "value" | "defaultValue" | "min" | "max" | "step" | "inputMode"
> {
  min?: number
  max?: number
  /** Arrow key step. Default `1`. */
  step?: number
  /** Page Up / Page Down and Shift+Arrow step. Default `step × 10`. */
  largeStep?: number
  /** `Intl.NumberFormat` options used to display the value while not editing. */
  formatOptions?: Intl.NumberFormatOptions
  /** Clamp to `min` / `max` when the field loses focus. Default `true`. */
  clampOnBlur?: boolean
  inputMode?: "numeric" | "decimal" | "text"
  /** A fixed unit shown beside the number, e.g. `"kg"` or `"MVR"`. */
  unit?: React.ReactNode
  /** Choosable units. Renders a unit select instead of fixed text. */
  units?: NumberInputUnitOption[]
  /** Controlled selected unit. */
  unitValue?: string
  defaultUnit?: string
  onUnitChange?: (unit: string) => void
  /** Form field name for the selected unit. */
  unitName?: string
  /** Accessible name of the unit select. Defaults to "Unit". */
  unitLabel?: string
  /** Which side the unit sits on. Default `"end"`. */
  unitPosition?: "start" | "end"
  classNames?: TextInputProps["classNames"] & {
    unit?: string
    unitTrigger?: string
    decrement?: string
    increment?: string
  }
}

export interface NumberInputFieldProps extends NumberInputBaseProps {
  stepper?: false
  /** Controlled value. `null` is empty. */
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
}

export interface NumberInputStepperProps extends NumberInputBaseProps, VariantProps<typeof numberInputVariants> {
  /**
   * Large − and + buttons at the sides; holding one repeats the step. The value
   * is never empty: it starts at, and falls back to, `min` (default `0`).
   */
  stepper: true
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** Delay before press-and-hold starts repeating, in ms. Default `400`. */
  repeatDelay?: number
  /** Interval between repeats while held, in ms. Default `80`. */
  repeatInterval?: number
}

export type NumberInputProps = NumberInputFieldProps | NumberInputStepperProps

/** Every prop of both variants, for the implementation. */
type NumberInputAllProps = NumberInputBaseProps &
  VariantProps<typeof numberInputVariants> & {
    stepper?: boolean
    value?: number | null
    defaultValue?: number | null
    onValueChange?: (value: number | null) => void
    repeatDelay?: number
    repeatInterval?: number
  }

function decimalsOf(n: number | undefined) {
  if (n === undefined || !Number.isFinite(n)) return 0
  const s = String(n)
  if (s.includes("e-")) return Number(s.split("e-")[1])
  return s.split(".")[1]?.length ?? 0
}

/** Locale number symbols, e.g. `{ group: ",", decimal: "." }`. */
export function numberSymbols(numberLocale: string) {
  const parts = new Intl.NumberFormat(numberLocale).formatToParts(-12345.6)
  return {
    group: parts.find((p) => p.type === "group")?.value ?? ",",
    decimal: parts.find((p) => p.type === "decimal")?.value ?? ".",
  }
}

/**
 * Parses user input in the given locale. Returns `null` for an empty string,
 * and `undefined` when the text is not (yet) a number, e.g. `"-"`.
 */
export function parseLocaleNumber(text: string, numberLocale: string): number | null | undefined {
  const { group, decimal } = numberSymbols(numberLocale)
  const cleaned = text
    .trim()
    .replace(/[\s\u00a0\u202f]/g, "")
    .split(group)
    .join("")
    .replace(decimal, ".")
    .replace(/^[\u2212]/, "-")
  if (cleaned === "") return null
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return undefined
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}

function clamp(n: number, min?: number, max?: number) {
  if (min !== undefined && n < min) return min
  if (max !== undefined && n > max) return max
  return n
}

/**
 * Starts `action` on pointer down and repeats it while the pointer is held
 * (press-and-hold). Keyboard activation (Enter/Space) runs it once.
 */
function usePressRepeat(action: () => boolean, delay: number, interval: number) {
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const actionRef = React.useRef(action)
  React.useEffect(() => {
    actionRef.current = action
  })
  const stop = React.useCallback(() => {
    clearTimeout(timer.current)
    clearInterval(timer.current)
    timer.current = undefined
  }, [])
  React.useEffect(() => stop, [stop])

  return {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      stop()
      if (!actionRef.current()) return
      timer.current = setTimeout(() => {
        timer.current = setInterval(() => {
          if (!actionRef.current()) stop()
        }, interval)
      }, delay)
      window.addEventListener("pointerup", stop, { once: true })
      window.addEventListener("pointercancel", stop, { once: true })
    },
    onPointerLeave: stop,
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
      // Pointer presses are handled on pointer down; detail 0 means keyboard or assistive tech.
      if (e.detail === 0) actionRef.current()
    },
  }
}

/**
 * Numeric input with locale-aware formatting (shown when not editing),
 * `min` / `max` / `step`, and APG spinbutton keys. It is a text field with a
 * numeric keyboard, so the scroll wheel never changes the value by accident.
 * With a `name`, the raw number is submitted through a hidden input.
 *
 * `unit` / `units` add a fixed unit or a unit select; `stepper` adds large
 * − and + buttons with press-and-hold repeat (cart quantities, guest counts).
 */
export function NumberInput(allProps: NumberInputProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    min: minProp,
    max,
    step = 1,
    largeStep,
    formatOptions,
    clampOnBlur = true,
    inputMode,
    stepper = false,
    size = "default",
    repeatDelay = 400,
    repeatInterval = 80,
    unit,
    units,
    unitValue,
    defaultUnit,
    onUnitChange,
    unitName,
    unitLabel,
    unitPosition = "end",
    startAddon,
    endAddon,
    classNames,
    onFocus,
    onBlur,
    onKeyDown,
    onChange,
    name: nameProp,
    ...props
  } = allProps as NumberInputAllProps
  const { locale, t } = useOnu()
  const numberLocale = locale.numberLocale
  // A stepper always holds a number: it starts at and falls back to `min` (default 0).
  const min = stepper ? (minProp ?? 0) : minProp
  const [value, setValue] = useControllableState<number | null>(
    valueProp,
    defaultValue ?? (stepper ? (min ?? 0) : null),
    onValueChange,
  )
  const [selectedUnit, setSelectedUnit] = useControllableState<string>(
    unitValue,
    defaultUnit ?? units?.[0]?.value ?? "",
    onUnitChange,
  )
  // While focused, the raw text being edited and the value it stood for. If the value changes
  // from outside (a stepper button, a controlled parent), the text follows the new value.
  const [editing, setEditing] = React.useState<{ text: string; value: number | null } | null>(null)
  const { name } = useFormFieldControl({ name: nameProp })

  const scale = formatOptions?.style === "percent" ? 100 : 1
  const precision = Math.max(decimalsOf(step), decimalsOf(min), decimalsOf(max))
  const formatter = React.useMemo(
    () => new Intl.NumberFormat(numberLocale, formatOptions),
    [numberLocale, formatOptions],
  )
  const plain = React.useMemo(
    () => new Intl.NumberFormat(numberLocale, { useGrouping: false, maximumFractionDigits: 20 }),
    [numberLocale],
  )
  const formatted = value === null ? "" : formatter.format(value)
  const toDraft = (n: number | null) => (n === null ? "" : plain.format(Number((n * scale).toFixed(10))))
  const fromText = (text: string) => {
    const n = parseLocaleNumber(text, numberLocale)
    return typeof n === "number" ? n / scale : n
  }

  const draft = editing ? (editing.value === value ? editing.text : toDraft(value)) : null
  const setDraft = (text: string | null, forValue: number | null = value) =>
    setEditing(text === null ? null : { text, value: forValue })

  const commit = (n: number | null) => {
    const next = stepper && n === null ? (min ?? 0) : n
    if (next !== value) setValue(next)
  }

  const stepBy = (delta: number) => {
    const current = draft !== null ? fromText(draft) : value
    const next =
      typeof current === "number" ? clamp(Number((current + delta).toFixed(precision)), min, max) : clamp(0, min, max)
    commit(next)
    if (draft !== null) setDraft(toDraft(next), next)
  }

  const allowNegative = min === undefined || min < 0
  const integer = precision === 0 && !(formatOptions?.maximumFractionDigits && formatOptions.maximumFractionDigits > 0)
  const mode = inputMode ?? (integer && !allowNegative ? "numeric" : "decimal")

  // Stepper buttons read the latest value, so press-and-hold repeats from where it got to.
  const latest = React.useRef(value)
  React.useEffect(() => {
    latest.current = value
  }, [value])
  const change = (delta: number) => {
    const current = latest.current ?? min ?? 0
    const next = clamp(Number((current + delta).toFixed(10)), min, max)
    if (next === latest.current) return false
    latest.current = next
    setValue(next)
    return true
  }
  const decrement = usePressRepeat(() => change(-step), repeatDelay, repeatInterval)
  const increment = usePressRepeat(() => change(step), repeatDelay, repeatInterval)

  let decrementButton: React.ReactNode = null
  let incrementButton: React.ReactNode = null
  if (stepper) {
    // Buttons at a limit use aria-disabled, not disabled: a disabled descendant would grey out the whole group.
    const inactive = props.disabled || props.readOnly
    const button = cn(
      stepperButtonSizes[size ?? "default"],
      "aria-disabled:pointer-events-none aria-disabled:opacity-40",
    )
    decrementButton = (
      <InputGroupButton
        size="icon-sm"
        variant="ghost"
        tabIndex={-1}
        data-slot="number-input-decrement"
        aria-label={t("input.decrement")}
        disabled={inactive}
        aria-disabled={(value !== null && min !== undefined && value <= min) || undefined}
        className={cn(button, classNames?.decrement)}
        {...decrement}
      >
        <Icon name="minus" />
      </InputGroupButton>
    )
    incrementButton = (
      <InputGroupButton
        size="icon-sm"
        variant="ghost"
        tabIndex={-1}
        data-slot="number-input-increment"
        aria-label={t("input.increment")}
        disabled={inactive}
        aria-disabled={(value !== null && max !== undefined && value >= max) || undefined}
        className={cn(button, classNames?.increment)}
        {...increment}
      >
        <Icon name="plus" />
      </InputGroupButton>
    )
  }

  const unitAddon = units?.length ? (
    <Select value={selectedUnit} onValueChange={setSelectedUnit} name={unitName} disabled={props.disabled}>
      <SelectTrigger
        size="sm"
        data-slot="unit-select"
        aria-label={unitLabel ?? t("input.unit")}
        className={cn(
          "h-7 gap-1 px-2 text-sm font-normal border-0 bg-transparent text-foreground shadow-none dark:bg-transparent",
          "touch:min-h-11",
          classNames?.unitTrigger,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {units.map((u) => (
          <SelectItem key={u.value} value={u.value} disabled={u.disabled}>
            {u.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : unit !== undefined ? (
    <span data-slot="unit" className={cn("text-muted-foreground", classNames?.unit)}>
      {unit}
    </span>
  ) : null

  // Outermost to innermost: stepper button, your addon, then the unit next to the number.
  const startUnit = unitPosition === "start" ? unitAddon : null
  const endUnit = unitPosition === "end" ? unitAddon : null
  const start =
    decrementButton || startAddon || startUnit ? (
      <>
        {decrementButton}
        {startAddon}
        {startUnit}
      </>
    ) : undefined
  const end =
    endUnit || endAddon || incrementButton ? (
      <>
        {endUnit}
        {endAddon}
        {incrementButton}
      </>
    ) : undefined

  return (
    <>
      <TextInput
        role="spinbutton"
        inputMode={mode}
        autoComplete="off"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={formatted || undefined}
        value={draft ?? formatted}
        onFocus={(e) => {
          setDraft(toDraft(value))
          onFocus?.(e)
        }}
        onBlur={(e) => {
          if (draft !== null) {
            const parsed = fromText(draft)
            const n = typeof parsed === "number" ? parsed : parsed === null ? null : value
            commit(n !== null && clampOnBlur ? clamp(n, min, max) : n)
          }
          setDraft(null)
          onBlur?.(e)
        }}
        onChange={(e) => {
          const text = e.target.value
          if (!/^[\d\s\u00a0\u202f.,'\u2019\u066b\u066c+\-\u2212]*$/.test(text)) return
          const parsed = fromText(text)
          setDraft(text, parsed === undefined ? value : parsed)
          if (parsed !== undefined) commit(parsed)
          onChange?.(e)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.defaultPrevented || props.readOnly) return
          const big = largeStep ?? step * 10
          const map: Record<string, number> = {
            ArrowUp: e.shiftKey ? big : step,
            ArrowDown: -(e.shiftKey ? big : step),
            PageUp: big,
            PageDown: -big,
          }
          const delta = map[e.key]
          if (delta !== undefined) {
            e.preventDefault()
            stepBy(delta)
          }
        }}
        {...props}
        data-size={stepper ? size : undefined}
        startAddon={start}
        endAddon={end}
        name=""
        dir="ltr"
        className={cn("tabular-nums", stepper && [numberInputVariants({ size }), "touch:h-12"], props.className)}
        classNames={stepper ? { ...classNames, input: cn("font-medium text-center", classNames?.input) } : classNames}
      />
      {name ? (
        <input type="hidden" name={name} value={value ?? ""} form={props.form} disabled={props.disabled} />
      ) : null}
    </>
  )
}
