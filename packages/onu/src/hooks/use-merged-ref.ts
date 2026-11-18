"use client"

import * as React from "react"

function setRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref) (ref as React.RefObject<T | null>).current = node
}

/** Merges a forwarded ref with local ones. */
export function useMergedRef<T>(a: React.Ref<T> | undefined, b?: React.Ref<T>, c?: React.Ref<T>) {
  return React.useCallback(
    (node: T | null) => {
      setRef(a, node)
      setRef(b, node)
      setRef(c, node)
    },
    [a, b, c],
  )
}
