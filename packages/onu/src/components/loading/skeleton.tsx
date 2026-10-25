"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import type { LabelLayout } from "../../providers/onu-provider"
import { useTranslation } from "../../providers/onu-provider"
import { Skeleton } from "../../ui/skeleton"
import { INLINE_FIELD_GRID, useLabelLayout } from "../form/form-context"
import { registerEnglish } from "../../i18n/english"
import { overlay as en_overlay } from "../../locales/en/overlay"

registerEnglish({ overlay: en_overlay })

interface SkeletonRootProps extends React.ComponentProps<"div"> {
  /** Screen-reader text for the loading region. Default "Loading…". */
  label?: string
}

/** Root shared by the presets: one polite status for screen readers, shapes hidden from them. */
function SkeletonRoot({ label, slot, className, children, ...props }: SkeletonRootProps & { slot: string }) {
  const { t } = useTranslation()
  return (
    <div role="status" aria-label={label ?? t("overlay.loading")} data-slot={slot} className={className} {...props}>
      <div aria-hidden="true" className="contents">
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */

export interface SkeletonTextProps extends SkeletonRootProps {
  /** Number of lines. Default 3. */
  lines?: number
  /**
   * Widths of the lines (CSS values, cycled). Default: full width with a
   * shorter last line, like a paragraph.
   */
  widths?: string[]
  /** Line size, matching the text it stands in for. Default `md`. */
  size?: "sm" | "md" | "lg"
  classNames?: { line?: string }
}

const LINE_HEIGHT = { sm: "h-3", md: "h-4", lg: "h-6" } as const

/** Placeholder lines shaped like a paragraph while text loads. */
export function SkeletonText({ lines = 3, widths, size = "md", className, classNames, ...props }: SkeletonTextProps) {
  return (
    <SkeletonRoot slot="skeleton-text" className={cn("gap-2 flex flex-col", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => {
        const width = widths?.length ? widths[i % widths.length] : i === lines - 1 && lines > 1 ? "60%" : "100%"
        return <Skeleton key={i} className={cn(LINE_HEIGHT[size], classNames?.line)} style={{ width }} />
      })}
    </SkeletonRoot>
  )
}

/* ------------------------------------------------------------------------ */

export interface SkeletonCardProps extends SkeletonRootProps {
  /** Image area at the top. Default `false`. */
  media?: boolean
  /** Avatar beside the title. Default `false`. */
  avatar?: boolean
  /** Body lines. Default 2. */
  lines?: number
  /** Action buttons at the bottom. Default 0. */
  actions?: number
  classNames?: { media?: string; avatar?: string; title?: string; line?: string; action?: string }
}

/** Placeholder shaped like a card: optional media, avatar, title, lines and actions. */
export function SkeletonCard({
  media = false,
  avatar = false,
  lines = 2,
  actions = 0,
  className,
  classNames,
  ...props
}: SkeletonCardProps) {
  return (
    <SkeletonRoot
      slot="skeleton-card"
      className={cn("gap-4 p-4 flex flex-col rounded-xl bg-card ring-1 ring-foreground/10", className)}
      {...props}
    >
      {media ? <Skeleton className={cn("-mx-4 -mt-4 aspect-video rounded-b-none", classNames?.media)} /> : null}
      <div className="gap-3 flex items-center">
        {avatar ? <Skeleton className={cn("size-10 shrink-0 rounded-full", classNames?.avatar)} /> : null}
        <div className="gap-2 flex flex-1 flex-col">
          <Skeleton className={cn("h-4 w-1/2", classNames?.title)} />
          {avatar ? <Skeleton className="h-3 w-1/3" /> : null}
        </div>
      </div>
      {lines > 0 ? (
        <div className="gap-2 flex flex-col">
          {Array.from({ length: lines }, (_, i) => (
            <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full", classNames?.line)} />
          ))}
        </div>
      ) : null}
      {actions > 0 ? (
        <div className="gap-2 flex">
          {Array.from({ length: actions }, (_, i) => (
            <Skeleton key={i} className={cn("h-8 w-20", classNames?.action)} />
          ))}
        </div>
      ) : null}
    </SkeletonRoot>
  )
}

/* ------------------------------------------------------------------------ */

export interface SkeletonTableProps extends SkeletonRootProps {
  /** Body rows. Default 5. */
  rows?: number
  /** Columns. Default 4. */
  columns?: number
  /** Header row. Default `true`. */
  header?: boolean
  /** Checkbox column for selectable tables. Default `false`. */
  selectable?: boolean
  classNames?: { header?: string; row?: string; cell?: string }
}

/**
 * Placeholder shaped like a data table. In narrow containers it shows only
 * the first two columns, as tables turn into cards on phones (R3.20).
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  header = true,
  selectable = false,
  className,
  classNames,
  ...props
}: SkeletonTableProps) {
  const cells = (row: number, head: boolean) => (
    <>
      {selectable ? <Skeleton className="size-4 shrink-0 rounded-sm" /> : null}
      {Array.from({ length: columns }, (_, col) => (
        <Skeleton
          key={col}
          className={cn(
            head ? "h-3" : "h-4",
            "min-w-0 flex-1",
            col >= 2 && "@md/skeleton-table:block hidden",
            classNames?.cell,
          )}
          // Vary the widths a little so rows don't look like a grid of identical bars.
          style={{ maxWidth: head ? "6rem" : `${60 + ((row * 7 + col * 13) % 40)}%` }}
        />
      ))}
    </>
  )
  return (
    <SkeletonRoot
      slot="skeleton-table"
      className={cn("@container/skeleton-table w-full rounded-lg border", className)}
      {...props}
    >
      {header ? (
        <div className={cn("gap-4 px-4 h-10 flex items-center border-b bg-muted/50", classNames?.header)}>
          {cells(0, true)}
        </div>
      ) : null}
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className={cn("gap-4 px-4 h-12 flex items-center border-b last:border-b-0", classNames?.row)}>
          {cells(row + 1, false)}
        </div>
      ))}
    </SkeletonRoot>
  )
}

/* ------------------------------------------------------------------------ */

export interface SkeletonFieldProps extends SkeletonRootProps {
  /** Shape of the control. Default `input`. */
  control?: "input" | "textarea" | "select" | "checkbox" | "switch"
  /** Show a label placeholder. Default `true`. */
  showLabel?: boolean
  /** Show a help-text placeholder under the control. Default `false`. */
  help?: boolean
  /** Label layout, like `FormField`. Defaults to the form or `OnuProvider` setting. */
  labelLayout?: LabelLayout
  classNames?: { label?: string; control?: string; help?: string }
}

/**
 * Placeholder shaped like a form field (label, control, help text), for forms
 * whose values are still loading. Follows the stacked/inline label layout so
 * the page doesn't jump when the real fields arrive.
 */
export function SkeletonField({
  control = "input",
  showLabel = true,
  help = false,
  labelLayout,
  className,
  classNames,
  ...props
}: SkeletonFieldProps) {
  const layout = useLabelLayout(labelLayout)
  const inline = layout === "inline"

  if (control === "checkbox" || control === "switch") {
    return (
      <SkeletonRoot
        slot="skeleton-field"
        data-control={control}
        className={cn("gap-2 flex items-center", className)}
        {...props}
      >
        <Skeleton
          className={cn(
            control === "switch" ? "w-8 h-[1.15rem] rounded-full" : "size-4 rounded-sm",
            classNames?.control,
          )}
        />
        {showLabel ? <Skeleton className={cn("h-3.5 w-32", classNames?.label)} /> : null}
      </SkeletonRoot>
    )
  }

  return (
    <SkeletonRoot
      slot="skeleton-field"
      data-control={control}
      data-label-layout={layout}
      className={cn("@container/form-field w-full", className)}
      {...props}
    >
      <div className={cn("gap-2 grid", inline && INLINE_FIELD_GRID)}>
        {showLabel ? (
          <div className={cn("flex items-center", inline && "@md/form-field:h-8")}>
            <Skeleton className={cn("h-3.5 w-24", classNames?.label)} />
          </div>
        ) : null}
        <div className={cn("gap-1.5 min-w-0 grid", inline && showLabel && "@md/form-field:col-start-2")}>
          <Skeleton
            className={cn(
              "touch:h-11 w-full rounded-lg",
              control === "textarea" ? "h-16" : "h-8",
              control === "select" && "gap-2 px-2.5 flex items-center justify-end",
              classNames?.control,
            )}
          >
            {control === "select" ? <span className="size-3 rounded-sm bg-muted-foreground/20" /> : null}
          </Skeleton>
          {help ? <Skeleton className={cn("h-3 w-2/3", classNames?.help)} /> : null}
        </div>
      </div>
    </SkeletonRoot>
  )
}

export interface PlaceholderInputProps extends Omit<SkeletonFieldProps, "label" | "showLabel"> {
  /** Show a label placeholder. Default `true`. */
  label?: boolean
  /** Screen-reader text. Default "Loading…". */
  srLabel?: string
}

/** `SkeletonField` under its older name: `label` toggles the label shape and `srLabel` is the screen-reader text. */
export function PlaceholderInput({ label = true, srLabel, ...props }: PlaceholderInputProps) {
  return <SkeletonField data-slot="placeholder-input" {...props} showLabel={label} label={srLabel} />
}
