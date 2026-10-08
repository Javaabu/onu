"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../icons/icon"
import type { SemanticIconName } from "../icons/types"
import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import { Skeleton } from "../ui/skeleton"
import { DeltaIndicator } from "./delta-indicator"
import { useChartFormat, type ValueFormat } from "./format"
import { Sparkline, type SparklineProps } from "./sparkline"

export const statTileVariants = cva(
  "min-w-0 gap-2 p-4 relative flex flex-col rounded-xl border border-border bg-card text-card-foreground outline-none",
  {
    variants: {
      size: {
        sm: "gap-1.5 p-3",
        default: "",
        lg: "gap-3 p-6",
      },
      interactive: {
        true: "transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
        false: "",
      },
    },
    defaultVariants: { size: "default", interactive: false },
  },
)

const valueSizes = { sm: "text-xl", default: "text-2xl", lg: "text-3xl" } as const

export interface StatTileClassNames {
  label?: string
  value?: string
  icon?: string
  delta?: string
  sparkline?: string
  footer?: string
}

export interface StatTileProps
  extends Omit<React.ComponentProps<"div">, "children">, Pick<VariantProps<typeof statTileVariants>, "size"> {
  /** What the number is, e.g. "Applications". */
  label: React.ReactNode
  /** The figure. Numbers are formatted with `valueFormat` and the active locale. */
  value: number | string | null | undefined
  valueFormat?: ValueFormat
  /** Previous value: the delta is computed from it. */
  previousValue?: number
  /** Relative change as a ratio (`0.12` = +12%), when you already have it. */
  delta?: number | null
  /** Text after the delta. Defaults to "vs previous period" when a delta is shown. */
  deltaContext?: React.ReactNode
  /** Whether an increase is good (green). Default `true`. */
  positiveIsGood?: boolean
  /** Semantic icon name or any node, shown at the inline end of the header. */
  icon?: SemanticIconName | React.ReactNode
  /** Values for a small trend line under the figure. */
  sparkline?: SparklineProps["data"]
  sparklineVariant?: SparklineProps["variant"]
  /** Gradient fill under an area sparkline. Default `true`, or the nearest `ChartStyleProvider`. */
  sparklineGradient?: boolean
  /** Show skeletons while data loads. */
  loading?: boolean
  /** Extra content at the bottom (a link, a note). */
  footer?: React.ReactNode
  /** Render as the child element, e.g. a link to the detail page. The tile content is placed inside it. */
  asChild?: boolean
  /** With `asChild`: the element to render as (e.g. `<a href="/applications" />`). */
  children?: React.ReactElement
  classNames?: StatTileClassNames
}

/**
 * A KPI tile: label, formatted value, delta (arrow + sign + semantic colour, never colour alone),
 * optional sparkline and a loading skeleton.
 */
export function StatTile({
  label,
  value,
  valueFormat = "number",
  previousValue,
  delta,
  deltaContext,
  positiveIsGood = true,
  icon,
  sparkline,
  sparklineVariant = "area",
  sparklineGradient,
  loading = false,
  footer,
  asChild = false,
  size = "default",
  className,
  classNames,
  children,
  ...props
}: StatTileProps) {
  const { t } = useOnu()
  const fmt = useChartFormat(valueFormat)
  const labelId = React.useId()
  const hasDelta = delta !== undefined || (previousValue !== undefined && typeof value === "number")
  const formatted = typeof value === "number" ? fmt.value(value) : (value ?? t("chart.noValue"))
  const labelText = typeof label === "string" ? label : t("chart.value")

  const content = (
    <>
      <div className="gap-2 flex items-start justify-between">
        <span
          id={labelId}
          data-slot="stat-tile-label"
          className={cn("text-sm text-muted-foreground", classNames?.label)}
        >
          {label}
        </span>
        {icon ? (
          <span
            data-slot="stat-tile-icon"
            className={cn("[&_svg]:size-4 shrink-0 text-muted-foreground", classNames?.icon)}
          >
            {typeof icon === "string" ? <Icon name={icon} /> : icon}
          </span>
        ) : null}
      </div>
      {loading ? (
        <div className="gap-2 grid" data-slot="stat-tile-loading">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-20" />
          <span className="sr-only">{t("common.loading")}</span>
        </div>
      ) : (
        <>
          <span
            data-slot="stat-tile-value"
            dir="auto"
            className={cn(
              "font-semibold tracking-tight leading-none tabular-nums",
              valueSizes[size ?? "default"],
              classNames?.value,
            )}
          >
            {formatted}
          </span>
          {hasDelta ? (
            <DeltaIndicator
              className={classNames?.delta}
              value={delta}
              current={typeof value === "number" ? value : undefined}
              previous={previousValue}
              positiveIsGood={positiveIsGood}
              context={deltaContext ?? t("chart.vsPrevious")}
            />
          ) : null}
          {sparkline?.length ? (
            <Sparkline
              data={sparkline}
              label={labelText}
              variant={sparklineVariant}
              gradient={sparklineGradient}
              valueFormat={valueFormat}
              className={cn("mt-1", classNames?.sparkline)}
            />
          ) : null}
        </>
      )}
      {footer ? (
        <div data-slot="stat-tile-footer" className={cn("text-xs mt-auto text-muted-foreground", classNames?.footer)}>
          {footer}
        </div>
      ) : null}
    </>
  )

  const rootProps = {
    "data-slot": "stat-tile",
    "aria-busy": loading || undefined,
    className: cn(statTileVariants({ size, interactive: asChild }), className),
    ...props,
  }

  if (asChild && React.isValidElement(children)) {
    // The child (e.g. a link) becomes the tile and the tile content goes inside it.
    return <Slot.Root {...rootProps}>{React.cloneElement(children, undefined, content)}</Slot.Root>
  }

  return (
    <div role="group" aria-labelledby={labelId} {...rootProps}>
      {content}
    </div>
  )
}

export interface StatTilesProps extends React.ComponentProps<"div"> {
  /** Most columns on wide containers. Columns collapse as the container narrows. Default `4`. */
  columns?: 2 | 3 | 4
}

const columnClasses = {
  2: "@md/stat-tiles:grid-cols-2",
  3: "@md/stat-tiles:grid-cols-2 @3xl/stat-tiles:grid-cols-3",
  4: "@md/stat-tiles:grid-cols-2 @4xl/stat-tiles:grid-cols-4",
} as const

/** A responsive grid of stat tiles. Uses container queries, so it adapts inside narrow columns too. */
export function StatTiles({ columns = 4, className, children, ...props }: StatTilesProps) {
  return (
    <div data-slot="stat-tiles" className="@container/stat-tiles w-full">
      <div className={cn("gap-4 grid grid-cols-1", columnClasses[columns], className)} {...props}>
        {children}
      </div>
    </div>
  )
}
