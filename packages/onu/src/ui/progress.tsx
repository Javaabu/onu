"use client"

// Vendored from shadcn/ui (radix base, nova style, RTL) by scripts/sync-shadcn.mjs.
// Onu changes are marked with "onu:" comments; keep them when re-syncing.

import * as React from "react"
import { cn } from "../lib/utils"
import { Direction, Progress as ProgressPrimitive } from "radix-ui"

function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  // onu: pass `value` to Radix (aria-valuenow) and fill from the inline start in RTL.
  const rtl = Direction.useDirection() === "rtl"
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn("h-1 relative flex w-full items-center overflow-x-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(${rtl ? "" : "-"}${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
