"use client"

import * as React from "react"

import { useMediaQuery } from "../hooks/use-media-query"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useOnu } from "../providers/onu-provider"
import { Button } from "../ui/button"
import type { ChartConfig } from "../ui/chart"
import { Skeleton } from "../ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { registerEnglish } from "../i18n/english"
import { chart as en_chart } from "../locales/en/chart"

registerEnglish({ chart: en_chart })

/** A data row: a category (or date) plus one value per series. */
export type ChartDatum = Record<string, unknown>

export type ChartView = "chart" | "table"

export interface ChartFrameClassNames {
  root?: string
  header?: string
  title?: string
  description?: string
  toggle?: string
  chart?: string
  table?: string
}

/** Props shared by every Onu chart. */
export interface ChartBaseProps {
  /** Accessible title, shown above the chart. Required: every chart needs a name (R14.9). */
  title: React.ReactNode
  /** Short description shown under the title and linked with `aria-describedby`. */
  description?: React.ReactNode
  /** Keep the title for screen readers but hide it visually. */
  hideTitle?: boolean
  /** Replace the generated text summary read by screen readers. */
  summary?: string
  /** Show the "View as table" toggle. Default `true`. */
  showTableToggle?: boolean
  /** Controlled view. */
  view?: ChartView
  /** Initial view when uncontrolled. Default `"chart"`. */
  defaultView?: ChartView
  onViewChange?: (view: ChartView) => void
  /** Show a loading skeleton instead of the chart. */
  loading?: boolean
  /** Shown when there is no data. Defaults to "No data to show". */
  emptyMessage?: React.ReactNode
  /** Animate on mount. Always off under `prefers-reduced-motion` or inside `<ChartAnimationProvider animate={false}>`. Default `true`. */
  animate?: boolean
  /** Chart height in px. Width follows the container. */
  height?: number
  /** Extra controls in the header, before the table toggle. */
  actions?: React.ReactNode
  className?: string
  classNames?: ChartFrameClassNames
  id?: string
  ref?: React.Ref<HTMLElement>
}

export interface SeriesInfo {
  key: string
  label: React.ReactNode
  /** Plain-text label for summaries and aria labels. */
  text: string
  color: string
}

/** True when the user asked for reduced motion (R14.8). */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)")
}

const ChartAnimationContext = React.createContext(true)

export interface ChartAnimationProviderProps {
  /** `false` turns animation off for every Onu chart inside. */
  animate: boolean
  children?: React.ReactNode
}

/**
 * Turns animation off (or back on) for every Onu chart inside, e.g. for
 * screenshots, print views or kiosks. `prefers-reduced-motion` always wins:
 * charts never animate under it, whatever this says.
 */
export function ChartAnimationProvider({ animate, children }: ChartAnimationProviderProps) {
  return <ChartAnimationContext.Provider value={animate}>{children}</ChartAnimationContext.Provider>
}

/**
 * Whether charts should animate: the `animate` prop and the nearest
 * {@link ChartAnimationProvider}, and never under `prefers-reduced-motion`.
 * Charts pass the result to every Recharts `isAnimationActive` (series and tooltip).
 */
export function useChartAnimation(animate = true) {
  const reduced = useReducedMotion()
  const enabled = React.useContext(ChartAnimationContext)
  return animate && enabled && !reduced
}

/** Tooltips open on tap on touch screens (no hover), on hover elsewhere (R3.26). */
export function useTooltipTrigger(): "hover" | "click" {
  return useMediaQuery("(hover: none)") ? "click" : "hover"
}

/** Plain text from a React node (strings and numbers only), or a fallback. */
export function nodeText(node: React.ReactNode, fallback: string): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  return fallback
}

/** The default colour of the n-th series: `var(--chart-1)` … `var(--chart-8)`, then repeats. */
export function chartColor(index: number) {
  return `var(--chart-${(index % 8) + 1})`
}

/**
 * Resolves the series to draw. `series` picks keys; otherwise every key in `config`.
 * Colours default to the `--chart-n` tokens in order.
 */
export function resolveSeries(config: ChartConfig = {}, series?: string[]): SeriesInfo[] {
  const keys = series ?? Object.keys(config)
  return keys.map((key, index) => {
    const entry = config[key]
    const label = entry?.label ?? key
    return { key, label, text: nodeText(label, key), color: entry?.color ?? chartColor(index) }
  })
}

/** A `ChartConfig` with a colour for every series, for `ChartContainer`. */
export function seriesConfig(config: ChartConfig = {}, series: SeriesInfo[]): ChartConfig {
  const result: ChartConfig = { ...config }
  for (const s of series) {
    const entry = config[s.key]
    result[s.key] = entry?.theme ? entry : { ...entry, label: s.label, color: s.color }
  }
  return result
}

/** Reads a number from a datum; anything else (null, missing, text) is `null`. */
export function numericValue(datum: ChartDatum | undefined, key: string): number | null {
  const value = datum?.[key]
  return typeof value === "number" && !Number.isNaN(value) ? value : null
}

/** Lowest and highest value of a series, ignoring gaps. */
export function seriesRange(data: ChartDatum[], key: string): { min: number; max: number } | null {
  const values = data.map((d) => numericValue(d, key)).filter((v): v is number => v !== null)
  if (!values.length) return null
  return { min: Math.min(...values), max: Math.max(...values) }
}

/**
 * Classes added to every `ChartContainer`:
 * - `direction: ltr` on the SVG so Recharts' physical text anchors stay correct in RTL (Thaana text still shapes RTL);
 * - token colours for Recharts 3 tick labels, which shadcn's selectors miss (dark mode).
 */
export const SVG_LTR =
  "[&_.recharts-surface]:overflow-visible [&_.recharts-surface]:[direction:ltr] [&_.recharts-cartesian-axis-tick-label_text]:fill-muted-foreground [&_.recharts-brush-texts_text]:fill-muted-foreground"

export interface DataTableModel {
  columns: React.ReactNode[]
  rows: { key: string; header: React.ReactNode; cells: React.ReactNode[] }[]
}

export interface ChartFrameProps extends ChartBaseProps {
  /** Plain-text summary generated by the chart. */
  autoSummary: string
  table: DataTableModel
  isEmpty: boolean
  children: (ids: { titleId: string; summaryId: string; title: string }) => React.ReactNode
  /** Rendered below the chart in both views (e.g. a selection read-out). */
  footer?: React.ReactNode
  /** Rendered between the header and the chart in both views (e.g. period totals). */
  lead?: React.ReactNode
  /** Force the table to show (e.g. a map without an API key). The toggle is hidden. */
  forceTable?: boolean
  dataSlot?: string
}

/**
 * The shell every chart renders in: title, description, "View as table" toggle,
 * loading and empty states, the data table alternative and a screen-reader summary (R14.9).
 */
export function ChartFrame({
  title,
  description,
  hideTitle = false,
  summary,
  autoSummary,
  showTableToggle = true,
  view: viewProp,
  defaultView = "chart",
  onViewChange,
  loading = false,
  emptyMessage,
  height = 300,
  actions,
  className,
  classNames,
  id,
  ref,
  table,
  isEmpty,
  children,
  footer,
  lead,
  forceTable = false,
  dataSlot = "chart-figure",
}: ChartFrameProps) {
  const { t } = useOnu()
  const reactId = React.useId()
  const baseId = id ?? `onu-chart-${reactId.replace(/:/g, "")}`
  const titleId = `${baseId}-title`
  const descId = `${baseId}-description`
  const summaryId = `${baseId}-summary`
  const bodyId = `${baseId}-body`

  const [uncontrolledView, setUncontrolledView] = React.useState<ChartView>(defaultView)
  const view = forceTable ? "table" : (viewProp ?? uncontrolledView)
  const setView = (next: ChartView) => {
    if (viewProp === undefined) setUncontrolledView(next)
    onViewChange?.(next)
  }

  const showToggle = showTableToggle && !forceTable && !loading && !isEmpty
  const titleText = nodeText(title, "")
  const summaryText = summary ?? autoSummary

  let body: React.ReactNode
  if (loading) {
    body = (
      <Skeleton data-slot="chart-loading" role="status" className={cn("w-full", classNames?.chart)} style={{ height }}>
        <span className="sr-only">{t("chart.loading")}</span>
      </Skeleton>
    )
  } else if (isEmpty) {
    body = (
      <div
        data-slot="chart-empty"
        className={cn(
          "p-4 text-sm flex w-full items-center justify-center rounded-lg border border-dashed border-border text-center text-muted-foreground",
          classNames?.chart,
        )}
        style={{ minHeight: Math.min(height, 160) }}
      >
        {emptyMessage ?? t("chart.noData")}
      </div>
    )
  } else if (view === "table") {
    body = <ChartDataTable table={table} labelledBy={titleId} className={classNames?.table} />
  } else {
    body = children({ titleId, summaryId, title: titleText })
  }

  return (
    <figure
      ref={ref}
      id={id}
      data-slot={dataSlot}
      data-view={view}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      aria-busy={loading || undefined}
      className={cn("m-0 min-w-0 gap-3 @container/chart flex w-full flex-col", classNames?.root, className)}
    >
      <figcaption
        data-slot="chart-header"
        className={cn("gap-2 flex flex-wrap items-start justify-between", classNames?.header)}
      >
        <div className={cn("min-w-0 gap-0.5 grid flex-1", hideTitle && "sr-only")}>
          <span id={titleId} data-slot="chart-title" className={cn("leading-snug font-medium", classNames?.title)}>
            {title}
          </span>
          {description ? (
            <span
              id={descId}
              data-slot="chart-description"
              className={cn("text-sm text-muted-foreground", classNames?.description)}
            >
              {description}
            </span>
          ) : null}
        </div>
        {actions || showToggle ? (
          <div className="gap-2 ms-auto flex flex-wrap items-center">
            {actions}
            {showToggle ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-slot="chart-view-toggle"
                aria-controls={bodyId}
                className={classNames?.toggle}
                onClick={() => setView(view === "table" ? "chart" : "table")}
              >
                <Icon name={view === "table" ? "eye" : "table"} />
                {view === "table" ? t("chart.viewAsChart") : t("chart.viewAsTable")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </figcaption>
      {lead && !loading && !isEmpty ? lead : null}
      <div id={bodyId} data-slot="chart-body" className="min-w-0">
        {body}
      </div>
      {footer}
      {!loading && !isEmpty ? (
        <p id={summaryId} data-slot="chart-summary" className="sr-only">
          {summaryText}
        </p>
      ) : null}
    </figure>
  )
}

/** The data as a real `<table>`, scrollable in its own focusable region. */
export function ChartDataTable({
  table,
  labelledBy,
  className,
}: {
  table: DataTableModel
  labelledBy: string
  className?: string
}) {
  return (
    <div
      role="region"
      aria-labelledby={labelledBy}
      // A scrollable region must be reachable by keyboard (WCAG 2.1.1).
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      data-slot="chart-table"
      className={cn(
        "max-h-96 overflow-auto rounded-lg border border-border outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <Table className="tabular-nums">
        <TableHeader className="top-0 sticky bg-muted/50">
          <TableRow>
            {table.columns.map((column, index) => (
              <TableHead key={index} scope="col" className={cn(index > 0 && "text-end")}>
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.rows.map((row) => (
            <TableRow key={row.key}>
              <TableHead scope="row" className="font-normal">
                {row.header}
              </TableHead>
              {row.cells.map((cell, index) => (
                <TableCell key={index} className="text-end">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
