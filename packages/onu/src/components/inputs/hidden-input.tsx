"use client"

import { useFormFieldControl } from "../form/form-field"

export type HiddenInputValue = string | number | boolean | null | undefined | readonly string[]

export interface HiddenInputProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "defaultValue"> {
  /**
   * Value to submit. Booleans become `"1"` / `"0"` (as Laravel expects), `null`
   * and `undefined` become an empty string, and arrays render one input per item
   * (`name[]`).
   */
  value?: HiddenInputValue
}

function serialize(value: Exclude<HiddenInputValue, readonly string[]>): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "1" : "0"
  return String(value)
}

/**
 * A hidden form value. Inside a `FormField` it takes the field's `id` and
 * `name`, so it works with server errors and `react-hook-form` like any other
 * control.
 */
export function HiddenInput({ value, ...props }: HiddenInputProps) {
  const { id, name, ref, form, disabled } = useFormFieldControl(props) as HiddenInputProps
  if (Array.isArray(value)) {
    const arrayName = name && !name.endsWith("[]") ? `${name}[]` : name
    return (
      <>
        {(value as readonly string[]).map((item, i) => (
          <input
            key={`${i}-${item}`}
            type="hidden"
            data-slot="hidden-input"
            id={i === 0 ? id : undefined}
            name={arrayName}
            value={item}
            form={form}
            disabled={disabled}
          />
        ))}
      </>
    )
  }
  return (
    <input
      ref={ref}
      type="hidden"
      data-slot="hidden-input"
      id={id}
      name={name}
      form={form}
      disabled={disabled}
      value={serialize(value as Exclude<HiddenInputValue, readonly string[]>)}
    />
  )
}
