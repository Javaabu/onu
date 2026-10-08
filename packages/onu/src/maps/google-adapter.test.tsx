import * as React from "react"
import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderWithOnu } from "../../test/utils"
import { useMapEngine } from "./_context"
import { HeatmapLayer } from "./heatmap-layer"
import { MapProvider } from "./map-provider"
import { MapCircleShape, MapMarker, MapPolygonShape, MapPolylineShape, MapView } from "./map-view"
import type { DrawShape, MapHandle, PlaceSearch, RouteService } from "./types"

// ---------------------------------------------------------------------------
// Module mocks: the Google Maps React bindings, terra-draw, deck.gl, clusterer.
// ---------------------------------------------------------------------------

const h = vi.hoisted(() => {
  const latLng = (lat: number, lng: number) => ({ toJSON: () => ({ lat, lng }), lat: () => lat, lng: () => lng })
  const map = {
    panTo: vi.fn(),
    setZoom: vi.fn(),
    setCenter: vi.fn(),
    fitBounds: vi.fn(),
    getCenter: vi.fn(() => latLng(4.17, 73.5)),
    getBounds: vi.fn(() => ({ toJSON: () => ({ north: 5, south: 4, east: 74, west: 73 }) })),
    getZoom: vi.fn((): number | undefined => 12),
    getProjection: vi.fn((): object | undefined => ({})),
    moveCamera: vi.fn(),
    listeners: {} as Record<string, () => void>,
    addListener: vi.fn((event: string, cb: () => void) => {
      map.listeners[event] = cb
      return { remove: vi.fn() }
    }),
  }
  const once: { event: string; cb: () => void; remove: ReturnType<typeof vi.fn> }[] = []
  return {
    latLng,
    map,
    once,
    props: {} as Record<string, Record<string, unknown>[]>,
    libraries: {} as Record<string, unknown>,
    draws: [] as {
      handlers: Record<string, (...args: unknown[]) => void>
      setMode: ReturnType<typeof vi.fn>
      clear: ReturnType<typeof vi.fn>
      addFeatures: ReturnType<typeof vi.fn>
      selectFeature: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
      started: number
      snapshot: unknown[]
      options: Record<string, unknown>
    }[],
    overlays: [] as {
      setMap: ReturnType<typeof vi.fn>
      setProps: ReturnType<typeof vi.fn>
      finalize: ReturnType<typeof vi.fn>
    }[],
    clusterers: [] as {
      options: { renderer: { render: (c: { count: number; position: unknown }) => unknown } }
      addMarkers: ReturnType<typeof vi.fn>
      clearMarkers: ReturnType<typeof vi.fn>
      setMap: ReturnType<typeof vi.fn>
    }[],
  }
})

function record(name: string, props: Record<string, unknown>) {
  ;(h.props[name] ??= []).push(props)
}
const last = (name: string) => h.props[name]!.at(-1)!

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: (props: { children: React.ReactNode }) => {
    record("APIProvider", props)
    return <>{props.children}</>
  },
  Map: (props: { children: React.ReactNode }) => {
    record("Map", props)
    return <div data-testid="google-map">{props.children}</div>
  },
  AdvancedMarker: (props: { title: string; onClick?: () => void; children: React.ReactNode }) => {
    record("AdvancedMarker", props)
    return (
      <button type="button" aria-label={props.title} onClick={props.onClick}>
        {props.children}
      </button>
    )
  },
  Circle: (props: Record<string, unknown>) => {
    record("Circle", props)
    return null
  },
  Polygon: (props: Record<string, unknown>) => {
    record("Polygon", props)
    return null
  },
  Polyline: (props: Record<string, unknown>) => {
    record("Polyline", props)
    return null
  },
  useMap: () => h.map,
  useMapsLibrary: (name: string) => h.libraries[name] ?? null,
}))

vi.mock("terra-draw", () => {
  class Mode {
    constructor(public options: unknown) {}
  }
  class TerraDraw {
    handlers: Record<string, (...args: unknown[]) => void> = {}
    setMode = vi.fn()
    // Like terra-draw, clearing reports the removed features as a delete.
    clear = vi.fn(() => this.handlers.change?.(["old"], "delete"))
    addFeatures = vi.fn()
    selectFeature = vi.fn()
    stop = vi.fn(() => {
      this.enabled = false
    })
    started = 0
    enabled = false
    snapshot: unknown[] = []
    constructor(public options: Record<string, unknown>) {
      h.draws.push(this)
    }
    on(event: string, cb: (...args: unknown[]) => void) {
      this.handlers[event] = cb
    }
    start() {
      this.started++
      this.enabled = true
      this.handlers.ready?.()
    }
    getSnapshot() {
      return this.snapshot
    }
    hasFeature(id: string) {
      return id === "z1"
    }
  }
  return {
    TerraDraw,
    TerraDrawPolygonMode: Mode,
    TerraDrawLineStringMode: Mode,
    TerraDrawSelectMode: Mode,
    TerraDrawRenderMode: Mode,
  }
})

vi.mock("terra-draw-google-maps-adapter", () => ({
  TerraDrawGoogleMapsAdapter: class {
    constructor(public options: unknown) {}
  },
}))

vi.mock("@deck.gl/google-maps", () => ({
  GoogleMapsOverlay: class {
    setMap = vi.fn()
    setProps = vi.fn()
    finalize = vi.fn()
    constructor() {
      h.overlays.push(this)
    }
  },
}))
vi.mock("@deck.gl/aggregation-layers", () => ({
  HeatmapLayer: class {
    constructor(public props: Record<string, unknown>) {}
  },
}))
vi.mock("@deck.gl/layers", () => ({
  PathLayer: class {
    constructor(public props: Record<string, unknown>) {}
  },
}))

vi.mock("@googlemaps/markerclusterer", () => ({
  MarkerClusterer: class {
    addMarkers = vi.fn()
    clearMarkers = vi.fn()
    setMap = vi.fn()
    constructor(public options: { renderer: { render: (c: { count: number; position: unknown }) => unknown } }) {
      h.clusterers.push(this)
    }
  },
}))

beforeEach(() => {
  for (const key of Object.keys(h.props)) delete h.props[key]
  h.draws.length = 0
  h.overlays.length = 0
  h.clusterers.length = 0
  h.once.length = 0
  for (const key of Object.keys(h.libraries)) delete h.libraries[key]
  vi.clearAllMocks()
  ;(globalThis as unknown as { google: unknown }).google = {
    maps: {
      TravelMode: { DRIVING: "DRIVING" },
      event: {
        addListenerOnce: (_target: unknown, event: string, cb: () => void) => {
          const listener = { event, cb, remove: vi.fn() }
          h.once.push(listener)
          return listener
        },
      },
    },
  }
})

function renderGoogle(ui: React.ReactElement, options: Parameters<typeof renderWithOnu>[1] = {}) {
  return renderWithOnu(ui, { provider: { maps: { googleMapsApiKey: "test-key" } }, ...options })
}

describe("Google Maps adapter", () => {
  it("wraps APIProvider with the key, language and region, and configures the map", () => {
    const onMapClick = vi.fn()
    const onViewChange = vi.fn()
    renderGoogle(<MapView onMapClick={onMapClick} onViewChange={onViewChange} controls={false} />, { locale: "dv" })
    expect(last("APIProvider")).toMatchObject({ apiKey: "test-key", language: "en", region: "MV" })
    const map = last("Map")
    expect(map).toMatchObject({
      mapId: "DEMO_MAP_ID",
      colorScheme: "LIGHT",
      disableDefaultUI: true,
      gestureHandling: "cooperative",
    })
    expect(screen.getByRole("region", { name: "މެޕް" })).toBeInTheDocument()
    ;(map.onClick as (e: unknown) => void)({ detail: { latLng: { lat: 1, lng: 2 } } })
    ;(map.onClick as (e: unknown) => void)({ detail: { latLng: null } })
    expect(onMapClick).toHaveBeenCalledTimes(1)
    ;(map.onIdle as (e: unknown) => void)({ map: h.map })
    expect(onViewChange).toHaveBeenCalledWith({
      center: { lat: 4.17, lng: 73.5 },
      zoom: 12,
      bounds: { north: 5, south: 4, east: 74, west: 73 },
    })
    h.map.getBounds.mockReturnValueOnce(undefined as never)
    ;(map.onIdle as (e: unknown) => void)({ map: h.map })
    expect(onViewChange).toHaveBeenCalledTimes(1)
  })

  it("uses the dark Map ID and colour scheme in dark mode", () => {
    renderGoogle(<MapView />, {
      dark: true,
      provider: { maps: { googleMapsApiKey: "k", mapId: "light", darkMapId: "dark" } },
    })
    expect(last("Map")).toMatchObject({ mapId: "dark", colorScheme: "DARK" })
  })

  it("keeps the camera when the map is recreated for a new colour scheme", () => {
    const { rerender } = renderGoogle(
      <MapProvider colorScheme="light">
        <MapView />
      </MapProvider>,
    )
    expect(h.map.moveCamera).not.toHaveBeenCalled()
    act(() => h.map.listeners.idle!())
    // The camera is fixed at creation; the next map instance starts where this one was.
    rerender(
      <MapProvider colorScheme="dark">
        <MapView />
      </MapProvider>,
    )
    expect(last("Map")).toMatchObject({ colorScheme: "DARK" })
    expect(h.map.moveCamera).toHaveBeenCalledWith({ center: { lat: 4.17, lng: 73.5 }, zoom: 12 })
  })

  it("forwards camera control to the Google map", () => {
    const ref = React.createRef<MapHandle>()
    renderGoogle(<MapView mapRef={ref} />)
    ref.current!.panTo({ lat: 1, lng: 2 }, 15)
    expect(h.map.panTo).toHaveBeenCalledWith({ lat: 1, lng: 2 })
    expect(h.map.setZoom).toHaveBeenCalledWith(15)
    ref.current!.panTo({ lat: 1, lng: 2 })
    expect(h.map.setZoom).toHaveBeenCalledTimes(1)
    ref.current!.fitBounds({ north: 1, south: 0, east: 1, west: 0 })
    expect(h.map.fitBounds).toHaveBeenCalledWith({ north: 1, south: 0, east: 1, west: 0 }, 32)
    expect(ref.current!.getView()!.zoom).toBe(12)
    h.map.getZoom.mockReturnValueOnce(undefined)
    expect(ref.current!.getView()!.zoom).toBe(0)
  })

  it("fits initial bounds once, also when they arrive later, and centres a single point", () => {
    const { rerender } = renderGoogle(<MapView />)
    expect(last("Map")).not.toHaveProperty("defaultBounds")
    expect(h.map.fitBounds).not.toHaveBeenCalled()
    const bounds = { north: 4.3, south: 0.6, east: 73.6, west: 73 }
    rerender(<MapView bounds={bounds} />)
    expect(h.map.fitBounds).toHaveBeenCalledWith(bounds, 48)
    rerender(<MapView bounds={{ north: 5, south: 4, east: 74, west: 73 }} />)
    expect(h.map.fitBounds).toHaveBeenCalledTimes(1)

    renderGoogle(<MapView bounds={{ north: 0.69, south: 0.69, east: 73.15, west: 73.15 }} />)
    expect(h.map.setCenter).toHaveBeenCalledWith({ lat: 0.69, lng: 73.15 })
    expect(h.map.setZoom).toHaveBeenCalledWith(15)
    expect(h.map.fitBounds).toHaveBeenCalledTimes(1)
  })

  it("renders markers and shapes with theme colours", () => {
    const onClick = vi.fn()
    const onDragEnd = vi.fn()
    const onCircle = vi.fn()
    renderGoogle(
      <MapView>
        <MapMarker
          position={{ lat: 1, lng: 1 }}
          title="Pin"
          onClick={onClick}
          draggable
          onDragEnd={onDragEnd}
          selected
        />
        <MapMarker position={{ lat: 1, lng: 1 }} title="Boat" heading={30} />
        <MapCircleShape center={{ lat: 1, lng: 1 }} radius={100} editable onChange={onCircle} />
        <MapPolygonShape path={[{ lat: 0, lng: 0 }]} tone="chart-2" onClick={onClick} />
        <MapPolygonShape path={[{ lat: 0, lng: 0 }]} selected />
        <MapPolylineShape path={[{ lat: 0, lng: 0 }]} dashed />
        <MapPolylineShape path={[{ lat: 0, lng: 0 }]} />
      </MapView>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Pin" }))
    expect(onClick).toHaveBeenCalled()
    const pin = h.props.AdvancedMarker!.find((p) => p.title === "Pin")!
    expect(pin).toMatchObject({ zIndex: 1000, clickable: true, anchorTop: "-100%" })
    ;(pin.onDragEnd as (e: unknown) => void)({ latLng: h.latLng(2, 3) })
    ;(pin.onDragEnd as (e: unknown) => void)({ latLng: null })
    expect(onDragEnd).toHaveBeenCalledWith({ lat: 2, lng: 3 })
    expect(h.props.AdvancedMarker!.find((p) => p.title === "Boat")).toMatchObject({ anchorTop: "-50%" })

    const circle = last("Circle")
    expect(circle).toMatchObject({ editable: true, draggable: true, strokeColor: expect.stringMatching(/^#/) })
    ;(circle.onRadiusChanged as (r: number) => void)(100.2)
    expect(onCircle).not.toHaveBeenCalled()
    ;(circle.onRadiusChanged as (r: number) => void)(150)
    expect(onCircle).toHaveBeenLastCalledWith({ center: { lat: 1, lng: 1 }, radius: 150 })
    ;(circle.onCenterChanged as (c: unknown) => void)(h.latLng(1, 1))
    ;(circle.onCenterChanged as (c: unknown) => void)(null)
    expect(onCircle).toHaveBeenCalledTimes(1)
    ;(circle.onCenterChanged as (c: unknown) => void)(h.latLng(2, 2))
    expect(onCircle).toHaveBeenLastCalledWith({ center: { lat: 2, lng: 2 }, radius: 100 })

    const [poly, selectedPoly] = h.props.Polygon!.slice(-2)
    expect(poly).toMatchObject({ clickable: true, strokeWeight: 2 })
    ;(poly!.onClick as () => void)()
    expect(selectedPoly).toMatchObject({ clickable: false, strokeWeight: 3, onClick: undefined })
    const [dashed, solid] = h.props.Polyline!.slice(-2)
    expect(dashed).toMatchObject({ strokeOpacity: 0 })
    expect(solid).toMatchObject({ strokeOpacity: 1, icons: undefined })
  })

  it("draws with terra-draw and syncs shapes both ways", async () => {
    const onChange = vi.fn()
    const onFinish = vi.fn()
    const onSelect = vi.fn()
    function Draw({ shapes, mode }: { shapes: DrawShape[]; mode: "draw" | "edit" | "view" }) {
      const { adapter } = useMapEngine()
      const D = adapter.Draw
      return (
        <D
          kind="polygon"
          shapes={shapes}
          onChange={onChange}
          onFinish={onFinish}
          onSelect={onSelect}
          mode={mode}
          selectedId="z1"
        />
      )
    }
    const shapes = [
      {
        id: "z1",
        path: [
          { lat: 0, lng: 0 },
          { lat: 0, lng: 1 },
          { lat: 1, lng: 1 },
        ],
      },
    ]
    const { rerender } = renderGoogle(
      <MapView>
        <Draw shapes={shapes} mode="view" />
      </MapView>,
    )
    await waitFor(() => expect(h.draws).toHaveLength(1))
    const draw = h.draws[0]!
    await waitFor(() => expect(draw.addFeatures).toHaveBeenCalled())
    expect(draw.addFeatures.mock.calls[0]![0][0].geometry.coordinates[0]).toHaveLength(4)
    expect(draw.setMode).toHaveBeenLastCalledWith("view")
    // Loading the value into terra-draw is not a user edit.
    expect(onChange).not.toHaveBeenCalled()

    rerender(
      <MapView>
        <Draw shapes={shapes} mode="draw" />
      </MapView>,
    )
    expect(draw.setMode).toHaveBeenLastCalledWith("polygon")
    rerender(
      <MapView>
        <Draw shapes={shapes} mode="edit" />
      </MapView>,
    )
    expect(draw.setMode).toHaveBeenLastCalledWith("select")
    expect(draw.selectFeature).toHaveBeenCalledWith("z1")

    draw.snapshot = [
      {
        id: "z1",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 0],
            ],
          ],
        },
      },
      { id: "line", geometry: { type: "LineString", coordinates: [[0, 0]] } },
    ]
    act(() => draw.handlers.finish!("z1", { action: "draw", mode: "polygon" }))
    expect(onChange).toHaveBeenLastCalledWith([
      {
        id: "z1",
        path: [
          { lat: 0, lng: 0 },
          { lat: 0, lng: 1 },
          { lat: 1, lng: 1 },
        ],
      },
    ])
    expect(onFinish).toHaveBeenCalledWith("z1")
    act(() => draw.handlers.finish!("z1", { action: "dragCoordinate", mode: "select" }))
    expect(onFinish).toHaveBeenCalledTimes(1)
    act(() => draw.handlers.change!(["z1"], "update"))
    expect(onChange).toHaveBeenCalledTimes(2)
    act(() => draw.handlers.change!(["z1"], "delete"))
    expect(onChange).toHaveBeenCalledTimes(3)
    act(() => draw.handlers.select!("z1"))
    expect(onSelect).toHaveBeenLastCalledWith("z1")
    act(() => draw.handlers.deselect!("z1"))
    expect(onSelect).toHaveBeenLastCalledWith(null)
  })

  it("draws line strings", async () => {
    const onChange = vi.fn()
    function Draw() {
      const { adapter } = useMapEngine()
      const D = adapter.Draw
      return (
        <D
          kind="linestring"
          shapes={[
            {
              id: "r",
              path: [
                { lat: 0, lng: 0 },
                { lat: 1, lng: 1 },
              ],
            },
          ]}
          onChange={onChange}
          mode="draw"
        />
      )
    }
    const { unmount } = renderGoogle(
      <MapView>
        <Draw />
      </MapView>,
    )
    await waitFor(() => expect(h.draws[0]?.addFeatures).toHaveBeenCalled())
    const draw = h.draws[0]!
    expect(draw.addFeatures.mock.calls[0]![0][0].geometry.type).toBe("LineString")
    expect(draw.setMode).toHaveBeenLastCalledWith("linestring")
    draw.snapshot = [
      {
        id: "r",
        geometry: {
          type: "LineString",
          coordinates: [
            [0, 0],
            [2, 2],
          ],
        },
      },
    ]
    act(() => draw.handlers.finish!("r", { action: "draw" }))
    expect(onChange).toHaveBeenLastCalledWith([
      {
        id: "r",
        path: [
          { lat: 0, lng: 0 },
          { lat: 2, lng: 2 },
        ],
      },
    ])
    unmount()
    expect(draw.stop).toHaveBeenCalled()
  })

  it("reloads the shapes into a new terra-draw instance when the tone changes", async () => {
    const shapes = [
      {
        id: "z1",
        path: [
          { lat: 0, lng: 0 },
          { lat: 0, lng: 1 },
          { lat: 1, lng: 1 },
        ],
      },
    ]
    function Draw({ tone }: { tone: "primary" | "chart-2" }) {
      const { adapter } = useMapEngine()
      const D = adapter.Draw
      return <D kind="polygon" shapes={shapes} onChange={() => {}} mode="view" tone={tone} />
    }
    const { rerender } = renderGoogle(
      <MapView>
        <Draw tone="primary" />
      </MapView>,
    )
    await waitFor(() => expect(h.draws[0]?.addFeatures).toHaveBeenCalledTimes(1))
    rerender(
      <MapView>
        <Draw tone="chart-2" />
      </MapView>,
    )
    await waitFor(() => expect(h.draws[1]?.addFeatures).toHaveBeenCalledTimes(1))
    expect(h.draws[0]!.stop).toHaveBeenCalled()
    expect(h.draws[1]!.addFeatures.mock.calls[0]![0][0].id).toBe("z1")
  })

  it("starts terra-draw only once the map has a projection", async () => {
    function Draw() {
      const { adapter } = useMapEngine()
      const D = adapter.Draw
      return <D kind="polygon" shapes={[]} onChange={() => {}} mode="draw" />
    }
    h.map.getProjection.mockReturnValue(undefined)
    const { unmount } = renderGoogle(
      <MapView>
        <Draw />
      </MapView>,
    )
    await waitFor(() => expect(h.once).toHaveLength(1))
    const draw = h.draws[0]!
    expect(h.once[0]!.event).toBe("projection_changed")
    expect(draw.started).toBe(0)
    act(() => h.once[0]!.cb())
    expect(draw.started).toBe(1)
    expect(draw.setMode).toHaveBeenLastCalledWith("polygon")
    unmount()
    expect(draw.stop).toHaveBeenCalledTimes(1)

    // Unmounted before the map is ready: the listener goes, and terra-draw never starts.
    const second = renderGoogle(
      <MapView>
        <Draw />
      </MapView>,
    )
    await waitFor(() => expect(h.once).toHaveLength(2))
    second.unmount()
    expect(h.once[1]!.remove).toHaveBeenCalled()
    expect(h.draws[1]!.started).toBe(0)
    expect(h.draws[1]!.stop).not.toHaveBeenCalled()
    h.map.getProjection.mockReturnValue({})
  })

  it("renders heatmaps and trails with deck.gl's GoogleMapsOverlay", async () => {
    function Trail({ n }: { n: number }) {
      const { adapter } = useMapEngine()
      const T = adapter.Trail
      return <T path={Array.from({ length: n }, (_, i) => ({ lat: i, lng: i }))} />
    }
    const { rerender, unmount } = renderGoogle(
      <MapView>
        <HeatmapLayer points={[{ position: { lat: 1, lng: 2 }, weight: 2 }, { position: { lat: 1, lng: 2 } }]} />
        <Trail n={1} />
      </MapView>,
    )
    await waitFor(() => expect(h.overlays).toHaveLength(2))
    rerender(
      <MapView>
        <HeatmapLayer points={[{ position: { lat: 1, lng: 2 }, weight: 2 }, { position: { lat: 1, lng: 2 } }]} />
        <Trail n={3} />
      </MapView>,
    )
    const [heat, trail] = h.overlays
    expect(heat!.setMap).toHaveBeenCalledWith(h.map)
    const heatLayer = heat!.setProps.mock.calls.at(-1)![0].layers[0].props
    expect(heatLayer.radiusPixels).toBe(30)
    expect(heatLayer.colorRange[0]).toHaveLength(3)
    expect(heatLayer.getPosition({ position: { lat: 1, lng: 2 } })).toEqual([2, 1])
    expect(heatLayer.getWeight({ position: { lat: 1, lng: 2 } })).toBe(1)
    expect(heatLayer.getWeight({ position: { lat: 1, lng: 2 }, weight: 5 })).toBe(5)
    const trailLayer = trail!.setProps.mock.calls.at(-1)![0].layers[0].props
    expect(trailLayer.getPath(trailLayer.data[0])).toHaveLength(3)
    expect(trail!.setProps.mock.calls.some((c) => c[0].layers.length === 0)).toBe(true)
    unmount()
    expect(heat!.finalize).toHaveBeenCalled()
  })

  it("clusters markers with @googlemaps/markerclusterer", async () => {
    class AdvancedMarkerElement {
      listeners: Record<string, () => void> = {}
      constructor(public options: Record<string, unknown>) {}
      addEventListener(name: string, cb: () => void) {
        this.listeners[name] = cb
      }
    }
    class PinElement {
      constructor(public options: Record<string, unknown>) {}
    }
    h.libraries.marker = { AdvancedMarkerElement, PinElement }
    const onMarkerClick = vi.fn()
    function Clusters() {
      const { adapter } = useMapEngine()
      const C = adapter.Clusters
      return (
        <C
          markers={[
            { id: "a", position: { lat: 1, lng: 1 }, title: "A" },
            { id: "b", position: { lat: 1, lng: 1 }, title: "B", tone: "info" },
          ]}
          selectedId="a"
          onMarkerClick={onMarkerClick}
        />
      )
    }
    const { unmount } = renderGoogle(
      <MapView>
        <Clusters />
      </MapView>,
    )
    await waitFor(() => expect(h.clusterers[0]?.addMarkers).toHaveBeenCalled())
    const clusterer = h.clusterers[0]!
    const markers = clusterer.addMarkers.mock.calls[0]![0] as AdvancedMarkerElement[]
    expect(markers).toHaveLength(2)
    expect(markers[0]!.options.content).toBeInstanceOf(PinElement)
    markers[1]!.listeners["gmp-click"]!()
    expect(onMarkerClick).toHaveBeenCalledWith("b")
    const cluster = clusterer.options.renderer.render({
      count: 7,
      position: { lat: 1, lng: 1 },
    }) as AdvancedMarkerElement
    expect((cluster.options.content as HTMLElement).textContent).toBe("7")
    unmount()
    expect(clusterer.setMap).toHaveBeenCalledWith(null)
  })

  it("searches with the Geocoder and aborts", async () => {
    h.libraries.geocoding = {
      Geocoder: class {
        geocode = vi.fn(async () => ({
          results: [{ place_id: "p1", formatted_address: "Malé", geometry: { location: h.latLng(4.17, 73.5) } }],
        }))
      },
    }
    let search: PlaceSearch | null = null
    function Probe() {
      search = useMapEngine().adapter.usePlaceSearch()
      return null
    }
    renderGoogle(
      <MapProvider>
        <Probe />
      </MapProvider>,
    )
    const results = await search!("male", { signal: new AbortController().signal })
    expect(results).toEqual([{ id: "p1", label: "Malé", position: { lat: 4.17, lng: 73.5 } }])
    const ac = new AbortController()
    ac.abort()
    await expect(search!("x", { signal: ac.signal })).rejects.toThrow("Aborted")
    const ac2 = new AbortController()
    const pending = search!("x", { signal: ac2.signal })
    ac2.abort()
    await expect(pending).rejects.toThrow("Aborted")
  })

  it("routes with the Directions service", async () => {
    const route = vi.fn(async (_request: Record<string, unknown>) => ({
      routes: [
        {
          overview_path: [h.latLng(0, 0), h.latLng(1, 1)],
          legs: [
            {
              start_location: h.latLng(0, 0),
              end_location: h.latLng(1, 1),
              distance: { value: 1200 },
              duration: { value: 300 },
              steps: [
                {
                  instructions: "Head <b>north</b>",
                  distance: { value: 1200 },
                  duration: { value: 300 },
                  start_location: h.latLng(0, 0),
                },
              ],
            },
            {
              start_location: h.latLng(1, 1),
              end_location: h.latLng(2, 2),
              steps: [{ instructions: "", start_location: h.latLng(1, 1) }],
            },
          ],
        },
      ],
    }))
    h.libraries.routes = {
      DirectionsService: class {
        route = route
      },
    }
    let service: RouteService | null = null
    function Probe() {
      service = useMapEngine().adapter.useRouteService()
      return null
    }
    renderGoogle(
      <MapProvider>
        <Probe />
      </MapProvider>,
    )
    const signal = new AbortController().signal
    const result = await service!(
      [
        { lat: 0, lng: 0 },
        { lat: 0.5, lng: 0.5 },
        { lat: 1, lng: 1 },
      ],
      { signal },
    )
    expect(route.mock.calls[0]![0]).toMatchObject({
      travelMode: "DRIVING",
      waypoints: [{ location: { lat: 0.5, lng: 0.5 }, stopover: true }],
    })
    expect(result.source).toBe("service")
    expect(result.legs[0]!.steps[0]!.instruction).toBe("Head north")
    expect(result.legs[1]!.distance).toBe(0)
    expect(await service!([{ lat: 0, lng: 0 }], { signal })).toMatchObject({ source: "straight", legs: [] })
    route.mockResolvedValueOnce({ routes: [] } as never)
    await expect(
      service!(
        [
          { lat: 0, lng: 0 },
          { lat: 1, lng: 1 },
        ],
        { signal },
      ),
    ).rejects.toThrow("No route")
  })
})
