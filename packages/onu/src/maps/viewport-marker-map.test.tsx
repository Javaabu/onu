import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { MapInfoPanel } from "./map-info-panel"
import type { LatLngBounds } from "./types"
import { ViewportMarkerMap, type ViewportFetcher, type ViewportMarker } from "./viewport-marker-map"

const markers: ViewportMarker[] = [
  { id: "a", title: "Clinic", description: "Malé", position: { lat: 4.1755, lng: 73.5093 }, tone: "destructive" },
  { id: "b", title: "School", position: { lat: 4.176, lng: 73.51 } },
]

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
afterEach(() => vi.useRealTimers())

async function flush(ms = 300) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

describe("ViewportMarkerMap", () => {
  it("loads markers for the visible bounds after a debounce and lists them", async () => {
    const fetcher = vi.fn<ViewportFetcher>().mockResolvedValue(markers)
    const onLoad = vi.fn()
    renderWithOnu(<ViewportMarkerMap fetcher={fetcher} onLoad={onLoad} zoom={14} />)
    expect(fetcher).not.toHaveBeenCalled()
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(1)
    const [bounds, ctx] = fetcher.mock.calls[0]!
    expect((bounds as LatLngBounds).north).toBeGreaterThan(4.1755)
    expect(ctx.zoom).toBe(14)
    expect(ctx.signal).toBeInstanceOf(AbortSignal)
    expect(await screen.findByText("2 places in view")).toBeInTheDocument()
    expect(onLoad).toHaveBeenCalledWith(markers, bounds)
    expect(screen.getByRole("list", { name: "Markers" })).toHaveTextContent("Clinic")
    await expectNoA11yViolations()
  })

  it("aborts the previous request when the view changes", async () => {
    const signals: AbortSignal[] = []
    const fetcher: ViewportFetcher = (_b, { signal }) => {
      signals.push(signal)
      return new Promise(() => {})
    }
    renderWithOnu(<ViewportMarkerMap fetcher={fetcher} />)
    await flush()
    expect(screen.getAllByText("Loading places…").length).toBeGreaterThan(0)
    // Zoom in: a new view → debounce → new request; the old one is aborted.
    await userEvent.click(screen.getByRole("button", { name: "Zoom in" }))
    await flush(100)
    expect(signals).toHaveLength(1)
    await flush(300)
    expect(signals).toHaveLength(2)
    expect(signals[0]!.aborted).toBe(true)
    expect(signals[1]!.aborted).toBe(false)
  })

  it("asks to zoom in below minZoom", async () => {
    const fetcher = vi.fn<ViewportFetcher>().mockResolvedValue(markers)
    renderWithOnu(<ViewportMarkerMap fetcher={fetcher} zoom={8} minZoom={10} />)
    await flush()
    expect(fetcher).not.toHaveBeenCalled()
    expect(screen.getByText("Zoom in to see places.")).toBeInTheDocument()
  })

  it("shows errors with Retry", async () => {
    const fetcher = vi.fn<ViewportFetcher>().mockRejectedValueOnce(new Error("500")).mockResolvedValue(markers)
    renderWithOnu(<ViewportMarkerMap fetcher={fetcher} />)
    await flush()
    expect(await screen.findByText("Couldn't load places for this area.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Retry" }))
    expect(await screen.findByText("2 places in view")).toBeInTheDocument()
  })

  it("selects markers from the list or the map (without clustering)", async () => {
    const onSelect = vi.fn()
    renderWithOnu(
      <ViewportMarkerMap
        fetcher={async () => markers}
        cluster={false}
        onSelect={onSelect}
        overlay={<MapInfoPanel open={false} onOpenChange={() => {}} title="x" />}
      />,
    )
    await flush()
    await screen.findByText("2 places in view")
    const listItem = screen.getByRole("list", { name: "Markers" }).querySelector("button")!
    await userEvent.click(listItem)
    expect(onSelect).toHaveBeenLastCalledWith("a", markers[0])
    expect(listItem).toHaveAttribute("aria-pressed", "true")
    const pins = screen.getAllByRole("button", { name: "School" })
    await userEvent.click(pins[0]!)
    expect(onSelect).toHaveBeenLastCalledWith("b", markers[1])
    await userEvent.click(pins[0]!)
    expect(onSelect).toHaveBeenLastCalledWith(null, null)
  })

  it("renders clustered markers through the engine and can hide the list", async () => {
    renderWithOnu(<ViewportMarkerMap fetcher={async () => markers} list={false} />)
    await flush()
    await screen.findByText("2 places in view")
    expect(screen.queryByRole("list", { name: "Markers" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Clinic" }))
    expect(screen.getByRole("button", { name: "Clinic" })).toHaveAttribute("aria-pressed", "true")
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<ViewportMarkerMap fetcher={async () => []} />, { locale: "dv", dir })
    await flush()
    expect(await screen.findByText("ފެންނަ ސަރަހައްދުގައި އެއްވެސް ތަނެއް ނެތް")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
