"use client"

import * as React from "react"

import { useClearFieldError } from "./form-context"
import { useFormField } from "./form-field"

export type FieldValueValue = string | number | null | undefined | readonly string[]

export interface FieldValueProps {
  /** Field name. Nothing renders without one. Arrays submit as `name[]`. */
  name?: string
  /** Value to submit. `null`/`undefined` submit an empty string; an array submits one input per item. */
  value: FieldValueValue
  /** `id` of the visible control, so errors for `name` can find and focus it. Defaults to the FormField's `id`. */
  control?: string
  /** The control's own disabled state. A disabled `FormField` disables the value too. */
  disabled?: boolean
  /** `form` attribute, for controls outside their `<form>`. */
  form?: string
}

/**
 * The hidden input(s) a composite control submits its value through. Every
 * control that keeps its value outside a native input uses this, so they all:
 *
 * - drop out of the submission when the control or its `FormField` is disabled;
 * - point at the visible control (`data-control`), so `Form`, `ValidationSummary`
 *   and `focusFirstInvalid` can go from a field name to something focusable;
 * - clear the field's server error in a surrounding `Form` when the value changes.
 *
 * An empty array submits nothing (as a native multi-select would), but still
 * renders a disabled marker so the field can be found by name.
 */
export function FieldValue({ name, value, control, disabled, form }: FieldValueProps) {
  const field = useFormField()
  const off = !!disabled || !!field?.disabled
  const controlId = control ?? field?.id
  const clearError = useClearFieldError()

  const key = Array.isArray(value) ? JSON.stringify(value) : String(value ?? "")
  const last = React.useRef(key)
  React.useEffect(() => {
    if (key === last.current) return
    last.current = key
    if (name) clearError?.(name)
  }, [key, name, clearError])

  if (!name) return null
  const common = { type: "hidden", "data-slot": "field-value", "data-control": controlId, form } as const
  if (Array.isArray(value)) {
    const arrayName = name.endsWith("[]") ? name : `${name}[]`
    const items = value as readonly string[]
    if (!items.length) return <input {...common} name={arrayName} disabled value="" />
    return (
      <>
        {items.map((item, i) => (
          <input key={`${i}-${item}`} {...common} name={arrayName} value={item} disabled={off} />
        ))}
      </>
    )
  }
  return <input {...common} name={name} value={String(value ?? "")} disabled={off} />
}
