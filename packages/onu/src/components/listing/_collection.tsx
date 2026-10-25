"use client"

import * as React from "react"

import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { isInteractiveTarget } from "./_shared"
import { SelectionCheckbox } from "./_selection-checkbox"
import { ActionMenu } from "../overlays/action-menu"
import type { RecordAction } from "./_actions"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

/** Item props of `ListView`. */
export interface CollectionProps<T> {
  items: T[]
  /** Stable id. Defaults to `item.id`. */
  getId?: (item: T) => string
  /** Display name, for "Select …" and "Actions for …". Defaults to `title` as text. */
  getName?: (item: T) => string
  /** Main line (bold); it links to the record when `getHref` is given. */
  title: (item: T) => React.ReactNode
  description?: (item: T) => React.ReactNode
  /** Small details (dates, counts, badges). */
  meta?: (item: T) => React.ReactNode
  /** Avatar, thumbnail or icon. */
  media?: (item: T) => React.ReactNode
  /** Replaces the default layout of each item entirely. */
  renderItem?: (
    item: T,
    parts: { checkbox: React.ReactNode; actions: React.ReactNode; title: React.ReactNode },
  ) => React.ReactNode
  getHref?: (item: T) => string | undefined
  onItemClick?: (item: T) => void
  itemActions?: (item: T) => RecordAction[]
  /** Selected ids. Shows checkboxes when `onSelectionChange` is given. */
  selection?: string[]
  onSelectionChange?: (ids: string[]) => void
  loading?: boolean
  /** Shown when there are no items (e.g. an `EmptyState`). */
  empty?: React.ReactNode
  /** Accessible name of the list. */
  "aria-label"?: string
}

export function useCollectionItem<T>(props: CollectionProps<T>) {
  const { t } = useTranslation()
  const Link = useLinkComponent()
  const getId = props.getId ?? ((item: T) => String((item as { id?: unknown }).id))
  const selectable = !!props.onSelectionChange
  const selection = props.selection ?? []

  const nameOf = (item: T) => {
    if (props.getName) return props.getName(item)
    const title = props.title(item)
    return typeof title === "string" || typeof title === "number" ? String(title) : getId(item)
  }

  const parts = (item: T) => {
    const id = getId(item)
    const selected = selection.includes(id)
    const href = props.getHref?.(item)
    const titleContent = props.title(item)
    const title = href ? (
      <Link
        href={href}
        data-row-link=""
        className="font-medium rounded-sm text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {titleContent}
      </Link>
    ) : (
      <span className="font-medium">{titleContent}</span>
    )
    const checkbox = selectable ? (
      <SelectionCheckbox
        checked={selected}
        aria-label={t("listing.selectRow", { name: nameOf(item) })}
        onCheckedChange={(on) =>
          props.onSelectionChange?.(on ? [...selection.filter((x) => x !== id), id] : selection.filter((x) => x !== id))
        }
      />
    ) : null
    const actionsList = props.itemActions?.(item)
    const actions = actionsList?.length ? (
      <ActionMenu name={nameOf(item)} items={actionsList} className="min-w-40" />
    ) : null
    const clickable = !!props.onItemClick || !!href
    const onClick = clickable
      ? (event: React.MouseEvent<HTMLElement>) => {
          if (isInteractiveTarget(event.target, event.currentTarget)) return
          if (props.onItemClick) props.onItemClick(item)
          else event.currentTarget.querySelector<HTMLAnchorElement>("a[data-row-link]")?.click()
        }
      : undefined
    return { id, selected, title, checkbox, actions, onClick, clickable }
  }

  return { parts }
}
