"use client"

import type { ThaanaKeyboardOptions } from "./attach"
import { useThaanaInput } from "./use-thaana-input"

/** Value of the `thaana` prop every free-text component accepts (R13.3). */
export type ThaanaProp = boolean | (Omit<ThaanaKeyboardOptions, "enabled" | "onToggle"> & { defaultEnabled?: boolean })

/**
 * Wires the `thaana` prop of a text component: returns a `ref` for the field
 * (attaches the keyboard) and the attributes a Thaana field needs
 * (`dir="rtl"`, `lang="dv"`, Thaana font, R13.4). Returns inert values, and a
 * `ref` that does nothing, when `thaana` is falsy.
 */
export function useThaanaField<T extends HTMLElement>(thaana: ThaanaProp | undefined) {
  const active = !!thaana
  const options = typeof thaana === "object" ? thaana : {}
  const { ref, enabled, setEnabled, toggle } = useThaanaInput<T>({
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

  return { ref: active ? ref : undefined, active, enabled: active && enabled, setEnabled, toggle, fieldProps }
}
