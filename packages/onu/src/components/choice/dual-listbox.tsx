"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { Button } from "../../ui/button"
import { useFormField, useFormFieldControl } from "../form/form-field"
import { useAnnouncer, useControllableState } from "./_hooks"
import { filterOptions, normalizeOptions, type ChoiceOption, type ChoiceOptionInput } from "./options"

export interface DualListboxProps extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange" | "dir"> {
  options: ReadonlyArray<ChoiceOptionInput>
  /** Values in the "Selected" list. */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[], options: ChoiceOption[]) => void
  /** Show a filter field above each list. Default `true`. */
  searchable?: boolean
  /** Type Thaana in the filter fields. */
  thaana?: ThaanaProp
  /** Heading of the left (start) list. */
  availableLabel?: string
  /** Heading of the right (end) list. */
  selectedLabel?: string
  disabled?: boolean
  /** Submits the chosen values as `name[]`. */
  name?: string
  classNames?: { pane?: string; heading?: string; search?: string; list?: string; item?: string; actions?: string }
}

type Side = "available" | "chosen"

function FilterInput({
  value,
  onChange,
  label,
  thaana,
  disabled,
  className,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  thaana?: ThaanaProp
  disabled?: boolean
  className?: string
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const { fieldProps } = useThaanaField(ref, thaana)
  return (
    <div className="relative">
      <Icon
        name="search"
        className="start-2.5 size-4 pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        ref={ref}
        type="search"
        value={value}
        disabled={disabled}
        aria-label={label}
        placeholder={label}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-8 ps-8 pe-2.5 text-sm touch:h-11 w-full rounded-lg border border-input bg-transparent outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30",
          className,
        )}
        {...fieldProps}
      />
    </div>
  )
}

interface PaneProps {
  side: Side
  id: string
  title: string
  options: ChoiceOption[]
  marked: Set<string>
  setMarked: (next: Set<string>) => void
  onMove: (values: string[]) => void
  query: string
  setQuery: (q: string) => void
  searchable: boolean
  thaana?: ThaanaProp
  disabled?: boolean
  describedBy?: string
  classNames?: DualListboxProps["classNames"]
}

function Pane({
  side,
  id,
  title,
  options,
  marked,
  setMarked,
  onMove,
  query,
  setQuery,
  searchable,
  thaana,
  disabled,
  describedBy,
  classNames,
}: PaneProps) {
  const { t } = useTranslation()
  const [active, setActive] = React.useState(0)
  const [anchor, setAnchor] = React.useState<number | null>(null)
  const index = Math.min(active, Math.max(0, options.length - 1))
  const activeOption = options[index]
  const optionId = (o: ChoiceOption) => `${id}-${side}-${o.value}`

  const toggle = (o: ChoiceOption) => {
    if (o.disabled) return
    const next = new Set(marked)
    if (next.has(o.value)) next.delete(o.value)
    else next.add(o.value)
    setMarked(next)
  }

  const markRange = (from: number, to: number) => {
    const [a, b] = from < to ? [from, to] : [to, from]
    const next = new Set(marked)
    for (const o of options.slice(a, b + 1)) if (!o.disabled) next.add(o.value)
    setMarked(next)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!options.length) return
    const go = (to: number) => {
      const target = Math.max(0, Math.min(options.length - 1, to))
      if (e.shiftKey) markRange(anchor ?? index, target)
      else setAnchor(target)
      setActive(target)
      document.getElementById(optionId(options[target]!))?.scrollIntoView({ block: "nearest" })
    }
    if (e.key === "ArrowDown") go(index + 1)
    else if (e.key === "ArrowUp") go(index - 1)
    else if (e.key === "Home") go(0)
    else if (e.key === "End") go(options.length - 1)
    else if (e.key === " ") {
      if (activeOption) toggle(activeOption)
    } else if (e.key === "Enter") {
      const values = marked.size ? [...marked] : activeOption && !activeOption.disabled ? [activeOption.value] : []
      if (values.length) onMove(values)
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
      setMarked(new Set(options.filter((o) => !o.disabled).map((o) => o.value)))
    } else return
    e.preventDefault()
  }

  return (
    <div data-slot="dual-listbox-pane" data-side={side} className={cn("min-w-0 gap-2 flex flex-col", classNames?.pane)}>
      <div className="gap-2 flex items-baseline justify-between">
        <span id={`${id}-${side}-heading`} className={cn("text-sm font-medium", classNames?.heading)}>
          {title}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {marked.size ? `${marked.size} / ${options.length}` : options.length}
        </span>
      </div>
      {searchable ? (
        <FilterInput
          value={query}
          onChange={setQuery}
          label={t("choice.filterList", { list: title })}
          thaana={thaana}
          disabled={disabled}
          className={classNames?.search}
        />
      ) : null}
      <div
        role="listbox"
        aria-multiselectable="true"
        aria-labelledby={`${id}-${side}-heading`}
        aria-describedby={describedBy}
        aria-activedescendant={activeOption ? optionId(activeOption) : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        className={cn(
          "h-56 p-1 overflow-y-auto rounded-lg border border-input bg-transparent outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
          disabled && "opacity-50",
          classNames?.list,
        )}
      >
        {options.length === 0 ? (
          <div className="py-6 text-sm text-center text-muted-foreground">
            {query ? t("common.noResultsFor", { query }) : t("choice.emptyList")}
          </div>
        ) : (
          options.map((o, i) => {
            const isMarked = marked.has(o.value)
            return (
              // Keyboard is handled on the listbox via aria-activedescendant.
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                key={o.value}
                id={optionId(o)}
                role="option"
                tabIndex={-1}
                aria-selected={isMarked}
                aria-disabled={o.disabled || undefined}
                data-active={i === index || undefined}
                onClick={(e) => {
                  if (disabled) return
                  setActive(i)
                  if (e.shiftKey && anchor !== null) markRange(anchor, i)
                  else {
                    setAnchor(i)
                    toggle(o)
                  }
                }}
                onDoubleClick={() => !disabled && !o.disabled && onMove([o.value])}
                className={cn(
                  "gap-2 px-2 py-1.5 text-sm touch:min-h-11 flex cursor-default items-center rounded-md select-none",
                  "aria-disabled:opacity-50 aria-selected:bg-primary/10 aria-selected:text-foreground",
                  "data-active:bg-muted in-[[role=listbox]:focus-visible]:data-active:ring-2 in-[[role=listbox]:focus-visible]:data-active:ring-ring/50",
                  classNames?.item,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-4 flex shrink-0 items-center justify-center rounded-[4px] border border-input",
                    isMarked && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {isMarked ? <Icon name="check" className="size-3" /> : null}
                </span>
                {o.icon}
                <span className="min-w-0 grid">
                  <span className="truncate">{o.label}</span>
                  {o.description ? (
                    <span className="text-xs truncate text-muted-foreground">{o.description}</span>
                  ) : null}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/**
 * Two lists side by side, "Available" and "Selected", with buttons to move
 * items between them. Each list is a multi-select listbox: arrows move,
 * Space marks, Shift+arrows extend, Ctrl+A marks all, Enter moves.
 * Stacks vertically in narrow containers.
 */
export function DualListbox({
  options: optionsInput,
  value: valueProp,
  defaultValue,
  onValueChange,
  searchable = true,
  thaana,
  availableLabel,
  selectedLabel,
  disabled: disabledProp,
  name: nameProp,
  className,
  classNames,
  ...props
}: DualListboxProps) {
  const { t, locale } = useTranslation()
  const field = useFormField()
  const control = useFormFieldControl({ ...props, name: nameProp, disabled: disabledProp } as Record<
    string,
    unknown
  >) as React.ComponentProps<"div"> & { name?: string; disabled?: boolean; required?: boolean }
  const {
    name,
    disabled,
    required: _required,
    id: controlId,
    "aria-describedby": describedBy,
    "aria-invalid": _invalid,
    "aria-required": _ariaRequired,
    ...rest
  } = control
  const generated = React.useId()
  const id = controlId ?? generated
  const options = React.useMemo(() => normalizeOptions(optionsInput), [optionsInput])
  const [value, setValue] = useControllableState<string[], [ChoiceOption[]]>(
    valueProp,
    defaultValue ?? [],
    onValueChange,
  )
  const [marked, setMarked] = React.useState<Record<Side, Set<string>>>({ available: new Set(), chosen: new Set() })
  const [queries, setQueries] = React.useState<Record<Side, string>>({ available: "", chosen: "" })
  const [message, announce] = useAnnouncer()

  const chosenSet = new Set(value)
  const titles: Record<Side, string> = {
    available: availableLabel ?? t("choice.available"),
    chosen: selectedLabel ?? t("choice.chosen"),
  }
  const lists: Record<Side, ChoiceOption[]> = {
    available: filterOptions(
      options.filter((o) => !chosenSet.has(o.value)),
      queries.available,
      locale.code,
    ),
    chosen: filterOptions(
      options.filter((o) => chosenSet.has(o.value)),
      queries.chosen,
      locale.code,
    ),
  }

  const move = (from: Side, values: string[]) => {
    const movable = new Set(values.filter((v) => !options.find((o) => o.value === v)?.disabled))
    if (!movable.size) return
    const next =
      from === "available"
        ? options.filter((o) => chosenSet.has(o.value) || movable.has(o.value))
        : options.filter((o) => chosenSet.has(o.value) && !movable.has(o.value))
    setValue(
      next.map((o) => o.value),
      next,
    )
    setMarked((m) => ({ ...m, [from]: new Set() }))
    const to: Side = from === "available" ? "chosen" : "available"
    announce(t("choice.itemsMoved", { count: movable.size, list: titles[to] }))
  }

  const moveAll = (from: Side) =>
    move(
      from,
      lists[from].filter((o) => !o.disabled).map((o) => o.value),
    )

  const pane = (side: Side) => (
    <Pane
      side={side}
      id={id}
      title={titles[side]}
      options={lists[side]}
      marked={marked[side]}
      setMarked={(next) => setMarked((m) => ({ ...m, [side]: next }))}
      onMove={(values) => move(side, values)}
      query={queries[side]}
      setQuery={(q) => setQueries((s) => ({ ...s, [side]: q }))}
      searchable={searchable}
      thaana={thaana}
      disabled={disabled}
      describedBy={describedBy}
      classNames={classNames}
    />
  )

  const actionButton = (label: string, wide: string, narrow: string, onClick: () => void, isDisabled: boolean) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      disabled={disabled || isDisabled}
      onClick={onClick}
      className="touch:size-11"
    >
      <Icon name={wide} className="@xl/dual-listbox:block hidden" />
      <Icon name={narrow} className="@xl/dual-listbox:hidden" />
    </Button>
  )

  return (
    <div
      role="group"
      data-slot="dual-listbox"
      aria-labelledby={rest["aria-labelledby"] ?? (field && !rest["aria-label"] ? field.labelId : undefined)}
      {...rest}
      className={cn("@container/dual-listbox w-full", className)}
    >
      <div className="gap-3 @xl/dual-listbox:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] grid grid-cols-1 items-center">
        {pane("available")}
        <div
          data-slot="dual-listbox-actions"
          className={cn("gap-2 @xl/dual-listbox:flex-col flex flex-row justify-center", classNames?.actions)}
        >
          {actionButton(
            t("choice.moveSelectedTo", { list: titles.chosen }),
            "chevron-right",
            "chevron-down",
            () => move("available", [...marked.available]),
            marked.available.size === 0,
          )}
          {actionButton(
            t("choice.moveAllTo", { list: titles.chosen }),
            "chevrons-right",
            "chevrons-down",
            () => moveAll("available"),
            lists.available.every((o) => o.disabled),
          )}
          {actionButton(
            t("choice.moveSelectedTo", { list: titles.available }),
            "chevron-left",
            "chevron-up",
            () => move("chosen", [...marked.chosen]),
            marked.chosen.size === 0,
          )}
          {actionButton(
            t("choice.moveAllTo", { list: titles.available }),
            "chevrons-left",
            "chevrons-up",
            () => moveAll("chosen"),
            lists.chosen.every((o) => o.disabled),
          )}
        </div>
        {pane("chosen")}
      </div>
      {name
        ? value.map((v) => <input key={v} type="hidden" name={name.endsWith("[]") ? name : `${name}[]`} value={v} />)
        : null}
      <span role="status" aria-live="polite" className="sr-only">
        {message}
      </span>
    </div>
  )
}
