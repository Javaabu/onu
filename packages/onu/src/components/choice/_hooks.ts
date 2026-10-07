"use client"

import * as React from "react"

/**
 * Controlled/uncontrolled state. `value === undefined` means uncontrolled;
 * `null` is a controlled empty value.
 */
export function useControllableState<T, A extends unknown[] = []>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T, ...args: A) => void,
) {
  const [inner, setInner] = React.useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const set = React.useCallback(
    (next: T, ...args: A) => {
      if (!controlled) setInner(next)
      onChange?.(next, ...args)
    },
    [controlled, onChange],
  )
  return [current, set] as const
}

/** `value`, updated only after it stops changing for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay: number): T {
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

/**
 * Calls `callback` whenever `dep` changes after the first render (compared by
 * JSON so inline objects work). Used to clear a child when its parent changes.
 */
export function useOnChange(dep: unknown, callback: () => void) {
  const key = JSON.stringify(dep ?? null)
  const previous = React.useRef(key)
  const cb = React.useRef(callback)
  React.useEffect(() => {
    cb.current = callback
  })
  React.useEffect(() => {
    if (previous.current === key) return
    previous.current = key
    cb.current()
  }, [key])
}

/** Polite live-region text that re-announces even when the same message repeats. */
export function useAnnouncer() {
  const [message, setMessage] = React.useState("")
  const announce = React.useCallback((text: string) => {
    setMessage("")
    setTimeout(() => setMessage(text), 30)
  }, [])
  return [message, announce] as const
}
