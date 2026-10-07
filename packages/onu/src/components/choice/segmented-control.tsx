"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useControllableState } from "./_hooks"
import { normalizeOptions, type ChoiceOptionInput } from "./options"

export const segmentedControlVariants = cva(
  // Scrolls sideways instead of truncating labels when space runs out; the
  // scrollbar is hidden because a focused or swiped segment scrolls into view.
  "gap-0.5 p-0.5 min-w-0 inline-flex max-w-full [scrollbar-width:none] items-stretch overflow-x-auto rounded-lg bg-muted text-muted-foreground [&::-webkit-scrollbar]:hidden",
  {
    variants: {
      size: {
        sm: "h-7 text-xs",
        default: "h-8 text-sm",
        lg: "h-10 text-sm",
      },
      fullWidth: { true: "flex w-full", false: "" },
    },
    defaultVariants: { size: "default", fullWidth: false },
  },
)

const itemClasses = [
  // Segments size to their label (never truncated) and share any spare room evenly.
  "relative inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 font-medium outline-none transition-[color,background-color,box-shadow]",
  "hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm dark:data-[state=on]:bg-input/50",
  "[&_svg]:size-4 [&_svg]:shrink-0 touch:min-h-11",
]

export interface SegmentedControlProps
  extends
    Omit<
      React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
      "type" | "value" | "defaultValue" | "onValueChange" | "children"
    >,
    Omit<VariantProps<typeof segmentedControlVariants>, "fullWidth"> {
  options: ReadonlyArray<ChoiceOptionInput>
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Stretch to the container width, segments sharing the space. */
  fullWidth?: boolean
  /** Show only the icon of options that have one (the label stays for screen readers). */
  iconOnly?: boolean
  classNames?: { item?: string }
}

/**
 * Pick one of a few options shown side by side (shadcn toggle group, single
 * mode). One segment is always selected; arrow keys move between segments in
 * visual order, also in RTL.
 */
export function SegmentedControl({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  size,
  fullWidth = false,
  iconOnly = false,
  className,
  classNames,
  ...props
}: SegmentedControlProps) {
  const items = normalizeOptions(options)
  const [value, setValue] = useControllableState<string>(
    valueProp,
    defaultValue ?? items[0]?.value ?? "",
    onValueChange,
  )
  const control = useFormFieldControl(props as Record<string, unknown>) as Omit<
    React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
    "type" | "value" | "defaultValue" | "onValueChange"
  > & { name?: string; required?: boolean }
  // A segmented control always has a value, so `required` adds nothing.
  const { name, required: _required, "aria-required": _ariaRequired, ...rootProps } = control
  const field = useFormField()
  const labelledBy = rootProps["aria-labelledby"] ?? (field && !rootProps["aria-label"] ? field.labelId : undefined)

  return (
    <>
      <ToggleGroupPrimitive.Root
        data-slot="segmented-control"
        data-size={size ?? "default"}
        {...rootProps}
        aria-labelledby={labelledBy}
        type="single"
        value={value}
        // A segmented control always has a value: ignore attempts to deselect.
        onValueChange={(next: string) => {
          if (next) setValue(next)
        }}
        className={cn(segmentedControlVariants({ size, fullWidth }), className)}
      >
        {items.map((o) => (
          <ToggleGroupPrimitive.Item
            key={o.value}
            value={o.value}
            disabled={o.disabled}
            aria-label={iconOnly && o.icon ? o.label : undefined}
            className={cn(itemClasses, classNames?.item)}
          >
            {o.icon}
            {iconOnly && o.icon ? null : <span>{o.label}</span>}
          </ToggleGroupPrimitive.Item>
        ))}
      </ToggleGroupPrimitive.Root>
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </>
  )
}
