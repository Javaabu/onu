import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import type { DateRangeValue } from "./_utils"
import { DateCalendar, DEFAULT_WEEKEND_DAYS, type CalendarView } from "./date-calendar"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

const TODAY = new Date(2026, 2, 12) // Thursday 12 March 2026

const caption = () => document.querySelector<HTMLElement>("[data-slot=calendar-caption]")!
const dayButton = (day: number, month = "March", year = 2026) =>
  screen.getByRole("button", { name: new RegExp(`${month} ${day}(st|nd|rd|th), ${year}$`) })

describe("DateCalendar — days view", () => {
  it("shows the month of the selected date, with today marked", () => {
    renderWithOnu(<DateCalendar selected={new Date(2026, 4, 5)} today={TODAY} />)
    expect(caption()).toHaveTextContent("May 2026")
    expect(screen.getByRole("grid", { name: "May 2026" })).toBeInTheDocument()
    expect(dayButton(5, "May")).toHaveAccessibleName(/Tuesday, May 5th, 2026/)
  })

  it("opens on today's month when nothing is selected, and names today", () => {
    renderWithOnu(<DateCalendar today={TODAY} />)
    expect(caption()).toHaveTextContent("March 2026")
    expect(dayButton(12)).toHaveAccessibleName("Today, Thursday, March 12th, 2026")
  })

  it("selects a single date", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithOnu(<DateCalendar today={TODAY} onSelect={onSelect} />)
    await user.click(dayButton(20))
    expect(onSelect).toHaveBeenCalledWith(new Date(2026, 2, 20))
  })

  it("moves between months with the previous and next buttons", async () => {
    const user = userEvent.setup()
    const onMonthChange = vi.fn()
    renderWithOnu(<DateCalendar today={TODAY} onMonthChange={onMonthChange} />)
    await user.click(screen.getByRole("button", { name: "Next month" }))
    expect(caption()).toHaveTextContent("April 2026")
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 3, 1))
    await user.click(screen.getByRole("button", { name: "Previous month" }))
    await user.click(screen.getByRole("button", { name: "Previous month" }))
    expect(caption()).toHaveTextContent("February 2026")
  })

  it("follows a controlled month", async () => {
    const user = userEvent.setup()
    const onMonthChange = vi.fn()
    const { rerender } = renderWithOnu(
      <DateCalendar today={TODAY} month={new Date(2026, 0, 1)} onMonthChange={onMonthChange} />,
    )
    expect(caption()).toHaveTextContent("January 2026")
    await user.click(screen.getByRole("button", { name: "Next month" }))
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 1, 1))
    expect(caption()).toHaveTextContent("January 2026")
    rerender(<DateCalendar today={TODAY} month={new Date(2026, 5, 1)} onMonthChange={onMonthChange} />)
    expect(caption()).toHaveTextContent("June 2026")
  })

  it("disables days outside min and max, and stops paging at them", () => {
    renderWithOnu(<DateCalendar today={TODAY} min={new Date(2026, 2, 10)} max={new Date(2026, 2, 20)} />)
    expect(dayButton(9)).toBeDisabled()
    expect(dayButton(10)).toBeEnabled()
    expect(dayButton(21)).toBeDisabled()
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Next month" })).toBeDisabled()
  })

  it("clamps the first month shown into the min–max range", () => {
    renderWithOnu(<DateCalendar today={TODAY} min={new Date(2026, 6, 1)} />)
    expect(caption()).toHaveTextContent("July 2026")
  })

  it("disables extra dates passed as matchers", () => {
    renderWithOnu(<DateCalendar today={TODAY} disabledDates={[new Date(2026, 2, 3), { dayOfWeek: [5] }]} />)
    expect(dayButton(3)).toBeDisabled()
    expect(dayButton(13)).toBeDisabled() // a Friday
    expect(dayButton(12)).toBeEnabled()
  })

  it("styles Friday and Saturday as the weekend by default, or the days given", () => {
    expect(DEFAULT_WEEKEND_DAYS).toEqual([5, 6])
    const { unmount } = renderWithOnu(<DateCalendar today={TODAY} />)
    const cellOf = (day: number) => dayButton(day).closest("td")!
    expect(cellOf(13).className).toMatch(/text-destructive/) // Friday
    expect(cellOf(15).className).not.toMatch(/text-destructive/) // Sunday
    unmount()
    renderWithOnu(<DateCalendar today={TODAY} weekendDays={[0]} />)
    expect(cellOf(15).className).toMatch(/text-destructive/)
  })

  it("starts the week on the given day", () => {
    renderWithOnu(<DateCalendar today={TODAY} weekStartsOn={1} />)
    const headers = within(screen.getByRole("grid")).getAllByRole("columnheader", { hidden: true })
    expect(headers.map((h) => h.textContent)).toEqual(["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"])
  })

  it("shows week numbers as row headers", async () => {
    renderWithOnu(<DateCalendar today={TODAY} showWeekNumber />)
    expect(screen.getAllByRole("rowheader").length).toBeGreaterThanOrEqual(4)
    await expectNoA11yViolations()
  })

  it("picks several dates and disables the rest at maxSelected", async () => {
    const user = userEvent.setup()
    function Multiple() {
      const [dates, setDates] = React.useState<Date[]>([new Date(2026, 2, 2)])
      return <DateCalendar mode="multiple" selected={dates} onSelect={setDates} maxSelected={2} today={TODAY} />
    }
    renderWithOnu(<Multiple />)
    await user.click(dayButton(4))
    expect(dayButton(4).closest("td")).toHaveAttribute("aria-selected", "true")
    expect(dayButton(9)).toBeDisabled()
    expect(dayButton(2)).toBeEnabled()
    await user.click(dayButton(2))
    expect(dayButton(9)).toBeEnabled()
  })

  it("selects a range", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    function Range() {
      const [range, setRange] = React.useState<DateRangeValue>({ from: null, to: null })
      return (
        <DateCalendar
          mode="range"
          selected={range}
          onSelect={(next) => {
            setRange(next)
            onSelect(next)
          }}
          today={TODAY}
        />
      )
    }
    renderWithOnu(<Range />)
    await user.click(dayButton(10))
    await user.click(dayButton(14))
    expect(onSelect).toHaveBeenLastCalledWith({ from: new Date(2026, 2, 10), to: new Date(2026, 2, 14) })
  })

  it("leaves selection to onDayClick and modifiers in mode none", async () => {
    const user = userEvent.setup()
    const onDayClick = vi.fn()
    renderWithOnu(
      <DateCalendar
        mode="none"
        today={TODAY}
        onDayClick={onDayClick}
        modifiers={{ booked: new Date(2026, 2, 18) }}
        modifiersClassNames={{ booked: "is-booked" }}
      />,
    )
    expect(dayButton(18).closest("td")).toHaveClass("is-booked")
    await user.click(dayButton(18))
    expect(onDayClick.mock.calls[0]![0]).toEqual(new Date(2026, 2, 18))
    expect(onDayClick.mock.calls[0]![1]).toMatchObject({ booked: true })
  })

  it("focuses the selected day when initialFocus is set", () => {
    renderWithOnu(<DateCalendar selected={new Date(2026, 2, 5)} today={TODAY} initialFocus />)
    expect(dayButton(5)).toHaveFocus()
  })
})

describe("DateCalendar — zooming out (§25.1)", () => {
  it("goes from days to months, years and ranges of years, and back in", async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    renderWithOnu(<DateCalendar today={TODAY} onViewChange={onViewChange} />)

    await user.click(screen.getByRole("button", { name: "March 2026: choose a month" }))
    const months = screen.getByRole("grid", { name: "Months" })
    expect(within(months).getAllByRole("gridcell")).toHaveLength(12)
    expect(within(months).getByRole("button", { name: "March 2026" })).toHaveAttribute("aria-current", "date")
    expect(onViewChange).toHaveBeenLastCalledWith("month")

    await user.click(screen.getByRole("button", { name: "2026: choose a year" }))
    const years = screen.getByRole("grid", { name: "Years" })
    expect(within(years).getByRole("button", { name: "2016" })).toBeInTheDocument()
    expect(within(years).getByRole("button", { name: "2027" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "2016–2027: choose a range of years" }))
    const decades = screen.getByRole("grid", { name: "Ranges of years" })
    expect(within(decades).getByRole("button", { name: "2016–2027" })).toHaveAttribute("aria-current", "date")
    // The widest view cannot zoom out further.
    expect(caption()).toHaveAttribute("aria-disabled", "true")

    await user.click(within(decades).getByRole("button", { name: "2040–2051" }))
    await user.click(within(screen.getByRole("grid", { name: "Years" })).getByRole("button", { name: "2041" }))
    await user.click(within(screen.getByRole("grid", { name: "Months" })).getByRole("button", { name: "July 2041" }))
    expect(caption()).toHaveTextContent("July 2041")
    expect(onViewChange).toHaveBeenLastCalledWith("day")
  })

  it("pages each zoom level by its own step", async () => {
    const user = userEvent.setup()
    function Zoomed() {
      const [view, setView] = React.useState<CalendarView>("month")
      return <DateCalendar today={TODAY} view={view} onViewChange={setView} />
    }
    renderWithOnu(<Zoomed />)
    await user.click(screen.getByRole("button", { name: "Next year" }))
    expect(caption()).toHaveTextContent("2027")
    await user.click(screen.getByRole("button", { name: "2027: choose a year" }))
    await user.click(screen.getByRole("button", { name: "Previous 12 years" }))
    expect(caption()).toHaveTextContent("2004–2015")
  })

  it("turns into a month picker with minView", async () => {
    const user = userEvent.setup()
    const onPeriodSelect = vi.fn()
    renderWithOnu(
      <DateCalendar
        minView="month"
        today={TODAY}
        selected={new Date(2026, 1, 1)}
        onPeriodSelect={onPeriodSelect}
        max={new Date(2026, 8, 30)}
      />,
    )
    const months = screen.getByRole("grid", { name: "Months" })
    expect(within(months).getByRole("button", { name: "February 2026" }).parentElement).toHaveAttribute(
      "aria-selected",
      "true",
    )
    expect(within(months).getByRole("button", { name: "October 2026" })).toHaveAttribute("aria-disabled", "true")
    await user.click(within(months).getByRole("button", { name: "October 2026" }))
    expect(onPeriodSelect).not.toHaveBeenCalled()
    await user.click(within(months).getByRole("button", { name: "May 2026" }))
    expect(onPeriodSelect).toHaveBeenCalledWith(new Date(2026, 4, 1))
    // Still a month grid: picking at minView does not zoom in.
    expect(screen.getByRole("grid", { name: "Months" })).toBeInTheDocument()
  })

  it("announces page changes in the zoomed views", async () => {
    const user = userEvent.setup()
    renderWithOnu(<DateCalendar today={TODAY} defaultView="year" />)
    await user.click(screen.getByRole("button", { name: "Next 12 years" }))
    expect(document.querySelector("[data-slot=calendar-header] [aria-live]")).toHaveTextContent("2028–2039")
  })
})

describe("DateCalendar — locale and direction", () => {
  it.each(directions)("has no axe violations in %s, in every view", async (dir) => {
    const user = userEvent.setup()
    renderWithOnu(<DateCalendar today={TODAY} selected={TODAY} />, { dir })
    await expectNoA11yViolations()
    await user.click(screen.getByRole("button", { name: /choose a month/ }))
    await expectNoA11yViolations()
  })

  it("uses Dhivehi month names and labels", () => {
    renderWithOnu(<DateCalendar today={TODAY} />, { locale: "dv" })
    expect(document.documentElement).toHaveAttribute("dir", "rtl")
    expect(caption().textContent).not.toMatch(/March/)
    expect(screen.getByRole("grid")).toBeInTheDocument()
  })

  it("passes classNames to its parts", () => {
    const { container } = renderWithOnu(
      <DateCalendar
        today={TODAY}
        className="root-x"
        classNames={{ header: "head-x", caption: "cap-x", nav: "nav-x" }}
      />,
    )
    expect(container.querySelector("[data-slot=date-calendar]")).toHaveClass("root-x")
    expect(container.querySelector("[data-slot=calendar-header]")).toHaveClass("head-x")
    expect(caption()).toHaveClass("cap-x")
    expect(screen.getByRole("button", { name: "Next month" })).toHaveClass("nav-x")
  })
})
