/// <reference types="google.maps" />
"use client"

import * as React from "react"
import {
  AdvancedMarker,
  APIProvider,
  Circle,
  Map as GoogleMap,
  Polygon,
  Polyline,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps"

import type { Layer } from "@deck.gl/core"

import { cn } from "../lib/utils"
import { hexToRgb, toneVar } from "./_colors"
import { MarkerArrow, MarkerPin } from "./_marker-glyphs"
import { fromPosition, INITIAL_FIT_PADDING, isPointBounds, SINGLE_POINT_ZOOM, toPosition } from "./geo"
import { useMapEngine } from "./_context"
import type {
  AdapterCircleProps,
  AdapterClusterProps,
  AdapterDrawProps,
  AdapterHeatmapProps,
  AdapterMapProps,
  AdapterMarkerProps,
  AdapterPolygonProps,
  AdapterPolylineProps,
  AdapterProviderProps,
  AdapterTrailProps,
  DrawShape,
  LatLng,
  LatLngBounds,
  MapAdapter,
  MapHandle,
  MapViewState,
  PlaceSearch,
  RouteResult,
  RouteService,
} from "./types"

/*
 * Google Maps engine (R16.9), on @vis.gl/react-google-maps. Drawing uses
 * terra-draw and heatmaps/trails use deck.gl; Google's deprecated Drawing
 * Library and HeatmapLayer are never used. Heavy modules load on demand.
 */

/** Google's demo Map ID: enables advanced markers and colour schemes when no Map ID is configured. */
export const DEMO_MAP_ID = "DEMO_MAP_ID"

function GoogleProvider({ apiKey, language, region, children }: AdapterProviderProps) {
  return (
    <APIProvider apiKey={apiKey ?? ""} language={language} region={region}>
      {children}
    </APIProvider>
  )
}

function viewOf(map: google.maps.Map): MapViewState | null {
  const center = map.getCenter()
  const bounds = map.getBounds()
  if (!center || !bounds) return null
  return { center: center.toJSON(), zoom: map.getZoom() ?? 0, bounds: bounds.toJSON() }
}

function HandleBinder({ handleRef }: { handleRef?: React.Ref<MapHandle> }) {
  const map = useMap()
  React.useImperativeHandle(
    handleRef,
    (): MapHandle => ({
      panTo: (position, zoom) => {
        map?.panTo(position)
        if (zoom !== undefined) map?.setZoom(zoom)
      },
      fitBounds: (bounds, padding = 32) => map?.fitBounds(bounds, padding),
      getView: () => (map ? viewOf(map) : null),
    }),
    [map],
  )
  return null
}

/**
 * Fits `bounds` once, as soon as both the map and the bounds exist: on creation, or
 * later when the points load. A single point is centred instead of zoomed all the way in.
 */
function InitialFit({ bounds, doneRef }: { bounds?: LatLngBounds; doneRef: React.RefObject<boolean> }) {
  const map = useMap()
  React.useEffect(() => {
    if (!map || !bounds || doneRef.current) return
    doneRef.current = true
    if (isPointBounds(bounds)) {
      map.setCenter({ lat: bounds.north, lng: bounds.east })
      map.setZoom(SINGLE_POINT_ZOOM)
    } else {
      map.fitBounds(bounds, INITIAL_FIT_PADDING)
    }
  }, [map, bounds, doneRef])
  return null
}

type Camera = { center: LatLng; zoom: number }

/**
 * Remembers the camera across map instances. The map is recreated when the colour
 * scheme or Map ID changes (both are fixed at creation), and should reopen where the
 * user left it instead of jumping back to the initial centre and zoom.
 */
function CameraMemory({ memory }: { memory: React.RefObject<Camera | null> }) {
  const map = useMap()
  React.useEffect(() => {
    if (!map) return
    if (memory.current) map.moveCamera(memory.current)
    const listener = map.addListener("idle", () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      if (center && zoom !== undefined) memory.current = { center: center.toJSON(), zoom }
    })
    return () => listener.remove()
  }, [map, memory])
  return null
}

function GoogleMapView({
  label,
  defaultCenter,
  defaultZoom,
  defaultBounds,
  colorScheme,
  mapId,
  onClick,
  onViewChange,
  controls = true,
  gestureHandling = "cooperative",
  handleRef,
  className,
  children,
}: AdapterMapProps) {
  // Outside the keyed map, so switching light/dark keeps the camera and doesn't fit again.
  const fitted = React.useRef(false)
  const camera = React.useRef<Camera | null>(null)
  return (
    <div role="region" aria-label={label} data-slot="google-map" className={cn("relative size-full", className)}>
      <GoogleMap
        // Map ID and colour scheme are fixed when the map is created.
        key={`${mapId || DEMO_MAP_ID}-${colorScheme}`}
        mapId={mapId || DEMO_MAP_ID}
        colorScheme={colorScheme === "dark" ? "DARK" : "LIGHT"}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        gestureHandling={gestureHandling}
        disableDefaultUI={!controls}
        clickableIcons={false}
        reuseMaps
        className="size-full"
        onClick={(e) => {
          const p = e.detail.latLng
          if (p) onClick?.(p)
        }}
        onIdle={(e) => {
          const view = viewOf(e.map)
          if (view) onViewChange?.(view)
        }}
      >
        <CameraMemory memory={camera} />
        <HandleBinder handleRef={handleRef} />
        <InitialFit bounds={defaultBounds} doneRef={fitted} />
        {children}
      </GoogleMap>
    </div>
  )
}

function GoogleMarker({
  position,
  title,
  label,
  tone = "primary",
  selected,
  heading,
  draggable,
  onDragEnd,
  onClick,
  zIndex,
}: AdapterMarkerProps) {
  const color = toneVar(tone)
  const arrow = heading !== undefined
  return (
    <AdvancedMarker
      position={position}
      title={title}
      draggable={draggable}
      clickable={!!onClick}
      onClick={onClick ? () => onClick() : undefined}
      onDragEnd={(e) => {
        if (e.latLng) onDragEnd?.(e.latLng.toJSON())
      }}
      zIndex={selected ? 1000 : zIndex}
      anchorLeft="-50%"
      anchorTop={arrow ? "-50%" : "-100%"}
    >
      {arrow ? (
        <MarkerArrow tone={color} heading={heading} />
      ) : (
        <MarkerPin tone={color} label={label} selected={selected} />
      )}
    </AdvancedMarker>
  )
}

function GoogleCircle({ center, radius, tone = "primary", editable, onChange }: AdapterCircleProps) {
  const { colors } = useMapEngine()
  const color = colors[tone]
  const latest = React.useRef({ center, radius })
  React.useEffect(() => {
    latest.current = { center, radius }
  }, [center, radius])
  return (
    <Circle
      center={center}
      radius={radius}
      editable={editable}
      draggable={editable}
      strokeColor={color}
      strokeWeight={2}
      fillColor={color}
      fillOpacity={0.15}
      onRadiusChanged={(r) => {
        if (Math.abs(r - latest.current.radius) > 0.5) onChange?.({ center: latest.current.center, radius: r })
      }}
      onCenterChanged={(c) => {
        const next = c?.toJSON()
        if (next && (next.lat !== latest.current.center.lat || next.lng !== latest.current.center.lng))
          onChange?.({ center: next, radius: latest.current.radius })
      }}
    />
  )
}

function GooglePolygon({ path, tone = "primary", selected, onClick }: AdapterPolygonProps) {
  const { colors } = useMapEngine()
  const color = colors[tone]
  return (
    <Polygon
      paths={path}
      strokeColor={color}
      strokeWeight={selected ? 3 : 2}
      fillColor={color}
      fillOpacity={selected ? 0.35 : 0.2}
      clickable={!!onClick}
      onClick={onClick ? () => onClick() : undefined}
    />
  )
}

function GooglePolyline({ path, tone = "primary", dashed, width = 4 }: AdapterPolylineProps) {
  const { colors } = useMapEngine()
  const color = colors[tone]
  const dash: google.maps.IconSequence[] | undefined = dashed
    ? [
        {
          icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: color, scale: width },
          offset: "0",
          repeat: `${width * 4}px`,
        },
      ]
    : undefined
  return (
    <Polyline
      path={path}
      strokeColor={color}
      strokeOpacity={dashed ? 0 : 1}
      strokeWeight={width}
      icons={dash}
      clickable={false}
    />
  )
}

// ---------------------------------------------------------------------------
// Drawing: terra-draw + its Google Maps adapter
// ---------------------------------------------------------------------------

type TerraDrawModule = typeof import("terra-draw")
type TerraDrawInstance = InstanceType<TerraDrawModule["TerraDraw"]>
type DrawFeature = ReturnType<TerraDrawInstance["getSnapshot"]>[number]

function shapesFromSnapshot(features: DrawFeature[], kind: "polygon" | "linestring"): DrawShape[] {
  return features
    .filter((f) => (kind === "polygon" ? f.geometry.type === "Polygon" : f.geometry.type === "LineString"))
    .map((f) => {
      const coords = (
        f.geometry.type === "Polygon" ? (f.geometry.coordinates[0] ?? []).slice(0, -1) : f.geometry.coordinates
      ) as number[][]
      return { id: String(f.id), path: coords.map(fromPosition) }
    })
}

function toFeatures(shapes: DrawShape[], kind: "polygon" | "linestring") {
  return shapes
    .filter((s) => s.path.length >= (kind === "polygon" ? 3 : 2))
    .map((s) => {
      const coords = s.path.map(toPosition)
      return {
        id: s.id,
        type: "Feature" as const,
        properties: { mode: kind },
        geometry:
          kind === "polygon"
            ? { type: "Polygon" as const, coordinates: [[...coords, coords[0]!]] }
            : { type: "LineString" as const, coordinates: coords },
      }
    })
}

function GoogleDraw({
  kind,
  shapes,
  onChange,
  onFinish,
  mode,
  selectedId,
  onSelect,
  tone = "primary",
}: AdapterDrawProps) {
  const map = useMap()
  const { colors } = useMapEngine()
  const [draw, setDraw] = React.useState<TerraDrawInstance | null>(null)
  const lastEmitted = React.useRef<string>("")
  // Set while the value is pushed into terra-draw: its `clear()` reports a delete,
  // which must not be echoed back as the user removing every shape.
  const syncing = React.useRef(false)
  const callbacks = React.useRef({ onChange, onSelect, onFinish })
  React.useEffect(() => {
    callbacks.current = { onChange, onSelect, onFinish }
  })
  const color = colors[tone]

  React.useEffect(() => {
    if (!map) return
    let cancelled = false
    let instance: TerraDrawInstance | null = null
    let waitForProjection: google.maps.MapsEventListener | null = null
    Promise.all([import("terra-draw"), import("terra-draw-google-maps-adapter")]).then(([td, tdg]) => {
      if (cancelled) return
      const lineStyles = { lineStringColor: color as `#${string}`, lineStringWidth: 4 }
      const polygonStyles = {
        fillColor: color as `#${string}`,
        outlineColor: color as `#${string}`,
        outlineWidth: 2,
        fillOpacity: 0.2,
      }
      let counter = 0
      instance = new td.TerraDraw({
        adapter: new tdg.TerraDrawGoogleMapsAdapter({ lib: google.maps, map, coordinatePrecision: 9 }),
        idStrategy: {
          isValidId: (id) => typeof id === "string" && id.length > 0,
          getId: () => `shape-${Date.now().toString(36)}-${counter++}`,
        },
        modes: [
          new td.TerraDrawPolygonMode({ styles: polygonStyles }),
          new td.TerraDrawLineStringMode({ styles: lineStyles }),
          new td.TerraDrawSelectMode({
            flags: {
              polygon: {
                feature: { draggable: true, coordinates: { midpoints: true, draggable: true, deletable: true } },
              },
              linestring: {
                feature: { draggable: true, coordinates: { midpoints: true, draggable: true, deletable: true } },
              },
            },
            styles: {
              selectedPolygonColor: color as `#${string}`,
              selectedPolygonOutlineColor: color as `#${string}`,
              selectedLineStringColor: color as `#${string}`,
              selectionPointColor: color as `#${string}`,
              midPointColor: color as `#${string}`,
            },
          }),
          new td.TerraDrawRenderMode({
            modeName: "view",
            styles: {
              ...polygonStyles,
              polygonFillColor: color as `#${string}`,
              polygonOutlineColor: color as `#${string}`,
              polygonFillOpacity: 0.2,
              lineStringColor: color as `#${string}`,
              lineStringWidth: 4,
            },
          }),
        ],
      })
      const emit = () => {
        if (!instance) return
        const next = shapesFromSnapshot(instance.getSnapshot(), kind)
        lastEmitted.current = JSON.stringify(next)
        callbacks.current.onChange(next)
      }
      instance.on("finish", (id, context) => {
        emit()
        if (context.action === "draw") callbacks.current.onFinish?.(String(id))
      })
      instance.on("change", (_ids, type) => {
        if (type === "delete" && !syncing.current) emit()
      })
      instance.on("select", (id) => callbacks.current.onSelect?.(String(id)))
      instance.on("deselect", () => callbacks.current.onSelect?.(null))
      instance.on("ready", () => !cancelled && setDraw(instance))
      // terra-draw binds its pointer listeners to the map's rendered panes, which only
      // exist once the map has a projection. Starting earlier throws inside terra-draw.
      if (map.getProjection()) instance.start()
      else
        waitForProjection = google.maps.event.addListenerOnce(map, "projection_changed", () => {
          waitForProjection = null
          if (!cancelled) instance?.start()
        })
    })
    return () => {
      cancelled = true
      waitForProjection?.remove()
      if (instance?.enabled) instance.stop()
      // The next instance (new tone or kind) starts empty: load the shapes into it again.
      lastEmitted.current = ""
      setDraw(null)
    }
  }, [map, kind, color])

  // Push external value changes into terra-draw.
  React.useEffect(() => {
    if (!draw) return
    const serialized = JSON.stringify(shapes)
    if (serialized === lastEmitted.current) return
    lastEmitted.current = serialized
    syncing.current = true
    try {
      draw.clear()
      draw.addFeatures(toFeatures(shapes, kind) as Parameters<TerraDrawInstance["addFeatures"]>[0])
    } finally {
      syncing.current = false
    }
  }, [draw, shapes, kind])

  React.useEffect(() => {
    if (!draw) return
    draw.setMode(mode === "draw" ? kind : mode === "edit" ? "select" : "view")
  }, [draw, mode, kind])

  React.useEffect(() => {
    if (!draw || mode !== "edit" || !selectedId || !draw.hasFeature(selectedId)) return
    draw.selectFeature(selectedId)
  }, [draw, mode, selectedId])

  return null
}

// ---------------------------------------------------------------------------
// deck.gl overlays (heatmap, trail)
// ---------------------------------------------------------------------------

type DeckModules = {
  GoogleMapsOverlay: typeof import("@deck.gl/google-maps").GoogleMapsOverlay
  HeatmapLayer: typeof import("@deck.gl/aggregation-layers").HeatmapLayer
  PathLayer: typeof import("@deck.gl/layers").PathLayer
}

let deckPromise: Promise<DeckModules> | null = null
function loadDeck() {
  deckPromise ??= Promise.all([
    import("@deck.gl/google-maps"),
    import("@deck.gl/aggregation-layers"),
    import("@deck.gl/layers"),
  ]).then(([gm, agg, layers]) => ({
    GoogleMapsOverlay: gm.GoogleMapsOverlay,
    HeatmapLayer: agg.HeatmapLayer,
    PathLayer: layers.PathLayer,
  }))
  return deckPromise
}

type DeckLayer = Layer

/** Keeps one deck.gl `GoogleMapsOverlay` on the map with the layer `build` returns. */
function useDeckLayer(build: (deck: DeckModules) => DeckLayer | null) {
  const map = useMap()
  const [deck, setDeck] = React.useState<DeckModules | null>(null)
  const overlay = React.useRef<InstanceType<DeckModules["GoogleMapsOverlay"]> | null>(null)

  React.useEffect(() => {
    let cancelled = false
    loadDeck().then((m) => !cancelled && setDeck(m))
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!map || !deck) return
    const instance = new deck.GoogleMapsOverlay({ layers: [] })
    instance.setMap(map)
    overlay.current = instance
    return () => {
      overlay.current = null
      instance.setMap(null)
      instance.finalize()
    }
  }, [map, deck])

  // Runs after the effect above on every render, so the overlay always shows the latest data.
  React.useEffect(() => {
    if (!overlay.current || !deck) return
    const layer = build(deck)
    overlay.current.setProps({ layers: layer ? [layer] : [] })
  })
}

function GoogleHeatmap({ points, radius, intensity, colors, opacity }: AdapterHeatmapProps) {
  useDeckLayer(
    ({ HeatmapLayer }) =>
      new HeatmapLayer<(typeof points)[number]>({
        id: "onu-heatmap",
        data: points,
        getPosition: (p) => [p.position.lng, p.position.lat],
        getWeight: (p) => p.weight ?? 1,
        radiusPixels: radius,
        intensity,
        opacity,
        colorRange: colors.map(hexToRgb),
      }) as unknown as Layer,
  )
  return null
}

function GoogleTrail({ path, tone = "primary", width = 4 }: AdapterTrailProps) {
  const { colors } = useMapEngine()
  const color = hexToRgb(colors[tone])
  useDeckLayer(({ PathLayer }) =>
    path.length < 2
      ? null
      : (new PathLayer<{ path: [number, number][] }>({
          id: "onu-trail",
          data: [{ path: path.map(toPosition) }],
          getPath: (d) => d.path,
          getColor: color,
          getWidth: width,
          widthUnits: "pixels",
          capRounded: true,
          jointRounded: true,
        }) as unknown as Layer),
  )
  return null
}

// ---------------------------------------------------------------------------
// Clustering: @googlemaps/markerclusterer
// ---------------------------------------------------------------------------

type ClustererModule = typeof import("@googlemaps/markerclusterer")

function GoogleClusters({ markers, selectedId, onMarkerClick }: AdapterClusterProps) {
  const map = useMap()
  const markerLib = useMapsLibrary("marker")
  const { colors } = useMapEngine()
  const [clusterer, setClusterer] = React.useState<InstanceType<ClustererModule["MarkerClusterer"]> | null>(null)
  const clickRef = React.useRef(onMarkerClick)
  React.useEffect(() => {
    clickRef.current = onMarkerClick
  })

  React.useEffect(() => {
    if (!map || !markerLib) return
    let cancelled = false
    let instance: InstanceType<ClustererModule["MarkerClusterer"]> | null = null
    import("@googlemaps/markerclusterer").then(({ MarkerClusterer }) => {
      if (cancelled) return
      instance = new MarkerClusterer({
        map,
        renderer: {
          render: ({ count, position }) => {
            const el = document.createElement("div")
            el.className =
              "bg-primary text-primary-foreground ring-background flex size-9 items-center justify-center rounded-full text-xs font-semibold shadow-md ring-4"
            el.textContent = String(count)
            return new markerLib.AdvancedMarkerElement({
              position,
              content: el,
              title: String(count),
              zIndex: 1000 + count,
            })
          },
        },
      })
      setClusterer(instance)
    })
    return () => {
      cancelled = true
      instance?.clearMarkers()
      instance?.setMap(null)
      setClusterer(null)
    }
  }, [map, markerLib])

  React.useEffect(() => {
    if (!clusterer || !markerLib) return
    const elements = markers.map((m) => {
      const pin = new markerLib.PinElement({
        background: colors[m.tone ?? "primary"],
        borderColor: colors.background,
        glyphColor: colors.background,
        scale: m.id === selectedId ? 1.25 : 1,
      })
      // PinElement is itself the marker content (`pin.element` is deprecated), and
      // `gmp-click` replaces the deprecated `addListener("click")`.
      const el = new markerLib.AdvancedMarkerElement({
        position: m.position,
        title: m.title,
        content: pin,
        gmpClickable: true,
      })
      el.addEventListener("gmp-click", () => clickRef.current?.(m.id))
      return el
    })
    clusterer.clearMarkers()
    clusterer.addMarkers(elements)
    return () => {
      clusterer.clearMarkers()
    }
  }, [clusterer, markerLib, markers, selectedId, colors])

  return null
}

// ---------------------------------------------------------------------------
// Services: geocoding search and routes
// ---------------------------------------------------------------------------

function abortable<T>(promise: Promise<T>, signal: AbortSignal) {
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"))
    if (signal.aborted) return onAbort()
    signal.addEventListener("abort", onAbort, { once: true })
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort))
  })
}

function useGooglePlaceSearch(): PlaceSearch | null {
  const geocoding = useMapsLibrary("geocoding")
  return React.useMemo(() => {
    if (!geocoding) return null
    const geocoder = new geocoding.Geocoder()
    return async (query, { signal }) => {
      const { results } = await abortable(geocoder.geocode({ address: query, region: "mv" }), signal)
      return results.map((r) => ({
        id: r.place_id,
        label: r.formatted_address,
        position: r.geometry.location.toJSON(),
      }))
    }
  }, [geocoding])
}

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html")
  return doc.body.textContent ?? ""
}

function useGoogleRouteService(): RouteService | null {
  const routes = useMapsLibrary("routes")
  return React.useMemo(() => {
    if (!routes) return null
    const service = new routes.DirectionsService()
    return async (stops, { signal }): Promise<RouteResult> => {
      const [origin, ...rest] = stops
      const destination = rest.pop()
      if (!origin || !destination) return { path: stops, legs: [], source: "straight" }
      const result = await abortable(
        service.route({
          origin,
          destination,
          waypoints: rest.map((location) => ({ location, stopover: true })),
          travelMode: google.maps.TravelMode.DRIVING,
        }),
        signal,
      )
      const route = result.routes[0]
      if (!route) throw new Error("No route")
      const toLatLng = (p: google.maps.LatLng): LatLng => p.toJSON()
      return {
        source: "service",
        path: route.overview_path.map(toLatLng),
        legs: route.legs.map((leg) => ({
          from: toLatLng(leg.start_location),
          to: toLatLng(leg.end_location),
          distance: leg.distance?.value ?? 0,
          duration: leg.duration?.value,
          steps: leg.steps.map((s) => ({
            instruction: stripHtml(s.instructions),
            distance: s.distance?.value ?? 0,
            duration: s.duration?.value,
            start: toLatLng(s.start_location),
          })),
        })),
      }
    }
  }, [routes])
}

/** The default engine when an API key is configured. */
export const googleMapsAdapter: MapAdapter = {
  name: "google",
  available: true,
  Provider: GoogleProvider,
  Map: GoogleMapView,
  Marker: GoogleMarker,
  Circle: GoogleCircle,
  Polygon: GooglePolygon,
  Polyline: GooglePolyline,
  Draw: GoogleDraw,
  Heatmap: GoogleHeatmap,
  Trail: GoogleTrail,
  Clusters: GoogleClusters,
  usePlaceSearch: useGooglePlaceSearch,
  useRouteService: useGoogleRouteService,
}
