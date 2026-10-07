"use client"

import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { iconNames } from "lucide-react/dynamic"

import { DynamicIcon, parseIconId } from "../../icons/dynamic-icon"
import { Icon } from "../../icons/icon"
import { useIconContext, type IconSource } from "../../icons/icon-context"
import { cn } from "../../lib/utils"
import { useOnu, useTranslation } from "../../providers/onu-provider"
import { NativeSelect, NativeSelectOption } from "../../ui/native-select"
import { useFormFieldControl } from "../form/form-field"
import { PickerSurface } from "./_picker-surface"
import { useControllableState } from "./_shared"

const RECENT_KEY = "onu-icon-picker-recent"
const CELL = 44

function readRecent(): string[] {
  try {
    const raw = typeof window === "undefined" ? null : window.localStorage.getItem(RECENT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []
  } catch {
    return []
  }
}

function writeRecent(ids: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(ids))
  } catch {
    // storage blocked: recent icons are a convenience only
  }
}

/** Ids of every Lucide icon, e.g. `lucide:house`. */
export function lucideIconIds(): string[] {
  return iconNames.map((name) => `lucide:${name}`)
}

/** Case-insensitive search on the icon name; spaces match dashes (`arrow left` → `arrow-left`). */
export function filterIconIds(ids: readonly string[], query: string): string[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, "-")
  if (!q) return [...ids]
  return ids.filter((id) => id.toLowerCase().includes(q))
}

export interface IconPickerProps extends Omit<
  React.ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "type"
> {
  /** Controlled value: a portable icon id such as `lucide:house` or `tabler:home`. */
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (id: string | null) => void
  /** Restrict to these sources by prefix label, e.g. `["lucide"]`. Default: Lucide plus every `iconSources` entry. */
  sets?: string[]
  /** Show a "Remove icon" button. Default `true`. */
  clearable?: boolean
  /** How many recently used icons to remember (per browser). `0` turns it off. Default `12`. */
  recentLimit?: number
  placeholder?: string
  /** Form field name; the id is submitted through a hidden input. */
  name?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  classNames?: { trigger?: string; panel?: string; search?: string; grid?: string; cell?: string }
}

interface SetInfo {
  key: string
  label: string
  load: () => Promise<string[]> | string[]
}

function useIconSets(sets: string[] | undefined): SetInfo[] {
  const { sources } = useIconContext()
  return React.useMemo(() => {
    const all: SetInfo[] = [{ key: "lucide", label: "Lucide", load: lucideIconIds }]
    for (const source of sources ?? []) {
      const s: IconSource = source
      if (!s.list) continue
      all.push({ key: s.prefixes.join(","), label: s.label, load: s.list })
    }
    return sets ? all.filter((s) => sets.some((k) => s.key.split(",").includes(k))) : all
  }, [sources, sets])
}

/**
 * Icon picker: searchable, virtualised grid over Lucide and any icon sources
 * registered on `OnuProvider` (Iconify, FontAwesome). The value is a portable
 * id (`lucide:house`) that `DynamicIcon` renders. Opens as a bottom sheet on phones.
 */
export function IconPicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  sets: setsProp,
  clearable = true,
  recentLimit = 12,
  placeholder,
  name: nameProp,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  classNames,
  ...props
}: IconPickerProps) {
  const { t } = useTranslation()
  const { dir } = useOnu()
  const [value, setValue] = useControllableState<string | null>(valueProp, defaultValue, onValueChange)
  const [open, setOpenState] = useControllableState(openProp, defaultOpen, onOpenChange)
  const { name, ...control } = useFormFieldControl({ ...props, name: nameProp })
  const sets = useIconSets(setsProp)
  const [setKey, setSetKey] = React.useState("all")
  const [loaded, setLoaded] = React.useState<Record<string, string[]>>({})
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const [recent, setRecent] = React.useState<string[]>(() => (recentLimit ? readRecent() : []))
  const [columns, setColumns] = React.useState(8)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()
  const searchRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    for (const set of sets) {
      if (loaded[set.key]) continue
      Promise.resolve(set.load()).then(
        (ids) => !cancelled && setLoaded((prev) => ({ ...prev, [set.key]: ids })),
        () => !cancelled && setLoaded((prev) => ({ ...prev, [set.key]: [] })),
      )
    }
    return () => {
      cancelled = true
    }
  }, [open, sets, loaded])

  const ids = React.useMemo(() => {
    const pool = sets.filter((s) => setKey === "all" || s.key === setKey).flatMap((s) => loaded[s.key] ?? [])
    return filterIconIds(pool, query)
  }, [sets, setKey, loaded, query])

  const rows = Math.ceil(ids.length / columns)
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual returns functions by design
  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CELL,
    overscan: 4,
    initialRect: { width: columns * CELL, height: CELL * 6 },
  })

  const setScrollEl = React.useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el
    if (!el || typeof ResizeObserver === "undefined") return
    const update = () => {
      const width = el.clientWidth
      if (width > 0) setColumns(Math.max(4, Math.floor(width / CELL)))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const setOpen = (next: boolean) => {
    setOpenState(next)
    if (!next) {
      setQuery("")
      setActive(0)
    }
  }

  const choose = (id: string | null) => {
    setValue(id)
    if (id && recentLimit) {
      const next = [id, ...recent.filter((r) => r !== id)].slice(0, recentLimit)
      setRecent(next)
      writeRecent(next)
    }
    setOpen(false)
  }

  const move = (to: number) => {
    if (!ids.length) return
    const next = Math.max(0, Math.min(ids.length - 1, to))
    setActive(next)
    virtualizer.scrollToIndex(Math.floor(next / columns), { align: "auto" })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const forward = dir === "rtl" ? -1 : 1
    const current = Math.min(active, Math.max(0, ids.length - 1))
    switch (e.key) {
      case "ArrowRight":
        move(current + forward)
        break
      case "ArrowLeft":
        move(current - forward)
        break
      case "ArrowDown":
        move(current + columns)
        break
      case "ArrowUp":
        move(current - columns)
        break
      case "PageDown":
        move(current + columns * 5)
        break
      case "PageUp":
        move(current - columns * 5)
        break
      case "Enter":
        if (ids[current]) choose(ids[current])
        break
      default:
        return
    }
    e.preventDefault()
  }

  const activeIndex = Math.min(active, ids.length - 1)
  const optionId = (i: number) => `${listId}-${i}`
  const valueName = value ? parseIconId(value).name : null
  const recentShown = !query && recent.length > 0

  return (
    <>
      <PickerSurface
        open={open}
        onOpenChange={setOpen}
        title={t("input.pickIcon")}
        className={cn("w-80 touch:w-full", classNames?.panel)}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          searchRef.current?.focus()
        }}
        trigger={
          <button
            type="button"
            data-slot="icon-picker"
            data-empty={!value || undefined}
            {...control}
            aria-haspopup="dialog"
            className={cn(
              "h-8 gap-2 ps-2 pe-2.5 text-sm min-w-36 inline-flex items-center rounded-lg border border-input bg-transparent transition-colors outline-none dark:bg-input/30",
              "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
              "touch:h-11",
              classNames?.trigger,
              className,
            )}
          >
            {value ? (
              <DynamicIcon id={value} className="size-4" />
            ) : (
              <span aria-hidden="true" className="size-4 rounded-sm border border-dashed border-muted-foreground/50" />
            )}
            <span dir="ltr" className={cn("flex-1 truncate text-start", !value && "text-muted-foreground")}>
              {valueName ?? placeholder ?? t("input.noIcon")}
            </span>
            <Icon name="chevron-down" className="size-4 text-muted-foreground" />
          </button>
        }
      >
        <div className="gap-2 flex">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="size-4 start-2.5 pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={searchRef}
              type="search"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={ids.length ? optionId(activeIndex) : undefined}
              aria-label={t("input.searchIcons")}
              placeholder={t("input.searchIcons")}
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
                virtualizer.scrollToOffset(0)
              }}
              onKeyDown={onKeyDown}
              className={cn(
                "h-8 ps-8 pe-2 text-sm touch:h-11 w-full rounded-lg border border-input bg-transparent outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
                classNames?.search,
              )}
            />
          </div>
          {sets.length > 1 ? (
            <NativeSelect
              aria-label={t("input.iconSet")}
              value={setKey}
              onChange={(e) => {
                setSetKey(e.target.value)
                setActive(0)
              }}
              className="max-w-32"
            >
              <NativeSelectOption value="all">{t("input.allIconSets")}</NativeSelectOption>
              {sets.map((s) => (
                <NativeSelectOption key={s.key} value={s.key}>
                  {s.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          ) : null}
        </div>

        {recentShown ? (
          <div className="gap-1 grid">
            <p className="text-xs font-medium text-muted-foreground">{t("input.recentIcons")}</p>
            <div className="gap-1 flex flex-wrap">
              {recent.map((id) => (
                <button
                  key={id}
                  type="button"
                  data-slot="icon-picker-recent"
                  aria-label={parseIconId(id).name}
                  title={parseIconId(id).name}
                  onClick={() => choose(id)}
                  className="size-9 touch:size-11 inline-flex items-center justify-center rounded-md hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <DynamicIcon id={id} className="size-5" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div
          ref={setScrollEl}
          className={cn("h-64 touch:h-72 overflow-y-auto overscroll-contain", classNames?.grid)}
          data-slot="icon-picker-grid"
        >
          <div
            id={listId}
            role="listbox"
            aria-label={t("input.pickIcon")}
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((row) => (
              <div
                key={row.key}
                role="presentation"
                className="start-0 top-0 absolute grid w-full"
                style={{
                  height: row.size,
                  transform: `translateY(${row.start}px)`,
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {ids.slice(row.index * columns, row.index * columns + columns).map((id, k) => {
                  const index = row.index * columns + k
                  const isActive = index === activeIndex
                  const label = parseIconId(id).name
                  return (
                    <div
                      key={id}
                      id={optionId(index)}
                      role="option"
                      tabIndex={-1}
                      aria-selected={id === value}
                      aria-label={label}
                      title={label}
                      data-active={isActive || undefined}
                      data-icon-id={id}
                      onPointerDown={(e) => e.preventDefault()}
                      onClick={() => choose(id)}
                      onKeyDown={() => {}}
                      className={cn(
                        "m-0.5 flex items-center justify-center rounded-md text-foreground hover:bg-muted",
                        "data-active:bg-accent data-active:text-accent-foreground data-active:ring-2 data-active:ring-ring/50",
                        "aria-selected:bg-primary aria-selected:text-primary-foreground",
                        classNames?.cell,
                      )}
                    >
                      <DynamicIcon id={id} className="size-5" />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="gap-2 text-xs flex items-center justify-between text-muted-foreground">
          <span aria-live="polite">{t("input.iconsCount", { count: ids.length })}</span>
          {clearable && value ? (
            <button
              type="button"
              onClick={() => choose(null)}
              className="font-medium px-2 py-1 touch:min-h-11 rounded-md text-foreground hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {t("input.clearIcon")}
            </button>
          ) : null}
        </div>
        {ids.length === 0 && Object.keys(loaded).length ? (
          <p className="text-sm text-center text-muted-foreground">{t("input.noIcons")}</p>
        ) : null}
      </PickerSurface>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
    </>
  )
}
