"use client"

import * as React from "react"
import { Direction } from "radix-ui"

import { createTranslator, mergeMessages } from "../i18n/translate"
import type { OnuLocale, PartialMessages, Translate } from "../i18n/types"
import { IconContext, type IconContextValue, type IconSource } from "../icons/icon-context"
import type { IconMap } from "../icons/types"
import { baseEn, BUILT_IN_LOCALES, type BuiltInLocaleCode } from "../locales/base"

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
  locale: baseEn,
  dir: "ltr",
  t: createTranslator(baseEn),
  density: "default",
  labelLayout: "stacked",
  linkComponent: "a",
  maps: {},
}

const OnuContext = React.createContext<OnuContextValue>(fallbackContext)

export interface OnuProviderProps {
  children?: React.ReactNode
  /**
   * A locale object (e.g. `dv` from `@javaabu/onu/locales/dv`) or the code of a
   * built-in locale (`"en"` | `"dv"`). The code `"dv"` loads the Dhivehi text on
   * demand, in a separate chunk; pass the `dv` object to have it on the first render.
   */
  locale?: OnuLocale | BuiltInLocaleCode
  /** Override the locale's direction. */
  dir?: "ltr" | "rtl"
  /** Override or add individual strings (R12.2). */
  messages?: PartialMessages
  density?: Density
  /** Default label layout for form fields (R3.31). */
  labelLayout?: LabelLayout
  linkComponent?: LinkComponent
  /**
   * Map semantic icon names to another set, e.g. `fontAwesomeIconMap()` (R6.5). Names not
   * in it use the default Lucide set, which loads on demand the first time a component
   * shows an icon chosen by name; pass `lucideIconMap` here to bundle it up front.
   */
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

/** Locales loaded on demand from their code, kept for the lifetime of the page. */
const loadedLocales = new Map<string, OnuLocale>()
const localeLoaders: Record<Exclude<BuiltInLocaleCode, "en">, () => Promise<OnuLocale>> = {
  dv: () => import("../locales/dv/dv").then((m) => m.dv),
}

/**
 * Resolves `OnuProvider locale`. Built-in codes other than English load their text
 * on demand; until it arrives, the code and direction are already right and strings
 * show in English.
 */
function useResolvedLocale(prop: OnuLocale | BuiltInLocaleCode): OnuLocale {
  const code = typeof prop === "string" ? prop : undefined
  const cached = code ? loadedLocales.get(code) : undefined
  const [, rerender] = React.useReducer((n: number) => n + 1, 0)

  React.useEffect(() => {
    const load = code && code !== "en" ? localeLoaders[code] : undefined
    if (!code || !load || loadedLocales.has(code)) return
    let live = true
    void load().then((locale) => {
      loadedLocales.set(code, locale)
      if (live) rerender()
    })
    return () => {
      live = false
    }
  }, [code])

  return React.useMemo(() => {
    if (typeof prop !== "string") return prop
    if (cached) return cached
    const builtIn = BUILT_IN_LOCALES.find((l) => l.code === prop)
    return builtIn && prop !== "en" ? { ...baseEn, code: builtIn.code, name: builtIn.name, dir: builtIn.dir } : baseEn
  }, [prop, cached])
}

/** The default Lucide icon set, once loaded. Shared by every provider on the page. */
let lucideDefaults: IconMap | undefined
let lucideDefaultsPromise: Promise<IconMap> | undefined

function loadLucideDefaults() {
  lucideDefaultsPromise ??= import("../icons/lucide-map").then((m) => (lucideDefaults = m.lucideIconMap))
  return lucideDefaultsPromise
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
  const base = useResolvedLocale(localeProp)
  const locale = React.useMemo(
    () => (messages ? { ...base, messages: mergeMessages(base.messages, messages) } : base),
    [base, messages],
  )
  const dir = dirProp ?? locale.dir

  const value = React.useMemo<OnuContextValue>(
    () => ({
      locale,
      dir,
      t: createTranslator(locale),
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

  // The default Lucide set loads on demand, the first time an <Icon> needs a name from it,
  // so apps whose icons are all fixed glyphs (spinners, chevrons, close buttons) never load it.
  const [defaults, setDefaults] = React.useState(lucideDefaults)
  const mounted = React.useRef(true)
  React.useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const loadDefaults = React.useCallback(() => {
    void loadLucideDefaults().then((map) => {
      if (mounted.current) setDefaults(map)
    })
  }, [])
  const iconValue = React.useMemo<IconContextValue>(
    () => ({ icons, sources: iconSources, defaults, loadDefaults }),
    [icons, iconSources, defaults, loadDefaults],
  )

  return (
    <OnuContext.Provider value={value}>
      <Direction.DirectionProvider dir={dir}>
        <IconContext.Provider value={iconValue}>{children}</IconContext.Provider>
      </Direction.DirectionProvider>
    </OnuContext.Provider>
  )
}

/**
 * Onu context. Without a provider it falls back to English and LTR. Icons are the
 * exception: icon names that components choose at runtime (e.g. `<Button startIcon="add">`)
 * need `OnuProvider`, which loads the default icon set on demand. Fixed glyphs (spinners, close
 * buttons, chevrons) and the `Icon` exported from the package root work without it.
 */
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
