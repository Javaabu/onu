import { act, renderHook, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { LoadingOverlay, useDelayedFlag } from "./loading-overlay"

// axe runs are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

describe("useDelayedFlag", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("turns on only after the delay and off immediately", () => {
    const { result, rerender } = renderHook(({ v }) => useDelayedFlag(v, 100), { initialProps: { v: true } })
    expect(result.current).toBe(false)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe(true)
    rerender({ v: false })
    expect(result.current).toBe(false)
    act(() => {
      vi.advanceTimersByTime(1)
    })
    // Turning on again waits for the delay again.
    rerender({ v: true })
    expect(result.current).toBe(false)
  })

  it("is on immediately with no delay", () => {
    const { result } = renderHook(() => useDelayedFlag(true, 0))
    expect(result.current).toBe(true)
  })
})

describe("LoadingOverlay", () => {
  afterEach(() => vi.useRealTimers())

  it("marks the container busy, then shows the overlay after the delay (no flicker)", () => {
    vi.useFakeTimers()
    const { container } = renderWithOnu(
      <LoadingOverlay loading message="Refreshing payments…">
        <button type="button">Pay</button>
      </LoadingOverlay>,
    )
    const root = container.querySelector("[data-slot=loading-overlay]")!
    expect(root).toHaveAttribute("aria-busy", "true")
    expect(root.querySelector("[data-slot=loading-overlay-overlay]")).toBeNull()
    expect(screen.getByRole("status")).toBeEmptyDOMElement()
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(root.querySelector("[data-slot=loading-overlay-overlay]")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Refreshing payments…")
    expect(screen.getByText("Refreshing payments…", { selector: "[aria-hidden]" })).toBeInTheDocument()
    expect(root.querySelector("[data-slot=loading-overlay-content]")).toHaveAttribute("inert")
  })

  it("never shows for loads shorter than the delay", () => {
    vi.useFakeTimers()
    const { container, rerender } = renderWithOnu(<LoadingOverlay loading>Body</LoadingOverlay>)
    act(() => {
      vi.advanceTimersByTime(100)
    })
    rerender(<LoadingOverlay loading={false}>Body</LoadingOverlay>)
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(container.querySelector("[data-slot=loading-overlay-overlay]")).toBeNull()
    expect(container.querySelector("[data-slot=loading-overlay]")).toHaveAttribute("aria-busy", "false")
  })

  it("announces a default message to screen readers", async () => {
    renderWithOnu(
      <LoadingOverlay loading delay={0}>
        Body
      </LoadingOverlay>,
    )
    expect(screen.getByRole("status")).toHaveTextContent("Loading…")
    await expectNoA11yViolations()
  })

  it("covers the viewport with fullScreen and accepts classNames", () => {
    const { container } = renderWithOnu(
      <LoadingOverlay
        loading
        delay={0}
        fullScreen
        blur={false}
        className="root-x"
        classNames={{ overlay: "ov-x", spinner: "sp-x", message: "msg-x" }}
        message="Submitting…"
      />,
    )
    const overlay = container.querySelector("[data-slot=loading-overlay-overlay]")!
    expect(overlay).toHaveClass("fixed", "inset-0", "ov-x")
    expect(overlay).not.toHaveClass("backdrop-blur-[2px]")
    expect(overlay.querySelector(".sp-x")).toBeInTheDocument()
    expect(overlay.querySelector(".msg-x")).toHaveTextContent("Submitting…")
    expect(container.querySelector("[data-slot=loading-overlay]")).toHaveClass("root-x")
    expect(container.querySelector("[data-slot=loading-overlay-content]")).toBeNull()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(
      <LoadingOverlay loading delay={0}>
        ރިޕޯޓު
      </LoadingOverlay>,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("status")).toHaveTextContent("ލޯޑުވަނީ…")
    await expectNoA11yViolations()
  })
})
