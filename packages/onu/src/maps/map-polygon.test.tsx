import * as React from "react"
import { fireEvent, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { FormField } from "../components/form/form-field"
import type { PolygonCollection } from "./geo"
import { MapPolygon } from "./map-polygon"
import { MapRoute, type RouteFeature } from "./map-route"

const zones: PolygonCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "henveiru",
      properties: { name: "Henveiru" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [73.5085, 4.1762],
            [73.5175, 4.1762],
            [73.5175, 4.1705],
            [73.5085, 4.1762],
          ],
        ],
      },
    },
  ],
}

async function typePoint(lat: string, lng: string) {
  const latInput = screen.getAllByLabelText("Latitude").at(-1)!
  const lngInput = screen.getAllByLabelText("Longitude").at(-1)!
  await userEvent.clear(latInput)
  await userEvent.type(latInput, lat)
  await userEvent.clear(lngInput)
  await userEvent.type(lngInput, lng)
  await userEvent.click(screen.getByRole("button", { name: "Add point" }))
}

function surface(container: HTMLElement) {
  return container.querySelector("[data-slot=map-draw-surface]")!
}

describe("MapPolygon", () => {
  it("lists polygons with their area and submits GeoJSON", async () => {
    const { container } = renderWithOnu(
      <FormField label="Zones" name="zones">
        <MapPolygon defaultValue={zones} />
      </FormField>,
    )
    expect(screen.getByRole("group", { name: "Zones" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Area 1/ })).toHaveTextContent(/3 points · \d+(\.\d+)? ha/)
    expect(screen.getAllByRole("listitem")).toHaveLength(1 + 3)
    const hidden = container.querySelector<HTMLInputElement>("input[name=zones]")!
    expect(JSON.parse(hidden.value).features[0].properties).toEqual({ name: "Henveiru" })
    await expectNoA11yViolations()
  })

  it("creates a polygon entirely with the keyboard", async () => {
    const onChange = vi.fn()
    renderWithOnu(<MapPolygon onChange={onChange} />)
    expect(screen.getByText(/No areas yet/)).toBeInTheDocument()
    await typePoint("4.17", "73.50")
    expect(screen.getByText("Point 1 added")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Area 1/ })).toHaveTextContent("Needs at least 3 points")
    expect(onChange).toHaveBeenLastCalledWith(null)
    await typePoint("4.18", "73.50")
    await typePoint("4.18", "73.51")
    const value = onChange.mock.calls.at(-1)![0] as PolygonCollection
    expect(value.features).toHaveLength(1)
    expect(value.features[0]!.geometry.coordinates[0]).toHaveLength(4)
    await userEvent.click(screen.getByRole("button", { name: "Remove point 2" }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    await userEvent.click(screen.getByRole("button", { name: "Remove Area 1" }))
    expect(screen.getByText("Area 1 removed")).toBeInTheDocument()
  })

  it("draws by clicking the map and edits by dragging points", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<MapPolygon onChange={onChange} multiple />)
    const draw = screen.getByRole("button", { name: "Draw area" })
    await userEvent.click(draw)
    expect(draw).toHaveAttribute("aria-pressed", "true")
    expect(screen.getAllByText(/Click the map to add points/).length).toBeGreaterThan(0)
    fireEvent.click(surface(container), { clientX: 300, clientY: 150 })
    fireEvent.click(surface(container), { clientX: 360, clientY: 150 })
    fireEvent.click(surface(container), { clientX: 360, clientY: 210 })
    expect(onChange.mock.calls.at(-1)![0].features).toHaveLength(1)
    await userEvent.click(screen.getByRole("button", { name: "Done" }))
    expect(screen.getByText("Drawing finished")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Edit points" }))
    const handles = container.querySelectorAll("[data-slot=map-handle]")
    expect(handles).toHaveLength(3)
    fireEvent.pointerDown(handles[0]!, { button: 0 })
    fireEvent.pointerMove(handles[0]!, { clientX: 250, clientY: 100 })
    fireEvent.pointerUp(handles[0]!)
    expect(onChange).toHaveBeenCalledTimes(4)
    await userEvent.click(screen.getByRole("button", { name: "Fit to view" }))
    await userEvent.click(screen.getByRole("button", { name: "Add area" }))
    expect(screen.getByRole("button", { name: /^Area 2/ })).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(screen.getByRole("button", { name: /^Area 1/ }))
    expect(screen.getByRole("button", { name: /^Area 1/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("syncs a controlled value from outside", () => {
    function Controlled({ value }: { value: PolygonCollection | null }) {
      return <MapPolygon value={value} onChange={() => {}} />
    }
    const { rerender } = renderWithOnu(<Controlled value={null} />)
    expect(screen.getByText(/No areas yet/)).toBeInTheDocument()
    rerender(<Controlled value={zones} />)
    expect(screen.getByRole("button", { name: /^Area 1/ })).toBeInTheDocument()
    rerender(<Controlled value={{ ...zones }} />)
    expect(screen.getByRole("button", { name: /^Area 1/ })).toBeInTheDocument()
  })

  it("single polygon mode disables drawing a second one; disabled is read only", () => {
    const { unmount } = renderWithOnu(<MapPolygon multiple={false} defaultValue={zones} />)
    expect(screen.getByRole("button", { name: "Draw area" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Add area" })).not.toBeInTheDocument()
    unmount()
    renderWithOnu(<MapPolygon disabled defaultValue={zones} />)
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Remove/ })).not.toBeInTheDocument()
    expect(screen.queryByLabelText("Latitude")).not.toBeInTheDocument()
  })

  it("shows a total for several polygons", async () => {
    renderWithOnu(
      <MapPolygon defaultValue={{ ...zones, features: [...zones.features, { ...zones.features[0]!, id: "b" }] }} />,
    )
    expect(screen.getByText(/^Total area/)).toBeInTheDocument()
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<MapPolygon defaultValue={zones} />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ސަރަހައްދު ކުރަހާ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ސަރަހައްދު 1 ނައްތާލާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

const route: RouteFeature = {
  type: "Feature",
  id: "patrol",
  properties: { name: "Patrol" },
  geometry: {
    type: "LineString",
    coordinates: [
      [73.5, 4.17],
      [73.51, 4.17],
      [73.51, 4.18],
    ],
  },
}

describe("MapRoute", () => {
  it("shows the distance, reorders points and reports changes", async () => {
    const onChange = vi.fn()
    const onDistanceChange = vi.fn()
    const { container } = renderWithOnu(
      <FormField label="Patrol" name="route">
        <MapRoute defaultValue={route} onChange={onChange} onDistanceChange={onDistanceChange} />
      </FormField>,
    )
    expect(screen.getByRole("button", { name: /^Route/ })).toHaveTextContent(/Distance 2\.\d+ km/)
    expect(screen.getByRole("button", { name: "Move point 1 up" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Move point 1 down" }))
    const next = onChange.mock.calls.at(-1)![0] as RouteFeature
    expect(next.geometry.coordinates[0]).toEqual([73.51, 4.17])
    expect(next.properties).toEqual({ name: "Patrol" })
    expect(onDistanceChange).toHaveBeenCalledWith(expect.any(Number))
    await userEvent.click(screen.getByRole("button", { name: "Move point 3 up" }))
    await userEvent.click(
      screen.getByRole("button", { name: "Move point 3 down" }).closest("li")!.querySelector("button")!,
    )
    expect(JSON.parse(container.querySelector<HTMLInputElement>("input[name=route]")!.value).type).toBe("Feature")
    expect(screen.getByRole("button", { name: "Draw route" })).toBeDisabled()
    await expectNoA11yViolations()
  })

  it("draws a route from scratch and clears it", async () => {
    const onChange = vi.fn()
    renderWithOnu(<MapRoute onChange={onChange} />)
    expect(screen.getByText(/No route yet/)).toBeInTheDocument()
    await typePoint("4.17", "73.5")
    await typePoint("4.18", "73.5")
    expect(onChange.mock.calls.at(-1)![0].geometry.coordinates).toHaveLength(2)
    await userEvent.click(within(screen.getByRole("group")).getByRole("button", { name: "Remove Route" }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })
})
