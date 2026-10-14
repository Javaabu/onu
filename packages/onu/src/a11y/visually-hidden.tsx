import { Slot } from "radix-ui"

import { cn } from "../lib/utils"

export interface VisuallyHiddenProps extends React.ComponentProps<"span"> {
  /** Render the child element instead of a `<span>` (Radix `Slot`). */
  asChild?: boolean
  /** Show the content while it (or something inside it) has keyboard focus, e.g. a "Skip to content" link. */
  focusable?: boolean
}

/**
 * Content for screen readers only: removed from the visual layout with
 * Tailwind's `sr-only`, but still read out and still in the tab order.
 */
export function VisuallyHidden({ asChild, focusable, className, ...props }: VisuallyHiddenProps) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp
      data-slot="visually-hidden"
      className={cn("sr-only", focusable && "focus-within:not-sr-only focus:not-sr-only", className)}
      {...props}
    />
  )
}
