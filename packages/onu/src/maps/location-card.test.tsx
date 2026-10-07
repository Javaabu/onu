import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { LocationCard } from "./location-card"
import { MapProvider } from "./map-provider"

const position = { lat: 4.1771, lng: 73.5123 }

describe("LocationCard", () => {
  it("shows a placeholder thumbnail without an API key, the address and a Google Maps link", async () => {
    renderWithOnu(
      <LocationCard position={position} title="Ministry of Finance" address="Ameenee Magu, Malé" className="x" />,
    )
    expect(screen.getByRole("img", { name: "Map preview unavailable" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Ministry of Finance" })).toBeInTheDocument()
    expect(screen.getByText("Ameenee Magu, Malé").tagName).toBe("ADDRESS")
    const link = screen.getByRole("link", { name: /Open in Google Maps.*Ministry of Finance.*new tab/ })
    expect(link).toHaveAttribute("href", "https://www.google.com/maps/search/?api=1&query=4.1771%2C73.5123")
    expect(link).toHaveAttribute("target", "_blank")
    expect(screen.getByRole("article")).toHaveClass("x")
    await expectNoA11yViolations()
  })

  it("renders a static map with the configured key, and falls back on error", () => {
    renderWithOnu(<LocationCard position={position} title="IGMH" placeId="abc" zoom={16} />, {
      provider: { maps: { googleMapsApiKey: "key-1", mapId: "m1" } },
    })
    const img = screen.getByRole("img", { name: "Map of IGMH" })
    expect(img.getAttribute("src")).toContain("key=key-1")
    expect(img.getAttribute("src")).toContain("zoom=16")
    expect(img.getAttribute("src")).toContain("map_id=m1")
    expect(screen.getByRole("link")).toHaveAttribute("href", expect.stringContaining("query_place_id=abc"))
    fireEvent.error(img)
    expect(screen.getByRole("img", { name: "Map preview unavailable" })).toBeInTheDocument()
  })

  it("uses a MapProvider's key and the dark Map ID", () => {
    renderWithOnu(
      <MapProvider apiKey="ctx-key" darkMapId="dark" colorScheme="dark">
        <LocationCard position={position} />
      </MapProvider>,
    )
    const img = screen.getByRole("img")
    expect(img.getAttribute("src")).toContain("key=ctx-key")
    expect(img.getAttribute("src")).toContain("map_id=dark")
    expect(img).toHaveAccessibleName(/Map of .*4\.17710/)
  })

  it("supports layout, no thumbnail, hidden coordinates and actions", () => {
    renderWithOnu(
      <LocationCard
        position={position}
        layout="horizontal"
        thumbnail={false}
        showCoordinates={false}
        actions={<button type="button">Call</button>}
        classNames={{ body: "body-x" }}
      />,
    )
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.queryByText(/4\.17710/)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Call" }).parentElement!.parentElement).toHaveClass("body-x")
  })

  it("uses the dark Map ID from OnuProvider in dark mode", () => {
    renderWithOnu(<LocationCard position={position} />, {
      dark: true,
      provider: { maps: { googleMapsApiKey: "k", mapId: "light", darkMapId: "dark" } },
    })
    expect(screen.getByRole("img").getAttribute("src")).toContain("map_id=dark")
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<LocationCard position={position} title="ހުޅުމާލެ" />, { locale: "dv", dir })
    expect(screen.getByRole("link", { name: /ގޫގުލް މެޕްސްގައި ހުޅުވާ/ })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
