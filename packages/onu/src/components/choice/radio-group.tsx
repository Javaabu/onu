"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { useFormField, useFormFieldControl } from "../form/form-field"
import {
  RadioGroupStyleContext,
  type RadioGroupContextValue,
  type RadioSize,
  type RadioVariant,
} from "./_radio-context"
import { normalizeOptions, type ChoiceOption, type ChoiceOptionInput } from "./options"
import { Radio } from "./radio"

export const radioGroupVariants = cva("w-full", {
  variants: {
    variant: { default: "", card: "" },
    orientation: { vertical: "", horizontal: "" },
  },
  compoundVariants: [
    { variant: "default", orientation: "vertical", className: "gap-3 grid" },
    { variant: "default", orientation: "horizontal", className: "gap-x-6 gap-y-3 flex flex-wrap" },
    { variant: "card", orientation: "vertical", className: "gap-2 grid" },
    {
      variant: "card",
      orientation: "horizontal",
      className: "gap-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))]",
    },
  ],
  defaultVariants: { variant: "default", orientation: "vertical" },
})

export interface RadioGroupOption extends ChoiceOption {
  /** Card variant: icon, logo or image. */
  media?: React.ReactNode
  /** Card variant: content at the end, e.g. a price. */
  aside?: React.ReactNode
}

export interface RadioGroupProps extends Omit<React.ComponentProps<typeof RadioGroupPrimitive.Root>, "orientation"> {
  /** Options as an array. Alternatively pass `Radio` (or shadcn `RadioGroupItem`) children. */
  options?: ReadonlyArray<RadioGroupOption | ChoiceOptionInput>
  /** `default` radios with labels, or selectable `card`s. */
  variant?: RadioVariant
  /** `vertical` (default) or `horizontal`; horizontal wraps on narrow screens. Arrow keys follow it (and RTL). */
  orientation?: "vertical" | "horizontal"
  /** `lg` gives larger controls and cards (kiosks). */
  size?: RadioSize
  classNames?: RadioGroupContextValue["classNames"]
}

/**
 * A set of radios where one can be chosen (shadcn radio group). Options can be
 * given as an array or as `Radio` children, in a `default` or `card` variant,
 * stacked or side by side. Arrow keys move between options and follow RTL.
 */
export function RadioGroup({
  options,
  variant = "default",
  orientation = "vertical",
  size = "default",
  className,
  classNames,
  children,
  ...props
}: RadioGroupProps) {
  const field = useFormField()
  const control = useFormFieldControl(props as Record<string, unknown>) as React.ComponentProps<
    typeof RadioGroupPrimitive.Root
  >
  const invalid = control["aria-invalid"] === true || control["aria-invalid"] === "true"
  const context = React.useMemo<RadioGroupContextValue>(
    () => ({ variant, size, invalid, classNames }),
    [variant, size, invalid, classNames],
  )
  const items = normalizeOptions(options as ReadonlyArray<ChoiceOptionInput> | undefined) as RadioGroupOption[]
  // A radiogroup is not labelable by <label for>, so name it by the FormField label's id.
  const labelledBy = control["aria-labelledby"] ?? (field && !control["aria-label"] ? field.labelId : undefined)

  return (
    <RadioGroupStyleContext.Provider value={context}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        data-variant={variant}
        orientation={orientation}
        {...control}
        aria-labelledby={labelledBy}
        className={cn(radioGroupVariants({ variant, orientation }), className)}
      >
        {items.map((o) => (
          <Radio
            key={o.value}
            value={o.value}
            label={o.label}
            description={o.description}
            disabled={o.disabled}
            media={o.media ?? o.icon}
            aside={o.aside}
          />
        ))}
        {children}
      </RadioGroupPrimitive.Root>
    </RadioGroupStyleContext.Provider>
  )
}
