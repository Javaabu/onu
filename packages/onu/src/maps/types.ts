import type * as React from "react"

/** A point on the map, in degrees (WGS 84). */
export interface LatLng {
  lat: number
  lng: number
}

/** A rectangular area, in degrees. */
export interface LatLngBounds {
  north: number
  south: number
  east: number
  west: number
}

/** What the camera currently shows. */
export interface MapViewState {
  center: LatLng
  zoom: number
  bounds: LatLngBounds
}

/**
 * Colour of a marker or shape. Tones map to theme tokens (`--primary`,
 * `--chart-1` …), so maps follow `--onu-primary` and dark mode.
 */
export type MapTone =
  | "primary"
  | "muted"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "chart-6"
  | "chart-7"
  | "chart-8"

/** Imperative camera control, handed out through `MapView`'s `mapRef`. */
export interface MapHandle {
  panTo(position: LatLng, zoom?: number): void
  fitBounds(bounds: LatLngBounds, padding?: number): void
  getView(): MapViewState | null
}

/** A place returned by a search (geocoding) service. */
export interface PlaceResult {
  id: string
  label: string
  description?: string
  position: LatLng
}

export type PlaceSearch = (query: string, options: { signal: AbortSignal }) => Promise<PlaceResult[]>

/** One instruction in a route. */
export interface RouteStep {
  instruction: string
  /** Metres. */
  distance: number
  /** Seconds, when the service knows it. */
  duration?: number
  /** Where the step starts. */
  start: LatLng
}

/** One leg of a route: from one stop to the next. */
export interface RouteLeg {
  from: LatLng
  to: LatLng
  /** Metres. */
  distance: number
  /** Seconds, when known. */
  duration?: number
  steps: RouteStep[]
}

export interface RouteResult {
  /** The full path to draw. */
  path: LatLng[]
  legs: RouteLeg[]
  /** `service`: a routing service answered. `straight`: straight segments between stops. */
  source: "service" | "straight"
}

export type RouteService = (stops: LatLng[], options: { signal: AbortSignal }) => Promise<RouteResult>

// ---------------------------------------------------------------------------
// Adapter interface (R16.9). Components only talk to these types, so another
// map engine (e.g. MapLibre) can be added without changing component APIs.
// ---------------------------------------------------------------------------

export interface AdapterProviderProps {
  apiKey?: string
  language: string
  region?: string
  children?: React.ReactNode
}

export interface AdapterMapProps {
  /** Accessible name of the map region. */
  label: string
  defaultCenter: LatLng
  defaultZoom: number
  /**
   * Fit these bounds once, as soon as they are set (on first render, or later when the
   * points load). Wins over centre/zoom; a single point is centred at a street-level zoom.
   */
  defaultBounds?: LatLngBounds
  colorScheme: "light" | "dark"
  /** Map ID (cloud styling / vector maps). Already resolved for the colour scheme. */
  mapId?: string
  /** UI language for map tiles and controls. */
  language: string
  onClick?: (position: LatLng) => void
  /** Fires when the camera stops moving. */
  onViewChange?: (view: MapViewState) => void
  /** Show the engine's own zoom / map-type controls. */
  controls?: boolean
  /** `cooperative` needs two fingers / Ctrl+scroll to move the map (good inside scrolling pages). */
  gestureHandling?: "cooperative" | "greedy" | "none" | "auto"
  handleRef?: React.Ref<MapHandle>
  className?: string
  children?: React.ReactNode
}

export interface AdapterMarkerProps {
  position: LatLng
  /** Accessible name; also the hover title. */
  title: string
  /** Short text inside the pin, e.g. a stop number. */
  label?: string
  tone?: MapTone
  selected?: boolean
  /** Degrees clockwise from north; renders a heading arrow instead of a pin. */
  heading?: number
  draggable?: boolean
  onDragEnd?: (position: LatLng) => void
  /** Makes the marker focusable and clickable. */
  onClick?: () => void
  zIndex?: number
}

export interface AdapterCircleProps {
  center: LatLng
  /** Metres. */
  radius: number
  tone?: MapTone
  /** Show drag handles for the centre and the radius. */
  editable?: boolean
  onChange?: (value: { center: LatLng; radius: number }) => void
}

export interface AdapterPolygonProps {
  /** Outer ring (not closed: the first point is not repeated). */
  path: LatLng[]
  tone?: MapTone
  selected?: boolean
  onClick?: () => void
}

export interface AdapterPolylineProps {
  path: LatLng[]
  tone?: MapTone
  dashed?: boolean
  /** Stroke width in pixels. */
  width?: number
}

/** A shape managed by the drawing tool. */
export interface DrawShape {
  id: string
  path: LatLng[]
}

export interface AdapterDrawProps {
  /** What a new shape is. */
  kind: "polygon" | "linestring"
  shapes: DrawShape[]
  onChange: (shapes: DrawShape[]) => void
  /** A new shape was completed with the drawing tool (engines that finish shapes themselves). */
  onFinish?: (id: string) => void
  /** `draw` adds a new shape on the next clicks; `edit` lets the user drag vertices. */
  mode: "draw" | "edit" | "view"
  selectedId?: string | null
  onSelect?: (id: string | null) => void
  tone?: MapTone
}

export interface HeatmapPoint {
  position: LatLng
  weight?: number
}

export interface AdapterHeatmapProps {
  points: HeatmapPoint[]
  /** Pixels each point spreads over. */
  radius: number
  intensity: number
  /** Colour ramp, low to high, as `#rrggbb`. */
  colors: string[]
  opacity: number
}

export interface AdapterTrailProps {
  path: LatLng[]
  tone?: MapTone
  width?: number
}

export interface ClusterMarker {
  id: string
  position: LatLng
  title: string
  tone?: MapTone
}

export interface AdapterClusterProps {
  markers: ClusterMarker[]
  selectedId?: string | null
  onMarkerClick?: (id: string) => void
}

/** The engine behind every Onu map component. */
export interface MapAdapter {
  /** Stable id, e.g. `"google"` or `"placeholder"`. */
  name: string
  /** `false` for the keyless placeholder: there is no real map, only a schematic preview. */
  available: boolean
  /** Loads the engine once for the whole subtree (e.g. Google's `APIProvider`). */
  Provider?: React.ComponentType<AdapterProviderProps>
  Map: React.ComponentType<AdapterMapProps>
  Marker: React.ComponentType<AdapterMarkerProps>
  Circle: React.ComponentType<AdapterCircleProps>
  Polygon: React.ComponentType<AdapterPolygonProps>
  Polyline: React.ComponentType<AdapterPolylineProps>
  Draw: React.ComponentType<AdapterDrawProps>
  Heatmap: React.ComponentType<AdapterHeatmapProps>
  Trail: React.ComponentType<AdapterTrailProps>
  Clusters: React.ComponentType<AdapterClusterProps>
  /** Hook: a geocoding search, or `null` when the engine has none. */
  usePlaceSearch: () => PlaceSearch | null
  /** Hook: a routing service, or `null` when the engine has none. */
  useRouteService: () => RouteService | null
}
