"use client"

import { useTranslation } from "../providers/onu-provider"
import { useMapEngine } from "./_context"
import type { HeatmapPoint, MapTone } from "./types"
import { registerEnglish } from "../i18n/english"
import { map as en_map } from "../locales/en/map"

registerEnglish({ map: en_map })

/** Default heat ramp, low to high, from theme tokens. */
export const HEATMAP_TONES: MapTone[] = ["info", "chart-6", "success", "warning", "destructive"]

export interface HeatmapLayerProps {
  points: HeatmapPoint[]
  /** Pixels each point spreads over. Default 30. */
  radius?: number
  /** Multiplier for the summed weight. Default 1. */
  intensity?: number
  /** Layer opacity, 0–1. Default 0.8. */
  opacity?: number
  /** Colour ramp, low to high: theme tones or `#rrggbb` colours. */
  colors?: (MapTone | `#${string}`)[]
  /** Visually hidden text summary for screen readers. Default: point count and total weight. Pass `null` to omit. */
  summary?: string | null
}

/**
 * A density heatmap inside a `MapView`. Drawn with deck.gl's `HeatmapLayer`
 * on Google Maps (Google's own HeatmapLayer is deprecated). Pair it with a
 * legend and a table of the data for an accessible alternative (R14.9).
 */
export function HeatmapLayer({
  points,
  radius = 30,
  intensity = 1,
  opacity = 0.8,
  colors: ramp = HEATMAP_TONES,
  summary,
}: HeatmapLayerProps) {
  const { t } = useTranslation()
  const { adapter, colors } = useMapEngine()
  const Heatmap = adapter.Heatmap
  const hex = ramp.map((c) => (c.startsWith("#") ? c : colors[c as MapTone]))
  const total = points.reduce((sum, p) => sum + (p.weight ?? 1), 0)
  const text = summary === undefined ? t("map.heatmapSummary", { count: points.length, total }) : summary
  return (
    <>
      <Heatmap points={points} radius={radius} intensity={intensity} colors={hex} opacity={opacity} />
      {text ? (
        <p data-slot="heatmap-summary" className="sr-only">
          {text}
        </p>
      ) : null}
    </>
  )
}
