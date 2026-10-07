import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { FormField } from "../components/form/form-field"
import { usePlaceSearchBox } from "./_place-search"
import { MapPicker } from "./map-picker"
import type { LatLng, PlaceSearch } from "./types"

const places = [
  { id: "maafushi", label: "Maafushi", description: "Kaafu", position: { lat: 3.942, lng: 73.49 } },
  { id: "male", label: "Malé", position: { lat: 4.1755, lng: 73.5093 } },
]

const search: PlaceSearch = vi.fn(async (q: string) =>
  places.filter((p) => p.label.toLowerCase().startsWith(q.toLowerCase())),
)

function surface(container: HTMLElement) {
  return container.querySelector("[data-slot=map-placeholder-surface]")!
}

function clickMap(container: HTMLElement, x = 320, y = 180) {
  fireEvent.pointerDown(surface(container), { button: 0, clientX: x, clientY: y })
  fireEvent.pointerUp(surface(container), { clientX: x, clientY: y })
}

afterEach(() => {
  vi.useRealTimers()
  Object.defineProperty(navigator, "geolocation", { value: undefined, configurable: true })
})

describe("MapPicker", () => {
  it("picks a point by clicking the map (uncontrolled) and submits hidden inputs", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <FormField label="Location" name="location">
        <MapPicker search={false} center={{ lat: 4.1755, lng: 73.5093 }} zoom={12} onChange={onChange} />
      </FormField>,
    )
    expect(screen.getByRole("group", { name: "Location" })).toBeInTheDocument()
    clickMap(container)
    const value = onChange.mock.calls[0]![0] as LatLng
    expect(value.lat).toBeCloseTo(4.1755, 4)
    expect(container.querySelector<HTMLInputElement>("input[name='location[lat]']")!.value).toBe(String(value.lat))
    expect(container.querySelector<HTMLInputElement>("input[name='location[lng]']")!.value).toBe(String(value.lng))
    expect(screen.getByRole("button", { name: "Selected location" })).toBeInTheDocument()
    expect(screen.getByText(/^Location set to/)).toBeInTheDocument()
    expect(screen.getByLabelText("Latitude")).toHaveValue(String(value.lat))
    await expectNoA11yViolations()
  })

  it("is controlled and can be typed with the keyboard", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<LatLng | null>({ lat: 4.2, lng: 73.5 })
      return (
        <>
          <MapPicker value={value} onChange={setValue} search={false} label="Site" />
          <output>{value ? `${value.lat},${value.lng}` : "none"}</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    const lat = screen.getByLabelText("Latitude")
    await userEvent.clear(lat)
    await userEvent.type(lat, "3.9")
    expect(screen.getByRole("status")).toHaveTextContent("3.9,73.5")
    await userEvent.clear(lat)
    await userEvent.type(lat, "95")
    expect(screen.getByText("Enter a latitude between -90 and 90")).toBeInTheDocument()
    expect(lat).toHaveAttribute("aria-invalid", "true")
    const lng = screen.getByLabelText("Longitude")
    await userEvent.clear(lng)
    await userEvent.type(lng, "abc")
    expect(screen.getByText("Enter a longitude between -180 and 180")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(screen.getByRole("status")).toHaveTextContent("none")
    expect(screen.getByText("Location cleared")).toBeInTheDocument()
    expect(lat).toHaveValue("")
  })

  it("drags the marker", () => {
    const onChange = vi.fn()
    renderWithOnu(<MapPicker defaultValue={{ lat: 4.1755, lng: 73.5093 }} search={false} onChange={onChange} />)
    const pin = screen.getByRole("button", { name: "Selected location" })
    fireEvent.pointerDown(pin, { button: 0 })
    fireEvent.pointerMove(pin, { clientX: 400, clientY: 150 })
    fireEvent.pointerUp(pin)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("searches places with debounce, keyboard selection and abort of stale requests", async () => {
    const onChange = vi.fn()
    renderWithOnu(<MapPicker search={search} onChange={onChange} />)
    const box = screen.getByRole("combobox", { name: "Search places" })
    await userEvent.type(box, "ma")
    expect(await screen.findByRole("option", { name: /Maafushi/ })).toBeInTheDocument()
    expect(box).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("2 results", { selector: "[aria-live]" })).toBeInTheDocument()
    await userEvent.keyboard("{ArrowDown}")
    expect(box).toHaveAttribute("aria-activedescendant", expect.stringContaining("-0"))
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{Enter}")
    expect(onChange).toHaveBeenLastCalledWith({ lat: 3.942, lng: 73.49 })
    expect(box).toHaveValue("")
    await userEvent.type(box, "zz")
    expect(await screen.findByText("No results for “zz”", { selector: "p" })).toBeInTheDocument()
    await userEvent.keyboard("{ArrowDown}{Escape}")
    expect(box).toHaveAttribute("aria-expanded", "false")
    await userEvent.keyboard("{Escape}")
    expect(box).toHaveValue("")
    await userEvent.type(box, "mal")
    fireEvent.click(await screen.findByRole("option", { name: /Malé/ }))
    expect(onChange).toHaveBeenLastCalledWith({ lat: 4.1755, lng: 73.5093 })
  })

  it("shows a search error with Retry", async () => {
    const failing = vi.fn<PlaceSearch>().mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce([places[1]!])
    renderWithOnu(<MapPicker search={failing} thaana={false} />)
    await userEvent.type(screen.getByRole("combobox"), "mal")
    expect(await screen.findByText("Search failed.", { selector: "p" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(await screen.findByRole("option", { name: "Malé" })).toBeInTheDocument()
    fireEvent.blur(screen.getByRole("combobox"))
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false")
    fireEvent.focus(screen.getByRole("combobox"))
  })

  it("uses the device location, and reports errors", async () => {
    const getCurrentPosition = vi
      .fn()
      .mockImplementationOnce((ok: PositionCallback) =>
        ok({ coords: { latitude: 4.2, longitude: 73.54 } } as GeolocationPosition),
      )
      .mockImplementationOnce((_ok: PositionCallback, fail: PositionErrorCallback) =>
        fail({ code: 1 } as GeolocationPositionError),
      )
    Object.defineProperty(navigator, "geolocation", { value: { getCurrentPosition }, configurable: true })
    const onChange = vi.fn()
    renderWithOnu(<MapPicker search={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Use my location" }))
    expect(onChange).toHaveBeenCalledWith({ lat: 4.2, lng: 73.54 })
    await userEvent.click(screen.getByRole("button", { name: "Use my location" }))
    expect(screen.getAllByText(/Couldn't get your location/).length).toBeGreaterThan(0)
  })

  it("hides the toolbar and fields when asked, and respects disabled", () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <MapPicker
        defaultValue={{ lat: 1, lng: 2 }}
        search={false}
        locate={false}
        coordinates={false}
        disabled
        onChange={onChange}
      />,
    )
    expect(screen.queryByLabelText("Latitude")).not.toBeInTheDocument()
    expect(screen.getByText(/1\.00000°\u2069 N/)).toBeInTheDocument()
    clickMap(container)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByText(/Click the map/)).not.toBeInTheDocument()
  })

  it("offers Clear without coordinate fields", async () => {
    const onChange = vi.fn()
    renderWithOnu(
      <MapPicker defaultValue={{ lat: 1, lng: 2 }} search={false} coordinates={false} onChange={onChange} />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Clear" }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it("passes FormField errors to the fields", () => {
    renderWithOnu(
      <FormField label="Site" error="Required" required>
        <MapPicker search={false} />
      </FormField>,
    )
    expect(screen.getByLabelText("Latitude")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByLabelText("Latitude")).toBeRequired()
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument()
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<MapPicker search={search} />, { locale: "dv", dir })
    expect(screen.getByRole("group", { name: "ތަނެއް ޚިޔާރުކުރޭ" })).toBeInTheDocument()
    expect(screen.getByLabelText("ލެޓިޓިއުޑް")).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
  })
})

describe("usePlaceSearchBox", () => {
  it("debounces and aborts older requests", async () => {
    vi.useFakeTimers()
    const signals: AbortSignal[] = []
    const slow: PlaceSearch = (q, { signal }) => {
      signals.push(signal)
      return new Promise((resolve) => setTimeout(() => resolve([{ ...places[0]!, label: q }]), 1000))
    }
    let api!: ReturnType<typeof usePlaceSearchBox>
    function Probe() {
      api = usePlaceSearchBox({ search: slow, debounce: 300 })
      return null
    }
    renderWithOnu(<Probe />)
    act(() => api.setQuery("m"))
    expect(api.status).toBe("idle")
    act(() => api.setQuery("ma"))
    act(() => api.setQuery("maa"))
    await act(async () => vi.advanceTimersByTime(300))
    expect(signals).toHaveLength(1)
    expect(api.status).toBe("loading")
    act(() => api.retry())
    expect(signals[0]!.aborted).toBe(true)
    await act(async () => vi.advanceTimersByTime(1000))
    expect(api.status).toBe("done")
    expect(api.results[0]!.label).toBe("maa")
    act(() => api.reset())
    expect(api.query).toBe("")
  })

  it("does nothing without a search function", () => {
    let api!: ReturnType<typeof usePlaceSearchBox>
    function Probe() {
      api = usePlaceSearchBox({ search: null })
      return null
    }
    renderWithOnu(<Probe />)
    act(() => api.setQuery("male"))
    act(() => api.retry())
    expect(api.status).toBe("idle")
  })
})
