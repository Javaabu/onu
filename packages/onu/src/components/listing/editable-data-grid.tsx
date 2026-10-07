"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useOnu, useTranslation } from "../../providers/onu-provider"
import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { NativeSelect, NativeSelectOption } from "../../ui/native-select"
import { TextInput } from "../inputs/text-input"
import { useAnnouncer } from "./_shared"

export interface EditableColumn<T> {
  id: string
  header: string
  /** Value of the cell. Defaults to `row[id]`. */
  accessor?: (row: T) => unknown
  /** Display content (when not editing). Defaults to the value. */
  cell?: (row: T) => React.ReactNode
  editable?: boolean
  /** Editor type. Default `text`. */
  type?: "text" | "number" | "select"
  options?: { value: string; label: string }[]
  required?: boolean
  /** Return an error message to refuse the value. */
  validate?: (value: string, row: T) => string | undefined | null
  /** Type Thaana in the text editor. */
  thaana?: ThaanaProp
  align?: "start" | "end"
  className?: string
}

export interface EditableDataGridProps<T> {
  columns: EditableColumn<T>[]
  rows: T[]
  getRowId?: (row: T) => string
  /**
   * Called when an edit is committed. Return (or resolve) an error message to
   * reject it; the cell stays in edit mode and shows the message.
   */
  onCellChange: (change: {
    rowId: string
    columnId: string
    value: string
    row: T
  }) => void | string | null | undefined | Promise<void | string | null | undefined>
  /** Accessible name. */
  "aria-label"?: string
  className?: string
  classNames?: { table?: string; header?: string; cell?: string; editor?: string; error?: string }
}

type Pos = { row: number; col: number }

/**
 * A spreadsheet-like table for quick edits (WAI-ARIA grid pattern). Arrow keys
 * move between cells (mirrored in RTL); Enter or F2 edits, Enter saves and
 * moves down, Tab saves and moves on, Escape cancels; typing starts an edit.
 * Values are validated before they are saved.
 */
export function EditableDataGrid<T>({
  columns,
  rows,
  getRowId = (row: T) => String((row as { id?: unknown }).id),
  onCellChange,
  className,
  classNames,
  ...props
}: EditableDataGridProps<T>) {
  const { t } = useTranslation()
  const { dir } = useOnu()
  const { announce, region } = useAnnouncer()
  const id = React.useId()
  const [active, setActive] = React.useState<Pos>({ row: 0, col: 0 })
  const [editing, setEditing] = React.useState<{ pos: Pos; value: string; error?: string } | null>(null)
  const saving = React.useRef(false)
  const cellRefs = React.useRef(new Map<string, HTMLTableCellElement>())
  const editorRef = React.useRef<HTMLInputElement | HTMLSelectElement | null>(null)
  const restoreFocus = React.useRef(false)

  const valueOf = (column: EditableColumn<T>, row: T) =>
    column.accessor ? column.accessor(row) : (row as Record<string, unknown>)[column.id]
  const text = (v: unknown) => (v === null || v === undefined ? "" : String(v))

  const focusCell = (pos: Pos) => cellRefs.current.get(`${pos.row}:${pos.col}`)?.focus()

  React.useEffect(() => {
    if (editing) editorRef.current?.focus()
    else if (restoreFocus.current) {
      restoreFocus.current = false
      focusCell(active)
    }
  }, [editing, active])

  const clamp = (pos: Pos): Pos => ({
    row: Math.max(0, Math.min(rows.length - 1, pos.row)),
    col: Math.max(0, Math.min(columns.length - 1, pos.col)),
  })

  const moveTo = (pos: Pos) => {
    const next = clamp(pos)
    setActive(next)
    focusCell(next)
  }

  const startEdit = (pos: Pos, initial?: string) => {
    const column = columns[pos.col]
    const row = rows[pos.row]
    if (!column?.editable || row === undefined) return
    setActive(pos)
    setEditing({ pos, value: initial ?? text(valueOf(column, row)) })
  }

  const commit = async (then?: Pos) => {
    if (!editing || saving.current) return
    const column = columns[editing.pos.col] as EditableColumn<T>
    const row = rows[editing.pos.row] as T
    const value = editing.value
    const unchanged = value === text(valueOf(column, row))
    let error: string | null | undefined
    if (!unchanged) {
      if (column.required && value.trim() === "") error = t("listing.cellRequired")
      else if (column.type === "number" && value.trim() !== "" && Number.isNaN(Number(value)))
        error = t("listing.cellNumber")
      error ??= column.validate?.(value, row)
      if (!error) {
        saving.current = true
        try {
          error = (await onCellChange({ rowId: getRowId(row), columnId: column.id, value, row })) ?? undefined
        } finally {
          saving.current = false
        }
      }
    }
    if (error) {
      setEditing({ ...editing, error })
      announce(t("listing.cellInvalid", { column: column.header, message: error }))
      return
    }
    restoreFocus.current = true
    setEditing(null)
    if (!unchanged) announce(t("listing.cellSaved"))
    if (then) setActive(clamp(then))
  }

  const cancel = () => {
    restoreFocus.current = true
    setEditing(null)
  }

  const onGridKeyDown = (event: React.KeyboardEvent) => {
    if (editing) return
    const { row, col } = active
    const forward = dir === "rtl" ? -1 : 1
    const keys: Record<string, () => void> = {
      ArrowRight: () => moveTo({ row, col: col + forward }),
      ArrowLeft: () => moveTo({ row, col: col - forward }),
      ArrowDown: () => moveTo({ row: row + 1, col }),
      ArrowUp: () => moveTo({ row: row - 1, col }),
      Home: () => moveTo(event.ctrlKey ? { row: 0, col: 0 } : { row, col: 0 }),
      End: () =>
        moveTo(event.ctrlKey ? { row: rows.length - 1, col: columns.length - 1 } : { row, col: columns.length - 1 }),
      PageDown: () => moveTo({ row: row + 10, col }),
      PageUp: () => moveTo({ row: row - 10, col }),
      Enter: () => startEdit(active),
      F2: () => startEdit(active),
    }
    const handler = keys[event.key]
    if (handler) {
      event.preventDefault()
      handler()
      return
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      columns[col]?.type !== "select"
    ) {
      event.preventDefault()
      startEdit(active, event.key)
    }
  }

  const onEditorKeyDown = (event: React.KeyboardEvent) => {
    if (!editing) return
    const { row, col } = editing.pos
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      cancel()
    } else if (event.key === "Enter") {
      event.preventDefault()
      void commit({ row: row + 1, col })
    } else if (event.key === "Tab") {
      event.preventDefault()
      const step = event.shiftKey ? -1 : 1
      let next = { row, col: col + step }
      if (next.col >= columns.length) next = { row: row + 1, col: 0 }
      if (next.col < 0) next = { row: row - 1, col: columns.length - 1 }
      void commit(next)
    }
  }

  return (
    <div data-slot="editable-data-grid" className={cn("overflow-x-auto rounded-lg border", className)}>
      {region}
      <p id={`${id}-help`} className="sr-only">
        {t("listing.gridInstructions")}
      </p>
      <table
        role="grid"
        aria-label={props["aria-label"]}
        aria-describedby={`${id}-help`}
        aria-rowcount={rows.length + 1}
        aria-colcount={columns.length}
        className={cn("text-sm w-full border-collapse", classNames?.table)}
        onKeyDown={onGridKeyDown}
      >
        <thead className={classNames?.header}>
          <tr role="row" aria-rowindex={1} className="border-b">
            {columns.map((column, c) => (
              <th
                key={column.id}
                role="columnheader"
                aria-colindex={c + 1}
                className={cn(
                  "h-9 px-2 font-medium bg-muted/40 whitespace-nowrap",
                  column.align === "end" ? "text-end" : "text-start",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={getRowId(row)} role="row" aria-rowindex={r + 2} className="border-b last:border-0">
              {columns.map((column, c) => {
                const isActive = active.row === r && active.col === c
                const isEditing = editing?.pos.row === r && editing.pos.col === c
                const errorId = `${id}-${r}-${c}-error`
                const display = column.cell ? column.cell(row) : text(valueOf(column, row))
                return (
                  <td
                    key={column.id}
                    ref={(el) => {
                      if (el) cellRefs.current.set(`${r}:${c}`, el)
                      else cellRefs.current.delete(`${r}:${c}`)
                    }}
                    role="gridcell"
                    aria-colindex={c + 1}
                    aria-readonly={column.editable ? undefined : true}
                    aria-invalid={isEditing && editing?.error ? true : undefined}
                    tabIndex={isActive && !isEditing ? 0 : -1}
                    data-active={isActive || undefined}
                    data-editing={isEditing || undefined}
                    onFocus={(e) => {
                      if (e.target === e.currentTarget && !isActive) setActive({ row: r, col: c })
                    }}
                    onClick={() => !isEditing && setActive({ row: r, col: c })}
                    onDoubleClick={() => startEdit({ row: r, col: c })}
                    className={cn(
                      "h-9 px-2 touch:h-11 border-e align-middle outline-none last:border-e-0",
                      column.align === "end" ? "text-end tabular-nums" : "text-start",
                      "data-active:ring-2 data-active:ring-ring/60 data-active:ring-inset",
                      column.editable && "cursor-cell",
                      column.className,
                      classNames?.cell,
                    )}
                  >
                    {isEditing && editing ? (
                      <div className="gap-1 py-1 grid">
                        {column.type === "select" ? (
                          <NativeSelect
                            ref={(el: HTMLSelectElement | null) => {
                              editorRef.current = el
                            }}
                            aria-label={t("listing.editCell", { column: column.header })}
                            aria-invalid={!!editing.error || undefined}
                            aria-describedby={editing.error ? errorId : undefined}
                            value={editing.value}
                            size="sm"
                            className={cn("w-full", classNames?.editor)}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value, error: undefined })}
                            onKeyDown={onEditorKeyDown}
                            onBlur={() => void commit()}
                          >
                            {!column.required ? (
                              <NativeSelectOption value="">{t("common.emptyValue")}</NativeSelectOption>
                            ) : null}
                            {column.options?.map((o) => (
                              <NativeSelectOption key={o.value} value={o.value}>
                                {o.label}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        ) : (
                          <TextInput
                            ref={(el) => {
                              editorRef.current = el
                            }}
                            aria-label={t("listing.editCell", { column: column.header })}
                            aria-invalid={!!editing.error || undefined}
                            aria-describedby={editing.error ? errorId : undefined}
                            inputMode={column.type === "number" ? "decimal" : undefined}
                            thaana={column.thaana}
                            value={editing.value}
                            className={cn("h-7", column.align === "end" && "text-end", classNames?.editor)}
                            onChange={(e) => setEditing({ ...editing, value: e.target.value, error: undefined })}
                            onKeyDown={onEditorKeyDown}
                            onBlur={() => void commit()}
                          />
                        )}
                        {editing.error ? (
                          <span id={errorId} className={cn("text-xs text-destructive", classNames?.error)}>
                            {editing.error}
                          </span>
                        ) : null}
                      </div>
                    ) : display === "" ? (
                      <span className="text-muted-foreground">{t("common.emptyValue")}</span>
                    ) : (
                      display
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
