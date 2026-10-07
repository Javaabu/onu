"use client"

import * as React from "react"

import { useMergedRef } from "../inputs/text-input"

/**
 * Radix dialogs return focus to their own Trigger on close. Dialogs opened
 * another way (a controlled `open`, `useConfirm()`, ⌘K) would drop focus on
 * `<body>`. This remembers whatever had focus when the content mounted and
 * returns focus there on close (R14.4, §25.10).
 *
 * Spread `ref` and `onCloseAutoFocus` onto the Radix `Content`.
 */
export function useRestoreFocus<T extends HTMLElement>(
  ref: React.Ref<T> | undefined,
  onCloseAutoFocus?: (event: Event) => void,
) {
  const opener = React.useRef<HTMLElement | null>(null)
  // Ref callbacks run during commit, before Radix moves focus into the content.
  const capture = React.useCallback((node: T | null) => {
    if (!node) return
    const active = document.activeElement
    opener.current = active instanceof HTMLElement && active !== document.body && !node.contains(active) ? active : null
  }, [])
  const mergedRef = useMergedRef(ref, capture)

  const handleCloseAutoFocus = React.useCallback(
    (event: Event) => {
      onCloseAutoFocus?.(event)
      if (event.defaultPrevented) return
      const el = opener.current
      if (el && el.isConnected) {
        event.preventDefault()
        el.focus({ preventScroll: true })
      }
    },
    [onCloseAutoFocus],
  )

  return { ref: mergedRef, onCloseAutoFocus: handleCloseAutoFocus }
}
