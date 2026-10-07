"use client"

import * as React from "react"

import type { ThaanaKeyboardOptions } from "./attach"
import { useThaanaInput } from "./use-thaana-input"

/** Value of the `thaana` prop every free-text component accepts (R13.3). */
export type ThaanaProp = boolean | (Omit<ThaanaKeyboardOptions, "enabled" | "onToggle"> & { defaultEnabled?: boolean })

/**
 * Wires the `thaana` prop of a text component: attaches the keyboard and returns
 * the attributes a Thaana field needs (`dir="rtl"`, `lang="dv"`, Thaana font, R13.4).
 * Returns inert values when `thaana` is falsy.
 */
export function useThaanaField<T extends HTMLElement>(ref: React.RefObject<T | null>, thaana: ThaanaProp | undefined) {
  const active = !!thaana
  const options = typeof thaana === "object" ? thaana : {}
  const { enabled, setEnabled, toggle } = useThaanaInput(active ? ref : NULL_REF, {
    keymap: options.keymap,
    paste: options.paste,
    toggleShortcut: options.toggleShortcut,
    defaultEnabled: options.defaultEnabled ?? true,
  })

  const fieldProps = active
    ? ({
        dir: enabled ? "rtl" : "auto",
        lang: enabled ? "dv" : undefined,
        "data-thaana": enabled ? "" : undefined,
      } as const)
    : ({} as const)

  return { active, enabled: active && enabled, setEnabled, toggle, fieldProps }
}

const NULL_REF = { current: null }
