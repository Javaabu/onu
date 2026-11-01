"use client"

import * as React from "react"

/** The default debounce of every search in the library, in ms. */
export const SEARCH_DELAY = 300

export type AsyncSearchStatus = "idle" | "loading" | "done" | "error"

export interface UseAsyncSearchOptions<T> {
  /** Runs the search. A new function identity searches again; `null` turns searching off. */
  search: ((query: string, options: { signal: AbortSignal }) => Promise<T>) | null | undefined
  query: string
  /** Turn searching off for now, e.g. while a popup is closed or the query is too short. Default `true`. */
  enabled?: boolean
  /** Debounce in ms. Default 300. */
  delay?: number
}

interface SearchState<T> {
  status: AsyncSearchStatus
  data: T | undefined
  /** The query the last response or failure belongs to. */
  settled: string | null
}

/**
 * A debounced search where a newer query, or turning it off, aborts the older
 * request, so a slow early response never overwrites a newer one. `data` is the
 * last successful result and survives later queries and failures until `clear()`.
 * `pending` is true from the moment the query changes until its response arrives,
 * including the debounce; `status` turns `"loading"` once the request starts.
 */
export function useAsyncSearch<T>({ search, query, enabled = true, delay = SEARCH_DELAY }: UseAsyncSearchOptions<T>) {
  const [state, setState] = React.useState<SearchState<T>>({ status: "idle", data: undefined, settled: null })
  const [attempt, setAttempt] = React.useState(0)
  const lastAttempt = React.useRef(0)
  const active = enabled && !!search

  React.useEffect(() => {
    const retrying = lastAttempt.current !== attempt
    lastAttempt.current = attempt
    if (!active || !search) return
    const controller = new AbortController()
    const { signal } = controller
    const timer = setTimeout(
      () => {
        setState((s) => ({ ...s, status: "loading" }))
        search(query, { signal }).then(
          (data) => {
            if (!signal.aborted) setState({ status: "done", data, settled: query })
          },
          () => {
            if (!signal.aborted) setState((s) => ({ ...s, status: "error", settled: query }))
          },
        )
      },
      retrying ? 0 : delay,
    )
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [active, search, query, delay, attempt])

  /** Runs the current query again, without the debounce. */
  const retry = React.useCallback(() => {
    setState((s) => ({ ...s, status: "loading", settled: null }))
    setAttempt((n) => n + 1)
  }, [])

  const clear = React.useCallback(() => setState({ status: "idle", data: undefined, settled: null }), [])

  return {
    data: state.data,
    status: active ? state.status : ("idle" as const),
    pending: active && state.settled !== query,
    retry,
    clear,
  }
}

/** `value`, updated only after it stops changing for `delay` ms. For a fetcher that cancels its own requests. */
export function useDebouncedValue<T>(value: T, delay = SEARCH_DELAY): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    if (delay <= 0) {
      const id = setTimeout(() => setDebounced(value), 0)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return delay <= 0 ? value : debounced
}
