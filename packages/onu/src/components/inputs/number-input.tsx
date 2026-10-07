"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_shared"
import { TextInput, type TextInputProps } from "./text-input"

export interface NumberInputProps extends Omit<
  TextInputProps,
  "type" | "thaana" | "thaanaToggle" | "value" | "defaultValue" | "min" | "max" | "step" | "inputMode"
> {
  /** Controlled value. `null` is empty. */
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
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
 * Numeric input with locale-aware formatting (shown when not editing),
 * `min` / `max` / `step`, and APG spinbutton keys. It is a text field with a
 * numeric keyboard, so the scroll wheel never changes the value by accident.
 * With a `name`, the raw number is submitted through a hidden input.
 */
export function NumberInput({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 1,
  largeStep,
  formatOptions,
  clampOnBlur = true,
  inputMode,
  onFocus,
  onBlur,
  onKeyDown,
  onChange,
  name: nameProp,
  ...props
}: NumberInputProps) {
  const { locale } = useOnu()
  const numberLocale = locale.numberLocale
  const [value, setValue] = useControllableState<number | null>(valueProp, defaultValue, onValueChange)
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
    if (n !== value) setValue(n)
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
        name=""
        dir="ltr"
        className={cn("tabular-nums", props.className)}
      />
      {name ? (
        <input type="hidden" name={name} value={value ?? ""} form={props.form} disabled={props.disabled} />
      ) : null}
    </>
  )
}
