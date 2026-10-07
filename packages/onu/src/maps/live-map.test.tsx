import * as React from "react"
import { act, renderHook, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { useAnimatedLatLng } from "./_hooks"
import { LiveMap, type LiveMapMarker, type LiveMapSubscribe } from "./live-map"

const boats: LiveMapMarker[] = [
  {
    id: "a",
    title: "Hiyala",
    position: { lat: 4.17, lng: 73.5 },
    heading: 90,
    updatedAt: Date.UTC(2026, 0, 1, 4, 5, 6),
  },
  { id: "b", title: "Raajje", position: { lat: 4.19, lng: 73.53 }, status: "12 kn" },
]

afterEach(() => vi.unstubAllGlobals())

describe("LiveMap", () => {
  it("lists markers as a text alternative and selects them", async () => {
    const onSelect = vi.fn()
    renderWithOnu(<LiveMap markers={boats} onSelect={onSelect} animationDuration={0} />)
    const list = screen.getByRole("region", { name: "Markers" })
    expect(list).toHaveTextContent("Hiyala")
    expect(list).toHaveTextContent("east")
    expect(list).toHaveTextContent("12 kn")
    const item = screen.getAllByRole("button", { name: /Hiyala/ })[0]!
    await userEvent.click(screen.getByRole("button", { name: "Raajje" }))
    expect(onSelect).toHaveBeenLastCalledWith("b")
    // The marker on the map is a button too.
    const markers = screen.getAllByRole("button", { name: "Raajje" })
    expect(markers.some((m) => m.getAttribute("aria-pressed") === "true")).toBe(true)
    await userEvent.click(markers[0]!)
    expect(onSelect).toHaveBeenLastCalledWith(null)
    expect(item).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("centres on a marker selected from outside the map, without following it", () => {
    const far: LiveMapMarker[] = [
      { id: "a", title: "Hiyala", position: { lat: 4.17, lng: 73.5 } },
      { id: "b", title: "Dhoni", position: { lat: 0.69, lng: 73.15 } },
    ]
    const onFollowChange = vi.fn()
    const marker = (name: string) => document.querySelector<HTMLElement>(`[data-slot=map-marker][aria-label="${name}"]`)
    const { rerender } = renderWithOnu(
      <LiveMap markers={far} selectedId={null} center={far[0]!.position} onFollowChange={onFollowChange} />,
    )
    // Addu is far outside the view at first.
    expect(marker("Dhoni")).toBeNull()
    rerender(<LiveMap markers={far} selectedId="b" center={far[0]!.position} onFollowChange={onFollowChange} />)
    // The camera is centred on it (jsdom has no layout, so the preview uses its default 640×360 size).
    expect(marker("Dhoni")).toHaveStyle({ left: "320px", top: "180px" })
    expect(onFollowChange).not.toHaveBeenCalled()
    expect(screen.queryByText(/Following/)).not.toBeInTheDocument()
    // Deselecting leaves the camera where it is.
    rerender(<LiveMap markers={far} selectedId={null} center={far[0]!.position} onFollowChange={onFollowChange} />)
    expect(marker("Dhoni")).toHaveStyle({ left: "320px", top: "180px" })
  })

  it("centres on a marker picked in the list but not on a tap on the marker itself", async () => {
    const far: LiveMapMarker[] = [
      { id: "a", title: "Hiyala", position: { lat: 4.17, lng: 73.5 } },
      { id: "b", title: "Dhoni", position: { lat: 4.1705, lng: 73.5005 } },
    ]
    renderWithOnu(<LiveMap markers={far} center={far[0]!.position} animationDuration={0} />)
    const marker = (name: string) =>
      document.querySelector<HTMLElement>(`[data-slot=map-marker][aria-label="${name}"]`)!
    const before = marker("Dhoni").style.left
    await userEvent.click(marker("Dhoni"))
    expect(marker("Dhoni").style.left).toBe(before)
    await userEvent.click(
      within(screen.getByRole("region", { name: "Markers" })).getByRole("button", { name: /^Hiyala/ }),
    )
    expect(marker("Hiyala")).toHaveStyle({ left: "320px", top: "180px" })
  })

  it("merges streamed updates and follows a marker", async () => {
    let push!: (m: LiveMapMarker) => void
    const unsubscribe = vi.fn()
    const subscribe: LiveMapSubscribe = (p) => {
      push = p
      return unsubscribe
    }
    const onFollowChange = vi.fn()
    const { unmount } = renderWithOnu(
      <LiveMap markers={boats} subscribe={subscribe} onFollowChange={onFollowChange} animationDuration={0} />,
    )
    act(() => push({ id: "c", title: "Kandu", position: { lat: 4.2, lng: 73.5 } }))
    expect(screen.getByRole("region", { name: "Markers" })).toHaveTextContent("Kandu")
    act(() => push({ ...boats[1]!, position: { lat: 4.195, lng: 73.531 } }))
    expect(screen.getByRole("region", { name: "Markers" })).toHaveTextContent("4.1950")
    const follow = screen.getByRole("button", { name: "Follow Raajje" })
    await userEvent.click(follow)
    expect(follow).toHaveAttribute("aria-pressed", "true")
    expect(onFollowChange).toHaveBeenLastCalledWith("b")
    expect(screen.getAllByText("Following Raajje").length).toBeGreaterThan(0)
    act(() => push({ ...boats[1]!, position: { lat: 4.2, lng: 73.54 } }))
    await userEvent.click(screen.getByRole("button", { name: "Stop following" }))
    expect(screen.getByText("Stopped following")).toBeInTheDocument()
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })

  it("shows an empty state and can hide the list", () => {
    const { rerender } = renderWithOnu(<LiveMap markers={[]} />)
    expect(screen.getByText("Nothing to show yet.")).toBeInTheDocument()
    rerender(<LiveMap markers={boats} list={false} />)
    expect(screen.queryByRole("region", { name: "Markers" })).not.toBeInTheDocument()
  })

  it.each(directions)("works in Dhivehi with 24-hour times (%s)", async (dir) => {
    renderWithOnu(<LiveMap markers={boats} animationDuration={0} />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "Hiyala ގެ ފަހަތުން ދާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("useAnimatedLatLng", () => {
  it("glides with requestAnimationFrame and jumps under reduced motion", () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal("cancelAnimationFrame", vi.fn())
    const now = vi.spyOn(performance, "now").mockReturnValue(0)
    const { result, rerender } = renderHook(({ p }) => useAnimatedLatLng(p, 100), {
      initialProps: { p: { lat: 0, lng: 0 } },
    })
    rerender({ p: { lat: 1, lng: 1 } })
    act(() => frames.shift()!(50))
    expect(result.current.lat).toBeGreaterThan(0)
    expect(result.current.lat).toBeLessThan(1)
    act(() => frames.shift()!(100))
    expect(result.current).toEqual({ lat: 1, lng: 1 })
    rerender({ p: { lat: 1, lng: 1 } })
    now.mockRestore()

    const instant = renderHook(({ p }) => useAnimatedLatLng(p, 0), { initialProps: { p: { lat: 0, lng: 0 } } })
    instant.rerender({ p: { lat: 2, lng: 2 } })
    expect(instant.result.current).toEqual({ lat: 2, lng: 2 })
  })
})

it("keeps React happy when rendered without markers prop", () => {
  renderWithOnu(React.createElement(LiveMap))
  expect(screen.getByText("Nothing to show yet.")).toBeInTheDocument()
})
