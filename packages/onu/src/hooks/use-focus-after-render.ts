import * as React from "react"

/**
 * Returns a function that focuses `ref`'s element once the next render has committed.
 * Use it when the element may be disabled until then (e.g. a file picker after a removal frees a slot).
 */
export function useFocusAfterRender(ref: React.RefObject<HTMLElement | null>) {
  const [request, setRequest] = React.useState(0)
  React.useEffect(() => {
    if (request) ref.current?.focus()
  }, [request, ref])
  return React.useCallback(() => setRequest((n) => n + 1), [])
}
