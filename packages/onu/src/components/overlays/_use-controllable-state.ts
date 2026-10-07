"use client"

import * as React from "react"

/**
 * Controlled/uncontrolled state in one hook: uses `value` when it is defined,
 * otherwise keeps its own state starting from `defaultValue`. `onChange` fires
 * for every change in both modes.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [inner, setInner] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInner(next)
      onChangeRef.current?.(next)
    },
    [controlled],
  )
  return [current, set]
}
