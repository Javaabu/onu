"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import { computeDelta, deltaSentiment, useChartFormat, type DeltaDirection } from "./format"
import { registerEnglish } from "../i18n/english"
import { chart as en_chart } from "../locales/en/chart"

registerEnglish({ chart: en_chart })

export const deltaIndicatorVariants = cva("gap-1 font-medium inline-flex items-center whitespace-nowrap tabular-nums", {
  variants: {
    sentiment: {
      positive: "text-success",
      negative: "text-destructive",
      neutral: "text-muted-foreground",
    },
    variant: {
      text: "text-sm",
      badge: "px-1.5 py-0.5 text-xs rounded-md",
    },
  },
  compoundVariants: [
    { variant: "badge", sentiment: "positive", className: "bg-success/10" },
    { variant: "badge", sentiment: "negative", className: "bg-destructive/10" },
    { variant: "badge", sentiment: "neutral", className: "bg-muted" },
  ],
  defaultVariants: { sentiment: "neutral", variant: "text" },
})

export interface DeltaIndicatorProps
  extends Omit<React.ComponentProps<"span">, "children">, Pick<VariantProps<typeof deltaIndicatorVariants>, "variant"> {
  /** Relative change as a ratio (`0.12` = +12%). Takes priority over `current`/`previous`. */
  value?: number | null
  /** Current value; with `previous` the change is computed. */
  current?: number
  previous?: number
  /** Whether an increase is good (green). Set `false` for costs, complaints, wait times. Default `true`. */
  positiveIsGood?: boolean
  /** Text after the delta, e.g. "vs last month". Read by screen readers too. */
  context?: React.ReactNode
}

const ICONS: Record<DeltaDirection, string> = { up: "arrow-up", down: "arrow-down", flat: "minus" }

/**
 * A change indicator: arrow icon + signed percentage + semantic colour, so direction is never
 * conveyed by colour alone (R14.6). Screen readers hear "Up 12.5%" / "Down 3%" / "No change".
 */
export function DeltaIndicator({
  value,
  current,
  previous,
  positiveIsGood = true,
  variant,
  context,
  className,
  ...props
}: DeltaIndicatorProps) {
  const { t } = useOnu()
  const fmt = useChartFormat("percent")

  let ratio: number | null = value ?? null
  let direction: DeltaDirection = "flat"
  if (value !== undefined && value !== null) {
    direction = Math.abs(value) < 1e-9 ? "flat" : value > 0 ? "up" : "down"
  } else if (current !== undefined && previous !== undefined) {
    const delta = computeDelta(current, previous)
    ratio = delta.ratio
    direction = delta.direction
  }
  const sentiment = deltaSentiment(direction, positiveIsGood)

  const magnitude = ratio === null ? null : fmt.percent(Math.abs(ratio))
  const visible =
    magnitude === null
      ? t("chart.noValue")
      : `${direction === "down" ? "−" : direction === "up" ? "+" : ""}${magnitude}`
  const spoken =
    direction === "flat"
      ? t("chart.noChange")
      : magnitude === null
        ? t(direction === "up" ? "chart.increase" : "chart.decrease", { value: "" }).trim()
        : t(direction === "up" ? "chart.increase" : "chart.decrease", { value: magnitude })

  return (
    <span
      data-slot="delta-indicator"
      data-direction={direction}
      data-sentiment={sentiment}
      className={cn(deltaIndicatorVariants({ sentiment, variant }), className)}
      {...props}
    >
      <Icon name={ICONS[direction]} className="size-3.5 shrink-0" />
      <span aria-hidden="true" dir="ltr">
        {visible}
      </span>
      <span className="sr-only">{spoken}</span>
      {context ? <span className="ms-0.5 font-normal text-muted-foreground">{context}</span> : null}
    </span>
  )
}
