import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"
import { Separator } from "../../ui/separator"

export const dividerVariants = cva("shrink-0", {
  variants: {
    variant: {
      solid: "",
      dashed: "border-dashed border-border bg-transparent data-horizontal:border-t data-vertical:border-s",
    },
    spacing: {
      none: "",
      sm: "data-horizontal:my-2 data-vertical:mx-2",
      md: "data-horizontal:my-4 data-vertical:mx-4",
      lg: "data-horizontal:my-8 data-vertical:mx-8",
    },
  },
  defaultVariants: { variant: "solid", spacing: "none" },
})

const SHORT = "flex-none data-horizontal:w-4 data-vertical:h-4"
const LONG = "flex-1 data-horizontal:w-auto data-vertical:h-auto data-vertical:self-auto"

export interface DividerProps
  extends Omit<React.ComponentProps<"div">, "children">, VariantProps<typeof dividerVariants> {
  orientation?: "horizontal" | "vertical"
  /** Text in the middle of the line, e.g. "or". */
  label?: React.ReactNode
  /** Where the label sits along the line. */
  align?: "start" | "center" | "end"
  /** Expose the line to assistive technology as a `separator` (only without a label). */
  decorative?: boolean
  classNames?: { line?: string; label?: string }
}

/** A separator line, optionally with a label ("or", a date, a section name). */
export function Divider({
  orientation = "horizontal",
  label,
  align = "center",
  variant,
  spacing,
  decorative = true,
  className,
  classNames,
  ...props
}: DividerProps) {
  const lineClass = cn(dividerVariants({ variant }), classNames?.line)

  if (label === undefined || label === null || label === false) {
    return (
      <Separator
        orientation={orientation}
        decorative={decorative}
        className={cn(dividerVariants({ variant, spacing }), classNames?.line, className)}
        {...(props as React.ComponentProps<typeof Separator>)}
      />
    )
  }

  const vertical = orientation === "vertical"
  return (
    <div
      data-slot="divider"
      data-orientation={orientation}
      data-align={align}
      className={cn(
        "gap-3 text-xs flex items-center text-muted-foreground",
        vertical ? "flex-col self-stretch" : "w-full",
        dividerVariants({ spacing }),
        className,
      )}
      {...props}
    >
      <Separator orientation={orientation} className={cn(lineClass, align === "start" ? SHORT : LONG)} />
      <span data-slot="divider-label" className={cn("shrink-0", classNames?.label)}>
        {label}
      </span>
      <Separator orientation={orientation} className={cn(lineClass, align === "end" ? SHORT : LONG)} />
    </div>
  )
}
