import { act, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { choroplethRegions, choroplethScale, stepOpacity, type GeoJsonFeatureCollection } from "./choropleth"
import { MapChart } from "./map-chart"

const selectRef: { current: ((r: unknown) => void) | null } = { current: null }

vi.mock("./_map-chart-google", () => ({
  default: (props: { regions: unknown[]; onSelect: (r: unknown) => void; apiKey: string }) => {
    selectRef.current = props.onSelect
    return <div data-testid="google-map" data-key={props.apiKey} data-regions={props.regions.length} />
  },
}))

const square = {
  type: "Polygon",
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ],
  ],
}
const geojson: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { id: "K", name: "Kaafu" }, geometry: square },
    { type: "Feature", properties: { id: "S", name: "Addu City" }, geometry: square },
    { type: "Feature", id: "L", properties: null, geometry: square },
  ],
}
const data = [
  { id: "K", value: 100 },
  { id: "S", value: 500 },
]

describe("choropleth helpers", () => {
  it("builds an equal-interval scale", () => {
    const scale = choroplethScale([0, 100], 4)
    expect(scale.thresholds).toEqual([0, 25, 50, 75])
    expect(scale.stepOf(0)).toBe(0)
    expect(scale.stepOf(60)).toBe(2)
    expect(scale.stepOf(100)).toBe(3)
    expect(scale.stepOf(-5)).toBe(0)
  })

  it("handles a single value and no values", () => {
    expect(choroplethScale([7], 5).stepOf(7)).toBe(4)
    expect(choroplethScale([], 3)).toMatchObject({ min: 0, max: 0 })
  })

  it("maps steps to opacity", () => {
    expect(stepOpacity(0, 5)).toBeCloseTo(0.2)
    expect(stepOpacity(4, 5)).toBe(1)
    expect(stepOpacity(0, 1)).toBe(1)
  })

  it("joins features and data by id, falling back to feature.id", () => {
    const { regions, scale } = choroplethRegions(geojson, data, { steps: 2 })
    expect(regions.map((r) => [r.id, r.name, r.value, r.step])).toEqual([
      ["K", "Kaafu", 100, 0],
      ["S", "Addu City", 500, 1],
      ["L", "L", null, null],
    ])
    expect(scale).toMatchObject({ min: 100, max: 500 })
  })

  it("uses custom keys", () => {
    const { regions } = choroplethRegions(
      {
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: { code: 1, label: "One" }, geometry: null }],
      },
      [{ region: 1, total: 9 }],
      { idKey: "region", valueKey: "total", featureIdKey: "code", featureNameKey: "label" },
    )
    expect(regions[0]).toMatchObject({ id: "1", name: "One", value: 9 })
  })
})

describe("MapChart", () => {
  it("shows an accessible placeholder and the data table without an API key", async () => {
    const { container } = renderWithOnu(
      <MapChart title="Population" geojson={geojson} data={data} regionLabel="Atoll" />,
    )
    expect(screen.getByRole("note")).toHaveTextContent("no Google Maps API key")
    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Atoll" })).toBeInTheDocument()
    expect(screen.getAllByRole("row")[3]).toHaveTextContent("LNo data")
    expect(screen.queryByRole("button", { name: "View as table" })).toBeNull()
    expect(screen.queryByTestId("google-map")).toBeNull()
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent(
      "Map chart with 1 series and 2 data points. Value: lowest 100, highest 500.",
    )
    await expectNoA11yViolations(container)
  })

  it("loads the Google map lazily with a key, with legend, read-out and table toggle", async () => {
    const user = userEvent.setup()
    const { container } = renderWithOnu(<MapChart title="Population" geojson={geojson} data={data} steps={2} />, {
      provider: { maps: { googleMapsApiKey: "test-key" } },
    })
    const map = await screen.findByTestId("google-map")
    expect(map).toHaveAttribute("data-key", "test-key")
    expect(map).toHaveAttribute("data-regions", "3")
    expect(screen.getByRole("region", { name: "Population" })).toContainElement(map)
    const legend = container.querySelector('[data-slot="map-legend"]')!
    expect(within(legend as HTMLElement).getAllByRole("listitem")).toHaveLength(3)
    expect(legend).toHaveTextContent("100 – 300")
    const readout = container.querySelector('[data-slot="map-readout"]')!
    expect(readout).toHaveAttribute("aria-live", "polite")
    expect(readout).toHaveTextContent("Tap or hover over a region")

    const { regions } = choroplethRegions(geojson, data)
    act(() => selectRef.current!(regions[1]))
    expect(readout).toHaveTextContent("Addu City: 500")
    act(() => selectRef.current!(regions[2]))
    expect(readout).toHaveTextContent("L: No data")

    await user.click(screen.getByRole("button", { name: "View as table" }))
    expect(screen.getByRole("table")).toBeInTheDocument()
  })

  it("shows the empty state without features", () => {
    renderWithOnu(<MapChart title="Population" geojson={{ type: "FeatureCollection", features: [] }} data={[]} />)
    expect(screen.getByText("No data to show")).toBeInTheDocument()
  })

  it("summarises with no values", () => {
    const { container } = renderWithOnu(<MapChart title="Population" geojson={geojson} data={[]} />)
    expect(container.querySelector('[data-slot="chart-summary"]')).toHaveTextContent("0 data points.")
  })

  it.each(directions)("renders the placeholder in %s", (dir) => {
    renderWithOnu(<MapChart title="Population" geojson={geojson} data={data} />, { dir })
    expect(screen.getByRole("note")).toBeInTheDocument()
  })

  it("uses Dhivehi", () => {
    renderWithOnu(<MapChart title="އާބާދީ" geojson={geojson} data={data} />, { locale: "dv" })
    expect(screen.getByRole("note")).toHaveTextContent("ފަށްޓަރު")
    expect(screen.getByRole("columnheader", { name: "ސަރަހައްދު" })).toBeInTheDocument()
  })
})
