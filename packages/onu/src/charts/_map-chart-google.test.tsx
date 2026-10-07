import { render } from "@testing-library/react"
import * as React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

import GoogleChoropleth, { resolveCssColor } from "./_map-chart-google"
import { choroplethRegions, type GeoJsonFeatureCollection } from "./choropleth"

const overlays: { setMap: ReturnType<typeof vi.fn>; setProps: ReturnType<typeof vi.fn> }[] = []
const fakeMap = { id: "map" }

vi.mock("@deck.gl/google-maps", () => ({
  GoogleMapsOverlay: class {
    setMap = vi.fn()
    setProps = vi.fn()
    constructor() {
      overlays.push(this)
    }
  },
}))

vi.mock("@deck.gl/layers", () => ({
  GeoJsonLayer: class {
    props: Record<string, unknown>
    constructor(props: Record<string, unknown>) {
      this.props = props
    }
  },
}))

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children, apiKey, language }: { children: React.ReactNode; apiKey: string; language: string }) => (
    <div data-testid="api" data-key={apiKey} data-language={language}>
      {children}
    </div>
  ),
  Map: ({ children, mapId, colorScheme }: { children: React.ReactNode; mapId?: string; colorScheme: string }) => (
    <div data-testid="map" data-map-id={mapId} data-scheme={colorScheme}>
      {children}
    </div>
  ),
  useMap: () => fakeMap,
}))

const square = { type: "Polygon", coordinates: [] }
const geojson: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { id: "K", name: "Kaafu" }, geometry: square },
    { type: "Feature", properties: { id: "S", name: "Addu" }, geometry: square },
  ],
}

type LayerProps = {
  data: unknown[]
  getFillColor: (f: unknown) => number[]
  onHover: (info: { object?: unknown }) => void
  onClick: (info: { object?: unknown }) => void
}

describe("resolveCssColor", () => {
  afterEach(() => vi.restoreAllMocks())

  it("falls back when canvas is unavailable", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
    expect(resolveCssColor("red", null)).toEqual([100, 116, 139, 255])
  })

  it("paints the colour and reads it back, resolving custom properties", () => {
    const ctx = {
      fillStyle: "",
      fillRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([10, 20, 30, 255]) })),
    }
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never)
    const el = document.createElement("div")
    el.style.setProperty("--chart-1", "rgb(10, 20, 30)")
    document.body.append(el)
    expect(resolveCssColor("var(--chart-1)", el)).toEqual([10, 20, 30, 255])
    expect(ctx.fillStyle).toBe("rgb(10, 20, 30)")
    el.remove()
  })
})

describe("GoogleChoropleth", () => {
  it("adds a deck.gl GeoJsonLayer to the map and reports hover and tap", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
    const { regions } = choroplethRegions(geojson, [{ id: "K", value: 10 }])
    const onSelect = vi.fn()
    const { getByTestId, unmount } = render(
      <GoogleChoropleth
        apiKey="key"
        mapId="light-id"
        regions={regions}
        steps={5}
        color="var(--chart-1)"
        center={{ lat: 3, lng: 73 }}
        zoom={6}
        onSelect={onSelect}
      />,
    )
    expect(getByTestId("api")).toHaveAttribute("data-key", "key")
    expect(getByTestId("api")).toHaveAttribute("data-language", "en")
    expect(getByTestId("map")).toHaveAttribute("data-map-id", "light-id")
    expect(getByTestId("map")).toHaveAttribute("data-scheme", "LIGHT")

    const overlay = overlays[overlays.length - 1]!
    expect(overlay.setMap).toHaveBeenCalledWith(fakeMap)
    const layer = overlay.setProps.mock.calls.at(-1)![0].layers[0] as { props: LayerProps }
    expect(layer.props.data).toHaveLength(2)
    const [kaafu, addu] = layer.props.data
    expect(layer.props.getFillColor(kaafu)[3]).toBe(230)
    expect(layer.props.getFillColor(addu)[3]).toBe(40)
    expect(layer.props.getFillColor({})[3]).toBe(40)

    layer.props.onHover({ object: kaafu })
    expect(onSelect).toHaveBeenLastCalledWith(regions[0])
    layer.props.onHover({})
    expect(onSelect).toHaveBeenCalledTimes(1)
    layer.props.onClick({ object: addu })
    expect(onSelect).toHaveBeenLastCalledWith(regions[1])
    layer.props.onClick({})
    expect(onSelect).toHaveBeenLastCalledWith(null)
    layer.props.onHover({ object: {} })
    expect(onSelect).toHaveBeenLastCalledWith(null)
    layer.props.onClick({ object: {} })
    expect(onSelect).toHaveBeenLastCalledWith(null)

    unmount()
    expect(overlay.setMap).toHaveBeenLastCalledWith(null)
  })
})
