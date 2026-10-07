"use client"

import * as React from "react"
import { arrayMove, move } from "@dnd-kit/helpers"
import { DragDropProvider } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { useDndPlugins } from "./_dnd"
import { useAnnouncer } from "./_shared"

export interface SortableListItemParts {
  /** The drag handle button (also keyboard-draggable: Space, arrows, Space). */
  handle: React.ReactNode
  /** Move up / Move down buttons, when `moveButtons` is on. */
  moveButtons: React.ReactNode
  index: number
  isDragging: boolean
}

export interface SortableListProps<T> {
  items: T[]
  /** Stable id. Defaults to `item.id`. */
  getId?: (item: T) => string
  /** Name for the handle label and announcements. */
  getName: (item: T) => string
  renderItem: (item: T, parts: SortableListItemParts) => React.ReactNode
  /** Called with the new order after a drop or a move button. */
  onReorder: (items: T[], change: { id: string; from: number; to: number }) => void
  /** Show Move up / Move down buttons as a non-drag alternative (R3.27). Default `true`. */
  moveButtons?: boolean
  disabled?: boolean
  "aria-label"?: string
  className?: string
  classNames?: { item?: string; handle?: string }
}

function SortableRow({
  id,
  index,
  name,
  disabled,
  count,
  onMove,
  moveButtons,
  children,
  className,
  handleClassName,
}: {
  id: string
  index: number
  name: string
  disabled?: boolean
  count: number
  onMove: (from: number, to: number) => void
  moveButtons: boolean
  children: (parts: SortableListItemParts) => React.ReactNode
  className?: string
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

  return (
    <li
      ref={ref}
      data-slot="sortable-item"
      data-dragging={isDragging || undefined}
      className={cn("data-dragging:shadow-md data-dragging:opacity-60", className)}
    >
      {children({ handle, moveButtons: buttons, index, isDragging })}
    </li>
  )
}

/**
 * A list the user can reorder by dragging (mouse, touch with a press delay,
 * or keyboard: Space to lift, arrows to move, Space to drop) or with Move up /
 * Move down buttons. Built on `@dnd-kit/react`; moves are announced.
 */
export function SortableList<T>({
  items,
  getId = (item: T) => String((item as { id?: unknown }).id),
  getName,
  renderItem,
  onReorder,
  moveButtons = true,
  disabled,
  className,
  classNames,
  ...props
}: SortableListProps<T>) {
  const { t, locale } = useTranslation()
  const { announce, region } = useAnnouncer()
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

  return (
    <DragDropProvider
      plugins={plugins}
      onDragEnd={(event) => {
        if (event.canceled || !event.operation.source) return
        commit(move(ids, event), String(event.operation.source.id))
      }}
    >
      {region}
      <ul data-slot="sortable-list" aria-label={props["aria-label"]} className={cn("gap-2 grid", className)}>
        {items.map((item, index) => {
          const id = getId(item)
          return (
            <SortableRow
              key={id}
              id={id}
              index={index}
              name={getName(item)}
              disabled={disabled}
              count={items.length}
              moveButtons={moveButtons}
              onMove={(from, to) => commit(arrayMove(ids, from, to), id)}
              className={classNames?.item}
              handleClassName={classNames?.handle}
            >
              {(parts) => renderItem(item, parts)}
            </SortableRow>
          )
        })}
      </ul>
    </DragDropProvider>
  )
}
