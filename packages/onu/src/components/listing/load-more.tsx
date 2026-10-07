"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { Spinner } from "../../ui/spinner"
import { useNoun } from "./_shared"
import type { ListingNoun } from "./listing-types"

export interface LoadMoreProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** How many items are shown now. */
  loaded: number
  /** Total items, when known. */
  total?: number
  /** Whether there is more to load. Defaults to `loaded < total`. */
  hasMore?: boolean
  loading?: boolean
  onLoadMore: () => void | Promise<unknown>
  /** Load the next page when the button scrolls into view (the button stays as a fallback). */
  auto?: boolean
  noun?: ListingNoun
  classNames?: { button?: string; summary?: string }
}

/**
 * "Load more" button for lists and grids, with "Showing 20 of 312" and an
 * announcement of how many items arrived. `auto` loads as the user scrolls.
 */
export function LoadMore({
  loaded,
  total,
  hasMore: hasMoreProp,
  loading: loadingProp,
  onLoadMore,
  auto = false,
  noun,
  className,
  classNames,
  ...props
}: LoadMoreProps) {
  const { t, locale } = useTranslation()
  const nounFor = useNoun(noun)
  const format = new Intl.NumberFormat(locale.numberLocale)
  const [pending, setPending] = React.useState(false)
  const loading = loadingProp ?? pending
  const hasMore = hasMoreProp ?? (total !== undefined ? loaded < total : true)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  // Announce how many arrived once loading finishes.
  const [before, setBefore] = React.useState<number | null>(null)
  const [message, setMessage] = React.useState("")
  if (before !== null && !loading && loaded !== before) {
    const added = loaded - before
    setBefore(null)
    setMessage(added > 0 ? t("listing.loadedMore", { count: added, noun: nounFor(added) }) : "")
  }

  const load = React.useCallback(async () => {
    if (loading) return
    setBefore(loaded)
    const result = onLoadMore()
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setPending(true)
      try {
        await result
      } finally {
        setPending(false)
      }
    }
  }, [loading, loaded, onLoadMore])

  React.useEffect(() => {
    if (!auto || !hasMore || loading || !buttonRef.current) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) void load()
    })
    observer.observe(buttonRef.current)
    return () => observer.disconnect()
  }, [auto, hasMore, loading, load])

  const summary =
    total !== undefined
      ? hasMore
        ? t("listing.showingRange", {
            from: format.format(loaded ? 1 : 0),
            to: format.format(loaded),
            total: format.format(total),
            noun: nounFor(total),
          })
        : t("listing.allLoaded", { total: format.format(total), noun: nounFor(total) })
      : t("listing.showingCount", { count: format.format(loaded), noun: nounFor(loaded) })

  return (
    <div data-slot="load-more" className={cn("gap-2 py-2 flex flex-col items-center", className)} {...props}>
      <p className={cn("text-sm text-muted-foreground tabular-nums", classNames?.summary)}>{summary}</p>
      {hasMore ? (
        <Button
          ref={buttonRef}
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
          aria-busy={loading || undefined}
          className={cn("min-w-32 touch:min-h-11", classNames?.button)}
        >
          {loading ? <Spinner /> : null}
          {loading ? t("listing.loadingMore") : t("listing.loadMore")}
        </Button>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  )
}
