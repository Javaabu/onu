"use client"

import * as React from "react"

import { useAsyncSearch, type AsyncSearchStatus } from "../hooks/use-async-search"
import { Icon } from "../icons/icon"
import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { useThaanaField, type ThaanaProp } from "../thaana/use-thaana-field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Spinner } from "../ui/spinner"
import { useLatest } from "./_hooks"
import type { PlaceResult, PlaceSearch } from "./types"
import { registerEnglish } from "../i18n/english"
import { common as en_common } from "../locales/en/common"
import { map as en_map } from "../locales/en/map"

registerEnglish({ common: en_common, map: en_map })

export interface UsePlaceSearchBoxOptions {
  /** The search function, e.g. the map engine's geocoder or your own API. `null` disables searching. */
  search: PlaceSearch | null
  /** Minimum characters before searching. Default 2. */
  minChars?: number
  /** Debounce in ms. Default 300. */
  debounce?: number
}

export type PlaceSearchStatus = AsyncSearchStatus

/**
 * State for a place search box: debounced, and older requests are aborted
 * (`AbortController`) so a slow early response never overwrites a newer one.
 */
export function usePlaceSearchBox({ search, minChars = 2, debounce }: UsePlaceSearchBoxOptions) {
  const [query, setQueryState] = React.useState("")
  const searchRef = useLatest(search)
  const stableSearch = React.useCallback<PlaceSearch>((q, options) => searchRef.current!(q, options), [searchRef])
  const trimmed = query.trim()
  const { data, status, retry, clear } = useAsyncSearch({
    search: search ? stableSearch : null,
    query: trimmed,
    enabled: trimmed.length > 0 && trimmed.length >= minChars,
    delay: debounce,
  })

  const setQuery = React.useCallback(
    (q: string) => {
      setQueryState(q)
      if (q.trim().length < minChars) clear()
    },
    [clear, minChars],
  )

  const reset = React.useCallback(() => {
    setQueryState("")
    clear()
  }, [clear])

  const results: PlaceResult[] = status === "idle" || status === "error" ? [] : (data ?? [])
  return { query, setQuery, results, status, reset, retry }
}

export interface PlaceSearchBoxProps {
  search: PlaceSearch | null
  onSelect: (place: PlaceResult) => void
  placeholder?: string
  /** Type Thaana from a Latin keyboard (R13.3). */
  thaana?: ThaanaProp
  disabled?: boolean
  className?: string
  minChars?: number
  debounce?: number
  "aria-label"?: string
}

/** A combobox that searches places and reports the chosen one (WAI-ARIA combobox pattern). */
export function PlaceSearchBox({
  search,
  onSelect,
  placeholder,
  thaana,
  disabled,
  className,
  minChars,
  debounce,
  "aria-label": ariaLabel,
}: PlaceSearchBoxProps) {
  const { t } = useTranslation()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { fieldProps } = useThaanaField(inputRef, thaana)
  const { query, setQuery, results, status, reset, retry } = usePlaceSearchBox({ search, minChars, debounce })
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(-1)
  const listId = React.useId()
  const expanded = open && status !== "idle"

  const choose = (place: PlaceResult) => {
    onSelect(place)
    reset()
    setOpen(false)
    setActive(-1)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!results.length) return
      e.preventDefault()
      setOpen(true)
      const delta = e.key === "ArrowDown" ? 1 : -1
      setActive((i) => (i + delta + results.length) % results.length)
    } else if (e.key === "Enter") {
      const place = results[active] ?? (results.length === 1 ? results[0] : undefined)
      if (place && expanded) {
        e.preventDefault()
        choose(place)
      }
    } else if (e.key === "Escape") {
      if (expanded) {
        e.preventDefault()
        setOpen(false)
      } else if (query) {
        e.preventDefault()
        reset()
      }
    }
  }

  const statusText =
    status === "loading"
      ? t("common.loading")
      : status === "error"
        ? t("map.searchError")
        : status === "done"
          ? results.length
            ? t("map.searchResults", { count: results.length })
            : t("common.noResultsFor", { query })
          : ""

  return (
    <div data-slot="place-search" className={cn("relative", className)}>
      <InputGroup data-disabled={disabled || undefined}>
        <InputGroupAddon align="inline-start">
          <Icon name="search" />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          role="combobox"
          type="search"
          aria-label={ariaLabel ?? t("map.searchPlaces")}
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder={placeholder ?? t("map.searchPlaceholder")}
          value={query}
          disabled={disabled}
          {...fieldProps}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setOpen(false)}
          onFocus={() => setOpen(true)}
        />
        {status === "loading" ? (
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <div
        hidden={!expanded}
        data-slot="place-search-popup"
        className="inset-x-0 mt-1 max-h-64 p-1 shadow-md absolute top-full z-50 overflow-auto rounded-md border bg-popover text-popover-foreground"
      >
        <ul id={listId} role="listbox" aria-label={t("map.searchResultsLabel")}>
          {results.map((place, i) => (
            // Options are chosen with the input's arrow keys + Enter (combobox pattern).
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              key={place.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={cn(
                "px-2 py-1.5 text-sm touch:py-2.5 flex cursor-pointer flex-col rounded-sm",
                i === active ? "bg-accent text-accent-foreground" : "hover:bg-muted",
              )}
              // Keep focus in the input while clicking.
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(place)}
            >
              <span>{place.label}</span>
              {place.description ? <span className="text-xs text-muted-foreground">{place.description}</span> : null}
            </li>
          ))}
        </ul>
        {status !== "loading" && !results.length ? (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            {statusText}
            {status === "error" ? (
              <button
                type="button"
                className="ms-2 text-primary underline-offset-4 hover:underline"
                onPointerDown={(e) => e.preventDefault()}
                onClick={retry}
              >
                {t("common.retry")}
              </button>
            ) : null}
          </p>
        ) : null}
      </div>
      <div aria-live="polite" className="sr-only">
        {statusText}
      </div>
    </div>
  )
}
