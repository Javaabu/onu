"use client"

import * as React from "react"

import { interpolateLatLng, latLngEquals } from "./geo"
import type { LatLng } from "./types"

/** Controlled when `value !== undefined`, otherwise internal state seeded by `defaultValue`. */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : internal
  const onChangeRef = useLatest(onChange)
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setInternal(next)
      onChangeRef.current?.(next)
    },
    [controlled, onChangeRef],
  )
  return [current, set]
}

/** A ref that always holds the latest value (for callbacks used in effects). */
export function useLatest<T>(value: T) {
  const ref = React.useRef(value)
  React.useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
}

/**
 * Glides from the previous position to `target` over `duration` ms (live
 * tracking). Jumps straight there under `prefers-reduced-motion`.
 */
export function useAnimatedLatLng(target: LatLng, duration = 800): LatLng {
  const instant = duration <= 0 || prefersReducedMotion() || typeof requestAnimationFrame === "undefined"
  const [shown, setShown] = React.useState(target)
  const shownRef = React.useRef(target)
  React.useEffect(() => {
    const from = shownRef.current
    if (instant) {
      shownRef.current = target
      return
    }
    if (latLngEquals(from, target)) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      const next = interpolateLatLng(from, target, eased)
      shownRef.current = next
      setShown(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, instant])
  return instant ? target : shown
}

/** Polite live-region text: set a message, render `message` in an `aria-live` element. */
export function useAnnouncer() {
  const [message, setMessage] = React.useState("")
  const announce = React.useCallback((text: string) => setMessage(text), [])
  return { message, announce }
}
