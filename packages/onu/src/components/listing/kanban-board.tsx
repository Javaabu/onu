"use client"

import * as React from "react"
import { move } from "@dnd-kit/helpers"
import { DragDropProvider, useDroppable } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"

import { useAnnouncer } from "../../a11y/use-announcer"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { useDndPlugins } from "./_dnd"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export interface KanbanColumn {
  id: string
  title: string
  /** Optional accent, e.g. `bg-chart-1`, shown as a dot by the title. */
  accentClassName?: string
  /** Extra header content (e.g. an add button). */
  actions?: React.ReactNode
}

export interface KanbanMove {
  id: string
  from: string
  to: string
  /** Position in the target column. */
  index: number
}

export interface KanbanCardParts {
  /** Drag handle (keyboard: Space to lift, arrows to move, Space to drop). */
  handle: React.ReactNode
  /** "Move to…" menu, the non-drag alternative. */
  moveMenu: React.ReactNode
  isDragging: boolean
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumn[]
  /** Items per column id. */
  items: Record<string, T[]>
  /** Stable id. Defaults to `item.id`. */
  getId?: (item: T) => string
  /** Name for the handle label and announcements. */
  getName: (item: T) => string
  renderCard: (item: T, parts: KanbanCardParts) => React.ReactNode
  /** Called with the new layout after a drop or a "Move to…" choice. */
  onItemsChange: (items: Record<string, T[]>, move: KanbanMove) => void
  /** Return `false` to refuse a move (e.g. workflow rules). */
  canMove?: (move: KanbanMove) => boolean
  /** Shown in an empty column. */
  emptyColumn?: React.ReactNode
  disabled?: boolean
  className?: string
  classNames?: { column?: string; header?: string; list?: string; card?: string }
}

type Layout = Record<string, string[]>

function KanbanCard({
  id,
  index,
  column,
  name,
  disabled,
  columns,
  onMoveTo,
  children,
  className,
}: {
  id: string
  index: number
  column: string
  name: string
  disabled?: boolean
  columns: KanbanColumn[]
  onMoveTo: (to: string) => void
  children: (parts: KanbanCardParts) => React.ReactNode
  className?: string
}) {
  const { t } = useTranslation()
  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    group: column,
    type: "item",
    accept: "item",
    disabled,
  })

  const handle = (
    <button
      ref={handleRef}
      type="button"
      data-slot="drag-handle"
      aria-label={t("listing.dragHandle", { name })}
      disabled={disabled}
      className="size-7 touch:size-11 inline-flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
    >
      <Icon name="grip-vertical" />
    </button>
  )

  const moveMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="touch:size-11"
          disabled={disabled}
          aria-label={`${t("listing.moveTo")} ${name}`}
        >
          <Icon name="more" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44 w-auto">
        <DropdownMenuLabel>{t("listing.moveTo")}</DropdownMenuLabel>
        {columns
          .filter((c) => c.id !== column)
          .map((c) => (
            <DropdownMenuItem key={c.id} className="touch:min-h-11" onSelect={() => onMoveTo(c.id)}>
              {t("listing.moveToColumn", { column: c.title })}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <li
      ref={ref}
      data-slot="kanban-card"
      data-dragging={isDragging || undefined}
      className={cn(
        "shadow-xs data-dragging:shadow-md rounded-lg border bg-card text-card-foreground data-dragging:opacity-60",
        className,
      )}
    >
      {children({ handle, moveMenu, isDragging })}
    </li>
  )
}

function KanbanColumnView({
  column,
  count,
  children,
  empty,
  className,
  headerClassName,
  listClassName,
}: {
  column: KanbanColumn
  count: number
  children: React.ReactNode
  empty: React.ReactNode
  className?: string
  headerClassName?: string
  listClassName?: string
}) {
  const { t, locale } = useTranslation()
  const { ref, isDropTarget } = useDroppable({ id: column.id, type: "column", accept: "item" })
  const headingId = React.useId()
  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      data-slot="kanban-column"
      data-drop-target={isDropTarget || undefined}
      className={cn(
        "gap-2 p-2 flex w-[min(18rem,85vw)] shrink-0 snap-start flex-col rounded-xl bg-muted/50 data-drop-target:ring-2 data-drop-target:ring-primary/40",
        className,
      )}
    >
      <header className={cn("gap-2 px-1 flex items-center", headerClassName)}>
        {column.accentClassName ? (
          <span aria-hidden="true" className={cn("size-2 rounded-full", column.accentClassName)} />
        ) : null}
        <h3 id={headingId} className="text-sm font-medium">
          {column.title}
        </h3>
        <Badge variant="secondary" className="tabular-nums" aria-label={t("listing.columnItems", { count })}>
          {new Intl.NumberFormat(locale.numberLocale).format(count)}
        </Badge>
        <div className="ms-auto">{column.actions}</div>
      </header>
      <ul className={cn("gap-2 min-h-16 grid content-start", listClassName)} aria-labelledby={headingId}>
        {children}
      </ul>
      {count === 0 ? (
        <p className="px-1 pb-2 text-sm text-center text-muted-foreground">{empty ?? t("listing.emptyColumn")}</p>
      ) : null}
    </section>
  )
}

/**
 * A board of columns with cards that move between them by drag and drop
 * (mouse, touch with a press delay, keyboard) or with each card's "Move to…"
 * menu. Built on `@dnd-kit/react`; moves are announced and reported through
 * `onItemsChange`.
 */
export function KanbanBoard<T>({
  columns,
  items,
  getId = (item: T) => String((item as { id?: unknown }).id),
  getName,
  renderCard,
  onItemsChange,
  canMove,
  emptyColumn,
  disabled,
  className,
  classNames,
}: KanbanBoardProps<T>) {
  const { t } = useTranslation()
  const { announce, region } = useAnnouncer({ role: "status" })

  const layoutFromProps = React.useMemo<Layout>(
    () => Object.fromEntries(columns.map((c) => [c.id, (items[c.id] ?? []).map(getId)])),
    [columns, items, getId],
  )
  const byId = React.useMemo(() => {
    const map = new Map<string, T>()
    for (const list of Object.values(items)) for (const item of list) map.set(getId(item), item)
    return map
  }, [items, getId])

  // While dragging, the layout follows the pointer; it is committed on drop.
  const [dragLayout, setDragLayoutState] = React.useState<Layout | null>(null)
  const dragRef = React.useRef<Layout | null>(null)
  const setDragLayout = (next: Layout | null) => {
    dragRef.current = next
    setDragLayoutState(next)
  }
  const layout = dragLayout ?? layoutFromProps

  const nameOf = (id: string | number) => {
    const item = byId.get(String(id))
    if (item) return getName(item)
    return columns.find((c) => c.id === id)?.title ?? String(id)
  }
  const plugins = useDndPlugins(nameOf)

  const columnOf = (l: Layout, id: string) => Object.keys(l).find((c) => l[c]?.includes(id))

  const commit = (next: Layout, id: string) => {
    const from = columnOf(layoutFromProps, id)
    const to = columnOf(next, id)
    if (!from || !to) return
    const change: KanbanMove = { id, from, to, index: next[to]?.indexOf(id) ?? 0 }
    const unchanged = from === to && layoutFromProps[from]?.indexOf(id) === change.index
    if (unchanged || canMove?.(change) === false) return
    onItemsChange(
      Object.fromEntries(Object.entries(next).map(([c, ids]) => [c, ids.map((x) => byId.get(x) as T)])),
      change,
    )
    const column = columns.find((c) => c.id === to)
    announce(t("listing.moved", { name: nameOf(id), column: column?.title ?? to }))
  }

  const moveTo = (id: string, to: string) => {
    const next: Layout = Object.fromEntries(
      Object.entries(layoutFromProps).map(([c, ids]) => [c, ids.filter((x) => x !== id)]),
    )
    next[to] = [...(next[to] ?? []), id]
    commit(next, id)
  }

  return (
    <DragDropProvider
      plugins={plugins}
      onDragStart={() => setDragLayout(layoutFromProps)}
      onDragOver={(event) => setDragLayout(move(dragRef.current ?? layoutFromProps, event))}
      onDragEnd={(event) => {
        const final = dragRef.current ?? layoutFromProps
        setDragLayout(null)
        if (event.canceled || !event.operation.source) return
        commit(final, String(event.operation.source.id))
      }}
    >
      {region}
      <div
        data-slot="kanban-board"
        className={cn("gap-3 pb-2 sm:snap-none flex snap-x snap-mandatory overflow-x-auto", className)}
      >
        {columns.map((column) => {
          const ids = layout[column.id] ?? []
          return (
            <KanbanColumnView
              key={column.id}
              column={column}
              count={ids.length}
              empty={emptyColumn}
              className={classNames?.column}
              headerClassName={classNames?.header}
              listClassName={classNames?.list}
            >
              {ids.map((id, index) => {
                const item = byId.get(id)
                if (!item) return null
                return (
                  <KanbanCard
                    key={id}
                    id={id}
                    index={index}
                    column={column.id}
                    name={getName(item)}
                    disabled={disabled}
                    columns={columns}
                    onMoveTo={(to) => moveTo(id, to)}
                    className={classNames?.card}
                  >
                    {(parts) => renderCard(item, parts)}
                  </KanbanCard>
                )
              })}
            </KanbanColumnView>
          )
        })}
      </div>
    </DragDropProvider>
  )
}
