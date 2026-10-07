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
 *
 * The button itself is 24×24 (WCAG 2.5.8 target size, which a pseudo-element
 * hit area does not satisfy) with the 16px box drawn inside, so it stays clear
 * of a sortable header button in the next column.
 */
export function SelectionCheckbox({ checked, onCheckedChange, className, ...props }: SelectionCheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={checked}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      className={cn(
        "group/checkbox peer size-6 relative inline-flex shrink-0 items-center justify-center rounded-md outline-none disabled:cursor-not-allowed disabled:opacity-50",
        // 44px on touch screens (R3.25).
        "touch:after:-inset-2.5 touch:after:absolute",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        data-slot="checkbox-box"
        className={cn(
          "size-4 flex items-center justify-center rounded-[4px] border border-input transition-colors dark:group-data-[state=unchecked]/checkbox:bg-input/30",
          "group-focus-visible/checkbox:border-ring group-focus-visible/checkbox:ring-3 group-focus-visible/checkbox:ring-ring/50",
          "group-data-[state=checked]/checkbox:border-primary group-data-[state=checked]/checkbox:bg-primary group-data-[state=checked]/checkbox:text-primary-foreground",
          "group-data-[state=indeterminate]/checkbox:border-primary group-data-[state=indeterminate]/checkbox:bg-primary group-data-[state=indeterminate]/checkbox:text-primary-foreground",
        )}
      >
        <CheckboxPrimitive.Indicator className="[&>svg]:size-3.5 grid place-content-center text-current">
          <Icon name={checked === "indeterminate" ? "minus" : "check"} />
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  )
}
