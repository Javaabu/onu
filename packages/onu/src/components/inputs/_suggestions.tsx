"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Popover, PopoverAnchor, PopoverContent } from "../../ui/popover"
import { LiveMessage } from "./_shared"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { input as en_input } from "../../locales/en/input"

registerEnglish({ common: en_common, input: en_input })

/** A suggestion: a plain string, or a value with a label and description. */
export type SuggestionOption =
  string | { value: string; label?: React.ReactNode; description?: React.ReactNode; disabled?: boolean }

/** A static list, or an async function called with the query and an `AbortSignal`. */
export type SuggestionSource =
  | readonly SuggestionOption[]
  | ((query: string, context: { signal: AbortSignal }) => Promise<readonly SuggestionOption[]>)

export interface NormalizedOption {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

export function normalizeOption(option: SuggestionOption): NormalizedOption {
  return typeof option === "string" ? { value: option, label: option } : { label: option.value, ...option }
}

/** Case-insensitive "contains" match that works for Thaana and Latin. */
export function matchesQuery(option: NormalizedOption, query: string) {
  const q = query.trim().toLocaleLowerCase()
  if (!q) return true
  const label = typeof option.label === "string" ? option.label : ""
  return option.value.toLocaleLowerCase().includes(q) || label.toLocaleLowerCase().includes(q)
}

interface UseSuggestionsOptions {
  source?: SuggestionSource
  query: string
  /** Only fetch while the list is open. */
  enabled: boolean
  debounce?: number
  minChars?: number
  max?: number
  exclude?: readonly string[]
}

/** Filters a static list, or debounces and cancels requests to an async source. */
export function useSuggestions({
  source,
  query,
  enabled,
  debounce = 300,
  minChars = 0,
  max = 50,
  exclude,
}: UseSuggestionsOptions) {
  const isAsync = typeof source === "function"
  const [remote, setRemote] = React.useState<{ query: string; items: NormalizedOption[] } | null>(null)
  const [status, setStatus] = React.useState<"idle" | "loading" | "error">("idle")
  const [attempt, setAttempt] = React.useState(0)
  const tooShort = query.trim().length < minChars

  React.useEffect(() => {
    if (!isAsync || !enabled || tooShort) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      setStatus("loading")
      source(query, { signal: controller.signal }).then(
        (items) => {
          if (controller.signal.aborted) return
          setRemote({ query, items: items.map(normalizeOption) })
          setStatus("idle")
        },
        () => {
          if (!controller.signal.aborted) setStatus("error")
        },
      )
    }, debounce)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [isAsync, source, query, enabled, tooShort, debounce, attempt])

  const items = React.useMemo(() => {
    if (tooShort || !source) return []
    const all = isAsync ? (remote?.items ?? []) : (source as readonly SuggestionOption[]).map(normalizeOption)
    const filtered = isAsync ? all : all.filter((o) => matchesQuery(o, query))
    return filtered.filter((o) => !exclude?.includes(o.value)).slice(0, max)
  }, [tooShort, source, isAsync, remote, query, exclude, max])

  return {
    items,
    loading: isAsync && !tooShort && status === "loading",
    error: isAsync && !tooShort && status === "error",
    retry: () => setAttempt((n) => n + 1),
  }
}

/**
 * Keyboard and state for an APG combobox with a listbox popup
 * (`aria-activedescendant` keeps focus in the input).
 */
export function useComboboxState(itemCount: number) {
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(-1)
  const listId = React.useId()
  const optionId = (i: number) => `${listId}-option-${i}`
  const current = active >= itemCount ? -1 : active

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, onPick: (index: number) => void): boolean => {
    if (e.nativeEvent.isComposing) return false
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setActive(e.altKey ? -1 : 0)
        } else setActive(itemCount ? (current + 1) % itemCount : -1)
        return true
      case "ArrowUp":
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setActive(itemCount - 1)
        } else setActive(itemCount ? (current <= 0 ? itemCount - 1 : current - 1) : -1)
        return true
      case "Enter":
        if (open && current >= 0) {
          e.preventDefault()
          onPick(current)
          return true
        }
        return false
      case "Escape":
        if (open) {
          e.preventDefault()
          setOpen(false)
          setActive(-1)
          return true
        }
        return false
      case "Tab":
        setOpen(false)
        return false
      default:
        return false
    }
  }

  return {
    open,
    setOpen: (next: boolean) => {
      setOpen(next)
      if (!next) setActive(-1)
    },
    active: current,
    setActive,
    listId,
    optionId,
    onKeyDown,
    /** Combobox attributes; `listShown` is whether the listbox is actually rendered. */
    inputProps: (listShown: boolean) => ({
      role: "combobox" as const,
      "aria-autocomplete": "list" as const,
      "aria-expanded": listShown,
      "aria-controls": listShown ? listId : undefined,
      "aria-activedescendant": listShown && current >= 0 ? optionId(current) : undefined,
    }),
  }
}

/** Whether the suggestion popup has anything to show. */
export function suggestionsShown(count: number, loading?: boolean, error?: boolean, empty?: React.ReactNode) {
  return count > 0 || !!loading || !!error || !!empty
}

export interface SuggestionListProps {
  anchor: React.ReactNode
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  onOpenChange: (open: boolean) => void
  items: NormalizedOption[]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
  active: number
  onActiveChange: (index: number) => void
  onPick: (index: number) => void
  listId: string
  optionId: (index: number) => string
  /** Content rendered when there are no items (and not loading). Nothing by default. */
  empty?: React.ReactNode
  renderOption?: (option: NormalizedOption, state: { active: boolean }) => React.ReactNode
  dir?: "ltr" | "rtl" | "auto"
  lang?: string
  classNames?: { list?: string; option?: string }
}

/** Popover listbox anchored to an input. Focus stays in the input. */
export function SuggestionList({
  anchor,
  anchorRef,
  open,
  onOpenChange,
  items,
  loading,
  error,
  onRetry,
  active,
  onActiveChange,
  onPick,
  listId,
  optionId,
  empty,
  renderOption,
  dir,
  lang,
  classNames,
}: SuggestionListProps) {
  const { t } = useTranslation()
  const visible = open && suggestionsShown(items.length, loading, error, empty)

  React.useEffect(() => {
    if (active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" })
  }, [active, optionId])

  let status: string | null = null
  if (open) {
    if (loading) status = t("input.loadingSuggestions")
    else if (error) status = t("input.suggestionsError")
    else status = t("input.suggestionsCount", { count: items.length })
  }

  return (
    <Popover open={visible} onOpenChange={onOpenChange}>
      <PopoverAnchor asChild>{anchor}</PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (anchorRef.current?.contains(e.target as Node)) e.preventDefault()
        }}
        aria-label={t("input.suggestions")}
        className={cn("min-w-48 gap-0 p-1 w-(--radix-popover-trigger-width)", classNames?.list)}
      >
        <div
          id={listId}
          role="listbox"
          aria-label={t("input.suggestions")}
          aria-busy={loading || undefined}
          dir={dir}
          lang={lang}
          className="max-h-72 overflow-y-auto overscroll-contain"
        >
          {items.map((option, i) => (
            <div
              key={option.value}
              id={optionId(i)}
              role="option"
              tabIndex={-1}
              aria-selected={i === active}
              aria-disabled={option.disabled || undefined}
              data-active={i === active || undefined}
              data-slot="suggestion"
              onPointerDown={(e) => e.preventDefault()}
              onPointerMove={() => i !== active && onActiveChange(i)}
              onClick={() => !option.disabled && onPick(i)}
              onKeyDown={() => {}}
              className={cn(
                "gap-0.5 px-2 py-1.5 text-sm touch:min-h-11 flex cursor-default flex-col rounded-md outline-none select-none touch:justify-center",
                "aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-accent data-active:text-accent-foreground",
                classNames?.option,
              )}
            >
              {renderOption ? (
                renderOption(option, { active: i === active })
              ) : (
                <>
                  <span>{option.label}</span>
                  {option.description ? (
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>
        {loading ? (
          <div className="gap-2 px-2 py-1.5 text-sm flex items-center text-muted-foreground">
            <Icon name="loading" className="size-4 animate-spin" />
            {t("input.loadingSuggestions")}
          </div>
        ) : error ? (
          <div className="gap-2 px-2 py-1.5 text-sm flex items-center justify-between text-destructive">
            {t("input.suggestionsError")}
            {onRetry ? (
              <button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={onRetry}
                className="text-xs font-medium px-2 py-1 rounded-md text-foreground underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                {t("common.retry")}
              </button>
            ) : null}
          </div>
        ) : items.length === 0 && empty ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">{empty}</div>
        ) : null}
      </PopoverContent>
      <LiveMessage>{status}</LiveMessage>
    </Popover>
  )
}
