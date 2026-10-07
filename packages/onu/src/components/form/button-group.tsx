import * as React from "react"

import { cn } from "../../lib/utils"
import { ButtonGroup as BaseButtonGroup } from "../../ui/button-group"

export interface ButtonGroupProps extends React.ComponentProps<"div"> {
  orientation?: "horizontal" | "vertical"
  /**
   * `true` (default) joins the buttons into one segmented control (shadcn's
   * button group). `false` keeps them separate with a gap and lets them wrap.
   */
  attached?: boolean
  /** Accessible name for the group, e.g. "Text formatting". */
  label?: string
}

/** Groups related buttons. Built on shadcn's `ButtonGroup`; joined edges swap sides in RTL. */
export function ButtonGroup({
  orientation = "horizontal",
  attached = true,
  label,
  className,
  ...props
}: ButtonGroupProps) {
  if (attached) {
    return <BaseButtonGroup orientation={orientation} aria-label={label} className={className} {...props} />
  }
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      data-attached="false"
      aria-label={label}
      className={cn(
        "gap-2 flex flex-wrap items-center",
        orientation === "vertical" && "flex-col items-stretch",
        className,
      )}
      {...props}
    />
  )
}
