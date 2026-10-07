import * as React from "react"
import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { autoUpdateInterval, RelativeDate } from "./relative-date"

const NOW = new Date("2026-03-12T10:00:00Z")
const minutes = (n: number) => new Date(NOW.getTime() + n * 60_000)

function mockNoHover(noHover: boolean) {
  const original = window.matchMedia
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === "(hover: none)" ? noHover : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  return () => {
    window.matchMedia = original
  }
}

describe("RelativeDate (§25.5)", () => {
  let restore: (() => void) | undefined
  afterEach(() => {
    restore?.()
    restore = undefined
    vi.useRealTimers()
  })

  describe("shows times like “just now”, “5 minutes ago”, “3 days ago” or “in 2 hours”", () => {
    it.each([
      [new Date(NOW.getTime() - 10_000), "just now"],
      [minutes(-5), "5 minutes ago"],
      [minutes(-3 * 24 * 60), "3 days ago"],
      [minutes(120), "in 2 hours"],
    ])("English: %s → %s", (value, expected) => {
      renderWithOnu(<RelativeDate value={value} now={NOW} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
    })

    it.each([
      [new Date(NOW.getTime() - 10_000), "ހަމަ މިހާރު"],
      [minutes(-5), "5 މިނެޓު ކުރިން"],
      [minutes(-3 * 24 * 60), "3 ދުވަސް ކުރިން"],
      [minutes(120), "2 ގަޑިއިރު ފަހުން"],
    ])("Dhivehi: %s → %s", (value, expected) => {
      renderWithOnu(<RelativeDate value={value} now={NOW} />, { locale: "dv" })
      expect(screen.getByText(expected)).toBeInTheDocument()
    })
  })

  it("hovering shows the exact date and time in a tooltip", async () => {
    restore = mockNoHover(false)
    const user = userEvent.setup()
    renderWithOnu(<RelativeDate value={minutes(-5)} now={NOW} tooltipDelay={0} format="yyyy-MM-dd HH:mm" />)
    await user.hover(screen.getByText("5 minutes ago"))
    expect(await screen.findByRole("tooltip")).toHaveTextContent(/2026-03-12 \d\d:55/)
  })

  it("focusing shows the exact date and time in a tooltip", async () => {
    restore = mockNoHover(false)
    const user = userEvent.setup()
    renderWithOnu(<RelativeDate value={minutes(-5)} now={NOW} format="yyyy-MM-dd HH:mm" />)
    await user.tab()
    const time = screen.getByText("5 minutes ago")
    expect(time).toHaveFocus()
    expect(await screen.findByRole("tooltip")).toHaveTextContent(/2026-03-12 \d\d:55/)
  })

  it("on touch screens (no hover) shows the exact date and time in smaller text underneath", () => {
    restore = mockNoHover(true)
    const { container } = renderWithOnu(<RelativeDate value={minutes(-5)} now={NOW} format="yyyy-MM-dd HH:mm" />)
    const exact = container.querySelector("[data-slot=relative-date-exact]")
    expect(exact).toHaveTextContent(/2026-03-12 \d\d:55/)
    expect(exact).toHaveClass("text-xs")
    expect(screen.getByText("5 minutes ago").tagName).toBe("TIME")
    expect(screen.getByText("5 minutes ago")).not.toHaveAttribute("tabindex")
  })

  it("with no value shows “—”", () => {
    const { container } = renderWithOnu(<RelativeDate value={null} />)
    expect(container).toHaveTextContent("—")
    expect(screen.getByText("Not set")).toHaveClass("sr-only")
    renderWithOnu(<RelativeDate value="" />)
    renderWithOnu(<RelativeDate value="not a date" />)
    expect(screen.getAllByText("—")).toHaveLength(3)
  })

  it("renders a semantic <time dateTime>", () => {
    renderWithOnu(<RelativeDate value={minutes(-5)} now={NOW} />)
    expect(screen.getByText("5 minutes ago")).toHaveAttribute("datetime", minutes(-5).toISOString())
  })

  it("updates itself as time passes", () => {
    vi.useFakeTimers({ now: NOW })
    renderWithOnu(<RelativeDate value={NOW} />)
    expect(screen.getByText("just now")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(2 * 60_000)
    })
    expect(screen.getByText("2 minutes ago")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(60 * 60_000)
    })
    expect(screen.getByText("1 hour ago")).toBeInTheDocument()
  })

  it("does not update with updateInterval={false} or a fixed now", () => {
    vi.useFakeTimers({ now: NOW })
    renderWithOnu(<RelativeDate value={NOW} updateInterval={false} />)
    act(() => {
      vi.advanceTimersByTime(5 * 60_000)
    })
    expect(screen.getByText("just now")).toBeInTheDocument()
  })

  it("picks a refresh interval by age", () => {
    const now = NOW.getTime()
    expect(autoUpdateInterval(new Date(now - 5_000), now)).toBe(10_000)
    expect(autoUpdateInterval(minutes(-5), now)).toBe(30_000)
    expect(autoUpdateInterval(minutes(-120), now)).toBe(300_000)
    expect(autoUpdateInterval(minutes(-3 * 24 * 60), now)).toBe(3_600_000)
  })

  it("can hide the exact date and uses a title instead", () => {
    renderWithOnu(<RelativeDate value={minutes(-5)} now={NOW} showExact={false} format="yyyy" />)
    expect(screen.getByText("5 minutes ago")).toHaveAttribute("title", "2026")
  })

  it.each(directions)("works in %s", async (dir) => {
    restore = mockNoHover(false)
    const { container } = renderWithOnu(<RelativeDate value={minutes(-5)} now={NOW} className="custom" />, { dir })
    expect(container.querySelector("time")).toHaveClass("custom")
    await expectNoA11yViolations(container)
  })
})
