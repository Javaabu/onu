import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { useMapEngine } from "./_context"
import { placeholderAdapter } from "./_placeholder-adapter"
import { HeatmapLayer } from "./heatmap-layer"
import { MapProvider, mapLanguage, useMapContext } from "./map-provider"
import { MALE, MapCircleShape, MapMarker, MapPolygonShape, MapPolylineShape, MapView } from "./map-view"
import type { MapAdapter, MapHandle, MapViewState } from "./types"

// jsdom has no layout: the placeholder uses its default 640×360 viewport, positioned at 0,0.
const CENTER_X = 320
const CENTER_Y = 180

function region() {
  return screen.getByRole("region", { name: "Map" })
}

describe("MapProvider", () => {
  it("uses the keyless placeholder without an API key", () => {
    let engine = ""
    function Probe() {
      engine = useMapEngine().adapter.name
      return null
    }
    renderWithOnu(
      <MapProvider>
        <Probe />
      </MapProvider>,
    )
    expect(engine).toBe("placeholder")
  })

  it("picks the Map ID for the colour scheme and the map language for the locale", () => {
    const seen: ReturnType<typeof useMapContext>[] = []
    function Probe() {
      seen.push(useMapContext())
      return null
    }
    const custom: MapAdapter = { ...placeholderAdapter, name: "custom" }
    renderWithOnu(
      <MapProvider adapter={custom} colorScheme="dark">
        <Probe />
      </MapProvider>,
      { locale: "dv", provider: { maps: { mapId: "light-id", darkMapId: "dark-id" } } },
    )
    const ctx = seen.at(-1)!
    expect(ctx.adapter.name).toBe("custom")
    expect(ctx.mapId).toBe("dark-id")
    expect(ctx.colorScheme).toBe("dark")
    // Google has no Dhivehi tiles: fall back to English.
    expect(ctx.language).toBe("en")
    expect(mapLanguage("en-GB")).toBe("en-GB")
    expect(mapLanguage("dv-MV")).toBe("en")
  })

  it("follows the page's dark mode", () => {
    const schemes: string[] = []
    function Probe() {
      schemes.push(useMapEngine().colorScheme)
      return null
    }
    renderWithOnu(
      <MapProvider mapId="a">
        <Probe />
      </MapProvider>,
      { dark: true },
    )
    expect(schemes.at(-1)).toBe("dark")
  })

  it("throws a helpful error outside a provider", () => {
    function Probe() {
      useMapEngine()
      return null
    }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderWithOnu(<Probe />)).toThrow(/MapProvider/)
    spy.mockRestore()
  })
})

describe("MapView (placeholder engine)", () => {
  it("renders an accessible, labelled preview with a notice", async () => {
    const { container } = renderWithOnu(<MapView className="extra" classNames={{ root: "root-x" }} />)
    expect(region()).toHaveAttribute("aria-roledescription", "map")
    expect(screen.getByText("Map preview.")).toBeInTheDocument()
    const root = container.querySelector("[data-slot=map-view]")!
    expect(root).toHaveAttribute("data-engine", "placeholder")
    expect(root).toHaveClass("extra", "root-x")
    await expectNoA11yViolations()
  })

  it("reports clicks as coordinates", () => {
    const onMapClick = vi.fn()
    const { container } = renderWithOnu(<MapView onMapClick={onMapClick} center={MALE} zoom={12} />)
    const surface = container.querySelector("[data-slot=map-placeholder-surface]")!
    fireEvent.pointerDown(surface, { button: 0, clientX: CENTER_X, clientY: CENTER_Y })
    fireEvent.pointerUp(surface, { clientX: CENTER_X, clientY: CENTER_Y })
    const p = onMapClick.mock.calls[0]![0]
    expect(p.lat).toBeCloseTo(MALE.lat, 4)
    expect(p.lng).toBeCloseTo(MALE.lng, 4)
  })

  it("pans by dragging without clicking", () => {
    const onMapClick = vi.fn()
    const onViewChange = vi.fn()
    const { container } = renderWithOnu(<MapView onMapClick={onMapClick} onViewChange={onViewChange} />)
    const surface = container.querySelector("[data-slot=map-placeholder-surface]")!
    fireEvent.pointerDown(surface, { button: 0, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(surface, { clientX: 101, clientY: 100 })
    fireEvent.pointerMove(surface, { clientX: 160, clientY: 100 })
    fireEvent.pointerUp(surface, { clientX: 160, clientY: 100 })
    expect(onMapClick).not.toHaveBeenCalled()
    const view: MapViewState = onViewChange.mock.calls.at(-1)![0]
    expect(view.center.lng).toBeLessThan(MALE.lng)
    fireEvent.pointerDown(surface, { button: 2, clientX: 1, clientY: 1 })
    fireEvent.pointerMove(surface, { clientX: 50, clientY: 50 })
    fireEvent.pointerCancel(surface)
  })

  it.each(directions)("pans with arrow keys and zooms with +/- and buttons (%s)", async (dir) => {
    const onViewChange = vi.fn()
    renderWithOnu(<MapView onViewChange={onViewChange} zoom={10} />, { dir })
    const map = region()
    const last = () => onViewChange.mock.calls.at(-1)![0] as MapViewState
    map.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(last().center.lng).toBeGreaterThan(MALE.lng)
    await userEvent.keyboard("{ArrowLeft}{ArrowUp}")
    expect(last().center.lat).toBeGreaterThan(MALE.lat)
    await userEvent.keyboard("{ArrowDown}+")
    expect(last().zoom).toBe(11)
    await userEvent.keyboard("-_")
    expect(last().zoom).toBe(9)
    await userEvent.keyboard("x")
    await userEvent.click(screen.getByRole("button", { name: "Zoom in" }))
    expect(last().zoom).toBe(10)
    await userEvent.click(screen.getByRole("button", { name: "Zoom out" }))
    expect(last().zoom).toBe(9)
  })

  it("exposes panTo, fitBounds and getView through mapRef", () => {
    const ref = React.createRef<MapHandle>()
    renderWithOnu(
      <MapView mapRef={ref} bounds={{ north: 4.22, south: 4.17, east: 73.55, west: 73.48 }} controls={false} />,
    )
    expect(screen.queryByRole("button", { name: "Zoom in" })).not.toBeInTheDocument()
    act(() => ref.current!.panTo({ lat: 1, lng: 2 }, 8))
    expect(ref.current!.getView()).toMatchObject({ center: { lat: 1, lng: 2 }, zoom: 8 })
    act(() => ref.current!.panTo({ lat: 3, lng: 4 }))
    expect(ref.current!.getView()!.zoom).toBe(8)
    act(() => ref.current!.fitBounds({ north: 1, south: 0, east: 1, west: 0 }))
    expect(ref.current!.getView()!.center).toEqual({ lat: 0.5, lng: 0.5 })
  })

  it("renders markers, shapes and layers; interactive markers are buttons", async () => {
    const onClick = vi.fn()
    const onPolygonClick = vi.fn()
    const { container } = renderWithOnu(
      <MapView center={MALE} zoom={14}>
        <MapMarker position={MALE} title="Malé" onClick={onClick} selected={false} />
        <MapMarker position={{ lat: 4.176, lng: 73.51 }} title="Static" label="2" />
        <MapMarker position={{ lat: 4.174, lng: 73.508 }} title="Vessel" heading={90} />
        <MapMarker position={{ lat: 40, lng: 10 }} title="Far away" />
        <MapPolygonShape
          path={[MALE, { lat: 4.18, lng: 73.51 }, { lat: 4.18, lng: 73.5 }]}
          onClick={onPolygonClick}
          selected
        />
        <MapPolylineShape path={[MALE, { lat: 4.18, lng: 73.51 }]} dashed />
        <MapCircleShape center={MALE} radius={300} />
        <HeatmapLayer points={[{ position: MALE, weight: 3 }, { position: MALE }]} colors={["info", "#ff0000"]} />
      </MapView>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Malé" }))
    expect(onClick).toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Malé" })).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByTitle("Static")).toHaveTextContent("2")
    expect(screen.queryByTitle("Far away")).not.toBeInTheDocument()
    fireEvent.click(container.querySelector("path.cursor-pointer")!)
    expect(onPolygonClick).toHaveBeenCalled()
    expect(screen.getByText("Heatmap of 2 points, total weight 4")).toHaveClass("sr-only")
    expect(container.querySelectorAll("circle").length).toBeGreaterThan(2)
    await expectNoA11yViolations()
  })

  it("drags a draggable marker", () => {
    const onDragEnd = vi.fn()
    renderWithOnu(
      <MapView center={MALE} zoom={12}>
        <MapMarker position={MALE} title="Pin" draggable onDragEnd={onDragEnd} />
      </MapView>,
    )
    const pin = screen.getByRole("button", { name: "Pin" })
    fireEvent.pointerUp(pin)
    fireEvent.pointerMove(pin, { clientX: 400, clientY: 100 })
    fireEvent.pointerDown(pin, { button: 2 })
    fireEvent.pointerDown(pin, { button: 0 })
    fireEvent.pointerMove(pin, { clientX: CENTER_X + 64, clientY: CENTER_Y })
    fireEvent.pointerUp(pin)
    expect(onDragEnd).toHaveBeenCalledTimes(1)
    expect(onDragEnd.mock.calls[0]![0].lng).toBeGreaterThan(MALE.lng)
  })

  it("edits a circle with its handles", () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <MapView center={MALE} zoom={14}>
        <MapCircleShape center={MALE} radius={200} editable onChange={onChange} />
      </MapView>,
    )
    const [centre, edge] = container.querySelectorAll("[data-slot=map-handle]")
    fireEvent.pointerDown(edge!, { button: 0 })
    fireEvent.pointerMove(edge!, { clientX: CENTER_X + 100, clientY: CENTER_Y })
    fireEvent.pointerUp(edge!)
    expect(onChange.mock.calls[0]![0].radius).toBeGreaterThan(200)
    fireEvent.pointerDown(centre!, { button: 0 })
    fireEvent.pointerMove(centre!, { clientX: CENTER_X, clientY: CENTER_Y - 50 })
    fireEvent.pointerUp(centre!)
    expect(onChange.mock.calls[1]![0].center.lat).toBeGreaterThan(MALE.lat)
  })

  it("works with Dhivehi strings", () => {
    renderWithOnu(<MapView />, { locale: "dv" })
    expect(screen.getByRole("region", { name: "މެޕް" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ބޮޑުކޮށްލާ" })).toBeInTheDocument()
  })
})
