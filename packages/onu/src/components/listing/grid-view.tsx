"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { Skeleton } from "../../ui/skeleton"
import { useCollectionItem, type CollectionProps } from "./_collection"

export interface GridViewProps<T> extends CollectionProps<T> {
  /** Smallest card width before the grid drops a column. Default `16rem`. */
  minItemWidth?: string
  className?: string
  classNames?: { item?: string; media?: string; body?: string; meta?: string }
}

/**
 * Records as a responsive grid of cards. Columns follow the space available
 * (not the viewport), so the grid also works in a narrow column.
 */
export function GridView<T>(props: GridViewProps<T>) {
  const { items, loading, empty, minItemWidth = "16rem", className, classNames } = props
  const { parts } = useCollectionItem(props)

  if (!loading && items.length === 0 && empty) return <>{empty}</>

  return (
    <ul
      data-slot="grid-view"
      aria-label={props["aria-label"]}
      aria-busy={loading || undefined}
      className={cn("gap-4 grid grid-cols-[repeat(auto-fill,minmax(min(var(--onu-grid-min),100%),1fr))]", className)}
      style={{ "--onu-grid-min": minItemWidth } as React.CSSProperties}
    >
      {loading
        ? Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="gap-3 p-3 grid rounded-xl border">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </li>
          ))
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
                  "relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground data-[state=selected]:border-primary/60 data-[state=selected]:ring-2 data-[state=selected]:ring-primary/20",
                  p.clickable && "cursor-pointer hover:border-foreground/20",
                  classNames?.item,
                )}
              >
                {props.renderItem ? (
                  props.renderItem(item, { checkbox: p.checkbox, actions: p.actions, title: p.title })
                ) : (
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
                        {props.description ? (
                          <div className="text-sm line-clamp-2 text-muted-foreground">{props.description(item)}</div>
                        ) : null}
                        {props.meta ? (
                          <div
                            className={cn(
                              "gap-x-3 gap-y-1 text-xs flex flex-wrap items-center text-muted-foreground",
                              classNames?.meta,
                            )}
                          >
                            {props.meta(item)}
                          </div>
                        ) : null}
                      </div>
                      {p.actions}
                    </div>
                  </>
                )}
              </li>
            )
          })}
    </ul>
  )
}
