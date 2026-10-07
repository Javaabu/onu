import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { MapNavigation, type NavigationStop } from "./map-navigation"
import type { RouteResult, RouteService } from "./types"

const stops: NavigationStop[] = [
  { label: "Warehouse", position: { lat: 4.17, lng: 73.5 } },
  { label: "IGMH", position: { lat: 4.17, lng: 73.51 } },
  { label: "Hulhumalé", position: { lat: 4.21, lng: 73.54 } },
]

const serviceRoute: RouteResult = {
  source: "service",
  path: stops.map((s) => s.position),
  legs: [
    {
      from: stops[0]!.position,
      to: stops[1]!.position,
      distance: 1200,
      duration: 300,
      steps: [
        { instruction: "Head east on Majeedhee Magu", distance: 800, duration: 200, start: stops[0]!.position },
        { instruction: "Turn left", distance: 400, duration: 100, start: { lat: 4.171, lng: 73.507 } },
      ],
    },
    {
      from: stops[1]!.position,
      to: stops[2]!.position,
      distance: 6000,
      duration: 900,
      steps: [{ instruction: "Cross the bridge", distance: 6000, duration: 900, start: stops[1]!.position }],
    },
  ],
}

describe("MapNavigation", () => {
  it("falls back to straight segments without a routing service", async () => {
    const onRoute = vi.fn()
    renderWithOnu(<MapNavigation stops={stops} onRoute={onRoute} />)
    expect(screen.getByText(/straight lines between stops are shown/)).toBeInTheDocument()
    expect(screen.getByText("Head east from Warehouse to IGMH")).toBeInTheDocument()
    expect(screen.getByText("Head north-east from IGMH to Hulhumalé")).toBeInTheDocument()
    expect(screen.getByText("Arrive at Hulhumalé")).toBeInTheDocument()
    expect(screen.getByText("2 steps")).toBeInTheDocument()
    expect(onRoute).toHaveBeenCalledWith(expect.objectContaining({ source: "straight" }))
    expect(screen.getByRole("link", { name: /Open in Google Maps/ })).toHaveAttribute(
      "href",
      expect.stringContaining("waypoints=4.17%2C73.51"),
    )
    expect(screen.getByRole("img", { name: "Stop A: Warehouse" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("uses a routing service, with step navigation by buttons", async () => {
    const service = vi.fn<RouteService>().mockResolvedValue(serviceRoute)
    const onActiveStepChange = vi.fn()
    renderWithOnu(<MapNavigation stops={stops} routeService={service} onActiveStepChange={onActiveStepChange} />)
    expect(screen.getByText("Finding the route…")).toBeInTheDocument()
    expect(await screen.findByText("Head east on Majeedhee Magu")).toBeInTheDocument()
    expect(screen.queryByText(/straight lines/)).not.toBeInTheDocument()
    expect(screen.getByText("7.2 km")).toBeInTheDocument()
    expect(screen.getByText("20 min")).toBeInTheDocument()
    const next = screen.getByRole("button", { name: "Next" })
    const prev = screen.getByRole("button", { name: "Previous" })
    await userEvent.click(next)
    expect(onActiveStepChange).toHaveBeenLastCalledWith(0)
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument()
    expect(prev).toBeDisabled()
    await userEvent.click(next)
    await userEvent.click(next)
    expect(next).toBeDisabled()
    expect(screen.getByRole("button", { name: /Cross the bridge/ })).toHaveAttribute("aria-current", "step")
    expect(screen.getByText("Step 3 of 3: Cross the bridge")).toBeInTheDocument()
    await userEvent.click(prev)
    expect(onActiveStepChange).toHaveBeenLastCalledWith(1)
    await userEvent.click(screen.getByRole("button", { name: /Head east on/ }))
    expect(onActiveStepChange).toHaveBeenLastCalledWith(0)
  })

  it("starts from Previous at the first step and handles an unknown duration", async () => {
    const route: RouteResult = { ...serviceRoute, legs: [{ ...serviceRoute.legs[0]!, duration: undefined }] }
    renderWithOnu(<MapNavigation stops={stops.slice(0, 2)} routeService={async () => route} externalLink={false} />)
    await screen.findByText("Head east on Majeedhee Magu")
    expect(screen.queryByText(/min$/)).not.toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it("explains when the routing service fails", async () => {
    renderWithOnu(<MapNavigation stops={stops} routeService={() => Promise.reject(new Error("quota"))} />)
    expect(await screen.findByText(/route couldn't be loaded/)).toBeInTheDocument()
    expect(screen.getByText("Head east from Warehouse to IGMH")).toBeInTheDocument()
  })

  it("aborts a stale request when stops change", async () => {
    const signals: AbortSignal[] = []
    const service: RouteService = (_s, { signal }) => {
      signals.push(signal)
      return new Promise(() => {})
    }
    const { rerender } = renderWithOnu(<MapNavigation stops={stops} routeService={service} />)
    rerender(<MapNavigation stops={stops.slice(0, 2)} routeService={service} />)
    await waitFor(() => expect(signals[0]!.aborted).toBe(true))
  })

  it("can be controlled", () => {
    renderWithOnu(<MapNavigation stops={stops} routeService={false} activeStep={1} />)
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument()
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<MapNavigation stops={stops} routeService={false} />, { locale: "dv", dir })
    expect(screen.getByText("Warehouse އިން IGMH އަށް އިރުމަތި ފަރާތަށް")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /ގޫގުލް މެޕްސްގައި ހުޅުވާ/ })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
