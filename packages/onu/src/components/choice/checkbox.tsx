"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useFormFieldControl } from "../form/form-field"
import { ChoiceLabelLayout, joinIds, type ChoiceLabelClassNames } from "./_choice-label"

/** The checkbox box (extends shadcn's checkbox styles). */
export const checkboxVariants = cva(
  [
    "group/checkbox peer relative flex shrink-0 items-center justify-center border border-input transition-colors outline-none dark:bg-input/30",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary",
    "data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:data-[state=indeterminate]:bg-primary",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "disabled:cursor-not-allowed disabled:opacity-50",
    // Larger hit area, ≥ 44px on touch screens (R3.25).
    "after:-inset-x-3 after:-inset-y-2 touch:after:-inset-3.5 after:absolute",
  ],
  {
    variants: {
      size: {
        sm: "size-3.5 [&_svg]:size-3 rounded-[3px]",
        default: "size-4 [&_svg]:size-3.5 rounded-[4px]",
        lg: "size-5 [&_svg]:size-4 rounded-[5px]",
      },
    },
    defaultVariants: { size: "default" },
  },
)

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>, VariantProps<typeof checkboxVariants> {
  /** Visible label beside the box. */
  label?: React.ReactNode
  /** Secondary text under the label. */
  description?: React.ReactNode
  /** Show the mixed state (a dash). Same as `checked="indeterminate"`. */
  indeterminate?: boolean
  /** Label after (default) or before the box. */
  labelPosition?: "start" | "end"
  /** Classes for the wrapper, label and description when a label is set. `className` styles the box. */
  classNames?: ChoiceLabelClassNames
}

/**
 * shadcn's checkbox plus a label, description and an indeterminate (mixed)
 * state. Without `label` it renders just the box, exactly like the primitive.
 */
export function Checkbox({
  label,
  description,
  indeterminate,
  labelPosition = "end",
  size,
  checked,
  className,
  classNames,
  ...props
}: CheckboxProps) {
  const generated = React.useId()
  const control = useFormFieldControl(props as Record<string, unknown>) as React.ComponentProps<
    typeof CheckboxPrimitive.Root
  >
  const id = control.id ?? (label ? `checkbox-${generated}` : undefined)
  const descriptionId = description ? `${id ?? generated}-description` : undefined

  const box = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size ?? "default"}
      {...control}
      id={id}
      checked={indeterminate ? "indeterminate" : checked}
      aria-describedby={joinIds(control["aria-describedby"], descriptionId)}
      className={cn(checkboxVariants({ size }), className)}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <Icon name="check" className="group-data-[state=indeterminate]/checkbox:hidden" />
        <Icon name="minus" className="hidden group-data-[state=indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!label && !description) return box

  return (
    <ChoiceLabelLayout
      slot="checkbox-field"
      control={box}
      htmlFor={id!}
      label={label}
      description={description}
      descriptionId={descriptionId}
      disabled={control.disabled}
      position={labelPosition}
      classNames={classNames}
    />
  )
}
