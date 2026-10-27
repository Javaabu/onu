"use client"

import * as React from "react"
import { arrayMove, move } from "@dnd-kit/helpers"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"

import { useAnnouncer } from "../../a11y/use-announcer"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { useDndPlugins } from "./_dnd"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export interface SortableListItemParts {
  /** The drag handle button (also keyboard-draggable: Space, arrows, Space). */
  handle: React.ReactNode
  /** Move up / Move down buttons, when `moveButtons` is on. */
  moveButtons: React.ReactNode
  index: number
  isDragging: boolean
}

/** A column of the table layout. */
export interface SortableListColumn<T> {
  id: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
}

interface SortableListBaseProps<T> {
  items: T[]
  /** Stable id. Defaults to `item.id`. */
  getId?: (item: T) => string
  /** Name for the handle label and announcements. */
  getName: (item: T) => string
  /** Called with the new order after a drop, Alt+Arrow on a handle, or a move button. */
  onReorder: (items: T[], change: { id: string; from: number; to: number }) => void
  /** Show Move up / Move down buttons as a non-drag alternative (R3.27). Default `true`. */
  moveButtons?: boolean
  disabled?: boolean
  /** Accessible name of the list, or of the table (as a visually hidden caption). */
  "aria-label"?: string
  className?: string
  /** `item` is each `li`, or each table row; `table` is the table layout's `<table>`. */
  classNames?: { item?: string; handle?: string; table?: string }
}

export type SortableListProps<T> = SortableListBaseProps<T> &
  (
    | {
        /** List layout: render each item, placing `handle` and `moveButtons` where they belong. */
        renderItem: (item: T, parts: SortableListItemParts) => React.ReactNode
        columns?: undefined
      }
    | {
        /** Table layout: one row per item on shadcn `Table`, the handle (and move buttons) in the first column. */
        columns: SortableListColumn<T>[]
        renderItem?: undefined
      }
  )

function useSortableItem({
  id,
  index,
  name,
  disabled,
  count,
  onMove,
  moveButtons,
  handleClassName,
}: {
  id: string
  index: number
  name: string
  disabled?: boolean
  count: number
  onMove: (from: number, to: number) => void
  moveButtons: boolean
  handleClassName?: string
}) {
  const { t } = useTranslation()
  const { ref, handleRef, isDragging } = useSortable({ id, index, disabled })

  const handle = (
    <button
      ref={handleRef}
      type="button"
      data-slot="drag-handle"
      aria-label={t("listing.dragHandle", { name })}
      aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
      disabled={disabled}
      onKeyDown={(e) => {
        // Alt+Arrow moves the item straight away, without a drag.
        if (!e.altKey) return
        if (e.key === "ArrowUp" && index > 0) {
          e.preventDefault()
          onMove(index, index - 1)
        } else if (e.key === "ArrowDown" && index < count - 1) {
          e.preventDefault()
          onMove(index, index + 1)
        }
      }}
      className={cn(
        "size-7 touch:size-11 inline-flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50",
        handleClassName,
      )}
    >
      <Icon name="grip-vertical" />
    </button>
  )

  const buttons = moveButtons ? (
    <span className="gap-0.5 flex">
      <Button
        variant="ghost"
        size="icon-xs"
        className="touch:size-11"
        aria-label={`${t("listing.moveUp")}: ${name}`}
        disabled={disabled || index === 0}
        onClick={() => onMove(index, index - 1)}
      >
        <Icon name="chevron-up" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="touch:size-11"
        aria-label={`${t("listing.moveDown")}: ${name}`}
        disabled={disabled || index === count - 1}
        onClick={() => onMove(index, index + 1)}
      >
        <Icon name="chevron-down" />
      </Button>
    </span>
  ) : null

  return { ref, isDragging, parts: { handle, moveButtons: buttons, index, isDragging } }
}

type RowProps = Parameters<typeof useSortableItem>[0] & { className?: string }

function SortableListItem({
  className,
  children,
  ...props
}: RowProps & { children: (parts: SortableListItemParts) => React.ReactNode }) {
  const { ref, isDragging, parts } = useSortableItem(props)
  return (
    <li
      ref={ref}
      data-slot="sortable-item"
      data-dragging={isDragging || undefined}
      className={cn("data-dragging:shadow-md data-dragging:opacity-60", className)}
    >
      {children(parts)}
    </li>
  )
}

function SortableTableRow({ className, children, ...props }: RowProps & { children: React.ReactNode }) {
  const { ref, isDragging, parts } = useSortableItem(props)
  return (
    <TableRow
      ref={ref}
      data-slot="sortable-item"
      data-dragging={isDragging || undefined}
      className={cn("data-dragging:bg-muted data-dragging:opacity-60", className)}
    >
      <TableCell className={props.moveButtons ? "w-px" : "w-10"}>
        <span className="gap-1 flex items-center">
          {parts.handle}
          {parts.moveButtons}
        </span>
      </TableCell>
      {children}
    </TableRow>
  )
}

/**
 * A list, or a table, the user can reorder by dragging (mouse, touch with a
 * press delay, or keyboard: Space to lift, arrows to move, Space to drop),
 * with Alt+Up/Down on a handle, or with Move up / Move down buttons. Pass
 * `renderItem` for a list or `columns` for a table (shadcn `Table`). Built on
 * `@dnd-kit/react`; moves are announced.
 */
export function SortableList<T>({
  items,
  getId = (item: T) => String((item as { id?: unknown }).id),
  getName,
  renderItem,
  columns,
  onReorder,
  moveButtons = true,
  disabled,
  className,
  classNames,
  "aria-label": ariaLabel,
}: SortableListProps<T>) {
  const { t, locale } = useTranslation()
  const { announce, region } = useAnnouncer({ role: "status" })
  const ids = items.map(getId)
  const byId = new Map(items.map((item) => [getId(item), item]))
  const nameOf = (id: string | number) => {
    const item = byId.get(String(id))
    return item ? getName(item) : String(id)
  }
  const plugins = useDndPlugins(nameOf)
  const format = new Intl.NumberFormat(locale.numberLocale)

  const commit = (nextIds: string[], id: string) => {
    const from = ids.indexOf(id)
    const to = nextIds.indexOf(id)
    if (from === to || to < 0) return
    onReorder(
      nextIds.map((x) => byId.get(x) as T),
      { id, from, to },
    )
    announce(
      t("listing.movedToPosition", {
        name: nameOf(id),
        position: format.format(to + 1),
        total: format.format(ids.length),
      }),
    )
  }

  const rowProps = (item: T, index: number) => {
    const id = getId(item)
    return {
      key: id,
      id,
      index,
      name: getName(item),
      disabled,
      count: items.length,
      moveButtons,
      onMove: (from: number, to: number) => commit(arrayMove(ids, from, to), id),
      className: classNames?.item,
      handleClassName: classNames?.handle,
    }
  }

  return (
    <DragDropProvider
      plugins={plugins}
      onDragEnd={(event) => {
        if (event.canceled || !event.operation.source) return
        commit(move(ids, event), String(event.operation.source.id))
      }}
    >
      {region}
      {columns ? (
        <div
          data-slot="sortable-list"
          data-layout="table"
          className={cn("overflow-hidden rounded-lg border", className)}
        >
          <Table className={classNames?.table}>
            {ariaLabel ? <TableCaption className="sr-only">{ariaLabel}</TableCaption> : null}
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={moveButtons ? "w-px" : "w-10"}>
                  <span className="sr-only">{t("listing.reorder")}</span>
                </TableHead>
                {columns.map((column) => (
                  <TableHead key={column.id} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const { key, ...props } = rowProps(item, index)
                return (
                  <SortableTableRow key={key} {...props}>
                    {columns.map((column) => (
                      <TableCell key={column.id} className={column.className}>
                        {column.cell(item)}
                      </TableCell>
                    ))}
                  </SortableTableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ul data-slot="sortable-list" aria-label={ariaLabel} className={cn("gap-2 grid", className)}>
          {items.map((item, index) => {
            const { key, ...props } = rowProps(item, index)
            return (
              <SortableListItem key={key} {...props}>
                {(parts) => renderItem?.(item, parts)}
              </SortableListItem>
            )
          })}
        </ul>
      )}
    </DragDropProvider>
  )
}
