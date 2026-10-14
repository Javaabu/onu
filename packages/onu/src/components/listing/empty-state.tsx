"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../../ui/empty"
import { useNoun } from "./_shared"
import type { ListingNoun } from "./listing-types"
import { registerEnglish } from "../../i18n/english"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ listing: en_listing })

export const emptyStateVariants = cva("", {
  variants: {
    variant: {
      /** Nothing has been added yet. */
      "no-records": "",
      /** The search or filters match nothing. */
      "no-results": "",
      /** The trash is empty. */
      trash: "",
    },
    bordered: {
      true: "border",
      false: "",
    },
  },
  defaultVariants: { variant: "no-records", bordered: false },
})

export interface EmptyStateProps
  extends Omit<React.ComponentProps<"div">, "title">, VariantProps<typeof emptyStateVariants> {
  /** What is being listed, e.g. `{ one: "user", other: "users" }`. */
  noun?: ListingNoun
  /** Overrides the built-in title. */
  title?: React.ReactNode
  /** Overrides the built-in description. */
  description?: React.ReactNode
  /** Icon name (semantic) or node. */
  icon?: string | React.ReactNode
  /** The main action, e.g. a "New user" button (no-records). */
  action?: React.ReactNode
  /** The active search term (no-results). */
  search?: string
  /** Text of the active filters, e.g. `["Status: Active"]` (no-results). */
  filters?: string[]
  /** Shows a "Clear search" button. */
  onClearSearch?: () => void
  /** Shows a "Clear filters" button. */
  onClearFilters?: () => void
  classNames?: { media?: string; title?: string; description?: string; content?: string }
}

/**
 * Empty state for listings (§25.6): "No users yet" with the main action, or
 * "No users match your search" naming the search and filters, with Clear search
 * and Clear filters buttons. Built on shadcn's `Empty`.
 */
export function EmptyState({
  variant = "no-records",
  bordered,
  noun,
  title,
  description,
  icon,
  action,
  search,
  filters,
  onClearSearch,
  onClearFilters,
  className,
  classNames,
  children,
  ...props
}: EmptyStateProps) {
  const { t } = useTranslation()
  const nounFor = useNoun(noun)
  const plural = nounFor(2)

  const defaults = {
    "no-records": {
      icon: "folder",
      title: t("listing.emptyTitle", { noun: plural }),
      description: t("listing.emptyDescription", { noun: plural }),
    },
    "no-results": {
      icon: "search",
      title: t("listing.noResultsTitle", { noun: plural }),
      description: noResultsText(t, search, filters),
    },
    trash: {
      icon: "trash",
      title: t("listing.trashEmptyTitle"),
      description: t("listing.trashEmptyDescription", { noun: plural }),
    },
  }[variant ?? "no-records"]

  const media = icon === undefined ? defaults.icon : icon
  const showClearSearch = variant === "no-results" && onClearSearch && !!search
  const showClearFilters = variant === "no-results" && onClearFilters && !!filters?.length

  return (
    <Empty
      data-slot="empty-state"
      data-variant={variant}
      role="status"
      className={cn(emptyStateVariants({ variant, bordered }), className)}
      {...props}
    >
      <EmptyHeader>
        {media ? (
          <EmptyMedia variant="icon" className={classNames?.media}>
            {typeof media === "string" ? <Icon name={media} /> : media}
          </EmptyMedia>
        ) : null}
        <EmptyTitle className={cn("text-base", classNames?.title)}>{title ?? defaults.title}</EmptyTitle>
        <EmptyDescription className={classNames?.description}>{description ?? defaults.description}</EmptyDescription>
      </EmptyHeader>
      {action || showClearSearch || showClearFilters || children ? (
        <EmptyContent className={cn("flex-row flex-wrap justify-center", classNames?.content)}>
          {showClearSearch ? (
            <Button variant="outline" onClick={onClearSearch} className="touch:min-h-11">
              {t("listing.clearSearch")}
            </Button>
          ) : null}
          {showClearFilters ? (
            <Button variant="outline" onClick={onClearFilters} className="touch:min-h-11">
              {t("listing.clearFilters")}
            </Button>
          ) : null}
          {action}
          {children}
        </EmptyContent>
      ) : null}
    </Empty>
  )
}

function noResultsText(
  t: ReturnType<typeof useTranslation>["t"],
  search: string | undefined,
  filters: string[] | undefined,
) {
  const list = filters?.join(", ")
  if (search && list) return t("listing.noResultsSearchAndFilters", { search, filters: list })
  if (search) return t("listing.noResultsSearch", { search })
  if (list) return t("listing.noResultsFilters", { filters: list })
  return t("listing.noResultsHint")
}
