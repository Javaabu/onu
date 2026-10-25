"use client"

import * as React from "react"

import type { ConfirmFunction } from "./confirm-dialog"

/** The nearest `ConfirmProvider`'s `confirm`. */
export const ConfirmContext = React.createContext<ConfirmFunction | null>(null)

let active: ConfirmFunction | null = null

/** The most recently mounted `ConfirmProvider`, for the standalone `confirm()`. */
export const activeConfirm = {
  get: () => active,
  set: (fn: ConfirmFunction | null) => {
    active = fn
  },
}

/**
 * The mounted `ConfirmProvider`'s `confirm`, or `null` when there is none (so
 * a caller can show its own dialog instead of the `window.confirm` fallback).
 * Read it when asking, not while rendering: a provider elsewhere in the tree
 * registers itself in an effect.
 */
export function useMountedConfirm(): () => ConfirmFunction | null {
  const context = React.useContext(ConfirmContext)
  return React.useCallback(() => context ?? active, [context])
}
