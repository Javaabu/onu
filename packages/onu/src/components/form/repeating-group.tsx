"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "./button"
import { registerEnglish } from "../../i18n/english"
import { form as en_form } from "../../locales/en/form"

registerEnglish({ form: en_form })

export interface RepeatingGroupRow<T> {
  item: T
  index: number
  /** Field name for this row: `name("qty")` → `items[0][qty]` (or `items.0.qty` with `nameFormat="dot"`). */
  name: (field: string) => string
  remove: () => void
  canRemove: boolean
}

export interface RepeatingGroupProps<T> extends Omit<React.ComponentProps<"div">, "children" | "onChange"> {
  /** The rows: `fields` from react-hook-form's `useFieldArray`, or a plain array. */
  items?: T[]
  /** Plain controlled array: the current rows (use with `onChange` and `createItem`). */
  value?: T[]
  onChange?: (value: T[]) => void
  /** Creates a new row for plain arrays. */
  createItem?: () => T
  /** Called by the Add button (react-hook-form: `() => append({...})`). */
  onAdd?: () => void
  /** Called by a row's Remove button (react-hook-form: `remove`). */
  onRemove?: (index: number) => void
  /** Enables Move up / Move down (react-hook-form: `move`). Plain arrays reorder automatically. */
  onMove?: (from: number, to: number) => void
  /** Allow reordering. Default: on when `onMove` is set or a plain array is used. */
  reorderable?: boolean
  min?: number
  max?: number
  /** Base field name, e.g. `items`. */
  name?: string
  nameFormat?: "bracket" | "dot"
  /** Row key. Defaults to `item.id` (react-hook-form), else a stable generated key. */
  getKey?: (item: T, index: number) => React.Key
  /** Renders the fields of one row. */
  children: (row: RepeatingGroupRow<T>) => React.ReactNode
  /** Accessible name and visible title for the group. */
  label?: React.ReactNode
  /** Row title shown above each row's fields. Default "Item {n}". Return `null` to hide. */
  itemLabel?: (index: number, item: T) => React.ReactNode
  addLabel?: React.ReactNode
  emptyText?: React.ReactNode
  disabled?: boolean
  classNames?: { header?: string; list?: string; row?: string; rowHeader?: string; actions?: string; add?: string }
}

let keyCounter = 0
const objectKeys = new WeakMap<object, string>()

function defaultKey(item: unknown, index: number): React.Key {
  if (item && typeof item === "object") {
    const id = (item as { id?: unknown }).id
    if (typeof id === "string" || typeof id === "number") return id
    let key = objectKeys.get(item)
    if (!key) {
      key = `row-${++keyCounter}`
      objectKeys.set(item, key)
    }
    return key
  }
  return index
}

function moveItem<T>(list: T[], from: number, to: number) {
  const next = list.slice()
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved as T)
  return next
}

type Focus = { index: number; target: "first" | "up" | "down" | "add" }

/**
 * A list of repeated field rows (line items, contacts, …) with Add, Remove and
 * Move up/down. Works with react-hook-form's `useFieldArray` or a plain array,
 * enforces `min`/`max`, generates names like `items[0][name]`, moves focus
 * sensibly and announces each change.
 */
export function RepeatingGroup<T>({
  items: itemsProp,
  value,
  onChange,
  createItem,
  onAdd,
  onRemove,
  onMove,
  reorderable,
  min = 0,
  max = Infinity,
  name = "items",
  nameFormat = "bracket",
  getKey = defaultKey,
  children,
  label,
  itemLabel,
  addLabel,
  emptyText,
  disabled = false,
  className,
  classNames,
  ...props
}: RepeatingGroupProps<T>) {
  const { t } = useTranslation()
  const items = itemsProp ?? value ?? []
  const listRef = React.useRef<HTMLOListElement>(null)
  const addRef = React.useRef<HTMLButtonElement>(null)
  const [focusRequest, setFocusRequest] = React.useState<Focus | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const labelId = React.useId()
  const canReorder = reorderable ?? (!!onMove || (!!value && !!onChange))
  const canAdd = !disabled && items.length < max
  const canRemove = !disabled && items.length > min

  React.useEffect(() => {
    const focus = focusRequest
    if (!focus) return
    if (focus.target === "add") return addRef.current?.focus()
    const row = listRef.current?.children[focus.index] as HTMLElement | undefined
    if (!row) return addRef.current?.focus()
    const selector =
      focus.target === "first"
        ? "input:not([type=hidden]), select, textarea, [role=combobox], button:not([data-row-action])"
        : `[data-row-action=${focus.target}]:not(:disabled)`
    const el =
      row.querySelector<HTMLElement>(selector) ??
      row.querySelector<HTMLElement>("[data-row-action]:not(:disabled)") ??
      row
    el.focus()
  }, [focusRequest])

  function add() {
    if (!canAdd) return
    setFocusRequest({ index: items.length, target: "first" })
    if (onAdd) onAdd()
    else if (onChange && createItem) onChange([...items, createItem()])
    setAnnouncement(t("form.itemAdded", { index: items.length + 1 }))
  }

  function remove(index: number) {
    if (!canRemove) return
    const remaining = items.length - 1
    setFocusRequest(
      remaining === 0 ? { index: 0, target: "add" } : { index: Math.min(index, remaining - 1), target: "first" },
    )
    if (onRemove) onRemove(index)
    else if (onChange) onChange(items.filter((_, i) => i !== index))
    setAnnouncement(t("form.itemRemoved", { index: index + 1 }))
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return
    setFocusRequest({ index: to, target: to < from ? "up" : "down" })
    if (onMove) onMove(from, to)
    else if (onChange) onChange(moveItem(items, from, to))
    setAnnouncement(t("form.itemMoved", { index: to + 1 }))
  }

  const fieldName = (index: number) => (field: string) =>
    nameFormat === "dot" ? `${name}.${index}.${field}` : `${name}[${index}][${field}]`

  const limits = [
    min > 0 ? t("form.minItems", { count: min }) : null,
    Number.isFinite(max) ? t("form.maxItems", { count: max }) : null,
  ].filter(Boolean)

  return (
    <div
      role="group"
      aria-labelledby={label ? labelId : undefined}
      data-slot="repeating-group"
      data-disabled={disabled || undefined}
      className={cn("gap-3 min-w-0 @container/repeating-group grid", className)}
      {...props}
    >
      {label || limits.length ? (
        <div className={cn("gap-2 flex flex-wrap items-baseline justify-between", classNames?.header)}>
          {label ? (
            <div id={labelId} className="text-sm font-medium">
              {label}
            </div>
          ) : null}
          {limits.length ? <p className="text-xs text-muted-foreground">{limits.join(" · ")}</p> : null}
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="p-4 text-sm rounded-lg border border-dashed border-border text-center text-muted-foreground">
          {emptyText ?? t("form.noItems")}
        </p>
      ) : null}

      <ol ref={listRef} className={cn("gap-3 grid", classNames?.list)} hidden={items.length === 0}>
        {items.map((item, index) => {
          const title = itemLabel ? itemLabel(index, item) : t("form.itemLabel", { index: index + 1 })
          const position = { index: index + 1 }
          return (
            <li
              key={getKey(item, index)}
              data-slot="repeating-group-row"
              aria-label={typeof title === "string" ? title : t("form.itemLabel", position)}
              className={cn(
                "gap-3 p-3 @lg/repeating-group:grid-cols-[minmax(0,1fr)_auto] @lg/repeating-group:items-start grid rounded-lg border border-border bg-card",
                classNames?.row,
              )}
            >
              <div className="gap-3 min-w-0 grid">
                {title !== null ? (
                  <div
                    className={cn(
                      "text-xs font-medium tracking-wide text-muted-foreground uppercase tabular-nums",
                      classNames?.rowHeader,
                    )}
                  >
                    {title}
                  </div>
                ) : null}
                {children({ item, index, name: fieldName(index), remove: () => remove(index), canRemove })}
              </div>
              <div
                data-slot="repeating-group-actions"
                className={cn(
                  "gap-1 @lg/repeating-group:flex-col @lg/repeating-group:justify-start flex items-center justify-end",
                  classNames?.actions,
                )}
              >
                {canReorder ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      data-row-action="up"
                      aria-label={t("form.moveItemUp", position)}
                      title={t("form.moveItemUp", position)}
                      disabled={disabled || index === 0}
                      onClick={() => move(index, index - 1)}
                      startIcon="arrow-up"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      data-row-action="down"
                      aria-label={t("form.moveItemDown", position)}
                      title={t("form.moveItemDown", position)}
                      disabled={disabled || index === items.length - 1}
                      onClick={() => move(index, index + 1)}
                      startIcon="arrow-down"
                    />
                  </>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  data-row-action="remove"
                  aria-label={t("form.removeItem", position)}
                  title={t("form.removeItem", position)}
                  disabled={!canRemove}
                  onClick={() => remove(index)}
                  startIcon="trash"
                  className="text-destructive hover:text-destructive"
                />
              </div>
            </li>
          )
        })}
      </ol>

      <div>
        <Button
          ref={addRef}
          variant="outline"
          startIcon="add"
          disabled={!canAdd}
          onClick={add}
          className={cn("touch:min-h-11", classNames?.add)}
        >
          {addLabel ?? t("form.addItem")}
        </Button>
      </div>

      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}
