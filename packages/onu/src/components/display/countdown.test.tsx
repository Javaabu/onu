import * as React from "react"
import { act, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createTranslator } from "../../i18n/translate"
import { en } from "../../locales"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Countdown, describeDuration, getCountdownParts } from "./countdown"

const NOW = new Date("2026-03-12T10:00:00Z")
const later = (seconds: number) => new Date(NOW.getTime() + seconds * 1000)

describe("countdown helpers", () => {
  it("splits time into parts", () => {
    expect(getCountdownParts(later(2 * 86_400 + 3 * 3600 + 4 * 60 + 5), NOW.getTime())).toMatchObject({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    })
    expect(getCountdownParts(later(-10), NOW.getTime()).total).toBe(0)
  })

  it("describes durations for screen readers", () => {
    const t = createTranslator(en)
    expect(describeDuration(86_400 + 120, t)).toBe("1 day, 2 minutes")
    expect(describeDuration(45, t)).toBe("45 seconds")
  })
})

describe("Countdown", () => {
  beforeEach(() => vi.useFakeTimers({ now: NOW }))
  afterEach(() => vi.useRealTimers())

  it("shows days, hours, minutes and seconds with tabular numbers", () => {
    const { container } = renderWithOnu(<Countdown to={later(86_400 + 3600 + 60 + 1)} />)
    const timer = screen.getByRole("timer", { name: "Countdown" })
    expect(timer).toHaveClass("tabular-nums")
    const values = Array.from(container.querySelectorAll("[data-unit]"), (el) => el.firstElementChild?.textContent)
    expect(values).toEqual(["01", "01", "01", "01"])
    expect(screen.getByText("day")).toBeInTheDocument()
    expect(screen.getByText("second")).toBeInTheDocument()
  })

  it("ticks every second and fires onComplete once at zero", () => {
    const onComplete = vi.fn()
    const { container } = renderWithOnu(<Countdown to={later(3)} onComplete={onComplete} />)
    const seconds = () => container.querySelector("[data-unit=seconds]")?.firstElementChild?.textContent
    expect(seconds()).toBe("03")
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(seconds()).toBe("02")
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(container.querySelector("[data-slot=countdown]")).toHaveAttribute("data-state", "complete")
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it("throttles aria-live announcements", () => {
    const { container } = renderWithOnu(<Countdown to={later(150)} announceEvery={60} />)
    const live = container.querySelector("[data-slot=countdown-announcer]")!
    expect(live).toHaveAttribute("aria-live", "polite")
    expect(live).toHaveTextContent("3 minutes remaining")
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    // The clock moved, the announcement did not.
    expect(live).toHaveTextContent("3 minutes remaining")
    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(live).toHaveTextContent("2 minutes remaining")
    act(() => {
      vi.advanceTimersByTime(120_000)
    })
    expect(live).toHaveTextContent("Time's up")
  })

  it("supports the inline variant, hiding days and seconds, and completion text", () => {
    const { container, rerender } = renderWithOnu(
      <Countdown to={later(2 * 86_400)} variant="inline" showDays={false} showSeconds={false} />,
    )
    expect(container.querySelector("[data-unit=hours]")).toHaveTextContent("48")
    expect(container.querySelector("[data-unit=seconds]")).toBeNull()
    rerender(<Countdown to={later(-1)} completeText="Registration closed" />)
    expect(screen.getByText("Registration closed")).toBeInTheDocument()
  })

  it("restarts when the target moves into the future", () => {
    const { container, rerender } = renderWithOnu(<Countdown to={later(-1)} />)
    expect(container.querySelector("[data-slot=countdown]")).toHaveAttribute("data-state", "complete")
    rerender(<Countdown to={later(100)} showDays />)
    expect(container.querySelector("[data-slot=countdown]")).toHaveAttribute("data-state", "running")
    expect(container.querySelector("[data-unit=days]")).toBeInTheDocument()
  })

  it("renders nothing for an invalid date", () => {
    const { container } = renderWithOnu(<Countdown to={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it.each(directions)("is accessible in %s (dv)", async (dir) => {
    vi.useRealTimers()
    const { container } = renderWithOnu(<Countdown to={new Date(Date.now() + 10 ** 10)} />, { dir, locale: "dv" })
    expect(screen.getByText("ދުވަސް")).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
