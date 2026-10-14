"use client"

import * as React from "react"
import { arrayMove, move } from "@dnd-kit/helpers"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { useDndPlugins } from "./_dnd"
import { useAnnouncer } from "./_shared"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export interface ReorderableColumn<T> {
  id: string
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

export interface ReorderableTableProps<T> {
  columns: ReorderableColumn<T>[]
  rows: T[]
  /** Stable id. Defaults to `row.id`. */
  getId?: (row: T) => string
  /** Name for the handle label and announcements. */
  getName: (row: T) => string
  /** Called with the new order after a drop or Alt+Arrow on a handle. */
  onReorder: (rows: T[], change: { id: string; from: number; to: number }) => void
  disabled?: boolean
  /** Accessible name of the table. */
  caption?: string
  className?: string
  classNames?: { table?: string; row?: string; handle?: string }
}

function ReorderableRow({
  id,
  index,
  name,
  count,
  disabled,
  onMove,
  className,
  handleClassName,
  children,
}: {
  id: string
  index: number
  name: string
  count: number
  disabled?: boolean
  onMove: (from: number, to: number) => void
  className?: string
  handleClassName?: string
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  const { ref, handleRef, isDragging } = useSortable({ id, index, disabled })
  return (
    <TableRow
      ref={ref}
      data-dragging={isDragging || undefined}
      className={cn("data-dragging:bg-muted data-dragging:opacity-60", className)}
    >
      <TableCell className="w-10">
        <button
          ref={handleRef}
          type="button"
          data-slot="drag-handle"
          disabled={disabled}
          aria-label={t("listing.dragHandle", { name })}
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
          onKeyDown={(e) => {
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
            "size-7 touch:size-11 inline-flex cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing disabled:opacity-50",
            handleClassName,
          )}
        >
          <Icon name="grip-vertical" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  )
}

/**
 * A table whose rows can be put in order: drag the handle (mouse, touch with a
 * press delay, or keyboard: Space, arrows, Space), or press Alt+Up/Down on the
 * handle to move a row by one. Moves are announced.
 */
export function ReorderableTable<T>({
  columns,
  rows,
  getId = (row: T) => String((row as { id?: unknown }).id),
  getName,
  onReorder,
  disabled,
  caption,
  className,
  classNames,
}: ReorderableTableProps<T>) {
  const { t, locale } = useTranslation()
  const { announce, region } = useAnnouncer()
  const ids = rows.map(getId)
  const byId = new Map(rows.map((row) => [getId(row), row]))
  const nameOf = (id: string | number) => {
    const row = byId.get(String(id))
    return row ? getName(row) : String(id)
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

  return (
    <DragDropProvider
      plugins={plugins}
      onDragEnd={(event) => {
        if (event.canceled || !event.operation.source) return
        commit(move(ids, event), String(event.operation.source.id))
      }}
    >
      {region}
      <div data-slot="reorderable-table" className={cn("overflow-hidden rounded-lg border", className)}>
        <Table className={classNames?.table}>
          {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
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
            {rows.map((row, index) => {
              const id = getId(row)
              return (
                <ReorderableRow
                  key={id}
                  id={id}
                  index={index}
                  name={getName(row)}
                  count={rows.length}
                  disabled={disabled}
                  onMove={(from, to) => commit(arrayMove(ids, from, to), id)}
                  className={classNames?.row}
                  handleClassName={classNames?.handle}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </ReorderableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </DragDropProvider>
  )
}
