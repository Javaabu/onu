"use client"

import * as React from "react"

import { attachThaanaKeyboard, type ThaanaKeyboardController, type ThaanaKeyboardOptions } from "./attach"

export type UseThaanaInputOptions = Omit<ThaanaKeyboardOptions, "enabled" | "onToggle"> & {
  /** Controlled on/off state. */
  enabled?: boolean
  /** Initial state when uncontrolled. Default `true`. */
  defaultEnabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
}

/**
 * Attaches the Thaana keyboard to an input, textarea or contenteditable (R13.2).
 * Put the returned `ref` on the element; the keyboard follows the DOM node, so
 * it works on elements that mount later or get replaced. Also returns the
 * current mode and setters for a Thaana/Latin toggle (R13.5).
 */
export function useThaanaInput<T extends HTMLElement>({
  enabled: enabledProp,
  defaultEnabled = true,
  onEnabledChange,
  keymap,
  paste,
  toggleShortcut,
}: UseThaanaInputOptions = {}) {
  const [element, ref] = React.useState<T | null>(null)
  const [uncontrolled, setUncontrolled] = React.useState(defaultEnabled)
  const enabled = enabledProp ?? uncontrolled
  const controller = React.useRef<ThaanaKeyboardController | null>(null)
  const onChangeRef = React.useRef(onEnabledChange)
  React.useEffect(() => {
    onChangeRef.current = onEnabledChange
  })

  const setEnabled = React.useCallback(
    (next: boolean) => {
      if (enabledProp === undefined) setUncontrolled(next)
      onChangeRef.current?.(next)
    },
    [enabledProp],
  )

  const enabledRef = React.useRef(enabled)
  const setEnabledRef = React.useRef(setEnabled)
  React.useEffect(() => {
    enabledRef.current = enabled
    setEnabledRef.current = setEnabled
    controller.current?.setEnabled(enabled)
  })

  // Shortcut objects are often written inline; compare them by value.
  const shortcutKey = JSON.stringify(toggleShortcut ?? null)
  React.useEffect(() => {
    if (!element) return
    const c = attachThaanaKeyboard(element, {
      keymap,
      paste,
      toggleShortcut: toggleShortcut === undefined ? undefined : (JSON.parse(shortcutKey) as typeof toggleShortcut),
      enabled: enabledRef.current,
      onToggle: (next) => setEnabledRef.current(next),
    })
    controller.current = c
    return () => {
      c.detach()
      controller.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Re-attach only when the element or keyboard settings change.
  }, [element, keymap, paste, shortcutKey])

  const toggle = React.useCallback(() => setEnabled(!enabled), [enabled, setEnabled])

  return { ref: ref as (node: T | null) => void, enabled, setEnabled, toggle }
}
