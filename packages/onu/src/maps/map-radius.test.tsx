import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { FormField } from "../components/form/form-field"
import { MapRadius, type MapRadiusValue } from "./map-radius"

const centre = { lat: 4.1755, lng: 73.5093 }

describe("MapRadius", () => {
  it("places a centre with the default radius by clicking the map", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <FormField label="Delivery area" name="area">
        <MapRadius onChange={onChange} defaultRadius={300} center={centre} />
      </FormField>,
    )
    expect(screen.getByRole("group", { name: "Delivery area" })).toBeInTheDocument()
    expect(screen.getByLabelText("Radius")).toBeDisabled()
    const surface = container.querySelector("[data-slot=map-placeholder-surface]")!
    fireEvent.pointerDown(surface, { button: 0, clientX: 320, clientY: 180 })
    fireEvent.pointerUp(surface, { clientX: 320, clientY: 180 })
    expect(onChange.mock.calls[0]![0].radius).toBe(300)
    expect(container.querySelector<HTMLInputElement>("input[name='area[radius]']")!.value).toBe("300")
    expect(container.querySelector("input[name='area[lat]']")).toHaveValue(
      String(onChange.mock.calls[0]![0].center.lat),
    )
    expect(screen.getByText(/Radius 300 m · area 28\.27 ha/)).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("updates the radius from the numeric field within min/max (controlled)", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<MapRadiusValue | null>({ center: centre, radius: 500 })
      return (
        <>
          <MapRadius value={value} onChange={setValue} min={100} max={1000} />
          <output>{value ? value.radius : "none"}</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    const radius = screen.getByLabelText("Radius")
    await userEvent.clear(radius)
    await userEvent.type(radius, "750")
    expect(screen.getByRole("status")).toHaveTextContent("750")
    await userEvent.clear(radius)
    await userEvent.type(radius, "5000")
    expect(screen.getByRole("status")).toHaveTextContent("500")
    fireEvent.blur(radius)
    expect(radius).toHaveValue(500)
    await userEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.getByRole("status")).toHaveTextContent("none")
  })

  it("moves the centre with coordinates and drags handles", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <MapRadius defaultValue={{ center: centre, radius: 200 }} onChange={onChange} max={400} />,
    )
    const lat = screen.getByLabelText("Latitude")
    await userEvent.clear(lat)
    await userEvent.type(lat, "4.2")
    expect(onChange).toHaveBeenLastCalledWith({ center: { lat: 4.2, lng: centre.lng }, radius: 200 })
    const edge = container.querySelectorAll("[data-slot=map-handle]")[1]!
    fireEvent.pointerDown(edge, { button: 0 })
    fireEvent.pointerMove(edge, { clientX: 620, clientY: 180 })
    fireEvent.pointerUp(edge)
    // Clamped to max.
    expect(onChange.mock.calls.at(-1)![0].radius).toBe(400)
    expect(screen.getByText(/Radius 400 m around/)).toBeInTheDocument()
  })

  it("is read-only when disabled", () => {
    const { container } = renderWithOnu(<MapRadius disabled required defaultValue={{ center: centre, radius: 200 }} />)
    expect(container.querySelector("[data-slot=map-handle]")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument()
    expect(screen.getByLabelText("Radius")).toBeDisabled()
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<MapRadius defaultValue={{ center: centre, radius: 1500 }} className="x" />, { locale: "dv", dir })
    expect(screen.getByRole("group", { name: "ރޭޑިއަސްއިން ސަރަހައްދު" })).toHaveClass("x")
    expect(screen.getByText(/1\.5 ކިލޯމީޓަރު/)).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
