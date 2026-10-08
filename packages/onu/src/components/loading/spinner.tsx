"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2Icon } from "lucide-react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"

export const spinnerVariants = cva("animate-spin shrink-0", {
  variants: {
    size: {
      xs: "size-3",
      sm: "size-4",
      md: "size-5",
      lg: "size-6",
      xl: "size-8",
    },
    tone: {
      current: "",
      primary: "text-primary",
      muted: "text-muted-foreground",
    },
  },
  defaultVariants: { size: "sm", tone: "current" },
})

export interface SpinnerProps
  extends Omit<React.ComponentProps<"span">, "children">, VariantProps<typeof spinnerVariants> {
  /** Text for screen readers (and shown when `showLabel`). Default "Loading…". */
  label?: React.ReactNode
  /** Show the label beside the spinner instead of only to screen readers. */
  showLabel?: boolean
  classNames?: { icon?: string; label?: string }
}

/**
 * A spinning loading indicator with a screen-reader label. It is a polite live
 * region (`role="status"`), so the label is announced when it appears.
 *
 * Replaces the shadcn `Spinner` (still available from `@javaabu/onu/primitives`),
 * whose icon was hidden from screen readers and whose label was English only.
 */
export function Spinner({ size, tone, label, showLabel = false, className, classNames, ...props }: SpinnerProps) {
  const { t } = useTranslation()
  const text = label ?? t("overlay.loading")
  return (
    <span
      role="status"
      data-slot="spinner"
      data-size={size ?? "sm"}
      className={cn("gap-2 inline-flex items-center align-middle", className)}
      {...props}
    >
      <Icon name="loading" fallback={Loader2Icon} className={cn(spinnerVariants({ size, tone }), classNames?.icon)} />
      <span data-slot="spinner-label" className={cn(showLabel ? "text-sm" : "sr-only", classNames?.label)}>
        {text}
      </span>
    </span>
  )
}
