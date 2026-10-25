"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { hasExactMatch } from "../choice/options"
import { useFormFieldControl } from "../form/form-field"
import {
  SuggestionList,
  suggestionsShown,
  useComboboxState,
  useSuggestions,
  type NormalizedOption,
  type SuggestionOption,
  type SuggestionRow,
  type SuggestionSource,
} from "./_suggestions"
import { useControllableState } from "./_shared"
import { TextInput, useMergedRef, type TextInputProps } from "./text-input"
import { registerEnglish } from "../../i18n/english"
import { choice as en_choice } from "../../locales/en/choice"
import { common as en_common } from "../../locales/en/common"

registerEnglish({ choice: en_choice, common: en_common })

export type { NormalizedOption as AutocompleteOption, SuggestionOption, SuggestionSource }

export interface AutocompleteProps extends Omit<
  TextInputProps,
  "value" | "defaultValue" | "onSelect" | "role" | "list"
> {
  /** Controlled text. */
  value?: string
  defaultValue?: string
  /** Called as the text changes. `option` is the picked suggestion, or `null` for typed text. */
  onValueChange?: (value: string, option: NormalizedOption | null) => void
  /** Static suggestions (strings or `ChoiceOption`s), or `async (query, { signal }) => options` for server search. */
  suggestions: SuggestionSource
  /** Called when a suggestion is picked. */
  onSelect?: (option: NormalizedOption) => void
  /** Debounce for async suggestions, in ms. Default `300`. */
  debounce?: number
  /** Minimum characters before suggestions show. Default `0` for lists, `1` for async sources. */
  minChars?: number
  /** Maximum suggestions shown. Default `50`. */
  maxSuggestions?: number
  /** Open the suggestions when the input gets focus. Default `false`. */
  openOnFocus?: boolean
  /** Show a chevron button that opens the full list. Default `false`. */
  showToggleButton?: boolean
  /** Offer "Use “x”" first when the text matches no suggestion exactly. Default `false`. */
  showCustomOption?: boolean
  /** Highlight the first row as the list opens or filters, so Enter picks it. Default `false`. */
  autoHighlight?: boolean
  /** Shown in the list when nothing matches. By default the list closes instead. */
  emptyMessage?: React.ReactNode | ((query: string) => React.ReactNode)
  /** Controlled open state of the list. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Custom option rendering. `selected` is true for the suggestion whose value is the current text. */
  renderOption?: (option: NormalizedOption, state: { active: boolean; selected: boolean }) => React.ReactNode
  classNames?: TextInputProps["classNames"] & { list?: string; option?: string }
}

/**
 * Free-text input with suggestions (WAI-ARIA combobox, list autocomplete).
 * The typed text is the value; suggestions only help fill it in. Supports
 * static lists, async search with debouncing and cancellation, and Thaana.
 * Matching uses `Intl.Collator` (case- and accent-insensitive).
 */
export function Autocomplete({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  suggestions,
  onSelect,
  debounce,
  minChars,
  maxSuggestions,
  openOnFocus = false,
  showToggleButton = false,
  showCustomOption = false,
  autoHighlight = false,
  emptyMessage,
  open: openProp,
  defaultOpen,
  onOpenChange,
  renderOption,
  classNames,
  endAddon,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  ref,
  ...props
}: AutocompleteProps) {
  const { t, locale } = useTranslation()
  const local = React.useRef<HTMLInputElement>(null)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const merged = useMergedRef(local, ref)
  const disabled = useFormFieldControl({ disabled: props.disabled }).disabled
  const [value, setValue] = useControllableState<string, [NormalizedOption | null]>(
    valueProp,
    defaultValue,
    onValueChange,
  )
  const [query, setQuery] = React.useState(value)
  const [listOpen, setListOpen] = React.useState(openProp ?? defaultOpen ?? false)
  const isAsync = typeof suggestions === "function"

  const { items, loading, error, retry } = useSuggestions({
    source: suggestions,
    query,
    enabled: listOpen,
    debounce,
    minChars: minChars ?? (isAsync ? 1 : 0),
    max: maxSuggestions,
  })

  const typed = query.trim()
  const rows: SuggestionRow[] =
    showCustomOption &&
    typed &&
    !hasExactMatch(
      items.map((o) => ({ value: o.value, label: o.value })),
      typed,
      locale.code,
    )
      ? [{ value: typed, label: t("choice.useValue", { query: typed }), custom: true }, ...items]
      : items
  const empty = typeof emptyMessage === "function" ? emptyMessage(query) : emptyMessage

  const combobox = useComboboxState(rows.length, { open: openProp, defaultOpen, onOpenChange })
  const open = combobox.open
  const setOpen = (next: boolean) => {
    if (!next) setQuery(value)
    combobox.setOpen(next)
  }
  const pick = (index: number) => {
    const option = rows[index]
    if (!option || option.disabled) return
    setValue(option.value, option.custom ? null : option)
    setQuery(option.value)
    combobox.setOpen(false)
    if (!option.custom) onSelect?.(option)
  }
  if (listOpen !== open) setListOpen(open)
  const listShown = open && suggestionsShown(rows.length, loading, error, empty)

  const toggleButton = showToggleButton ? (
    <button
      type="button"
      tabIndex={-1}
      aria-label={t("choice.showOptions")}
      aria-expanded={listShown}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        if (open) setOpen(false)
        else {
          // The button opens the full list, not just matches for the current text.
          setQuery("")
          combobox.setOpen(true)
          combobox.setActive(autoHighlight ? 0 : -1)
        }
        local.current?.focus()
      }}
      className="size-6 touch:size-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Icon name="chevron-down" className="size-4" />
    </button>
  ) : null

  return (
    <SuggestionList
      anchorRef={anchorRef}
      anchor={
        <div ref={anchorRef} data-slot="autocomplete" className={cn("w-full", classNames?.root)}>
          <TextInput
            ref={merged}
            autoComplete="off"
            {...props}
            {...combobox.inputProps(listShown)}
            classNames={classNames}
            endAddon={
              endAddon || toggleButton ? (
                <>
                  {endAddon}
                  {toggleButton}
                </>
              ) : undefined
            }
            value={value}
            onChange={(e) => {
              setValue(e.target.value, null)
              setQuery(e.target.value)
              combobox.setOpen(true)
              combobox.setActive(autoHighlight ? 0 : -1)
              onChange?.(e)
            }}
            onKeyDown={(e) => {
              onKeyDown?.(e)
              if (e.defaultPrevented) return
              if (combobox.onKeyDown(e, pick)) return
              if (e.key === "Escape" && value) {
                e.preventDefault()
                setValue("", null)
                setQuery("")
              }
            }}
            onFocus={(e) => {
              if (openOnFocus && !open) {
                combobox.setOpen(true)
                combobox.setActive(autoHighlight ? 0 : -1)
              }
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setOpen(false)
              onBlur?.(e)
            }}
          />
        </div>
      }
      open={open}
      onOpenChange={setOpen}
      items={rows}
      loading={loading}
      error={error}
      onRetry={retry}
      active={combobox.active}
      onActiveChange={combobox.setActive}
      onPick={pick}
      listId={combobox.listId}
      optionId={combobox.optionId}
      empty={empty}
      value={value}
      renderOption={renderOption}
      dir={props.thaana ? "rtl" : undefined}
      lang={props.thaana ? "dv" : undefined}
      classNames={{ list: classNames?.list, option: classNames?.option }}
    />
  )
}
