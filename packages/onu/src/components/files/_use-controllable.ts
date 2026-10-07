"use client"

import * as React from "react"

/**
 * State that is controlled when `value` is defined and internal otherwise.
 * `setValue` always calls `onChange`.
 */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal
  const setValue = React.useCallback(
    (next: T) => {
      if (!controlled) setInternal(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )
  return [current, setValue] as const
}
