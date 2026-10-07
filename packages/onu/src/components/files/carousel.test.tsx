import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "../../ui/carousel"
import { Carousel, CarouselAutoplayToggle, CarouselDots, useCarouselState } from "./carousel"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

type Api = NonNullable<CarouselApi>

function Slides({ count = 3 }: { count?: number }) {
  return (
    <CarouselContent>
      {Array.from({ length: count }, (_, i) => (
        <CarouselItem key={i}>Slide {i + 1}</CarouselItem>
      ))}
    </CarouselContent>
  )
}

/** Wraps Embla's api so tests can drive selection and observe navigation. */
function spyApi(api: Api) {
  let selected = 0
  const listeners = new Map<string, Set<() => void>>()
  vi.spyOn(api, "scrollSnapList").mockReturnValue([0, 0.5, 1])
  vi.spyOn(api, "selectedScrollSnap").mockImplementation(() => selected)
  vi.spyOn(api, "on").mockImplementation(((name: string, cb: () => void) => {
    if (!listeners.has(name)) listeners.set(name, new Set())
    listeners.get(name)!.add(cb)
    return api
  }) as unknown as Api["on"])
  vi.spyOn(api, "off").mockImplementation(((name: string, cb: () => void) => {
    listeners.get(name)?.delete(cb)
    return api
  }) as unknown as Api["off"])
  const select = (i: number) => {
    selected = i
    act(() => listeners.get("select")?.forEach((cb) => cb()))
  }
  const scrollTo = vi.spyOn(api, "scrollTo").mockImplementation((i: number) => select(i))
  const scrollNext = vi.spyOn(api, "scrollNext").mockImplementation(() => select(selected + 1))
  const scrollPrev = vi.spyOn(api, "scrollPrev").mockImplementation(() => select(selected - 1))
  vi.spyOn(api, "canScrollNext").mockImplementation(() => selected < 2)
  vi.spyOn(api, "canScrollPrev").mockImplementation(() => selected > 0)
  return {
    select,
    scrollTo,
    scrollNext,
    scrollPrev,
    reInit: () => act(() => listeners.get("reInit")?.forEach((cb) => cb())),
  }
}

function setup(
  ui: (setApi: (api: CarouselApi) => void) => React.ReactElement,
  options?: Parameters<typeof renderWithOnu>[1],
) {
  let api: Api | undefined
  let spies: ReturnType<typeof spyApi> | undefined
  const result = renderWithOnu(
    ui((a) => {
      // Spy before the Onu carousel subscribes to the api.
      if (a && a !== api) {
        api = a
        spies = spyApi(a)
      }
    }),
    options,
  )
  spies!.reInit()
  return { ...result, api: api!, ...spies! }
}

afterEach(() => vi.useRealTimers())

describe("Carousel", () => {
  it("is a labelled region with translated controls, dots and announcements", async () => {
    const { scrollTo } = setup((setApi) => (
      <Carousel label="Featured islands" setApi={setApi} className="extra">
        <Slides />
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots classNames={{ dot: "dot-x" }} />
      </Carousel>
    ))
    const region = screen.getByRole("region", { name: "Featured islands" })
    expect(region).toHaveAttribute("aria-roledescription", "carousel")
    expect(region).toHaveClass("extra")
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeInTheDocument()
    const dots = screen.getAllByRole("button", { name: /Go to slide/ })
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveAttribute("aria-current", "true")
    expect(dots[0]).toHaveClass("dot-x")
    await userEvent.click(dots[2]!)
    expect(scrollTo).toHaveBeenCalledWith(2)
    expect(dots[2]).toHaveAttribute("aria-current", "true")
    expect(screen.getByText("Slide 3 of 3")).toHaveAttribute("aria-live", "polite")
    await expectNoA11yViolations()
  })

  it.each(directions)("arrow keys follow the visual order in %s", (dir) => {
    const { scrollNext, scrollPrev } = setup(
      (setApi) => (
        <Carousel label="c" setApi={setApi}>
          <Slides />
        </Carousel>
      ),
      { dir },
    )
    const region = screen.getByRole("region")
    fireEvent.keyDown(region, { key: "ArrowLeft" })
    expect(dir === "rtl" ? scrollNext : scrollPrev).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(region, { key: "ArrowRight" })
    expect(dir === "rtl" ? scrollPrev : scrollNext).toHaveBeenCalledTimes(1)
  })

  it("autoplays, pauses on hover and focus, and has a pause button", () => {
    vi.useFakeTimers()
    const { scrollNext, scrollTo, select } = setup((setApi) => (
      <Carousel label="c" setApi={setApi} autoplay={{ delay: 1000 }} loop>
        <Slides />
        <CarouselAutoplayToggle />
      </Carousel>
    ))
    const region = screen.getByRole("region")
    expect(region).toHaveAttribute("data-autoplay", "running")
    act(() => vi.advanceTimersByTime(1000))
    expect(scrollNext).toHaveBeenCalledTimes(1)
    select(2)
    act(() => vi.advanceTimersByTime(1000))
    expect(scrollTo).toHaveBeenCalledWith(0)
    // Live region is off while rotating.
    expect(screen.getByText(/Slide \d of 3/)).toHaveAttribute("aria-live", "off")

    fireEvent.pointerEnter(region, { pointerType: "mouse" })
    expect(region).toHaveAttribute("data-autoplay", "paused")
    fireEvent.pointerLeave(region)
    expect(region).toHaveAttribute("data-autoplay", "running")

    const toggle = screen.getByRole("button", { name: "Pause slides" })
    fireEvent.click(toggle)
    expect(screen.getByRole("button", { name: "Play slides" })).toBeInTheDocument()
    fireEvent.blur(toggle)
    expect(region).toHaveAttribute("data-autoplay", "paused")
    fireEvent.click(screen.getByRole("button", { name: "Play slides" }))
    fireEvent.blur(screen.getByRole("button", { name: "Pause slides" }), { relatedTarget: document.body })
    expect(region).toHaveAttribute("data-autoplay", "running")
  })

  it("stops for good on interaction when asked", () => {
    vi.useFakeTimers()
    const { scrollNext } = setup((setApi) => (
      <Carousel label="c" setApi={setApi} autoplay={{ delay: 500, stopOnInteraction: true }}>
        <Slides />
        <CarouselDots />
      </Carousel>
    ))
    const region = screen.getByRole("region")
    fireEvent.pointerDown(region)
    fireEvent.keyDown(region, { key: "ArrowRight" })
    act(() => vi.advanceTimersByTime(2000))
    // Only the key press moved it.
    expect(scrollNext).toHaveBeenCalledTimes(1)
    expect(region).toHaveAttribute("data-autoplay", "paused")
  })

  it("hides dots and the toggle when not useful", () => {
    renderWithOnu(
      <Carousel label="c">
        <Slides count={1} />
        <CarouselDots />
        <CarouselAutoplayToggle />
      </Carousel>,
    )
    expect(screen.queryByRole("group", { name: "Choose slide" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /slides/ })).not.toBeInTheDocument()
  })

  it("throws a helpful error outside a Carousel", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    function Bad() {
      useCarouselState()
      return null
    }
    expect(() => renderWithOnu(<Bad />)).toThrow(/within an Onu <Carousel/)
    spy.mockRestore()
  })

  it("uses Dhivehi labels", () => {
    setup(
      (setApi) => (
        <Carousel label="ރަށްތައް" setApi={setApi}>
          <Slides />
          <CarouselNext />
          <CarouselDots />
        </Carousel>
      ),
      { locale: "dv" },
    )
    expect(screen.getByRole("button", { name: "ދެން އޮތް ސްލައިޑް" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "ސްލައިޑް ހޮވާ" })).toBeInTheDocument()
  })
})
