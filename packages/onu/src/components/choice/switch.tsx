"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { Switch as SwitchPrimitive } from "../../ui/switch"
import { useFormFieldControl } from "../form/form-field"
import { ChoiceLabelLayout, joinIds, type ChoiceLabelClassNames } from "./_choice-label"

export interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive> {
  /** Visible label beside the switch. */
  label?: React.ReactNode
  /** Secondary text under the label. */
  description?: React.ReactNode
  /** Label after (default) or before the switch. Settings lists often use `start`. */
  labelPosition?: "start" | "end"
  /** Classes for the wrapper, label and description when a label is set. `className` styles the switch. */
  classNames?: ChoiceLabelClassNames
}

/**
 * shadcn's switch plus a label and description. Use it for settings that
 * apply immediately. Without `label` it renders just the switch.
 */
export function Switch({ label, description, labelPosition = "end", className, classNames, ...props }: SwitchProps) {
  const generated = React.useId()
  const control = useFormFieldControl(props as Record<string, unknown>) as React.ComponentProps<typeof SwitchPrimitive>
  const id = control.id ?? (label ? `switch-${generated}` : undefined)
  const descriptionId = description ? `${id ?? generated}-description` : undefined

  const toggle = (
    <SwitchPrimitive
      {...control}
      id={id}
      aria-describedby={joinIds(control["aria-describedby"], descriptionId)}
      className={cn("touch:after:-inset-x-2 touch:after:-inset-y-3.5", className)}
    />
  )

  if (!label && !description) return toggle

  return (
    <ChoiceLabelLayout
      slot="switch-field"
      control={toggle}
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
