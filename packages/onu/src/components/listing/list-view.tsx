"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { Skeleton } from "../../ui/skeleton"
import { useCollectionItem, type CollectionProps } from "./_collection"

export interface ListViewProps<T> extends CollectionProps<T> {
  /** Lines between items (default) or separate cards. */
  variant?: "divided" | "cards"
  className?: string
  classNames?: { item?: string; media?: string; body?: string; meta?: string }
}

/**
 * Records as a vertical list: media, title, description and details, with
 * optional checkboxes and a ⋯ menu per item. Clicking an item opens it.
 */
export function ListView<T>(props: ListViewProps<T>) {
  const { items, loading, empty, variant = "divided", className, classNames } = props
  const { parts } = useCollectionItem(props)

  if (!loading && items.length === 0 && empty) return <>{empty}</>

  return (
    <ul
      data-slot="list-view"
      aria-label={props["aria-label"]}
      aria-busy={loading || undefined}
      className={cn(variant === "divided" ? "divide-y rounded-lg border" : "gap-2 grid", className)}
    >
      {loading
        ? Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="gap-3 p-3 flex items-center">
              <Skeleton className="size-10 rounded-full" />
              <div className="gap-2 grid flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
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
                  "gap-3 p-3 flex items-start data-[state=selected]:bg-primary/5",
                  variant === "cards" && "rounded-lg border bg-card",
                  p.clickable && "cursor-pointer hover:bg-muted/50",
                  classNames?.item,
                )}
              >
                {props.renderItem ? (
                  props.renderItem(item, { checkbox: p.checkbox, actions: p.actions, title: p.title })
                ) : (
                  <>
                    {p.checkbox ? <div className="pt-0.5">{p.checkbox}</div> : null}
                    {props.media ? <div className={cn("shrink-0", classNames?.media)}>{props.media(item)}</div> : null}
                    <div className={cn("gap-0.5 min-w-0 grid flex-1", classNames?.body)}>
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
                  </>
                )}
              </li>
            )
          })}
    </ul>
  )
}
