import { area as turfArea, bearing as turfBearing, distance as turfDistance, lineString, polygon } from "@turf/turf"

import type { Translate } from "../i18n/types"
import type { DrawShape, LatLng, LatLngBounds, RouteLeg, RouteResult } from "./types"
import { registerEnglish } from "../i18n/english"
import { map as en_map } from "../locales/en/map"

registerEnglish({ map: en_map })

// ---------------------------------------------------------------------------
// GeoJSON (a minimal subset, so consumers do not need @types/geojson)
// ---------------------------------------------------------------------------

/** `[lng, lat]`, GeoJSON order. */
export type GeoJsonPosition = [number, number] | number[]

export interface GeoJsonPolygon {
  type: "Polygon"
  coordinates: GeoJsonPosition[][]
}

export interface GeoJsonLineString {
  type: "LineString"
  coordinates: GeoJsonPosition[]
}

export interface GeoJsonFeature<G, P = Record<string, unknown>> {
  type: "Feature"
  id?: string | number
  geometry: G
  properties: P | null
}

export interface GeoJsonFeatureCollection<G, P = Record<string, unknown>> {
  type: "FeatureCollection"
  features: GeoJsonFeature<G, P>[]
}

// ---------------------------------------------------------------------------
// Points
// ---------------------------------------------------------------------------

export function isValidLatLng(value: Partial<LatLng> | null | undefined): value is LatLng {
  return (
    !!value &&
    typeof value.lat === "number" &&
    typeof value.lng === "number" &&
    Number.isFinite(value.lat) &&
    Number.isFinite(value.lng) &&
    Math.abs(value.lat) <= 90 &&
    Math.abs(value.lng) <= 180
  )
}

export function latLngEquals(a: LatLng | null | undefined, b: LatLng | null | undefined, epsilon = 1e-9) {
  if (!a || !b) return a === b
  return Math.abs(a.lat - b.lat) < epsilon && Math.abs(a.lng - b.lng) < epsilon
}

/** Rounds to `digits` decimals (6 ≈ 10 cm), the precision stored in form fields. */
export function roundLatLng(p: LatLng, digits = 6): LatLng {
  const f = 10 ** digits
  return { lat: Math.round(p.lat * f) / f, lng: Math.round(p.lng * f) / f }
}

export const toPosition = (p: LatLng): [number, number] => [p.lng, p.lat]
export const fromPosition = (p: GeoJsonPosition): LatLng => ({ lat: Number(p[1]), lng: Number(p[0]) })

export function interpolateLatLng(a: LatLng, b: LatLng, t: number): LatLng {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }
}

// ---------------------------------------------------------------------------
// Measurements (turf)
// ---------------------------------------------------------------------------

/** Great-circle distance in metres. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  return turfDistance(toPosition(a), toPosition(b), { units: "meters" })
}

/** Length of a path in metres. */
export function pathLength(path: LatLng[]): number {
  if (path.length < 2) return 0
  let total = 0
  for (let i = 1; i < path.length; i++) total += distanceMeters(path[i - 1]!, path[i]!)
  return total
}

/** Area of a ring in square metres (0 for fewer than three points). */
export function polygonArea(path: LatLng[]): number {
  if (path.length < 3) return 0
  return turfArea(polygon([closeRing(path.map(toPosition))]))
}

/** Bearing from `a` to `b`, 0–360° clockwise from north. */
export function bearingDegrees(a: LatLng, b: LatLng): number {
  return (turfBearing(toPosition(a), toPosition(b)) + 360) % 360
}

export const COMPASS = ["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"] as const
export type CompassDirection = (typeof COMPASS)[number]

/** Nearest of the eight compass directions for a bearing. */
export function compassDirection(bearing: number): CompassDirection {
  const index = Math.round((((bearing % 360) + 360) % 360) / 45) % 8
  return COMPASS[index]!
}

/** Translated name of a compass direction ("north-east"). */
export function compassLabel(direction: CompassDirection, t: Translate) {
  return t(`map.compass${direction[0]!.toUpperCase()}${direction.slice(1)}`)
}

function closeRing(ring: [number, number][]) {
  const first = ring[0]!
  const last = ring[ring.length - 1]!
  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first]
}

// ---------------------------------------------------------------------------
// Formatting (always through the active locale)
// ---------------------------------------------------------------------------

function number(value: number, numberLocale: string, digits: number) {
  return new Intl.NumberFormat(numberLocale, { maximumFractionDigits: digits }).format(value)
}

/** `4.175500° N` style coordinate, with the hemisphere letter from the locale. */
export function formatCoordinate(value: number, axis: "lat" | "lng", t: Translate, numberLocale = "en", digits = 6) {
  const hemisphere =
    axis === "lat" ? (value >= 0 ? t("map.north") : t("map.south")) : value >= 0 ? t("map.east") : t("map.west")
  const abs = new Intl.NumberFormat(numberLocale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(value))
  // Isolate the number so the degree sign stays with it in RTL text.
  return `\u2066${abs}°\u2069 ${hemisphere}`
}

export function formatLatLng(p: LatLng, t: Translate, numberLocale = "en", digits = 6) {
  return `${formatCoordinate(p.lat, "lat", t, numberLocale, digits)}, ${formatCoordinate(p.lng, "lng", t, numberLocale, digits)}`
}

/** `850 m` / `1.2 km`. */
export function formatDistance(meters: number, t: Translate, numberLocale = "en") {
  if (meters < 1000) return t("map.meters", { value: number(Math.round(meters), numberLocale, 0) })
  return t("map.kilometers", { value: number(meters / 1000, numberLocale, meters < 10_000 ? 2 : 1) })
}

/** `640 m²` / `2.4 ha` / `3.1 km²`. */
export function formatArea(squareMeters: number, t: Translate, numberLocale = "en") {
  if (squareMeters < 10_000) return t("map.squareMeters", { value: number(Math.round(squareMeters), numberLocale, 0) })
  if (squareMeters < 1_000_000) return t("map.hectares", { value: number(squareMeters / 10_000, numberLocale, 2) })
  return t("map.squareKilometers", { value: number(squareMeters / 1_000_000, numberLocale, 2) })
}

/** `45 min` / `2 h 5 min`. */
export function formatDuration(seconds: number, t: Translate) {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return t("map.minutes", { value: minutes })
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? t("map.hoursMinutes", { hours, minutes: rest }) : t("map.hours", { value: hours })
}

// ---------------------------------------------------------------------------
// Bounds and Web Mercator maths (used by the placeholder and viewport loading)
// ---------------------------------------------------------------------------

export function boundsOf(points: LatLng[]): LatLngBounds | null {
  if (!points.length) return null
  let north = -90
  let south = 90
  let east = -180
  let west = 180
  for (const p of points) {
    north = Math.max(north, p.lat)
    south = Math.min(south, p.lat)
    east = Math.max(east, p.lng)
    west = Math.min(west, p.lng)
  }
  return { north, south, east, west }
}

/** Padding (px) around points fitted on first render. */
export const INITIAL_FIT_PADDING = 48
/** Zoom used when the points to fit are a single spot (fitting would zoom all the way in). */
export const SINGLE_POINT_ZOOM = 15

/** True when the bounds are a single point (one marker, or several at the same spot). */
export function isPointBounds(b: LatLngBounds): boolean {
  return b.north === b.south && b.east === b.west
}

export function boundsCenter(b: LatLngBounds): LatLng {
  return { lat: (b.north + b.south) / 2, lng: (b.east + b.west) / 2 }
}

export function boundsContains(b: LatLngBounds, p: LatLng) {
  const inLng = b.west <= b.east ? p.lng >= b.west && p.lng <= b.east : p.lng >= b.west || p.lng <= b.east
  return p.lat <= b.north && p.lat >= b.south && inLng
}

export function boundsEqual(a: LatLngBounds | null | undefined, b: LatLngBounds | null | undefined, epsilon = 1e-7) {
  if (!a || !b) return a === b
  return (
    Math.abs(a.north - b.north) < epsilon &&
    Math.abs(a.south - b.south) < epsilon &&
    Math.abs(a.east - b.east) < epsilon &&
    Math.abs(a.west - b.west) < epsilon
  )
}

const TILE = 256
const MAX_LAT = 85.05112878

/** World pixel coordinates at `zoom` (Web Mercator, like Google and MapLibre). */
export function project(p: LatLng, zoom: number): { x: number; y: number } {
  const scale = TILE * 2 ** zoom
  const lat = Math.max(-MAX_LAT, Math.min(MAX_LAT, p.lat))
  const sin = Math.sin((lat * Math.PI) / 180)
  return {
    x: ((p.lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  }
}

export function unproject(point: { x: number; y: number }, zoom: number): LatLng {
  const scale = TILE * 2 ** zoom
  const lng = (point.x / scale) * 360 - 180
  const n = Math.PI - (2 * Math.PI * point.y) / scale
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
  return { lat, lng }
}

/** Bounds visible in a `width` × `height` px viewport. */
export function boundsForView(center: LatLng, zoom: number, width: number, height: number): LatLngBounds {
  const c = project(center, zoom)
  const nw = unproject({ x: c.x - width / 2, y: c.y - height / 2 }, zoom)
  const se = unproject({ x: c.x + width / 2, y: c.y + height / 2 }, zoom)
  return { north: nw.lat, south: se.lat, west: nw.lng, east: se.lng }
}

/** Largest zoom (≤ `maxZoom`) at which `bounds` fits in the viewport with `padding`. */
export function zoomForBounds(bounds: LatLngBounds, width: number, height: number, padding = 32, maxZoom = 18) {
  const w = Math.max(1, width - padding * 2)
  const h = Math.max(1, height - padding * 2)
  for (let z = maxZoom; z > 0; z--) {
    const ne = project({ lat: bounds.north, lng: bounds.east }, z)
    const sw = project({ lat: bounds.south, lng: bounds.west }, z)
    if (Math.abs(ne.x - sw.x) <= w && Math.abs(sw.y - ne.y) <= h) return z
  }
  return 1
}

// ---------------------------------------------------------------------------
// Polygons as GeoJSON
// ---------------------------------------------------------------------------

export type PolygonCollection = GeoJsonFeatureCollection<GeoJsonPolygon>

/** Drawing shapes → a GeoJSON FeatureCollection of closed Polygons. */
export function shapesToPolygons(shapes: DrawShape[], previous?: PolygonCollection | null): PolygonCollection {
  return {
    type: "FeatureCollection",
    features: shapes
      .filter((s) => s.path.length >= 3)
      .map((s) => {
        const prev = previous?.features.find((f) => String(f.id) === s.id)
        return {
          type: "Feature",
          id: s.id,
          properties: prev?.properties ?? {},
          geometry: { type: "Polygon", coordinates: [closeRing(s.path.map(toPosition))] },
        }
      }),
  }
}

/** A FeatureCollection of Polygons → drawing shapes (outer rings, without the closing point). */
export function polygonsToShapes(value: PolygonCollection | null | undefined): DrawShape[] {
  if (!value) return []
  return value.features
    .filter((f) => f.geometry?.type === "Polygon" && f.geometry.coordinates[0])
    .map((f, i) => {
      const ring = f.geometry.coordinates[0]!.map(fromPosition)
      const first = ring[0]
      const last = ring[ring.length - 1]
      if (ring.length > 1 && latLngEquals(first, last)) ring.pop()
      return { id: f.id !== undefined ? String(f.id) : `polygon-${i + 1}`, path: ring }
    })
}

/** A path → a GeoJSON LineString feature. */
export function pathToLineString(path: LatLng[]): GeoJsonFeature<GeoJsonLineString> | null {
  if (path.length < 2) return null
  return lineString(path.map(toPosition)) as unknown as GeoJsonFeature<GeoJsonLineString>
}

export function lineStringToPath(value: GeoJsonFeature<GeoJsonLineString> | GeoJsonLineString | null | undefined) {
  if (!value) return []
  const geometry = value.type === "Feature" ? value.geometry : value
  return geometry.coordinates.map(fromPosition)
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * A route made of straight segments, for when no routing service is available.
 * `describe` writes each step's instruction (so it can be translated).
 */
export function straightRoute(
  stops: LatLng[],
  describe: (info: { from: number; to: number; direction: CompassDirection; distance: number }) => string,
): RouteResult {
  const legs: RouteLeg[] = []
  for (let i = 1; i < stops.length; i++) {
    const from = stops[i - 1]!
    const to = stops[i]!
    const distance = distanceMeters(from, to)
    legs.push({
      from,
      to,
      distance,
      steps: [
        {
          instruction: describe({
            from: i - 1,
            to: i,
            direction: compassDirection(bearingDegrees(from, to)),
            distance,
          }),
          distance,
          start: from,
        },
      ],
    })
  }
  return { path: stops, legs, source: "straight" }
}

// ---------------------------------------------------------------------------
// Tracks (map replay)
// ---------------------------------------------------------------------------

export interface TrackPoint extends LatLng {
  /** Epoch milliseconds. */
  time: number
}

/** GeoJSON LineString with a `timestamps` array (ms or ISO strings) in its properties. */
export type TrackFeature = GeoJsonFeature<GeoJsonLineString, { timestamps: (number | string)[] }>

/** Accepts `TrackPoint[]` or a timestamped LineString feature and returns points sorted by time. */
export function normalizeTrack(track: TrackPoint[] | TrackFeature | null | undefined): TrackPoint[] {
  if (!track) return []
  if (Array.isArray(track)) return [...track].sort((a, b) => a.time - b.time)
  const stamps = track.properties?.timestamps ?? []
  return track.geometry.coordinates
    .map((c, i) => {
      const raw = stamps[i]
      const time = typeof raw === "string" ? Date.parse(raw) : Number(raw)
      return { ...fromPosition(c), time }
    })
    .filter((p) => Number.isFinite(p.time))
    .sort((a, b) => a.time - b.time)
}

/** Position, heading and the index of the last passed point at `time`. */
export function trackStateAt(track: TrackPoint[], time: number): { position: LatLng; heading: number; index: number } {
  if (!track.length) return { position: { lat: 0, lng: 0 }, heading: 0, index: -1 }
  if (track.length === 1 || time <= track[0]!.time) {
    const next = track[1]
    return { position: track[0]!, heading: next ? bearingDegrees(track[0]!, next) : 0, index: 0 }
  }
  const last = track[track.length - 1]!
  if (time >= last.time) {
    return { position: last, heading: bearingDegrees(track[track.length - 2]!, last), index: track.length - 1 }
  }
  let i = 1
  while (i < track.length && track[i]!.time < time) i++
  const a = track[i - 1]!
  const b = track[i]!
  const span = b.time - a.time
  const t = span > 0 ? (time - a.time) / span : 1
  return { position: interpolateLatLng(a, b, t), heading: bearingDegrees(a, b), index: i - 1 }
}

/** The part of the track already travelled at `time`, ending at the interpolated position. */
export function travelledPath(track: TrackPoint[], time: number): LatLng[] {
  const state = trackStateAt(track, time)
  if (state.index < 0) return []
  return [...track.slice(0, state.index + 1).map(({ lat, lng }) => ({ lat, lng })), state.position]
}

// ---------------------------------------------------------------------------
// Links
// ---------------------------------------------------------------------------

/** A Google Maps link that opens a point (or a search) in the app or browser. */
export function googleMapsUrl(target: LatLng | string, placeId?: string) {
  const query = typeof target === "string" ? target : `${target.lat},${target.lng}`
  const url = new URL("https://www.google.com/maps/search/")
  url.searchParams.set("api", "1")
  url.searchParams.set("query", query)
  if (placeId) url.searchParams.set("query_place_id", placeId)
  return url.toString()
}

/** A Google Maps directions link through every stop. */
export function googleDirectionsUrl(stops: LatLng[], travelMode?: "driving" | "walking" | "bicycling" | "transit") {
  const url = new URL("https://www.google.com/maps/dir/")
  url.searchParams.set("api", "1")
  const fmt = (p: LatLng) => `${p.lat},${p.lng}`
  if (stops[0]) url.searchParams.set("origin", fmt(stops[0]))
  if (stops.length > 1) url.searchParams.set("destination", fmt(stops[stops.length - 1]!))
  if (stops.length > 2) url.searchParams.set("waypoints", stops.slice(1, -1).map(fmt).join("|"))
  if (travelMode) url.searchParams.set("travelmode", travelMode)
  return url.toString()
}

export interface StaticMapOptions {
  apiKey: string
  center: LatLng
  zoom?: number
  width: number
  height: number
  /** Marker colour as `#rrggbb`. */
  markerColor?: string
  mapId?: string
  language?: string
  scale?: 1 | 2
}

/** URL of a Google Static Maps image with one marker. */
export function staticMapUrl({
  apiKey,
  center,
  zoom = 15,
  width,
  height,
  markerColor,
  mapId,
  language,
  scale = 2,
}: StaticMapOptions) {
  const url = new URL("https://maps.googleapis.com/maps/api/staticmap")
  const at = `${center.lat},${center.lng}`
  url.searchParams.set("center", at)
  url.searchParams.set("zoom", String(zoom))
  url.searchParams.set("size", `${Math.round(width)}x${Math.round(height)}`)
  url.searchParams.set("scale", String(scale))
  url.searchParams.set("markers", markerColor ? `color:0x${markerColor.replace("#", "")}|${at}` : at)
  if (mapId) url.searchParams.set("map_id", mapId)
  if (language) url.searchParams.set("language", language)
  url.searchParams.set("key", apiKey)
  return url.toString()
}
