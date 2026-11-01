"use client"

import * as React from "react"

import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect"

/**
 * State that is controlled when `value` is given, and internal otherwise, starting
 * from `defaultValue`. `undefined` means uncontrolled; `null` is a real, empty value.
 * The setter is stable and calls `onChange` in both modes, with any extra arguments.
 */
export function useControllableState<T, A extends unknown[] = []>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T, ...args: A) => void,
): [T, (next: T, ...args: A) => void] {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const controlled = value !== undefined
  const onChangeRef = React.useRef(onChange)
  useIsomorphicLayoutEffect(() => {
    onChangeRef.current = onChange
  })
  const set = React.useCallback(
    (next: T, ...args: A) => {
      if (!controlled) setInternal(next)
      onChangeRef.current?.(next, ...args)
    },
    [controlled],
  )
  return [controlled ? value : internal, set]
}
