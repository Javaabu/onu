import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { MiniCalendar, type MiniCalendarEvent } from "./mini-calendar"

const MONTH = new Date(2026, 2, 1)
const events: MiniCalendarEvent[] = [
  { id: 1, date: new Date(2026, 2, 12, 9), title: "Independence Day rehearsal", tone: "primary", href: "/e/1" },
  { id: 2, date: new Date(2026, 2, 12, 14), title: "Council meeting", tone: "warning" },
  { id: 3, date: new Date(2026, 2, 20), title: "Job fair", tone: "success" },
  { id: 4, date: "invalid", title: "Ignored" },
]

describe("MiniCalendar", () => {
  it("shows event dots and counts them in the day's accessible name", () => {
    const { container } = renderWithOnu(<MiniCalendar events={events} defaultMonth={MONTH} />)
    const day = screen.getByRole("button", { name: /March 12th, 2026, 2 events/ })
    expect(day.querySelectorAll("[data-slot=mini-calendar-dot]")).toHaveLength(2)
    expect(container.querySelectorAll("[data-slot=mini-calendar-dot]")).toHaveLength(3)
  })

  it("lists a day's events when clicked and reports them", async () => {
    const user = userEvent.setup()
    const onDayClick = vi.fn()
    renderWithOnu(<MiniCalendar events={events} defaultMonth={MONTH} onDayClick={onDayClick} />)
    await user.click(screen.getByRole("button", { name: /March 12th, 2026/ }))
    expect(onDayClick).toHaveBeenCalledWith(expect.any(Date), [events[0], events[1]])
    const list = document.querySelector("[data-slot=mini-calendar-events]") as HTMLElement
    expect(within(list).getByRole("link", { name: "Independence Day rehearsal" })).toHaveAttribute("href", "/e/1")
    expect(within(list).getByText("Council meeting")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /March 13th, 2026/ }))
    expect(within(list).getByText("No events")).toBeInTheDocument()
    // Clicking the active day again keeps reporting it.
    await user.click(screen.getByRole("button", { name: /March 13th, 2026/ }))
    expect(onDayClick).toHaveBeenCalledTimes(3)
  })

  it("can hide the list and limit dots", async () => {
    renderWithOnu(<MiniCalendar events={events} defaultMonth={MONTH} showEventList={false} maxDots={1} />)
    const day = screen.getByRole("button", { name: /March 12th, 2026/ })
    expect(day.querySelectorAll("[data-slot=mini-calendar-dot]")).toHaveLength(1)
    await userEvent.click(day)
    expect(document.querySelector("[data-slot=mini-calendar-events]")).toBeNull()
  })

  it("uses Dhivehi month names and week start", () => {
    renderWithOnu(<MiniCalendar events={events} defaultMonth={MONTH} />, { locale: "dv" })
    expect(screen.getByText(/މާޗު/)).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s", async (dir) => {
    const { container } = renderWithOnu(<MiniCalendar events={events} defaultMonth={MONTH} />, { dir })
    expect(container.querySelector("[data-slot=calendar]")?.closest("[dir]")).toHaveAttribute("dir", dir)
    await expectNoA11yViolations(container)
  })
})
