"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { Skeleton } from "../../ui/skeleton"
import { EmptyState } from "./empty-state"

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export interface HighlightProps extends React.ComponentProps<"span"> {
  text: string
  /** Words to mark. Each word is matched on its own, ignoring case. */
  query: string
  classNames?: { mark?: string }
}

/** Marks the words of `query` inside `text` with `<mark>`. */
export function Highlight({ text, query, className, classNames, ...props }: HighlightProps) {
  const words = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp)
  if (!words.length)
    return (
      <span className={className} {...props}>
        {text}
      </span>
    )
  const pattern = new RegExp(`(${words.join("|")})`, "giu")
  const parts = text.split(pattern)
  return (
    <span data-slot="highlight" className={className} {...props}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={cn("px-0.5 -mx-0.5 rounded-sm bg-primary/15 text-foreground", classNames?.mark)}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </span>
  )
}

export interface SearchResultItem {
  id: string
  title: string
  description?: string
  href?: string
  /** Extra line, e.g. a date or a breadcrumb. */
  meta?: React.ReactNode
  /** Semantic icon name or node. */
  icon?: string | React.ReactNode
}

export interface SearchResultGroup {
  id: string
  label: string
  items: SearchResultItem[]
  /** Total matches in this group when more exist than are shown. */
  total?: number
  /** "View all" link for the group. */
  moreHref?: string
  moreLabel?: string
}

export interface SearchResultsProps extends Omit<React.ComponentProps<"section">, "onSelect"> {
  query: string
  groups: SearchResultGroup[]
  loading?: boolean
  /** Called when a result without `href` is chosen. */
  onSelect?: (item: SearchResultItem, group: SearchResultGroup) => void
  /** Hide the "3 results for …" heading. */
  hideSummary?: boolean
  classNames?: { summary?: string; group?: string; heading?: string; item?: string; mark?: string }
}

/**
 * Search results grouped by type (e.g. Services, News, Pages), with the
 * search words highlighted and a count per group.
 */
export function SearchResults({
  query,
  groups,
  loading,
  onSelect,
  hideSummary,
  className,
  classNames,
  ...props
}: SearchResultsProps) {
  const { t, locale } = useTranslation()
  const Link = useLinkComponent()
  const format = new Intl.NumberFormat(locale.numberLocale)
  const id = React.useId()
  const total = groups.reduce((sum, g) => sum + (g.total ?? g.items.length), 0)
  const visibleGroups = groups.filter((g) => g.items.length)

  return (
    <section
      data-slot="search-results"
      aria-labelledby={`${id}-summary`}
      aria-busy={loading || undefined}
      className={cn("gap-6 grid", className)}
      {...props}
    >
      <h2
        id={`${id}-summary`}
        className={cn("text-sm text-muted-foreground", hideSummary && "sr-only", classNames?.summary)}
        aria-live="polite"
      >
        {loading
          ? t("listing.loading")
          : query
            ? t("listing.resultsFor", { count: total, query })
            : t("listing.searchResults")}
      </h2>
      {loading ? (
        <div className="gap-3 grid">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="gap-2 grid">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : visibleGroups.length === 0 ? (
        <EmptyState
          variant="no-results"
          title={query ? t("listing.resultsFor", { count: 0, query }) : t("common.noResults")}
          description={t("listing.noResultsHint")}
        />
      ) : (
        visibleGroups.map((group) => {
          const headingId = `${id}-${group.id}`
          const count = group.total ?? group.items.length
          return (
            <section key={group.id} aria-labelledby={headingId} className={cn("gap-2 grid", classNames?.group)}>
              <h3 id={headingId} className={cn("gap-2 text-sm font-medium flex items-center", classNames?.heading)}>
                {group.label}
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {t("listing.resultsInGroup", { count })}
                </span>
              </h3>
              <ul className="gap-1 grid">
                {group.items.map((item) => {
                  const body = (
                    <>
                      {item.icon ? (
                        <span className="mt-0.5 text-muted-foreground">
                          {typeof item.icon === "string" ? <Icon name={item.icon} /> : item.icon}
                        </span>
                      ) : null}
                      <span className="gap-0.5 min-w-0 grid">
                        <span className="font-medium">
                          <Highlight text={item.title} query={query} classNames={{ mark: classNames?.mark }} />
                        </span>
                        {item.description ? (
                          <span className="text-sm line-clamp-2 text-muted-foreground">
                            <Highlight text={item.description} query={query} classNames={{ mark: classNames?.mark }} />
                          </span>
                        ) : null}
                        {item.meta ? <span className="text-xs text-muted-foreground">{item.meta}</span> : null}
                      </span>
                    </>
                  )
                  const itemClass = cn(
                    "gap-3 p-2 touch:min-h-11 flex w-full items-start rounded-lg text-start outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                    classNames?.item,
                  )
                  return (
                    <li key={item.id}>
                      {item.href ? (
                        <Link href={item.href} className={itemClass}>
                          {body}
                        </Link>
                      ) : (
                        <button type="button" className={itemClass} onClick={() => onSelect?.(item, group)}>
                          {body}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
              {group.moreHref ? (
                <Link href={group.moreHref} className="text-sm w-fit text-primary underline-offset-4 hover:underline">
                  {group.moreLabel ?? `${group.label} (${format.format(count)})`}
                </Link>
              ) : null}
            </section>
          )
        })
      )}
    </section>
  )
}
