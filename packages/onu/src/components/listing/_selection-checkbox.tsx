"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"

export interface SelectionCheckboxProps extends Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  "checked" | "onCheckedChange"
> {
  checked: boolean | "indeterminate"
  onCheckedChange: (checked: boolean) => void
}

/**
 * Row / select-all checkbox. Same look as shadcn's `Checkbox`, plus a dash for
 * the "some rows selected" state (§25.6), which the vendored primitive draws as a tick.
 */
export function SelectionCheckbox({ checked, onCheckedChange, className, ...props }: SelectionCheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      className={cn(
        "peer size-4 relative flex shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:bg-input/30 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        // Bigger hit area without changing the look; 44px on touch screens (R3.25).
        "after:-inset-2.5 touch:after:-inset-3.5 after:absolute",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="[&>svg]:size-3.5 grid place-content-center text-current">
        <Icon name={checked === "indeterminate" ? "minus" : "check"} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
