import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import type { GeoJsonFeatureCollection } from "./choropleth"
import { MapChart } from "./map-chart"

// An app that has not installed deck.gl: importing it fails.
vi.mock("@deck.gl/layers", () => {
  throw new Error("Cannot find module '@deck.gl/layers'")
})

const geojson: GeoJsonFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "K", name: "Kaafu" },
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
  ],
}

describe("MapChart without its optional map peers", () => {
  it("loadMapPeers returns null when a peer is not installed", async () => {
    const { loadMapPeers } = await import("./_map-chart-google")
    await expect(loadMapPeers()).resolves.toBeNull()
  })

  it("falls back to a note and the data table instead of crashing", async () => {
    renderWithOnu(<MapChart title="Population" geojson={geojson} data={[{ id: "K", value: 100 }]} />, {
      provider: { maps: { googleMapsApiKey: "test-key" } },
    })
    expect(await screen.findByText(/map packages are not installed/)).toBeInTheDocument()
    expect(screen.getByRole("table")).toHaveTextContent("Kaafu")
    await expectNoA11yViolations()
  })
})
