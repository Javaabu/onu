import * as React from "react"

/** Subscribes to a CSS media query. Returns `false` during SSR. */
export function useMediaQuery(query: string) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query],
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** True on touch-first devices (coarse primary pointer). */
export function useCoarsePointer() {
  return useMediaQuery("(pointer: coarse)")
}

/** True when hover is not available (touch screens). */
export function useNoHover() {
  return useMediaQuery("(hover: none)")
}
