"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"

import { useMediaQuery } from "../../hooks/use-media-query"
import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"

export const progressTrackVariants = cva("relative w-full overflow-hidden rounded-full bg-muted", {
  variants: {
    size: { sm: "h-1", md: "h-2", lg: "h-3" },
  },
  defaultVariants: { size: "md" },
})

export const progressIndicatorVariants = cva("ease-out h-full rounded-full transition-[width] duration-300", {
  variants: {
    color: {
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      destructive: "bg-destructive",
      info: "bg-info",
      muted: "bg-muted-foreground",
    },
  },
  defaultVariants: { color: "primary" },
})

export interface ProgressBarProps
  extends
    Omit<React.ComponentProps<typeof ProgressPrimitive.Root>, "value" | "max" | "color">,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  /** Current value. `null`/omitted shows an indeterminate bar. */
  value?: number | null
  /** Maximum value. Default 100. */
  max?: number
  /** Visible label above the bar; also the accessible name. */
  label?: React.ReactNode
  /** Show the value (e.g. "40%") beside the label. Default `true` when determinate and labelled. */
  showValue?: boolean
  /** Custom value text, e.g. `(v, max) => \`${v} of ${max} files\``. Also read by screen readers. */
  formatValue?: (value: number, max: number) => string
  classNames?: { label?: string; value?: string; track?: string; indicator?: string; header?: string }
}

/**
 * A determinate or indeterminate progress bar with an optional label and
 * value text, in semantic colours. Fills from the inline start, so it is
 * mirrored in RTL (R11.6). Built on Radix `Progress` (shadcn).
 */
export function ProgressBar({
  value = null,
  max = 100,
  label,
  showValue,
  formatValue,
  size,
  color,
  className,
  classNames,
  "aria-label": ariaLabel,
  ...props
}: ProgressBarProps) {
  const { locale, t } = useOnu()
  const labelId = React.useId()
  const indicatorRef = React.useRef<HTMLDivElement>(null)
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const indeterminate = value === null || value === undefined || Number.isNaN(value)
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), max)
  const percent = max > 0 ? (clamped / max) * 100 : 0
  const text = indeterminate
    ? undefined
    : formatValue
      ? formatValue(clamped, max)
      : new Intl.NumberFormat(locale.numberLocale, { style: "percent", maximumFractionDigits: 0 }).format(percent / 100)
  const withValue = showValue ?? (!!label && !indeterminate)

  // Indeterminate sweep via the Web Animations API (no global keyframes needed).
  // Logical `insetInlineStart` makes it run from the inline start in RTL too.
  React.useEffect(() => {
    const el = indicatorRef.current
    if (!indeterminate || reducedMotion || !el || typeof el.animate !== "function") return
    const animation = el.animate([{ insetInlineStart: "-40%" }, { insetInlineStart: "100%" }], {
      duration: 1400,
      iterations: Infinity,
      easing: "ease-in-out",
    })
    return () => animation.cancel()
  }, [indeterminate, reducedMotion])

  return (
    <div data-slot="progress-bar" className={cn("gap-1.5 grid w-full", className)}>
      {label || withValue ? (
        <div className={cn("gap-2 text-sm flex items-baseline justify-between", classNames?.header)}>
          {label ? (
            <span id={labelId} className={cn("font-medium", classNames?.label)}>
              {label}
            </span>
          ) : (
            <span />
          )}
          {withValue && text ? (
            <span
              aria-hidden="true"
              dir="auto"
              data-slot="progress-bar-value"
              className={cn("text-muted-foreground tabular-nums", classNames?.value)}
            >
              {text}
            </span>
          ) : null}
        </div>
      ) : null}
      <ProgressPrimitive.Root
        data-slot="progress-bar-track"
        value={indeterminate ? null : clamped}
        max={max}
        getValueLabel={() => text ?? ""}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : (ariaLabel ?? t("overlay.progress"))}
        className={cn(progressTrackVariants({ size }), classNames?.track)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          ref={indicatorRef}
          data-slot="progress-bar-indicator"
          className={cn(
            progressIndicatorVariants({ color }),
            indeterminate && "inset-y-0 start-0 absolute w-2/5",
            indeterminate && reducedMotion && "w-full opacity-40",
            classNames?.indicator,
          )}
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}
