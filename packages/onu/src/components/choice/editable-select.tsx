"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../ui/input-group"
import { Popover, PopoverAnchor, PopoverContent } from "../../ui/popover"
import { useFormFieldControl } from "../form/form-field"
import { ThaanaToggle } from "../inputs/thaana-toggle"
import { useMergedRef } from "../inputs/text-input"
import { useControllableState } from "./_hooks"
import { useOpenState } from "./_selection"
import { filterOptions, hasExactMatch, normalizeOptions, type ChoiceOption, type ChoiceOptionInput } from "./options"
import { registerEnglish } from "../../i18n/english"
import { choice as en_choice } from "../../locales/en/choice"
import { common as en_common } from "../../locales/en/common"

registerEnglish({ choice: en_choice, common: en_common })

export interface EditableSelectProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "type"
> {
  /** Suggestions. The user may also type anything else. */
  options: ReadonlyArray<ChoiceOptionInput>
  /** The text in the field. */
  value?: string
  defaultValue?: string
  /** Called as the user types or picks a suggestion (`option` is the suggestion, or `null` for custom text). */
  onValueChange?: (value: string, option: ChoiceOption | null) => void
  /** Type Thaana from a Latin keyboard (R13.3). */
  thaana?: ThaanaProp
  /** Show a Thaana/Latin toggle when `thaana` is on. */
  thaanaToggle?: boolean
  /** Offer "Use “x”" for text that matches no suggestion. Default `true`. */
  showCustomOption?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  classNames?: { root?: string; input?: string; content?: string; list?: string; item?: string }
}

interface Row {
  id: string
  option: ChoiceOption | null
  label: string
}

/**
 * A combobox that accepts custom values: a text field with a list of
 * suggestions (WAI-ARIA combobox with list autocomplete). Typing filters the
 * suggestions with `Intl.Collator`; Enter keeps whatever was typed.
 */
export function EditableSelect({
  options: optionsInput,
  value: valueProp,
  defaultValue,
  onValueChange,
  thaana,
  thaanaToggle = false,
  showCustomOption = true,
  open: openProp,
  defaultOpen,
  onOpenChange,
  className,
  classNames,
  ref,
  onKeyDown,
  onBlur,
  ...props
}: EditableSelectProps) {
  const { t, locale } = useTranslation()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const merged = useMergedRef(inputRef, ref)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const { fieldProps, active: thaanaActive, enabled, toggle } = useThaanaField(inputRef, thaana)
  const control = useFormFieldControl(props as Record<string, unknown>) as React.ComponentProps<"input">
  const [value, setValue] = useControllableState<string, [ChoiceOption | null]>(
    valueProp,
    defaultValue ?? "",
    onValueChange,
  )
  const [open, setOpen] = useOpenState(openProp, defaultOpen, onOpenChange)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [filterText, setFilterText] = React.useState<string | null>(null)
  const listId = `${React.useId()}-list`
  const options = React.useMemo(() => normalizeOptions(optionsInput), [optionsInput])

  // Filter by what the user typed since opening; show everything when just opened.
  const query = filterText ?? ""
  const matches = filterOptions(options, query, locale.code)
  const rows: Row[] = [
    ...(showCustomOption && query.trim() && !hasExactMatch(options, query, locale.code)
      ? [{ id: `${listId}-custom`, option: null, label: t("choice.useValue", { query: query.trim() }) }]
      : []),
    ...matches.map((o, i) => ({ id: `${listId}-${i}`, option: o, label: o.label })),
  ]
  const active = open ? rows[Math.min(activeIndex, rows.length - 1)] : undefined

  const show = (next: boolean) => {
    if (next === open) return
    if (!next) setFilterText(null)
    setActiveIndex(0)
    setOpen(next)
  }

  const choose = (row: Row) => {
    if (row.option && !row.option.disabled) setValue(row.option.label, row.option)
    else if (!row.option) setValue(query.trim(), null)
    else return
    // Options keep focus in the input (mousedown is prevented), so no refocus is needed.
    show(false)
  }

  const move = (delta: number) => {
    if (!rows.length) return
    setActiveIndex((i) => (Math.min(i, rows.length - 1) + delta + rows.length) % rows.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented || e.nativeEvent.isComposing) return
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (!open) show(true)
        else if (!e.altKey) move(1)
        break
      case "ArrowUp":
        e.preventDefault()
        if (!open) show(true)
        else move(-1)
        break
      case "Enter":
        if (open && active) {
          e.preventDefault()
          choose(active)
        }
        break
      case "Escape":
        if (open) {
          e.preventDefault()
          show(false)
        }
        break
      case "Tab":
        show(false)
        break
    }
  }

  const showToggle = thaanaActive && thaanaToggle

  return (
    <Popover open={open} onOpenChange={show}>
      <PopoverAnchor asChild>
        <InputGroup
          ref={anchorRef}
          data-slot="editable-select"
          data-disabled={control.disabled || undefined}
          className={cn("touch:min-h-11", classNames?.root, className)}
        >
          <InputGroupInput
            ref={merged}
            role="combobox"
            type="text"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={active?.id}
            {...fieldProps}
            {...control}
            value={value}
            onChange={(e) => {
              setValue(e.target.value, null)
              setFilterText(e.target.value)
              setActiveIndex(0)
              if (!open) setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              onBlur?.(e)
              if (!anchorRef.current?.contains(e.relatedTarget as Node | null)) show(false)
            }}
            className={classNames?.input}
          />
          <InputGroupAddon align="inline-end">
            {showToggle ? <ThaanaToggle enabled={enabled} onToggle={toggle} /> : null}
            <button
              type="button"
              tabIndex={-1}
              aria-label={t("choice.showOptions")}
              aria-expanded={open}
              disabled={control.disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                show(!open)
                inputRef.current?.focus()
              }}
              className="size-6 touch:size-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Icon name="chevron-down" className="size-4" />
            </button>
          </InputGroupAddon>
        </InputGroup>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        data-slot="editable-select-content"
        role="presentation"
        className={cn("p-1 gap-0 min-w-48 w-(--radix-popover-trigger-width)", classNames?.content)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (anchorRef.current?.contains(e.target as Node)) e.preventDefault()
        }}
      >
        <div
          id={listId}
          role="listbox"
          aria-label={(props["aria-label"] as string | undefined) ?? t("choice.options")}
          className={cn("max-h-64 overflow-y-auto", classNames?.list)}
        >
          {rows.length === 0 ? (
            <div className="py-4 text-sm text-center text-muted-foreground">
              {query ? t("common.noResultsFor", { query }) : t("choice.noOptions")}
            </div>
          ) : (
            rows.map((row) => {
              const isActive = row.id === active?.id
              return (
                // Keyboard is handled on the input via aria-activedescendant (WAI-ARIA combobox).
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <div
                  key={row.id}
                  id={row.id}
                  role="option"
                  tabIndex={-1}
                  aria-selected={isActive}
                  aria-disabled={row.option?.disabled || undefined}
                  data-active={isActive || undefined}
                  data-custom={!row.option || undefined}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(row)}
                  onPointerMove={() => setActiveIndex(rows.indexOf(row))}
                  className={cn(
                    "gap-2 px-2 py-1.5 text-sm touch:min-h-11 flex cursor-default items-center rounded-sm select-none aria-disabled:opacity-50 data-active:bg-muted",
                    classNames?.item,
                  )}
                >
                  {row.option ? null : <Icon name="plus" className="size-4 text-muted-foreground" />}
                  <span className="truncate">{row.label}</span>
                  {row.option && row.option.label === value ? <Icon name="check" className="size-4 ms-auto" /> : null}
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
