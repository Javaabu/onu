"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { ProgressBar, type ProgressBarProps } from "../loading/progress-bar"
import { NavIcon, NavLink } from "./_nav"

export interface UsageMeterProps extends Omit<React.ComponentProps<"div">, "children" | "color"> {
  /** What is being used, e.g. "Storage" or "Records quota". */
  label: React.ReactNode
  /** Semantic icon name or node before the label. */
  icon?: string | React.ReactNode
  /** The amount used. */
  value: number
  /** The quota. */
  max: number
  /** Value text. Default: "1,284 / 2,000" in the active locale's digits. */
  formatValue?: (value: number, max: number) => string
  /**
   * Bar colour. Default: the brand colour, `warning` from 80% and
   * `destructive` from 95%, so a nearly full quota stands out.
   */
  color?: ProgressBarProps["color"]
  /** A link under the bar, e.g. "Get more space". */
  link?: { label: React.ReactNode; href: string; external?: boolean }
  /** Small text at the end of the bottom row, e.g. the app version. */
  meta?: React.ReactNode
  classNames?: { bar?: string; label?: string; value?: string; footer?: string; link?: string; meta?: string }
}

/**
 * A quota meter for the bottom of the sidebar (Proton's storage meter): a
 * labelled bar with "used / total", an optional link (e.g. upgrade) and a
 * small note such as the app version. Built on `ProgressBar`, so the value is
 * announced and the bar fills from the inline start (mirrored in RTL).
 */
export function UsageMeter({
  label,
  icon,
  value,
  max,
  formatValue,
  color,
  link,
  meta,
  className,
  classNames,
  ...props
}: UsageMeterProps) {
  const { locale } = useTranslation()
  const fmt = new Intl.NumberFormat(locale.numberLocale)
  const ratio = max > 0 ? value / max : 0
  const tone = color ?? (ratio >= 0.95 ? "destructive" : ratio >= 0.8 ? "warning" : "primary")

  return (
    <div
      data-slot="usage-meter"
      className={cn(
        "gap-2 pt-3 grid border-t border-[color:var(--shell-border,var(--border))]",
        "dark:border-[color:var(--shell-border,var(--border))]",
        className,
      )}
      {...props}
    >
      <ProgressBar
        value={value}
        max={max}
        size="sm"
        color={tone}
        showValue
        label={
          <span className="gap-1.5 [&_svg]:size-4 inline-flex items-center">
            <NavIcon icon={icon} />
            {label}
          </span>
        }
        formatValue={formatValue ?? ((v, m) => `${fmt.format(v)} / ${fmt.format(m)}`)}
        className={classNames?.bar}
        classNames={{
          label: cn("text-xs", classNames?.label),
          value: cn("text-xs tabular-nums", classNames?.value),
          // A weak tonal track that reads on the shell and on cards.
          track: "bg-[color:var(--shell-weak,#eae7e4)] dark:bg-[color:var(--shell-weak,#3f3b4c)]",
        }}
      />
      {link || meta ? (
        <div
          data-slot="usage-meter-footer"
          className={cn("gap-2 text-xs flex items-center justify-between", classNames?.footer)}
        >
          {link ? (
            <NavLink
              href={link.href}
              external={link.external}
              className={cn(
                "touch:min-h-11 inline-flex items-center rounded-sm text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
                classNames?.link,
              )}
            >
              {link.label}
            </NavLink>
          ) : (
            <span />
          )}
          {meta ? <span className={cn("text-muted-foreground", classNames?.meta)}>{meta}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
