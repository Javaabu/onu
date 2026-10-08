"use client"

import * as React from "react"
import { Direction } from "radix-ui"

import { createTranslator, mergeMessages } from "../i18n/translate"
import type { OnuLocale, PartialMessages, Translate } from "../i18n/types"
import { IconContext, type IconSource } from "../icons/icon-context"
import { lucideIconMap } from "../icons/lucide-map"
import type { IconMap } from "../icons/types"
import { en, locales } from "../locales"

export type Density = "compact" | "default" | "comfortable" | "touch"
export type LabelLayout = "stacked" | "inline"

/** Anything that renders a link: `"a"`, Inertia's `Link`, Next's `Link`, … (R16.2). */
export type LinkComponent = React.ElementType<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; ref?: React.Ref<HTMLAnchorElement> }
>

export interface MapsConfig {
  /** Google Maps JavaScript API key (R16.9). */
  googleMapsApiKey?: string
  /** Map ID for vector maps, advanced markers and cloud styling. */
  mapId?: string
  /** Separate Map ID used in dark mode. */
  darkMapId?: string
}

export interface OnuContextValue {
  locale: OnuLocale
  dir: "ltr" | "rtl"
  t: Translate
  density: Density
  labelLayout: LabelLayout
  linkComponent: LinkComponent
  maps: MapsConfig
}

const fallbackContext: OnuContextValue = {
  locale: en,
  dir: "ltr",
  t: createTranslator(en),
  density: "default",
  labelLayout: "stacked",
  linkComponent: "a",
  maps: {},
}

const OnuContext = React.createContext<OnuContextValue>(fallbackContext)

export interface OnuProviderProps {
  children?: React.ReactNode
  /** A locale object or the code of a built-in locale (`"en"` | `"dv"`). */
  locale?: OnuLocale | keyof typeof locales
  /** Override the locale's direction. */
  dir?: "ltr" | "rtl"
  /** Override or add individual strings (R12.2). */
  messages?: PartialMessages
  density?: Density
  /** Default label layout for form fields (R3.31). */
  labelLayout?: LabelLayout
  linkComponent?: LinkComponent
  /** Map semantic icon names to another set, e.g. `fontAwesomeIconMap()` (R6.5). */
  icons?: IconMap
  /** Extra icon sources for `DynamicIcon` and the icon picker (Iconify, FontAwesome). */
  iconSources?: IconSource[]
  maps?: MapsConfig
  /**
   * Set `lang`, `dir` and `data-density` on `<html>` so portalled overlays
   * inherit them. Disable when Onu only controls part of a page.
   */
  syncDocument?: boolean
}

/** Root provider: locale, direction, density, icons, links and map config in one place. */
export function OnuProvider({
  children,
  locale: localeProp = "en",
  dir: dirProp,
  messages,
  density = "default",
  labelLayout = "stacked",
  linkComponent = "a",
  icons,
  iconSources,
  maps,
  syncDocument = true,
}: OnuProviderProps) {
  const base = typeof localeProp === "string" ? locales[localeProp] : localeProp
  const locale = React.useMemo(
    () => (messages ? { ...base, messages: mergeMessages(base.messages, messages) } : base),
    [base, messages],
  )
  const dir = dirProp ?? locale.dir

  const value = React.useMemo<OnuContextValue>(
    () => ({
      locale,
      dir,
      t: createTranslator(locale, en),
      density,
      labelLayout,
      linkComponent,
      maps: maps ?? {},
    }),
    [locale, dir, density, labelLayout, linkComponent, maps],
  )

  React.useEffect(() => {
    if (!syncDocument) return
    const html = document.documentElement
    html.lang = locale.code
    html.dir = dir
    html.dataset.density = density
  }, [syncDocument, locale.code, dir, density])

  // The default Lucide set is supplied here, not imported by <Icon>, so components with fixed glyphs stay small.
  const iconValue = React.useMemo(
    () => ({ icons, sources: iconSources, defaults: lucideIconMap }),
    [icons, iconSources],
  )

  return (
    <OnuContext.Provider value={value}>
      <Direction.DirectionProvider dir={dir}>
        <IconContext.Provider value={iconValue}>{children}</IconContext.Provider>
      </Direction.DirectionProvider>
    </OnuContext.Provider>
  )
}

/** Onu context. Works without a provider (English, LTR). */
export function useOnu() {
  return React.useContext(OnuContext)
}

/** `t("namespace.key", params)` for the active locale. */
export function useTranslation() {
  const { t, locale } = useOnu()
  return { t, locale }
}

export function useDirection() {
  return useOnu().dir
}

export function useLinkComponent() {
  return useOnu().linkComponent
}

export interface DensityProps extends React.HTMLAttributes<HTMLDivElement> {
  value: Density
}

/** Scopes a density mode to a subtree (R3.2). */
export function Density({ value, className, ...props }: DensityProps) {
  return <div data-density={value} className={className} {...props} />
}
