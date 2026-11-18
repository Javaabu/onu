"use client"

import * as React from "react"

/** Sets one ref and returns how to undo it: the ref's own React 19 cleanup, or a call with `null`. */
function setRef<T>(ref: React.Ref<T> | undefined, node: T | null): () => void {
  if (typeof ref === "function") {
    const cleanup = ref(node)
    return typeof cleanup === "function" ? cleanup : () => ref(null)
  }
  if (ref) (ref as React.RefObject<T | null>).current = node
  return () => {
    if (ref) (ref as React.RefObject<T | null>).current = null
  }
}

/**
 * Merges a forwarded ref with a local one. Returns a React 19 ref callback with a
 * cleanup, so a ref that returns its own cleanup gets it called on detach.
 */
export function useMergedRef<T>(a: React.Ref<T> | undefined, b?: React.Ref<T>) {
  return React.useCallback(
    // `node` is null only when an older ref composer detaches by calling with null.
    (node: T | null) => {
      const undoA = setRef(a, node)
      const undoB = setRef(b, node)
      return () => {
        undoA()
        undoB()
      }
    },
    [a, b],
  )
}
