"use client"

import * as React from "react"

/** Anything a display component accepts as a date. */
export type DateInput = Date | string | number | null | undefined

/** Parses a date input. Returns `null` for empty or invalid values. */
export function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * The current time, refreshed every `interval` ms (pass `null` to stop).
 * Starts from `initial` so server and first client render agree.
 */
export function useNow(interval: number | null, initial?: number): number {
  const [now, setNow] = React.useState(() => initial ?? Date.now())
  React.useEffect(() => {
    if (interval === null) return
    const id = window.setInterval(() => setNow(Date.now()), interval)
    return () => window.clearInterval(id)
  }, [interval])
  return now
}

/** Copies text to the clipboard and exposes a `copied` flag that resets after `timeout` ms. */
export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = React.useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        return false
      }
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), timeout)
      return true
    },
    [timeout],
  )
  return { copied, copy }
}

/** Reads and writes a JSON value in `localStorage`, tolerating unavailable storage. */
export function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable (private mode, quotas); the choice still applies for this visit.
  }
}
