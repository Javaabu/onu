import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { FormField } from "../components/form/form-field"
import { RouteStopEditor, type RouteStop } from "./route-stop-editor"

// dnd-kit needs real layout; capture the drop handler and test our reorder logic.
const dnd = vi.hoisted(() => ({ onDragEnd: null as null | ((event: unknown) => void) }))
vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: unknown) => void }) => {
    dnd.onDragEnd = onDragEnd
    return <>{children}</>
  },
}))
vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({ ref: () => {}, handleRef: () => {}, isDragging: false }),
}))
vi.mock("@dnd-kit/helpers", () => ({
  move: <T,>(items: T[], event: { to: number; from: number }) => {
    if (event.from === event.to) return items
    const next = [...items]
    const [item] = next.splice(event.from, 1)
    next.splice(event.to, 0, item!)
    return next
  },
}))

const stops: RouteStop[] = [
  { id: "a", label: "Terminal", position: { lat: 4.1757, lng: 73.5166 } },
  { id: "b", label: "Airport", position: { lat: 4.1918, lng: 73.5291 } },
  { id: "c", label: "", position: null },
]

function Controlled({ onChange }: { onChange?: (s: RouteStop[]) => void }) {
  const [value, setValue] = React.useState(stops)
  return (
    <FormField label="Shuttle stops">
      <RouteStopEditor
        value={value}
        onChange={(s) => {
          onChange?.(s)
          setValue(s)
        }}
        name="stops"
        max={4}
      />
    </FormField>
  )
}

const names = () => screen.getAllByRole("textbox", { name: /^Name of stop/ }).map((i) => (i as HTMLInputElement).value)

describe("RouteStopEditor", () => {
  it("fits stops that load after the first render, unless a centre or zoom is given", () => {
    const addu: RouteStop[] = [
      { id: "g", label: "Gan", position: { lat: -0.69, lng: 73.15 } },
      { id: "h", label: "Hithadhoo", position: { lat: -0.6, lng: 73.09 } },
    ]
    const pin = (name: string) => document.querySelector(`[data-slot=map-marker][aria-label^="${name}"]`)
    const { rerender } = renderWithOnu(<RouteStopEditor value={[]} />)
    // Addu is far from the default view (Malé) …
    rerender(<RouteStopEditor value={addu} />)
    // … but the map fits the stops once they arrive.
    expect(pin("Stop 1")).toBeInTheDocument()
    expect(pin("Stop 2")).toBeInTheDocument()
  })

  it("keeps an explicit centre instead of fitting the stops", () => {
    const addu: RouteStop[] = [{ id: "g", label: "Gan", position: { lat: -0.69, lng: 73.15 } }]
    renderWithOnu(<RouteStopEditor defaultValue={addu} center={{ lat: 4.17, lng: 73.5 }} />)
    expect(document.querySelector("[data-slot=map-marker]")).toBeNull()
  })

  it("lists stops in order with numbered markers and hidden inputs", async () => {
    const { container } = renderWithOnu(<Controlled />)
    expect(screen.getByRole("group", { name: "Shuttle stops" })).toBeInTheDocument()
    expect(names()).toEqual(["Terminal", "Airport", ""])
    expect(screen.getByRole("button", { name: "Stop 1: Terminal" })).toHaveTextContent("1")
    expect(screen.getByText("Not placed on the map yet")).toBeInTheDocument()
    expect(screen.getByText(/^Distance/)).toBeInTheDocument()
    expect(container.querySelector("input[name='stops[1][label]']")).toHaveValue("Airport")
    expect(container.querySelector("input[name='stops[2][lat]']")).toHaveValue("")
    await expectNoA11yViolations()
  })

  it("reorders with the arrow buttons and announces it", async () => {
    renderWithOnu(<Controlled />)
    expect(screen.getByRole("button", { name: "Move Terminal up" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Move Terminal down" }))
    expect(names()).toEqual(["Airport", "Terminal", ""])
    expect(screen.getByText("Terminal moved to position 2 of 3")).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole("button", { name: "Move Airport up" }).parentElement!.querySelectorAll("button")[1]!,
    )
    expect(names()).toEqual(["Terminal", "Airport", ""])
  })

  it("reorders by drag and drop", () => {
    renderWithOnu(<Controlled />)
    act(() => dnd.onDragEnd!({ canceled: true, operation: { source: { id: "a" } } }))
    act(() => dnd.onDragEnd!({ canceled: false, from: 0, to: 0, operation: { source: { id: "a" } } }))
    expect(names()).toEqual(["Terminal", "Airport", ""])
    act(() => dnd.onDragEnd!({ canceled: false, from: 0, to: 2, operation: { source: { id: "a" } } }))
    expect(names()).toEqual(["Airport", "", "Terminal"])
    expect(screen.getByText("Terminal moved to position 3 of 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reorder Terminal" })).toBeInTheDocument()
  })

  it("adds, renames, places and removes stops", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<Controlled onChange={onChange} />)
    // Drag a marker to move it.
    const pin = screen.getByRole("button", { name: "Stop 1: Terminal" })
    fireEvent.pointerDown(pin, { button: 0 })
    fireEvent.pointerMove(pin, { clientX: 100, clientY: 100 })
    fireEvent.pointerUp(pin)
    expect(onChange.mock.calls.at(-1)![0][0].position).not.toEqual(stops[0]!.position)
    // Click the map to add a stop there.
    const surface = container.querySelector("[data-slot=map-placeholder-surface]")!
    fireEvent.pointerDown(surface, { button: 0, clientX: 320, clientY: 180 })
    fireEvent.pointerUp(surface, { clientX: 320, clientY: 180 })
    expect(names()).toHaveLength(4)
    expect(screen.getByText("Stop 4 added")).toBeInTheDocument()
    // Max reached.
    expect(screen.getByRole("button", { name: "Add stop" })).toBeDisabled()
    expect(screen.getByText("Up to 4 stops")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove Stop 4" }))
    await userEvent.click(screen.getByRole("button", { name: "Add stop" }))
    expect(screen.getAllByRole("button", { name: "Coordinates" }).at(-1)).toHaveAttribute("aria-expanded", "true")
    await userEvent.type(screen.getByRole("textbox", { name: "Name of stop 3" }), "Villimalé")
    expect(onChange.mock.calls.at(-1)![0][2].label).toBe("Villimalé")
    await userEvent.click(screen.getAllByRole("button", { name: "Coordinates" })[2]!)
    await userEvent.type(screen.getByLabelText("Latitude"), "4.17")
    await userEvent.type(screen.getByLabelText("Longitude"), "73.48")
    expect(onChange.mock.calls.at(-1)![0][2].position).toEqual({ lat: 4.17, lng: 73.48 })
    await userEvent.click(screen.getAllByRole("button", { name: "Coordinates" })[2]!)
    expect(screen.queryByLabelText("Latitude")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove Terminal" }))
    expect(screen.getByText("Terminal removed")).toBeInTheDocument()
  })

  it("shows an empty state, and is read only when disabled", () => {
    const { unmount } = renderWithOnu(<RouteStopEditor />)
    expect(screen.getByText(/No stops yet/)).toBeInTheDocument()
    unmount()
    renderWithOnu(<RouteStopEditor defaultValue={stops} disabled addOnMapClick={false} showPath={false} />)
    expect(screen.queryByRole("button", { name: "Add stop" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Reorder/ })).not.toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Name of stop 1" })).toBeDisabled()
    expect(screen.getByRole("img", { name: "Stop 1: Terminal" })).toBeInTheDocument()
  })

  it.each(directions)("works in Dhivehi with Thaana names (%s)", async (dir) => {
    renderWithOnu(<RouteStopEditor defaultValue={stops} thaana />, { locale: "dv", dir })
    expect(screen.getByRole("textbox", { name: "ހުއްޓުން 1 ގެ ނަން" })).toHaveAttribute("lang", "dv")
    expect(screen.getByRole("button", { name: "ހުއްޓުމެއް އިތުރުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
