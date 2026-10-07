"use client"

// Loaded lazily by MapChart only when a Google Maps API key is configured, so the
// map peers (@vis.gl/react-google-maps, deck.gl) stay out of the main chart bundle.

import * as React from "react"
import { GoogleMapsOverlay } from "@deck.gl/google-maps"
import { GeoJsonLayer } from "@deck.gl/layers"
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps"

import { useOnu } from "../providers/onu-provider"
import { useTheme } from "../providers/theme-provider"
import { stepOpacity, type ChoroplethRegion } from "./choropleth"

type Rgba = [number, number, number, number]

const FALLBACK: Rgba = [100, 116, 139, 255]

/**
 * Resolves any CSS colour (including `var(--chart-1)` and `oklch()`) to RGBA by painting it
 * on a 1×1 canvas. deck.gl needs numbers, not CSS. Falls back to slate when canvas is unavailable.
 */
export function resolveCssColor(color: string, element: Element | null): Rgba {
  if (typeof document === "undefined") return FALLBACK
  let value = color
  const match = /^var\((--[\w-]+)\)$/.exec(color.trim())
  if (match && element) value = getComputedStyle(element).getPropertyValue(match[1]!).trim() || color
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext?.("2d", { willReadFrequently: true })
  if (!ctx) return FALLBACK
  ctx.fillStyle = "#000"
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0, a = 255] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b, a]
}

export interface GoogleChoroplethProps {
  apiKey: string
  mapId?: string
  darkMapId?: string
  regions: ChoroplethRegion[]
  steps: number
  color: string
  center: { lat: number; lng: number }
  zoom: number
  onSelect: (region: ChoroplethRegion | null) => void
}

function ChoroplethOverlay({
  regions,
  steps,
  color,
  onSelect,
  hostRef,
}: Pick<GoogleChoroplethProps, "regions" | "steps" | "color" | "onSelect"> & {
  hostRef: React.RefObject<HTMLDivElement | null>
}) {
  const map = useMap()
  const { resolvedTheme } = useTheme()
  const overlay = React.useMemo(() => new GoogleMapsOverlay({ interleaved: true }), [])

  React.useEffect(() => {
    if (!map) return
    overlay.setMap(map)
    return () => overlay.setMap(null)
  }, [map, overlay])

  React.useEffect(() => {
    // Token colours are resolved here (not during render) and again when the theme changes.
    const colors = {
      base: resolveCssColor(color, hostRef.current),
      border: resolveCssColor("var(--background)", hostRef.current),
      muted: resolveCssColor("var(--muted-foreground)", hostRef.current),
      theme: resolvedTheme,
    }
    const byFeature = new globalThis.Map(regions.map((r) => [r.feature, r]))
    overlay.setProps({
      layers: [
        new GeoJsonLayer({
          id: "onu-choropleth",
          data: regions.map((r) => r.feature) as never,
          pickable: true,
          stroked: true,
          filled: true,
          lineWidthMinPixels: 1,
          getLineColor: [...colors.border.slice(0, 3), 220] as Rgba,
          getFillColor: (feature: unknown) => {
            const region = byFeature.get(feature as ChoroplethRegion["feature"])
            if (!region || region.step === null) return [...colors.muted.slice(0, 3), 40] as Rgba
            return [...colors.base.slice(0, 3), Math.round(stepOpacity(region.step, steps) * 230)] as Rgba
          },
          updateTriggers: { getFillColor: [regions, steps, colors] },
          onHover: (info: { object?: unknown }) => {
            if (info.object) onSelect(byFeature.get(info.object as ChoroplethRegion["feature"]) ?? null)
          },
          onClick: (info: { object?: unknown }) => {
            onSelect(info.object ? (byFeature.get(info.object as ChoroplethRegion["feature"]) ?? null) : null)
          },
        }),
      ],
    })
  }, [overlay, regions, steps, color, hostRef, resolvedTheme, onSelect])

  return null
}

/** Google Map + deck.gl choropleth layer. */
export default function GoogleChoropleth({
  apiKey,
  mapId,
  darkMapId,
  regions,
  steps,
  color,
  center,
  zoom,
  onSelect,
}: GoogleChoroplethProps) {
  const { locale } = useOnu()
  const { resolvedTheme } = useTheme()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const dark = resolvedTheme === "dark"

  return (
    <div ref={hostRef} className="size-full" data-slot="map-chart-google">
      <APIProvider apiKey={apiKey} language={locale.code}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId={(dark ? darkMapId : undefined) ?? mapId}
          colorScheme={dark ? "DARK" : "LIGHT"}
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
          className="size-full"
        >
          <ChoroplethOverlay regions={regions} steps={steps} color={color} onSelect={onSelect} hostRef={hostRef} />
        </Map>
      </APIProvider>
    </div>
  )
}
