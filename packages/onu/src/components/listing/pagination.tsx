"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { buttonVariants } from "../../ui/button"
import { useNoun } from "./_shared"
import type { ListingNoun } from "./listing-types"
import { PerPage } from "./per-page"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ common: en_common, listing: en_listing })

/** `meta` of a Laravel API resource collection, or the top level of `paginator->toArray()`. */
export interface LaravelPaginationMeta {
  current_page: number
  per_page: number | string
  total?: number
  last_page?: number
  from?: number | null
  to?: number | null
  path?: string
  next_page_url?: string | null
  prev_page_url?: string | null
  links?: LaravelPaginatorLink[] | LaravelResourceLinks
}

export interface LaravelPaginatorLink {
  url: string | null
  label: string
  active: boolean
  page?: number | null
}

/** `links` of a Laravel API resource collection. */
export interface LaravelResourceLinks {
  first?: string | null
  last?: string | null
  prev?: string | null
  next?: string | null
}

/** A Laravel API resource collection response: `{ data, meta, links }`. */
export interface LaravelResourceCollection {
  data?: unknown[]
  meta: LaravelPaginationMeta
  links?: LaravelResourceLinks
}

/** What the pagination needs, whatever shape the server sent. */
export interface PaginationInfo {
  page: number
  perPage: number
  /** Total rows. Unknown for Laravel's simple paginator. */
  total?: number
  lastPage?: number
  from?: number
  to?: number
  prevUrl?: string | null
  nextUrl?: string | null
  /** Builds the URL of any page, when the server gave a `path`. */
  pageUrl?: (page: number) => string
}

function isResource(input: LaravelResourceCollection | LaravelPaginationMeta): input is LaravelResourceCollection {
  return "meta" in input && typeof input.meta === "object" && input.meta !== null
}

/**
 * Reads a Laravel paginator (`->paginate()` / `->simplePaginate()` as JSON) or an
 * API resource collection (`{ data, meta, links }`) into one shape (R16.4).
 */
export function normalizePagination(input: LaravelResourceCollection | LaravelPaginationMeta): PaginationInfo {
  const meta = isResource(input) ? input.meta : input
  const resourceLinks = isResource(input) ? input.links : Array.isArray(meta.links) ? undefined : meta.links
  const perPage = Number(meta.per_page)
  const page = Number(meta.current_page)
  const lastPage =
    meta.last_page ?? (meta.total !== undefined ? Math.max(1, Math.ceil(meta.total / perPage)) : undefined)
  const path = meta.path
  return {
    page,
    perPage,
    total: meta.total,
    lastPage,
    from: meta.from ?? undefined,
    to: meta.to ?? undefined,
    prevUrl: resourceLinks?.prev ?? meta.prev_page_url ?? null,
    nextUrl: resourceLinks?.next ?? meta.next_page_url ?? null,
    pageUrl: path
      ? (n: number) => {
          const url = new URL(path, "http://localhost")
          url.searchParams.set("page", String(n))
          return path.startsWith("http") ? url.toString() : `${url.pathname}${url.search}`
        }
      : undefined,
  }
}

/** Page numbers to show around the current page, with `null` for a gap. Always the same length once gaps appear. */
export function getPageItems(page: number, lastPage: number, siblings = 1): (number | null)[] {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const slots = siblings * 2 + 5
  if (lastPage <= slots) return range(1, lastPage)
  const left = Math.max(page - siblings, 1)
  const right = Math.min(page + siblings, lastPage)
  const leftGap = left > 2
  const rightGap = right < lastPage - 1
  const edge = 3 + siblings * 2
  if (!leftGap) return [...range(1, edge), null, lastPage]
  if (!rightGap) return [1, null, ...range(lastPage - edge + 1, lastPage)]
  return [1, null, ...range(left, right), null, lastPage]
}

export const paginationVariants = cva("gap-3 @container flex flex-wrap items-center justify-between", {
  variants: {
    size: {
      default: "text-sm",
      sm: "text-xs",
    },
  },
  defaultVariants: { size: "default" },
})

export interface PaginationProps
  extends Omit<React.ComponentProps<"nav">, "onChange">, VariantProps<typeof paginationVariants> {
  /** Current page (1-based). */
  page?: number
  perPage?: number
  /** Total rows. Without it, Next relies on `hasNextPage`. */
  total?: number
  /** For paginators that don't count (Laravel `simplePaginate`). */
  hasNextPage?: boolean
  /** A Laravel paginator or API resource collection (or its `meta`). Overrides the props above. */
  paginator?: LaravelResourceCollection | LaravelPaginationMeta
  onPageChange?: (page: number) => void
  /** Show the rows-per-page select. */
  onPerPageChange?: (perPage: number) => void
  perPageOptions?: number[]
  /** Render pages as links. Uses `OnuProvider linkComponent` (e.g. Inertia's `Link`). */
  getPageHref?: (page: number) => string
  /** Show numbered page buttons (Ant-style; the current page is outlined in the brand colour). They collapse to "Page 2 of 13" on phones. Default `true`; `false` shows only Previous / Next with their labels. */
  numbered?: boolean
  /** The "Showing 26–50 of 312 users" text. Default `true`. */
  showSummary?: boolean
  /** What is being listed, for the summary. Default "records". */
  noun?: ListingNoun
  disabled?: boolean
  classNames?: { summary?: string; controls?: string; perPage?: string; pages?: string; button?: string }
}

/**
 * Pagination for listings: a summary ("Showing 26–50 of 312 users"), a
 * rows-per-page select and Previous / Next buttons, with optional numbered pages.
 * Accepts Laravel paginator / API resource shapes directly (R16.4).
 */
export function Pagination({
  page: pageProp = 1,
  perPage: perPageProp = 25,
  total: totalProp,
  hasNextPage,
  paginator,
  onPageChange,
  onPerPageChange,
  perPageOptions,
  getPageHref: getPageHrefProp,
  numbered = true,
  showSummary = true,
  noun,
  disabled,
  size,
  className,
  classNames,
  ...props
}: PaginationProps) {
  const { t, locale } = useTranslation()
  const Link = useLinkComponent()
  const nounFor = useNoun(noun)
  const format = new Intl.NumberFormat(locale.numberLocale)

  const info = paginator ? normalizePagination(paginator) : undefined
  const page = info?.page ?? pageProp
  const perPage = info?.perPage ?? perPageProp
  const total = info ? info.total : totalProp
  const lastPage = info?.lastPage ?? (total !== undefined ? Math.max(1, Math.ceil(total / perPage)) : undefined)
  const getPageHref = getPageHrefProp ?? info?.pageUrl

  const isFirst = page <= 1
  const isLast = lastPage !== undefined ? page >= lastPage : info ? !info.nextUrl : !hasNextPage

  const from = info?.from ?? (total === 0 ? 0 : (page - 1) * perPage + 1)
  const to = info?.to ?? (total !== undefined ? Math.min(page * perPage, total) : page * perPage)

  let summary: string
  if (total === 0) summary = t("listing.showingNone", { noun: nounFor(0) })
  else if (total !== undefined)
    summary = t("listing.showingRange", {
      from: format.format(from),
      to: format.format(to),
      total: format.format(total),
      noun: nounFor(total),
    })
  else summary = t("listing.page", { page: format.format(page) })

  const hrefFor = (target: number) => {
    if (target === page) return undefined
    if (getPageHref) return getPageHref(target)
    if (target === page - 1 && info?.prevUrl) return info.prevUrl
    if (target === page + 1 && info?.nextUrl) return info.nextUrl
    return undefined
  }

  const go = (target: number) => (event: React.MouseEvent) => {
    if (!onPageChange) return
    if (event.metaKey || event.ctrlKey || event.shiftKey) return
    event.preventDefault()
    onPageChange(target)
  }

  const pageButton = ({
    target,
    isDisabled,
    children,
    label,
    current,
    extra,
  }: {
    target: number
    isDisabled?: boolean
    children: React.ReactNode
    label?: string
    current?: boolean
    extra?: string
  }) => {
    // Ant pagination items: 32px, 6px corners, no border; the current page is outlined in the brand colour.
    const classes = cn(
      buttonVariants({ variant: "ghost", size: "default" }),
      "min-w-8 px-1.5 touch:min-h-11 touch:min-w-11 tabular-nums",
      current &&
        "font-semibold border-primary bg-card text-primary-7 hover:bg-card hover:text-primary-7 dark:text-primary-7",
      classNames?.button,
      extra,
    )
    const href = hrefFor(target)
    if (href && !isDisabled && !disabled) {
      return (
        <Link href={href} className={classes} aria-label={label} onClick={go(target)}>
          {children}
        </Link>
      )
    }
    return (
      <button
        type="button"
        className={classes}
        aria-label={label}
        aria-current={current ? "page" : undefined}
        disabled={isDisabled || disabled}
        onClick={current ? undefined : () => onPageChange?.(target)}
      >
        {children}
      </button>
    )
  }

  return (
    <nav
      aria-label={t("common.pagination")}
      data-slot="pagination"
      className={cn(paginationVariants({ size }), className)}
      {...props}
    >
      {showSummary ? (
        <p
          className={cn("text-muted-foreground tabular-nums", classNames?.summary)}
          data-slot="pagination-summary"
          aria-live="polite"
        >
          {summary}
        </p>
      ) : null}
      <div className={cn("gap-x-4 gap-y-2 ms-auto flex flex-wrap items-center", classNames?.controls)}>
        <ul className={cn("gap-2 flex items-center", classNames?.pages)} data-slot="pagination-pages">
          <li>
            {pageButton({
              target: page - 1,
              isDisabled: isFirst,
              label: t("common.goToPreviousPage"),
              children: (
                <>
                  <Icon name="chevron-left" />
                  {numbered && lastPage !== undefined ? null : (
                    <span className="@sm:inline hidden">{t("listing.previous")}</span>
                  )}
                </>
              ),
            })}
          </li>
          {numbered && lastPage !== undefined ? (
            <>
              {getPageItems(page, lastPage).map((item, index) =>
                item === null ? (
                  <li key={`gap-${index}`} aria-hidden="true" className="@md:flex px-1 hidden text-muted-foreground">
                    <Icon name="more" />
                  </li>
                ) : (
                  <li key={item} className="@md:list-item hidden">
                    {pageButton({
                      target: item,
                      current: item === page,
                      label:
                        item === page
                          ? t("listing.currentPage", { page: format.format(item) })
                          : t("listing.goToPage", { page: format.format(item) }),
                      children: format.format(item),
                    })}
                  </li>
                ),
              )}
              <li className="@md:hidden px-2 text-muted-foreground tabular-nums" aria-current="page">
                {t("listing.pageOf", { page: format.format(page), pages: format.format(lastPage) })}
              </li>
            </>
          ) : null}
          <li>
            {pageButton({
              target: page + 1,
              isDisabled: isLast,
              label: t("common.goToNextPage"),
              children: (
                <>
                  {numbered && lastPage !== undefined ? null : (
                    <span className="@sm:inline hidden">{t("listing.next")}</span>
                  )}
                  <Icon name="chevron-right" />
                </>
              ),
            })}
          </li>
        </ul>
        {onPerPageChange ? (
          <PerPage
            value={perPage}
            onValueChange={onPerPageChange}
            options={perPageOptions}
            disabled={disabled}
            className={classNames?.perPage}
          />
        ) : null}
      </div>
    </nav>
  )
}
