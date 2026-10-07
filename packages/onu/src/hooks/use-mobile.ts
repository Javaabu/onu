import { useMediaQuery } from "./use-media-query"

const MOBILE_BREAKPOINT = 768

/** True below the `md` breakpoint (768px). */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}
