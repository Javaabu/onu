"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useOnu } from "../../providers/onu-provider"
import { wrap } from "./_utils"

export interface GridKeyboardOptions {
  count: number
  columns: number
  focused: number
  setFocused: (index: number) => void
  dir: "ltr" | "rtl"
  /** PageUp (-1) / PageDown (+1). */
  onPage?: (delta: number) => void
  /** Moving past the first or last cell: page in that direction and land on `index` of the new page. */
  onOverflow?: (delta: number, index: number) => void
  /** Wrap around at the ends (clock faces). */
  wrapAround?: boolean
  /** Every arrow moves by one (a clock face has no rows). */
  linear?: boolean
}

/**
 * Arrow-key navigation for a grid of cells (APG grid pattern). Left/right follow
 * the visual order, so they swap in RTL (R11.5). Returns `true` when it handled the key.
 */
export function handleGridKey(e: React.KeyboardEvent, o: GridKeyboardOptions): boolean {
  const forward = o.dir === "rtl" ? -1 : 1
  const rowStart = o.linear ? 0 : o.focused - (o.focused % o.columns)
  let target: number
  switch (e.key) {
    case "ArrowRight":
      target = o.focused + (o.linear ? 1 : forward)
      break
    case "ArrowLeft":
      target = o.focused - (o.linear ? 1 : forward)
      break
    case "ArrowDown":
      target = o.focused + (o.linear ? 1 : o.columns)
      break
    case "ArrowUp":
      target = o.focused - (o.linear ? 1 : o.columns)
      break
    case "Home":
      target = rowStart
      break
    case "End":
      target = o.linear ? o.count - 1 : Math.min(rowStart + o.columns - 1, o.count - 1)
      break
    case "PageUp":
    case "PageDown":
      if (!o.onPage) return false
      e.preventDefault()
      o.onPage(e.key === "PageUp" ? -1 : 1)
      return true
    default:
      return false
  }
  e.preventDefault()
  if (target < 0 || target >= o.count) {
    if (o.wrapAround) target = wrap(target, o.count)
    else if (o.onOverflow) {
      o.onOverflow(target < 0 ? -1 : 1, wrap(target, o.count))
      return true
    } else target = Math.max(0, Math.min(o.count - 1, target))
  }
  o.setFocused(target)
  return true
}

export interface GridItem {
  key: string
  label: React.ReactNode
  /** Accessible name when the visible label is abbreviated. */
  ariaLabel?: string
  disabled?: boolean
  selected?: boolean
  /** Today / this month / now. */
  current?: boolean
  /** Dim (e.g. outside the current page). */
  muted?: boolean
  className?: string
}

export interface PeriodGridProps {
  items: GridItem[]
  columns?: number
  /** Accessible name of the grid. */
  label: string
  onSelect: (index: number) => void
  onPage?: (delta: number) => void
  /** Focus the active cell when mounted. */
  initialFocus?: boolean
  /** `grid` (rows and columns) or `clock` (cells on a circle; 24 items use two rings). */
  layout?: "grid" | "clock"
  /** What `aria-current` means for the current cell. */
  currentKind?: "date" | "time"
  className?: string
  cellClassName?: string
}

function initialIndex(items: GridItem[]) {
  const selected = items.findIndex((i) => i.selected)
  if (selected >= 0) return selected
  const current = items.findIndex((i) => i.current)
  return current >= 0 ? current : 0
}

/** Accessible grid of months, years, year ranges, hours or minutes with roving focus. */
export function PeriodGrid({
  items,
  columns = 3,
  label,
  onSelect,
  onPage,
  initialFocus,
  layout = "grid",
  currentKind = "date",
  className,
  cellClassName,
}: PeriodGridProps) {
  const { dir } = useOnu()
  const [focused, setFocusedState] = React.useState(() => initialIndex(items))
  const active = Math.min(focused, items.length - 1)
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([])
  const pendingFocus = React.useRef(!!initialFocus)

  React.useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    buttons.current[active]?.focus()
  }, [active, items])

  const setFocused = (index: number) => {
    pendingFocus.current = true
    setFocusedState(index)
  }

  const clock = layout === "clock"
  const onKeyDown = (e: React.KeyboardEvent) => {
    handleGridKey(e, {
      count: items.length,
      columns,
      focused: active,
      setFocused,
      dir,
      onPage: onPage
        ? (delta) => {
            pendingFocus.current = true
            onPage(delta)
          }
        : undefined,
      onOverflow:
        onPage && !clock
          ? (delta, index) => {
              setFocused(index)
              onPage(delta)
            }
          : undefined,
      wrapAround: clock,
      linear: clock,
    })
  }

  const renderCell = (item: GridItem, index: number, style?: React.CSSProperties) => (
    <div
      key={item.key}
      role="gridcell"
      aria-selected={!!item.selected}
      className={cn(clock && "absolute -translate-x-1/2 -translate-y-1/2")}
      style={style}
    >
      <button
        ref={(node) => {
          buttons.current[index] = node
        }}
        type="button"
        tabIndex={index === active ? 0 : -1}
        aria-label={item.ariaLabel}
        aria-disabled={item.disabled || undefined}
        aria-current={item.current ? currentKind : undefined}
        data-selected={item.selected || undefined}
        data-current={item.current || undefined}
        data-muted={item.muted || undefined}
        onClick={() => {
          if (!item.disabled) onSelect(index)
        }}
        onFocus={() => setFocusedState(index)}
        onKeyDown={onKeyDown}
        className={cn(
          "h-9 px-1 text-sm inline-flex w-full items-center justify-center rounded-(--cell-radius,var(--radius-md)) tabular-nums outline-none select-none",
          "touch:min-h-11 hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-current:font-semibold data-current:ring-1 data-current:ring-primary/40",
          "data-muted:text-muted-foreground",
          "data-selected:bg-primary data-selected:text-primary-foreground data-selected:hover:bg-primary/90 data-selected:hover:text-primary-foreground",
          "aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent",
          clock && "size-9 touch:size-11 rounded-full",
          cellClassName,
          item.className,
        )}
      >
        {item.label}
      </button>
    </div>
  )

  if (clock) {
    const rings = items.length > 12 ? 2 : 1
    return (
      <div role="grid" aria-label={label} className={cn("size-60 touch:size-72 relative mx-auto", className)}>
        <div aria-hidden="true" className="inset-0 absolute rounded-full bg-muted/60" />
        <div role="row" className="contents">
          {items.map((item, index) => {
            const ring = rings === 2 && index >= 12 ? 1 : 0
            const position = index % 12
            const radius = ring === 0 ? 42 : 26
            const angle = (position / 12) * 2 * Math.PI
            // Physical positions on purpose: a clock face is never mirrored.
            const style = {
              left: `${50 + radius * Math.sin(angle)}%`,
              top: `${50 - radius * Math.cos(angle)}%`,
            }
            return renderCell(item, index, style)
          })}
        </div>
      </div>
    )
  }

  const rows: GridItem[][] = []
  for (let i = 0; i < items.length; i += columns) rows.push(items.slice(i, i + columns))

  return (
    <div role="grid" aria-label={label} className={cn("gap-1 grid", className)}>
      {rows.map((row, r) => (
        <div
          role="row"
          key={r}
          className="gap-1 grid"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {row.map((item, c) => renderCell(item, r * columns + c))}
        </div>
      ))}
    </div>
  )
}
