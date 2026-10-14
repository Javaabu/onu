"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { Button } from "../../ui/button"
import { Skeleton } from "../../ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { TextInput } from "../inputs/text-input"
import { useControllable } from "./_use-controllable"
import { FileIcon } from "./file-icon"
import { getFileKind } from "./file-utils"
import { useFormatFileSize } from "./use-files"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { file as en_file } from "../../locales/en/file"

registerEnglish({ common: en_common, file: en_file })

export type MediaId = string | number

export interface MediaItem {
  id: MediaId
  name: string
  url?: string
  thumbnailUrl?: string
  /** Alt text for the thumbnail. The name is shown as text, so it may be left empty. */
  alt?: string
  /** MIME type. */
  type?: string
  size?: number
}

export type MediaView = "grid" | "list"

export interface MediaListerProps extends Omit<React.ComponentProps<"div">, "onSelect"> {
  items: MediaItem[]
  /** `grid` or `list` (controlled). */
  view?: MediaView
  defaultView?: MediaView
  onViewChange?: (view: MediaView) => void
  /** Search text (controlled). */
  search?: string
  defaultSearch?: string
  /** Called as the user types. Pass it to search on the server; omit it to filter `items` by name locally. */
  onSearchChange?: (search: string) => void
  /** Hide the search box. */
  hideSearch?: boolean
  /** Thaana typing in the search box. */
  searchThaana?: ThaanaProp
  /** `none` (items open on click), `single` or `multiple`. Default `none`. */
  selectionMode?: "none" | "single" | "multiple"
  selected?: MediaId[]
  defaultSelected?: MediaId[]
  onSelectedChange?: (ids: MediaId[]) => void
  /** Called when an item is activated in `none` mode. */
  onItemOpen?: (item: MediaItem) => void
  /** Extra buttons per item (shown beside it, never only on hover). */
  renderActions?: (item: MediaItem) => React.ReactNode
  loading?: boolean
  /** More items can be loaded (infinite loading). */
  hasMore?: boolean
  /** Load the next batch. Called when the end of the list scrolls into view, and by the "Load more" button. */
  onLoadMore?: () => void
  /** Load more automatically on scroll. Default `true`; `false` shows only the button. */
  infinite?: boolean
  /** Paged loading: current page (1-based). */
  page?: number
  pageCount?: number
  onPageChange?: (page: number) => void
  /** Text when there are no items. */
  emptyMessage?: React.ReactNode
  /** Extra toolbar content (e.g. an upload button). */
  toolbar?: React.ReactNode
  /** Accessible name for the list. */
  label?: string
  classNames?: { toolbar?: string; list?: string; item?: string; thumbnail?: string; name?: string; footer?: string }
}

/**
 * A media library: grid or list view, search, single or multiple selection with
 * announcements, type icons, lazy thumbnails, and infinite or paged loading driven by props.
 */
export function MediaLister({
  items,
  view: viewProp,
  defaultView = "grid",
  onViewChange,
  search: searchProp,
  defaultSearch = "",
  onSearchChange,
  hideSearch = false,
  searchThaana,
  selectionMode = "none",
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  onItemOpen,
  renderActions,
  loading = false,
  hasMore = false,
  onLoadMore,
  infinite = true,
  page,
  pageCount,
  onPageChange,
  emptyMessage,
  toolbar,
  label,
  className,
  classNames,
  ...props
}: MediaListerProps) {
  const { t, locale } = useTranslation()
  const format = useFormatFileSize()
  const [view, setView] = useControllable<MediaView>(viewProp, defaultView, onViewChange)
  const [search, setSearch] = useControllable<string>(searchProp, defaultSearch, onSearchChange)
  const [selected, setSelected] = useControllable<MediaId[]>(selectedProp, defaultSelected ?? [], onSelectedChange)
  const sentinel = React.useRef<HTMLDivElement>(null)
  const listId = React.useId()

  const visible = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase(locale.code)
    if (onSearchChange || !query) return items
    return items.filter((item) => item.name.toLocaleLowerCase(locale.code).includes(query))
  }, [items, search, onSearchChange, locale.code])

  const loadMore = React.useEffectEvent(() => onLoadMore?.())
  React.useEffect(() => {
    const node = sentinel.current
    if (!node || !infinite || !hasMore || loading || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) loadMore()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [infinite, hasMore, loading])

  const toggle = (item: MediaItem) => {
    if (selectionMode === "none") return onItemOpen?.(item)
    const isSelected = selected.includes(item.id)
    if (selectionMode === "single") setSelected(isSelected ? [] : [item.id])
    else setSelected(isSelected ? selected.filter((id) => id !== item.id) : [...selected, item.id])
  }

  const grid = view === "grid"
  const allSelected = visible.length > 0 && visible.every((i) => selected.includes(i.id))

  return (
    <div data-slot="media-lister" className={cn("gap-3 @container/media grid w-full", className)} {...props}>
      <div className={cn("gap-2 flex flex-wrap items-center", classNames?.toolbar)}>
        {!hideSearch ? (
          <TextInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            thaana={searchThaana}
            placeholder={t("file.searchMedia")}
            aria-label={t("file.searchMedia")}
            aria-controls={listId}
            startAddon={<Icon name="search" />}
            className="min-w-48 flex-1"
          />
        ) : null}
        {selectionMode === "multiple" && visible.length ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setSelected(
                allSelected
                  ? selected.filter((id) => !visible.some((i) => i.id === id))
                  : [...new Set([...selected, ...visible.map((i) => i.id)])],
              )
            }
          >
            {allSelected ? t("file.clearSelection") : t("common.selectAll")}
          </Button>
        ) : null}
        {toolbar}
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={view}
          onValueChange={(v) => v && setView(v as MediaView)}
          aria-label={t("file.view")}
        >
          <ToggleGroupItem value="grid" aria-label={t("file.gridView")}>
            <Icon name="grid" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label={t("file.listView")}>
            <Icon name="list" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {selectionMode !== "none" ? t("file.selectedCount", { count: selected.length }) : null}
        {loading ? ` ${t("common.loading")}` : null}
      </div>

      {visible.length === 0 && !loading ? (
        <div className="gap-2 p-8 text-sm flex flex-col items-center rounded-xl border border-dashed border-border text-center text-muted-foreground">
          <Icon name="image" size="xl" />
          {emptyMessage ?? (search ? t("common.noResultsFor", { query: search }) : t("file.noMedia"))}
        </div>
      ) : (
        <ul
          id={listId}
          aria-label={label ?? t("file.mediaLibrary")}
          aria-busy={loading || undefined}
          data-view={view}
          className={cn(
            grid
              ? "gap-3 @sm/media:grid-cols-3 @lg/media:grid-cols-4 @3xl/media:grid-cols-6 grid grid-cols-2"
              : "gap-2 grid",
            classNames?.list,
          )}
        >
          {visible.map((item) => {
            const isSelected = selected.includes(item.id)
            const kind = getFileKind({ type: item.type, name: item.url ?? item.name })
            const thumb = item.thumbnailUrl ?? (kind === "image" ? item.url : undefined)
            const actions = renderActions?.(item)
            return (
              <li
                key={item.id}
                data-selected={isSelected || undefined}
                className={cn("group/media relative", classNames?.item)}
              >
                <button
                  type="button"
                  aria-pressed={selectionMode === "none" ? undefined : isSelected}
                  onClick={() => toggle(item)}
                  className={cn(
                    "w-full rounded-lg border border-border bg-card text-start outline-none group-data-[selected]/media:border-primary group-data-[selected]/media:ring-2 group-data-[selected]/media:ring-primary/40 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50",
                    grid ? "gap-2 p-2 flex flex-col" : "gap-3 p-2 touch:min-h-11 flex items-center",
                    actions && !grid && "pe-24",
                  )}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.alt ?? ""}
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        "rounded-md bg-muted object-cover",
                        grid ? "aspect-square w-full" : "size-10 shrink-0",
                        classNames?.thumbnail,
                      )}
                    />
                  ) : grid ? (
                    <span className="flex aspect-square w-full items-center justify-center rounded-md bg-muted/50">
                      <FileIcon kind={kind} size="lg" />
                    </span>
                  ) : (
                    <FileIcon kind={kind} />
                  )}
                  <span className="min-w-0 gap-0.5 flex flex-1 flex-col">
                    {/* Own direction, so a Latin name truncates at its own end on an RTL page; self-start keeps it at the start. */}
                    <span
                      dir="auto"
                      title={item.name}
                      className={cn("text-sm font-medium max-w-full self-start truncate", classNames?.name)}
                    >
                      <bdi>{item.name}</bdi>
                    </span>
                    {typeof item.size === "number" ? (
                      <span dir="ltr" className="text-xs self-start text-muted-foreground tabular-nums">
                        {format(item.size)}
                      </span>
                    ) : null}
                  </span>
                </button>
                {selectionMode !== "none" ? (
                  <span
                    aria-hidden
                    className={cn(
                      "top-3 start-3 size-5 pointer-events-none absolute flex items-center justify-center rounded-full border border-border bg-background/90 text-primary-foreground group-data-[selected]/media:border-primary group-data-[selected]/media:bg-primary",
                      !grid && "top-1 start-1 size-4",
                    )}
                  >
                    {isSelected ? <Icon name="check" size="xs" /> : null}
                  </span>
                ) : null}
                {actions ? (
                  <div
                    className={cn(
                      "gap-0.5 absolute flex",
                      grid ? "top-3 end-3 rounded-md bg-background/90" : "end-2 top-1/2 -translate-y-1/2",
                    )}
                  >
                    {actions}
                  </div>
                ) : null}
              </li>
            )
          })}
          {loading
            ? Array.from({ length: grid ? 4 : 2 }, (_, i) => (
                <li key={`skeleton-${i}`} aria-hidden>
                  <Skeleton className={grid ? "aspect-square w-full rounded-lg" : "h-14 w-full rounded-lg"} />
                </li>
              ))
            : null}
        </ul>
      )}

      {hasMore || (pageCount !== undefined && pageCount > 1) ? (
        <div className={cn("gap-2 flex items-center justify-center", classNames?.footer)}>
          {hasMore ? (
            <>
              <div ref={sentinel} aria-hidden className="h-px w-px" />
              <Button type="button" variant="outline" size="sm" disabled={loading} onClick={() => onLoadMore?.()}>
                {loading ? <Icon name="loading" data-icon="inline-start" className="animate-spin" /> : null}
                {t("file.loadMore")}
              </Button>
            </>
          ) : (
            <nav aria-label={t("common.pagination")} className="gap-2 flex items-center">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={t("common.goToPreviousPage")}
                disabled={!page || page <= 1 || loading}
                onClick={() => onPageChange?.((page ?? 1) - 1)}
              >
                <Icon name="chevron-left" />
              </Button>
              <span className="text-sm tabular-nums">
                {t("file.pageOf", { page: page ?? 1, total: pageCount ?? 1 })}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={t("common.goToNextPage")}
                disabled={(page ?? 1) >= (pageCount ?? 1) || loading}
                onClick={() => onPageChange?.((page ?? 1) + 1)}
              >
                <Icon name="chevron-right" />
              </Button>
            </nav>
          )}
        </div>
      ) : null}
    </div>
  )
}
