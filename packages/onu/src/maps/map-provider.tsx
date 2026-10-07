"use client"

import * as React from "react"

import { useOnu } from "../providers/onu-provider"
import { MapContext, useMapContext, type MapContextValue } from "./_context"
import { useIsDark, useMapColors } from "./_colors"
import { googleMapsAdapter } from "./_google-adapter"
import { placeholderAdapter } from "./_placeholder-adapter"
import type { MapAdapter } from "./types"

/**
 * Google has no Dhivehi map language: tiles and Google's own controls fall back
 * to English while Onu's UI stays in Dhivehi (R16.9).
 */
const UNSUPPORTED_MAP_LANGUAGES = new Set(["dv"])

export function mapLanguage(code: string) {
  const base = code.split("-")[0]!.toLowerCase()
  return UNSUPPORTED_MAP_LANGUAGES.has(base) ? "en" : code
}

export interface MapProviderProps {
  /** Google Maps API key. Defaults to `OnuProvider maps.googleMapsApiKey`. */
  apiKey?: string
  /** Map ID for vector maps and advanced markers. Defaults to `OnuProvider maps.mapId`. */
  mapId?: string
  /** Map ID used in dark mode. Defaults to `OnuProvider maps.darkMapId`. */
  darkMapId?: string
  /** Force a colour scheme. Defaults to the page's light/dark mode. */
  colorScheme?: "light" | "dark"
  /** Region bias for geocoding and borders. */
  region?: string
  /**
   * The map engine. Defaults to Google Maps when there is an API key, and to a
   * schematic placeholder (no network, no key) otherwise.
   */
  adapter?: MapAdapter
  children?: React.ReactNode
}

/**
 * Configures the map engine for every map inside. Reads `OnuProvider maps`
 * (`googleMapsApiKey`, `mapId`, `darkMapId`); props override. With Google it
 * wraps `APIProvider`, so the Maps JavaScript API is loaded once.
 */
export function MapProvider({
  apiKey: apiKeyProp,
  mapId: mapIdProp,
  darkMapId: darkMapIdProp,
  colorScheme: colorSchemeProp,
  region = "MV",
  adapter: adapterProp,
  children,
}: MapProviderProps) {
  const { maps, locale } = useOnu()
  const apiKey = apiKeyProp ?? maps.googleMapsApiKey
  const lightMapId = mapIdProp ?? maps.mapId
  const darkMapId = darkMapIdProp ?? maps.darkMapId
  const dark = useIsDark()
  const colorScheme = colorSchemeProp ?? (dark ? "dark" : "light")
  const colors = useMapColors()
  const adapter = adapterProp ?? (apiKey ? googleMapsAdapter : placeholderAdapter)
  const language = mapLanguage(locale.code)
  const mapId = colorScheme === "dark" ? (darkMapId ?? lightMapId) : lightMapId

  const value = React.useMemo<MapContextValue>(
    () => ({ adapter, apiKey, mapId, colorScheme, language, colors }),
    [adapter, apiKey, mapId, colorScheme, language, colors],
  )

  const Provider = adapter.Provider
  // Keyed by engine so hooks never switch implementation mid-life.
  const content = (
    <MapContext.Provider key={adapter.name} value={value}>
      {children}
    </MapContext.Provider>
  )
  return Provider ? (
    <Provider apiKey={apiKey} language={language} region={region}>
      {content}
    </Provider>
  ) : (
    content
  )
}

/** Wraps `children` in a MapProvider unless one is already above. */
export function EnsureMapProvider({ children }: { children: React.ReactNode }) {
  const ctx = useMapContext()
  return ctx ? <>{children}</> : <MapProvider>{children}</MapProvider>
}

export { useMapContext, useMapEngine, type MapContextValue } from "./_context"
