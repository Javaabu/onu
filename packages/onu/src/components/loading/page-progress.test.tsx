import { act, renderHook, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { PageProgress, createPageProgress, pageProgress, usePageProgress, usePageProgressState } from "./page-progress"

// axe runs are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const tick = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

describe("createPageProgress", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("starts, trickles towards the end without reaching it, and finishes", () => {
    const p = createPageProgress()
    expect(p.getState()).toEqual({ active: false, value: 0 })
    p.start()
    expect(p.getState()).toEqual({ active: true, value: 0.08 })
    vi.advanceTimersByTime(60_000)
    expect(p.getState().value).toBeGreaterThan(0.9)
    expect(p.getState().value).toBeLessThan(1)
    p.done()
    expect(p.getState()).toEqual({ active: true, value: 1 })
    vi.advanceTimersByTime(300)
    expect(p.getState()).toEqual({ active: false, value: 0 })
  })

  it("nests start/done calls and supports force", () => {
    const p = createPageProgress()
    p.start()
    p.start()
    p.done()
    expect(p.getState().value).toBeLessThan(1)
    p.done()
    expect(p.getState().value).toBe(1)
    p.start()
    p.start()
    p.done(true)
    expect(p.getState().value).toBe(1)
    p.done()
  })

  it("sets and increments the value, notifying subscribers", () => {
    const p = createPageProgress()
    const listener = vi.fn()
    const unsubscribe = p.subscribe(listener)
    p.inc()
    expect(p.getState().active).toBe(false)
    p.set(0.5)
    expect(p.getState()).toEqual({ active: true, value: 0.5 })
    p.inc(0.1)
    expect(p.getState().value).toBeCloseTo(0.6)
    p.set(2)
    expect(p.getState().value).toBe(1)
    expect(listener).toHaveBeenCalled()
    unsubscribe()
    listener.mockClear()
    p.set(-1)
    expect(p.getState().value).toBe(0)
    expect(listener).not.toHaveBeenCalled()
    p.done(true)
  })

  it("restarts cleanly while finishing", () => {
    const p = createPageProgress()
    p.start()
    p.done()
    p.start()
    expect(p.getState()).toEqual({ active: true, value: 0.08 })
    vi.advanceTimersByTime(400)
    expect(p.getState().active).toBe(true)
    p.done()
  })
})

describe("PageProgress", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    act(() => pageProgress.done(true))
    vi.advanceTimersByTime(1000)
    vi.useRealTimers()
  })

  it("shows a thin progressbar after the delay and hides when done", async () => {
    const p = createPageProgress()
    renderWithOnu(<PageProgress controller={p} />)
    expect(screen.queryByRole("progressbar")).toBeNull()
    act(() => p.start())
    expect(screen.queryByRole("progressbar")).toBeNull()
    tick(150)
    const bar = screen.getByRole("progressbar", { name: "Loading page" })
    expect(bar).toHaveAttribute("data-state", "loading")
    expect(bar).toHaveClass("fixed", "top-0")
    expect(bar.querySelector("[data-slot=page-progress-bar]")).toHaveClass("start-0", "motion-reduce:transition-none")
    vi.useRealTimers()
    await expectNoA11yViolations()
    vi.useFakeTimers()
    act(() => p.done())
    expect(bar).toHaveAttribute("data-state", "complete")
    expect(bar).toHaveAttribute("aria-valuenow", "100")
    tick(300)
    expect(screen.queryByRole("progressbar")).toBeNull()
  })

  it("does not flash for navigations faster than the delay", () => {
    const p = createPageProgress()
    renderWithOnu(<PageProgress controller={p} delay={200} />)
    act(() => p.start())
    tick(100)
    act(() => p.done())
    tick(150)
    expect(screen.queryByRole("progressbar")).toBeNull()
    tick(500)
    expect(screen.queryByRole("progressbar")).toBeNull()
  })

  it("follows the shared controller by default and accepts styling props", () => {
    renderWithOnu(
      <PageProgress
        delay={0}
        position="absolute"
        height={5}
        color="success"
        className="pp-x"
        classNames={{ bar: "bar-x" }}
      />,
    )
    act(() => pageProgress.set(0.4))
    tick(1)
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveClass("absolute", "pp-x")
    expect(bar.style.height).toBe("5px")
    const fill = bar.querySelector("[data-slot=page-progress-bar]") as HTMLElement
    expect(fill).toHaveClass("bg-success", "bar-x")
    expect(fill.style.width).toBe("40%")
  })

  it("usePageProgress starts while loading and finishes on unmount or when loading ends", () => {
    const p = createPageProgress()
    const { rerender, unmount } = renderHook(({ loading }) => usePageProgress(loading, p), {
      initialProps: { loading: true },
    })
    expect(p.getState().active).toBe(true)
    rerender({ loading: false })
    expect(p.getState().value).toBe(1)
    rerender({ loading: true })
    unmount()
    expect(p.getState().value).toBe(1)
  })

  it("usePageProgressState reads the shared controller", () => {
    const { result } = renderHook(() => usePageProgressState())
    expect(result.current.active).toBe(false)
  })

  it.each(directions)("works in %s with Dhivehi strings", (dir) => {
    const p = createPageProgress()
    renderWithOnu(<PageProgress controller={p} delay={0} />, { locale: "dv", dir })
    act(() => p.start())
    tick(1)
    expect(screen.getByRole("progressbar", { name: "ސަފްހާ ލޯޑުވަނީ" })).toBeInTheDocument()
  })
})
