"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { Skeleton } from "../../ui/skeleton"
import { useCollectionItem, type CollectionProps } from "./_collection"

export interface ListViewProps<T> extends CollectionProps<T> {
  /**
   * `list` (default): rows with media at the start. `grid`: a responsive grid
   * of cards with media on top. The values match `ViewSwitcher`'s views.
   */
  layout?: "list" | "grid"
  /** List layout: lines between items (default) or separate cards. */
  variant?: "divided" | "cards"
  /** Grid layout: smallest card width before the grid drops a column. Default `16rem`. */
  minItemWidth?: string
  className?: string
  classNames?: { item?: string; media?: string; body?: string; meta?: string }
}

/**
 * Records as a vertical list (media, title, description and details) or, with
 * `layout="grid"`, a grid of cards whose columns follow the space available
 * (not the viewport). Optional checkboxes and a ⋯ menu per item; clicking an
 * item opens it.
 */
export function ListView<T>(props: ListViewProps<T>) {
  const {
    items,
    loading,
    empty,
    layout = "list",
    variant = "divided",
    minItemWidth = "16rem",
    className,
    classNames,
  } = props
  const { parts } = useCollectionItem(props)
  const grid = layout === "grid"

  if (!loading && items.length === 0 && empty) return <>{empty}</>

  const metaRow = (item: T) =>
    props.meta ? (
      <div
        className={cn("gap-x-3 gap-y-1 text-xs flex flex-wrap items-center text-muted-foreground", classNames?.meta)}
      >
        {props.meta(item)}
      </div>
    ) : null
  const descriptionRow = (item: T) =>
    props.description ? (
      <div className="text-sm line-clamp-2 text-muted-foreground">{props.description(item)}</div>
    ) : null

  return (
    <ul
      data-slot={grid ? "grid-view" : "list-view"}
      aria-label={props["aria-label"]}
      aria-busy={loading || undefined}
      className={cn(
        grid
          ? "gap-4 grid grid-cols-[repeat(auto-fill,minmax(min(var(--onu-grid-min),100%),1fr))]"
          : variant === "divided"
            ? "divide-y rounded-lg border"
            : "gap-2 grid",
        className,
      )}
      style={grid ? ({ "--onu-grid-min": minItemWidth } as React.CSSProperties) : undefined}
    >
      {loading
        ? Array.from({ length: grid ? 6 : 4 }, (_, i) =>
            grid ? (
              <li key={i} className="gap-3 p-3 grid rounded-xl border">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </li>
            ) : (
              <li key={i} className="gap-3 p-3 flex items-center">
                <Skeleton className="size-10 rounded-full" />
                <div className="gap-2 grid flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </li>
            ),
          )
        : items.map((item) => {
            const p = parts(item)
            return (
              // Clicking anywhere on the item is a mouse shortcut for its link, which keyboard users reach directly.
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <li
                key={p.id}
                data-state={p.selected ? "selected" : undefined}
                onClick={p.onClick}
                className={cn(
                  grid
                    ? [
                        "relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground data-[state=selected]:border-primary/60 data-[state=selected]:ring-2 data-[state=selected]:ring-primary/20",
                        p.clickable && "cursor-pointer hover:border-foreground/20",
                      ]
                    : [
                        "gap-3 p-3 flex items-start data-[state=selected]:bg-primary/5",
                        variant === "cards" && "rounded-lg border bg-card",
                        p.clickable && "cursor-pointer hover:bg-muted/50",
                      ],
                  classNames?.item,
                )}
              >
                {props.renderItem ? (
                  props.renderItem(item, { checkbox: p.checkbox, actions: p.actions, title: p.title })
                ) : grid ? (
                  <>
                    {props.media ? (
                      <div
                        className={cn(
                          "aspect-video bg-muted [&_img]:size-full [&_img]:object-cover",
                          classNames?.media,
                        )}
                      >
                        {props.media(item)}
                      </div>
                    ) : null}
                    {p.checkbox ? (
                      <div className="top-2 start-2 p-1.5 absolute flex rounded-md bg-background/90">{p.checkbox}</div>
                    ) : null}
                    <div className={cn("gap-1 p-3 flex flex-1 items-start", classNames?.body)}>
                      <div className="gap-1 min-w-0 grid flex-1">
                        {p.title}
                        {descriptionRow(item)}
                        {metaRow(item)}
                      </div>
                      {p.actions}
                    </div>
                  </>
                ) : (
                  <>
                    {p.checkbox ? <div className="pt-0.5">{p.checkbox}</div> : null}
                    {props.media ? <div className={cn("shrink-0", classNames?.media)}>{props.media(item)}</div> : null}
                    <div className={cn("gap-0.5 min-w-0 grid flex-1", classNames?.body)}>
                      {p.title}
                      {descriptionRow(item)}
                      {metaRow(item)}
                    </div>
                    {p.actions}
                  </>
                )}
              </li>
            )
          })}
    </ul>
  )
}

export type GridViewProps<T> = Omit<ListViewProps<T>, "layout" | "variant">

/** `ListView` with `layout="grid"`: records as a responsive grid of cards. */
export function GridView<T>(props: GridViewProps<T>) {
  return <ListView {...props} layout="grid" />
}
