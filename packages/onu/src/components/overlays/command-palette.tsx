"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { Icon } from "../../icons/icon"
import type { SemanticIconName } from "../../icons/types"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { useThaanaField, type ThaanaProp } from "../../thaana/use-thaana-field"
import { Button } from "../../ui/button"
import { Kbd } from "../../ui/kbd"
import { ThaanaToggle } from "../inputs/thaana-toggle"
import { ModalContent, ModalDescription, ModalRoot, ModalTitle, ModalTrigger } from "./modal"
import { useControllableState } from "./_use-controllable-state"

export interface CommandPaletteItem {
  /** Unique id. Used for recent items and as the cmdk value. */
  id: string
  label: React.ReactNode
  /** Text the search matches. Defaults to `label` when it is a string. */
  value?: string
  /** Extra search terms (synonyms, English and Dhivehi names). */
  keywords?: string[]
  icon?: SemanticIconName | (string & {})
  /** Secondary line, e.g. a record's ID or island. */
  description?: React.ReactNode
  /** Shortcut hint shown at the inline end. Display only. */
  shortcut?: string
  /** Navigate here when chosen (through `onNavigate`, or `location.assign`). */
  href?: string
  onSelect?: () => void
  disabled?: boolean
}

export interface CommandPaletteGroup {
  id?: string
  heading?: React.ReactNode
  items: CommandPaletteItem[]
}

export interface CommandPaletteSearchContext {
  /** Aborted when the query changes or the palette closes, so stale results never show (R16.5). */
  signal: AbortSignal
}

export interface CommandPaletteProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Optional element that opens the palette (rendered with `asChild`). */
  trigger?: React.ReactNode
  /** Static commands and pages. Filtered locally as the user types. */
  groups?: CommandPaletteGroup[]
  /**
   * Async search, e.g. against an API. Debounced; earlier requests are aborted.
   * Return items (shown under `searchHeading`) or groups.
   */
  search?: (
    query: string,
    context: CommandPaletteSearchContext,
  ) => Promise<CommandPaletteItem[] | CommandPaletteGroup[]>
  searchHeading?: React.ReactNode
  /** Debounce for `search` in ms. Default 250. */
  debounce?: number
  /** Minimum query length before `search` runs. Default 1. */
  minQueryLength?: number
  /** Remember chosen items and show them when the query is empty. Default `true`. */
  recent?: boolean | { storageKey?: string; max?: number }
  /** Key that opens the palette with ⌘ (macOS) or Ctrl. `false` disables it. Default `"k"`. */
  shortcut?: string | false
  /** Type Thaana in the search box (R13.3). */
  thaana?: ThaanaProp
  placeholder?: string
  /** Accessible title of the dialog. Default "Command palette". */
  title?: string
  /** Shown when nothing matches. Receives the query. */
  emptyMessage?: (query: string) => React.ReactNode
  /** Show the key hints footer (hidden on touch screens). Default `true`. */
  footer?: boolean
  /** Router hook for `href` items, e.g. `(href) => router.visit(href)`. */
  onNavigate?: (href: string) => void
  /** Called for every chosen item, before its own `onSelect`. */
  onItemSelect?: (item: CommandPaletteItem) => void
  /** Close after choosing an item. Default `true`. */
  closeOnSelect?: boolean
  className?: string
  classNames?: {
    input?: string
    list?: string
    group?: string
    item?: string
    empty?: string
    footer?: string
  }
}

const DEFAULT_RECENT_KEY = "onu-command-palette-recent"

/** Lower-cases and strips Latin diacritics so "Male" matches "Malé". */
export function normalizeSearch(text: string) {
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase().trim()
}

/** True when every word of `query` appears in the item's value, label or keywords. */
export function matchesCommandItem(item: CommandPaletteItem, query: string) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean)
  if (!words.length) return true
  const haystack = normalizeSearch(
    [item.value ?? (typeof item.label === "string" ? item.label : ""), ...(item.keywords ?? [])].join(" "),
  )
  return words.every((word) => haystack.includes(word))
}

function readRecent(key: string): string[] {
  try {
    const raw = typeof window === "undefined" ? null : window.localStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []
  } catch {
    return []
  }
}

function writeRecent(key: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    // Storage can be unavailable (private mode, blocked); recent items are a convenience.
  }
}

function isGroupList(value: CommandPaletteItem[] | CommandPaletteGroup[]): value is CommandPaletteGroup[] {
  return value.length > 0 && "items" in value[0]!
}

interface AsyncResult {
  query: string
  groups: CommandPaletteGroup[]
  error: boolean
}

const NO_RESULT: AsyncResult = { query: "\u0000", groups: [], error: false }

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? "")

/**
 * ⌘K / Ctrl+K command palette: search pages, records and commands from the
 * keyboard. Static groups filter instantly; an async `search` is debounced and
 * aborts stale requests. Remembers recent choices, supports Thaana input and
 * announces result counts to screen readers. Built on shadcn `Command` (cmdk).
 */
export function CommandPalette({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  trigger,
  groups = [],
  search,
  searchHeading,
  debounce = 250,
  minQueryLength = 1,
  recent = true,
  shortcut = "k",
  thaana,
  placeholder,
  title,
  emptyMessage,
  footer = true,
  onNavigate,
  onItemSelect,
  closeOnSelect = true,
  className,
  classNames,
}: CommandPaletteProps) {
  const { t } = useTranslation()
  const [open, setOpenState] = useControllableState(openProp, defaultOpen, onOpenChange)
  const [query, setQuery] = React.useState("")
  const [result, setResult] = React.useState<AsyncResult>(NO_RESULT)
  const [known, setKnown] = React.useState<Record<string, CommandPaletteItem>>({})
  const [attempt, setAttempt] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { fieldProps, active: thaanaActive, enabled: thaanaEnabled, toggle } = useThaanaField(inputRef, thaana)

  const recentKey = (typeof recent === "object" && recent.storageKey) || DEFAULT_RECENT_KEY
  const maxRecent = (typeof recent === "object" && recent.max) || 5
  const [recentIds, setRecentIds] = React.useState<string[]>(() => (recent ? readRecent(recentKey) : []))

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!next) setQuery("")
      setOpenState(next)
    },
    [setOpenState],
  )

  // ⌘K / Ctrl+K toggles the palette from anywhere on the page.
  React.useEffect(() => {
    if (!shortcut) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === shortcut.toLowerCase()) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [shortcut, open, setOpen])

  const trimmed = query.trim()
  const searching = !!search && open && trimmed.length >= minQueryLength

  // Debounced async search; a newer query (or closing) aborts the older request.
  React.useEffect(() => {
    if (!searching || !search) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      search(trimmed, { signal: controller.signal }).then(
        (value) => {
          if (controller.signal.aborted) return
          const list = value ?? []
          const resultGroups = isGroupList(list) ? list : [{ id: "search", heading: searchHeading, items: list }]
          setResult({ query: trimmed, groups: resultGroups, error: false })
          setKnown((prev) => {
            const next = { ...prev }
            for (const group of resultGroups) for (const item of group.items) next[item.id] = item
            return next
          })
        },
        () => {
          if (controller.signal.aborted) return
          setResult({ query: trimmed, groups: [], error: true })
        },
      )
    }, debounce)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searching, search, trimmed, debounce, searchHeading, attempt])

  const loading = searching && result.query !== trimmed
  const failed = searching && !loading && result.error

  const staticGroups = React.useMemo(
    () =>
      groups
        .map((group, index) => ({
          ...group,
          id: group.id ?? `group-${index}`,
          items: group.items.filter((item) => matchesCommandItem(item, trimmed)),
        }))
        .filter((group) => group.items.length > 0),
    [groups, trimmed],
  )

  const recentItems = React.useMemo(() => {
    if (!recent || trimmed) return []
    const lookup = new Map<string, CommandPaletteItem>()
    for (const group of groups) for (const item of group.items) lookup.set(item.id, item)
    return recentIds.map((id) => lookup.get(id) ?? known[id]).filter((item): item is CommandPaletteItem => !!item)
  }, [recent, trimmed, groups, recentIds, known])

  const asyncGroups = searching && !loading ? result.groups.filter((group) => group.items.length > 0) : []
  const visible: CommandPaletteGroup[] = [
    ...(recentItems.length ? [{ id: "recent", heading: t("overlay.recent"), items: recentItems }] : []),
    ...staticGroups,
    ...asyncGroups.map((group, index) => ({ ...group, id: group.id ?? `search-${index}` })),
  ]
  const count = visible.reduce((sum, group) => sum + group.items.length, 0)
  const empty = count === 0 && !loading && !failed && trimmed.length > 0

  const choose = (item: CommandPaletteItem) => {
    if (item.disabled) return
    if (recent) {
      const next = [item.id, ...recentIds.filter((id) => id !== item.id)].slice(0, maxRecent)
      setRecentIds(next)
      writeRecent(recentKey, next)
    }
    if (closeOnSelect) setOpen(false)
    onItemSelect?.(item)
    item.onSelect?.()
    if (item.href) {
      if (onNavigate) onNavigate(item.href)
      else window.location.assign(item.href)
    }
  }

  const status = loading
    ? t("overlay.searching")
    : failed
      ? t("overlay.searchFailed")
      : trimmed
        ? t("overlay.results", { count })
        : ""

  return (
    <ModalRoot open={open} onOpenChange={setOpen}>
      {trigger ? <ModalTrigger asChild>{trigger}</ModalTrigger> : null}
      <ModalContent
        size="md"
        mobile="fullscreen"
        data-slot="command-palette"
        className={cn("sm:top-[12vh] sm:translate-y-0 sm:data-open:slide-in-from-top-2", className)}
      >
        <ModalTitle className="sr-only">{title ?? t("overlay.commandPalette")}</ModalTitle>
        <ModalDescription className="sr-only">{t("overlay.commandPaletteDescription")}</ModalDescription>
        <CommandPrimitive
          shouldFilter={false}
          loop
          label={title ?? t("overlay.commandPalette")}
          className="min-h-0 flex flex-1 flex-col"
        >
          <div
            data-slot="command-palette-input"
            className="gap-2 px-3 sm:pt-0 flex shrink-0 items-center border-b pt-[max(0.25rem,env(safe-area-inset-top))]"
          >
            <Icon name="search" className="size-4 shrink-0 text-muted-foreground" />
            <CommandPrimitive.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder={placeholder ?? t("overlay.commandPlaceholder")}
              className={cn(
                "h-12 min-w-0 text-base sm:text-sm flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground",
                classNames?.input,
              )}
              {...fieldProps}
            />
            {loading ? <Icon name="loading" className="size-4 animate-spin shrink-0 text-muted-foreground" /> : null}
            {thaanaActive ? <ThaanaToggle enabled={thaanaEnabled} onToggle={toggle} /> : null}
            <Button
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              onClick={() => setOpen(false)}
              data-slot="command-palette-close"
            >
              <Icon name="close" />
              <span className="sr-only">{t("overlay.close")}</span>
            </Button>
          </div>
          <CommandPrimitive.List
            data-slot="command-palette-list"
            className={cn(
              "p-1 min-h-0 scroll-py-1 sm:max-h-[min(24rem,60dvh)] sm:flex-none flex-1 overflow-y-auto overscroll-contain",
              classNames?.list,
            )}
          >
            {visible.map((group) => (
              <CommandPrimitive.Group
                key={group.id}
                heading={group.heading}
                data-slot="command-palette-group"
                className={cn(
                  "p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium text-foreground **:[[cmdk-group-heading]]:text-muted-foreground",
                  classNames?.group,
                )}
              >
                {group.items.map((item) => (
                  <CommandPrimitive.Item
                    key={`${group.id}:${item.id}`}
                    value={`${group.id}:${item.id}`}
                    disabled={item.disabled}
                    onSelect={() => choose(item)}
                    data-slot="command-palette-item"
                    className={cn(
                      "gap-2 px-2 py-2 text-sm touch:min-h-11 [&_svg:not([class*='size-'])]:size-4 relative flex cursor-default items-center rounded-md outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:shrink-0",
                      classNames?.item,
                    )}
                  >
                    {item.icon ? <Icon name={item.icon} className="text-muted-foreground" /> : null}
                    <span className="min-w-0 flex flex-1 flex-col">
                      <span className="truncate">{item.label}</span>
                      {item.description ? (
                        <span className="text-xs truncate text-muted-foreground">{item.description}</span>
                      ) : null}
                    </span>
                    {item.shortcut ? (
                      <span dir="ltr" className="text-xs tracking-widest text-muted-foreground">
                        {item.shortcut}
                      </span>
                    ) : null}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            ))}
            {failed ? (
              <div data-slot="command-palette-error" className="gap-3 py-6 text-sm flex flex-col items-center">
                <p className="text-destructive">{t("overlay.searchFailed")}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setResult(NO_RESULT)
                    setAttempt((n) => n + 1)
                  }}
                >
                  <Icon name="refresh" />
                  {t("common.retry")}
                </Button>
              </div>
            ) : null}
            {loading && count === 0 ? (
              <div className="py-6 text-sm text-center text-muted-foreground" data-slot="command-palette-loading">
                {t("overlay.searching")}
              </div>
            ) : null}
            {empty ? (
              <div
                className={cn("py-6 px-4 text-sm text-center text-muted-foreground", classNames?.empty)}
                data-slot="command-palette-empty"
              >
                {emptyMessage ? emptyMessage(trimmed) : t("common.noResultsFor", { query: trimmed })}
              </div>
            ) : null}
          </CommandPrimitive.List>
          {footer ? (
            <div
              data-slot="command-palette-footer"
              className={cn(
                "gap-4 px-3 py-2 text-xs sm:flex hidden shrink-0 items-center border-t text-muted-foreground touch:hidden",
                classNames?.footer,
              )}
            >
              <span className="gap-1 inline-flex items-center">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                {t("overlay.hintNavigate")}
              </span>
              <span className="gap-1 inline-flex items-center">
                <Kbd>↵</Kbd>
                {t("overlay.hintSelect")}
              </span>
              <span className="gap-1 inline-flex items-center">
                <Kbd>Esc</Kbd>
                {t("overlay.hintClose")}
              </span>
              {shortcut ? (
                <span className="ms-auto">
                  <span className="gap-1 inline-flex items-center" dir="ltr">
                    <Kbd>{isMac() ? "⌘" : "Ctrl"}</Kbd>
                    <Kbd>{shortcut.toUpperCase()}</Kbd>
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}
        </CommandPrimitive>
        <span className="sr-only" aria-live="polite" data-slot="command-palette-status">
          {status}
        </span>
      </ModalContent>
    </ModalRoot>
  )
}
