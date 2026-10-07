"use client"

import * as React from "react"

import type { MapColors } from "./_colors"
import type { MapAdapter } from "./types"

export interface MapContextValue {
  adapter: MapAdapter
  apiKey?: string
  /** Map ID for the current colour scheme. */
  mapId?: string
  colorScheme: "light" | "dark"
  /** Language for map tiles and the engine's controls. */
  language: string
  /** Theme colours as `#rrggbb`. */
  colors: MapColors
}

export const MapContext = React.createContext<MapContextValue | null>(null)

/** The nearest MapProvider, or `null`. */
export function useMapContext() {
  return React.useContext(MapContext)
}

/** The map context; throws outside a MapProvider (map components add one themselves). */
export function useMapEngine(): MapContextValue {
  const ctx = useMapContext()
  if (!ctx) throw new Error("Onu map components must be rendered inside <MapProvider> or <MapView>.")
  return ctx
}
