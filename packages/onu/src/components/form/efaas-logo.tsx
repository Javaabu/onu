"use client"

import * as React from "react"

import { cn } from "../../lib/utils"
import { EFAAS_LOGO_ICONS, EFAAS_LOGO_VIEWBOXES } from "./efaas-logo-icons.data"
import type { EfaasLogoData, EfaasLogoNode } from "./efaas-logo-types"

/** The 22 official eFaas logos, numbered as in eFaas's brand kit (`Efaas Logos SVG-01` … `-22`). */
export type EfaasLogoVariant =
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22

export interface EfaasLogoInfo {
  /** `icon`: the mark alone. `horizontal`: mark and wordmark. `tagline`: with "Key to a digital Maldives". `stacked`: mark above wordmark and tagline. */
  layout: "icon" | "horizontal" | "tagline" | "stacked"
  /** Wordmark language (`null` for the icon alone). */
  language: "en" | "dv" | null
  /** Colour of the wordmark and tile: eFaas blue, black, or white. */
  colour: "blue" | "black" | "white"
  /** The background the logo is made for. */
  background: "light" | "dark"
}

const L = (
  layout: EfaasLogoInfo["layout"],
  language: EfaasLogoInfo["language"],
  colour: EfaasLogoInfo["colour"],
  background: EfaasLogoInfo["background"],
): EfaasLogoInfo => ({ layout, language, colour, background })

/** What each variant is, from eFaas's brand kit. */
export const EFAAS_LOGO_VARIANTS: Record<EfaasLogoVariant, EfaasLogoInfo> = {
  1: L("horizontal", "en", "blue", "light"),
  2: L("horizontal", "dv", "blue", "light"),
  3: L("tagline", "en", "blue", "light"),
  4: L("tagline", "dv", "blue", "light"),
  5: L("stacked", "en", "blue", "light"),
  6: L("stacked", "dv", "blue", "light"),
  7: L("horizontal", "en", "black", "light"),
  8: L("horizontal", "dv", "black", "light"),
  9: L("icon", null, "blue", "light"),
  10: L("icon", null, "black", "light"),
  11: L("icon", null, "white", "dark"),
  12: L("horizontal", "dv", "white", "dark"),
  13: L("horizontal", "dv", "white", "dark"),
  14: L("icon", null, "white", "dark"),
  15: L("icon", null, "white", "dark"),
  16: L("tagline", "en", "white", "dark"),
  17: L("horizontal", "dv", "white", "dark"),
  18: L("horizontal", "en", "white", "dark"),
  19: L("tagline", "dv", "white", "dark"),
  20: L("tagline", "dv", "white", "dark"),
  21: L("stacked", "dv", "white", "dark"),
  22: L("stacked", "en", "white", "dark"),
}

// The wordmark logos (~40 kB compressed) load on first use, so apps that only show the icon don't pay for them.
let wordmarks: Record<number, EfaasLogoData> | undefined
let loading: Promise<void> | undefined
const listeners = new Set<() => void>()

function loadWordmarks() {
  loading ??= import("./efaas-logo-wordmarks.data").then((m) => {
    wordmarks = m.EFAAS_LOGO_WORDMARKS
    listeners.forEach((l) => l())
  })
  return loading
}

function useLogoData(variant: number): EfaasLogoData | undefined {
  const icon = EFAAS_LOGO_ICONS[variant]
  const subscribe = React.useCallback((l: () => void) => {
    listeners.add(l)
    return () => listeners.delete(l)
  }, [])
  const loaded = React.useSyncExternalStore(
    subscribe,
    () => wordmarks,
    () => undefined,
  )
  React.useEffect(() => {
    if (!icon && !wordmarks) void loadWordmarks()
  }, [icon])
  return icon ?? loaded?.[variant]
}

function renderNode([tag, attrs, children]: EfaasLogoNode, key: number): React.ReactNode {
  return React.createElement(tag, { key, ...attrs }, ...children.map(renderNode))
}

export interface EfaasLogoProps extends Omit<React.ComponentProps<"svg">, "children"> {
  /** Which official logo, 1–22 (see `EFAAS_LOGO_VARIANTS`). Default `1`: the blue horizontal English logo. */
  variant?: EfaasLogoVariant
  /** Accessible name. Default `"eFaas"`. */
  title?: string
  /** Hide from assistive technology when visible text already names eFaas. */
  decorative?: boolean
}

/**
 * The official eFaas logos (all 22 variants of eFaas's brand kit), unchanged.
 * Pick the one made for your background: variants for light backgrounds are
 * blue or black, those for dark backgrounds white. Size it with a height class
 * (`h-10`); the width follows. The icon marks are bundled; the logos with a
 * wordmark load on first use and keep their space while loading.
 */
export function EfaasLogo({ variant = 1, title = "eFaas", decorative = false, className, ...props }: EfaasLogoProps) {
  const data = useLogoData(variant)
  const viewBox = EFAAS_LOGO_VIEWBOXES[variant] ?? EFAAS_LOGO_VIEWBOXES[1]
  return (
    <svg
      data-slot="efaas-logo"
      data-variant={variant}
      data-loading={data ? undefined : ""}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative || undefined}
      focusable="false"
      className={cn("h-10 w-auto shrink-0", className)}
      {...props}
    >
      {data?.nodes.map(renderNode)}
    </svg>
  )
}
