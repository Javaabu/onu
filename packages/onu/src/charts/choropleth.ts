import { numericValue, type ChartDatum } from "./_shared"

/** Minimal GeoJSON types (polygons and multipolygons are what a choropleth needs). */
export interface GeoJsonFeature {
  type: "Feature"
  id?: string | number
  properties?: Record<string, unknown> | null
  geometry: { type: string; coordinates: unknown } | null
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection"
  features: GeoJsonFeature[]
}

export interface ChoroplethRegion {
  id: string
  name: string
  value: number | null
  /** Colour step (0 … steps-1), or `null` without data. */
  step: number | null
  feature: GeoJsonFeature
}

export interface ChoroplethScale {
  min: number
  max: number
  /** Lower bound of each step. */
  thresholds: number[]
  stepOf: (value: number) => number
}

/** Equal-interval scale from the data's min to max. */
export function choroplethScale(values: number[], steps = 5): ChoroplethScale {
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const size = (max - min) / steps
  const thresholds = Array.from({ length: steps }, (_, i) => min + size * i)
  const stepOf = (value: number) =>
    size === 0 ? steps - 1 : Math.min(steps - 1, Math.max(0, Math.floor((value - min) / size)))
  return { min, max, thresholds, stepOf }
}

/** Opacity of each step: from light to full colour. */
export function stepOpacity(step: number, steps: number) {
  return steps <= 1 ? 1 : 0.2 + (0.8 * step) / (steps - 1)
}

function featureId(feature: GeoJsonFeature, key: string) {
  const value = feature.properties?.[key] ?? feature.id
  return value === undefined || value === null ? "" : String(value)
}

/** Joins features with data and assigns each region a colour step. */
export function choroplethRegions(
  geojson: GeoJsonFeatureCollection,
  data: ChartDatum[],
  { idKey = "id", valueKey = "value", featureIdKey = "id", featureNameKey = "name", steps = 5 } = {},
): { regions: ChoroplethRegion[]; scale: ChoroplethScale } {
  const values = new Map<string, number | null>(data.map((d) => [String(d[idKey]), numericValue(d, valueKey)]))
  const scale = choroplethScale(
    [...values.values()].filter((v): v is number => v !== null),
    steps,
  )
  const regions = geojson.features.map((feature) => {
    const id = featureId(feature, featureIdKey)
    const value = values.get(id) ?? null
    const name = feature.properties?.[featureNameKey]
    return {
      id,
      name: typeof name === "string" && name ? name : id,
      value,
      step: value === null ? null : scale.stepOf(value),
      feature,
    }
  })
  return { regions, scale }
}
