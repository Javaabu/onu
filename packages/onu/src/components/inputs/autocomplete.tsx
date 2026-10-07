"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import {
  SuggestionList,
  suggestionsShown,
  useComboboxState,
  useSuggestions,
  type NormalizedOption,
  type SuggestionOption,
  type SuggestionSource,
} from "./_suggestions"
import { useControllableState } from "./_shared"
import { TextInput, useMergedRef, type TextInputProps } from "./text-input"

export type { NormalizedOption as AutocompleteOption, SuggestionOption, SuggestionSource }

export interface AutocompleteProps extends Omit<
  TextInputProps,
  "value" | "defaultValue" | "onSelect" | "role" | "list"
> {
  /** Controlled text. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Static suggestions, or `async (query, { signal }) => options` for server search. */
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
  /** Custom option rendering. */
  renderOption?: (option: NormalizedOption, state: { active: boolean }) => React.ReactNode
  classNames?: TextInputProps["classNames"] & { list?: string; option?: string }
}

/**
 * Free-text input with suggestions (WAI-ARIA combobox, list autocomplete).
 * The typed text is the value; suggestions only help fill it in. Supports
 * static lists, async search with debouncing and cancellation, and Thaana.
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
  renderOption,
  classNames,
  onChange,
  onKeyDown,
  onFocus,
  onBlur,
  ref,
  ...props
}: AutocompleteProps) {
  const local = React.useRef<HTMLInputElement>(null)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const merged = useMergedRef(local, ref)
  const [value, setValue] = useControllableState(valueProp, defaultValue, onValueChange)
  const [query, setQuery] = React.useState(value)
  const [listOpen, setListOpen] = React.useState(false)
  const isAsync = typeof suggestions === "function"

  const { items, loading, error, retry } = useSuggestions({
    source: suggestions,
    query,
    enabled: listOpen,
    debounce,
    minChars: minChars ?? (isAsync ? 1 : 0),
    max: maxSuggestions,
  })

  const combobox = useComboboxState(items.length)
  const pick = (index: number) => {
    const option = items[index]
    if (!option) return
    setValue(option.value)
    setQuery(option.value)
    combobox.setOpen(false)
    onSelect?.(option)
  }
  const open = combobox.open
  const setOpen = combobox.setOpen
  if (listOpen !== open) setListOpen(open)

  return (
    <SuggestionList
      anchorRef={anchorRef}
      anchor={
        <div ref={anchorRef} data-slot="autocomplete" className={cn("w-full", classNames?.root)}>
          <TextInput
            ref={merged}
            autoComplete="off"
            {...props}
            {...combobox.inputProps(open && suggestionsShown(items.length, loading, error))}
            classNames={classNames}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setQuery(e.target.value)
              setOpen(true)
              combobox.setActive(-1)
              onChange?.(e)
            }}
            onKeyDown={(e) => {
              onKeyDown?.(e)
              if (e.defaultPrevented) return
              if (combobox.onKeyDown(e, pick)) return
              if (e.key === "Escape" && value) {
                e.preventDefault()
                setValue("")
                setQuery("")
              }
            }}
            onFocus={(e) => {
              if (openOnFocus) setOpen(true)
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
      items={items}
      loading={loading}
      error={error}
      onRetry={retry}
      active={combobox.active}
      onActiveChange={combobox.setActive}
      onPick={pick}
      listId={combobox.listId}
      optionId={combobox.optionId}
      renderOption={renderOption}
      dir={props.thaana ? "rtl" : undefined}
      lang={props.thaana ? "dv" : undefined}
      classNames={{ list: classNames?.list, option: classNames?.option }}
    />
  )
}
