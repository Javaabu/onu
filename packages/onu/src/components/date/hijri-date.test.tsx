import * as React from "react"
import { renderHook, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { OnuProvider } from "../../providers/onu-provider"
import { addHijriMonths, fromHijri, hijriDaysInMonth, toHijri } from "./_hijri"
import { HijriDate, useHijriFormatter } from "./hijri-date"
import { HijriCalendar, HijriDatePicker } from "./hijri-date-picker"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

// 12 March 2026 is 23 Ramadan 1447 (Umm al-Qura).
const TODAY = new Date(2026, 2, 12)

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  return { user, ...renderWithOnu(ui, options) }
}
const focused = () => document.activeElement as HTMLElement

describe("Hijri maths", () => {
  it("converts both ways and adds months", () => {
    expect(toHijri(TODAY)).toEqual({ year: 1447, month: 9, day: 23 })
    expect(fromHijri({ year: 1447, month: 9, day: 1 })).toEqual(new Date(2026, 1, 18))
    expect(fromHijri({ year: 1447, month: 9, day: 40 })).toEqual(fromHijri({ year: 1447, month: 9, day: 30 }))
    expect(hijriDaysInMonth(1447, 9)).toBeGreaterThanOrEqual(29)
    expect(addHijriMonths({ year: 1447, month: 12, day: 30 }, 1)).toMatchObject({ year: 1448, month: 1 })
  })
})

describe("HijriDate", () => {
  it("shows a Hijri date in every format, with the Gregorian date optionally", () => {
    renderWithOnu(
      <>
        <HijriDate date={TODAY} data-testid="long" />
        <HijriDate date={TODAY} format="short" data-testid="short" />
        <HijriDate date={TODAY} format="month-year" data-testid="month-year" />
        <HijriDate date={TODAY} format="numeric" showGregorian className="x" data-testid="numeric" />
      </>,
    )
    expect(screen.getByTestId("long")).toHaveTextContent("23 Ramadan 1447 AH")
    expect(screen.getByTestId("long")).toHaveAttribute("datetime", "2026-03-12")
    expect(screen.getByTestId("short")).toHaveTextContent("23 Ramadan 1447")
    expect(screen.getByTestId("month-year")).toHaveTextContent("Ramadan 1447")
    expect(screen.getByTestId("numeric")).toHaveTextContent("23/09/1447 (12/03/2026)")
    expect(screen.getByTestId("numeric")).toHaveClass("x")
  })

  it("uses Dhivehi Hijri month names", () => {
    renderWithOnu(<HijriDate date={TODAY} />, { locale: "dv" })
    expect(screen.getByText("23 ރަމަޟާން 1447 ހ")).toBeInTheDocument()
  })

  it("has a formatter hook", () => {
    const { result } = renderHook(() => useHijriFormatter(), {
      wrapper: ({ children }) => <OnuProvider locale="dv">{children}</OnuProvider>,
    })
    expect(result.current(new Date(2026, 4, 30), "month-year")).toBe("ޛުލްޙިއްޖާ 1447")
  })
})

describe("HijriDatePicker", () => {
  it("shows the Hijri and Gregorian date and posts the Gregorian ISO date", () => {
    const { container } = renderWithOnu(<HijriDatePicker aria-label="Date" name="date" defaultValue={TODAY} />)
    expect(screen.getByRole("combobox")).toHaveTextContent("23 Ramadan 1447 (12/03/2026)")
    expect(container.querySelector('input[name="date"]')).toHaveValue("2026-03-12")
  })

  it("opens on the Hijri month, marks today and the weekend, and picks a day", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <HijriDatePicker aria-label="Date" today={TODAY} onChange={onChange} showGregorian={false} />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("Select a Hijri date")
    await user.click(screen.getByRole("combobox"))
    const dialog = screen.getByRole("dialog")
    const grid = within(dialog).getByRole("grid", { name: "Ramadan 1447" })
    expect(within(grid).getAllByRole("columnheader")).toHaveLength(7)
    const today = within(grid).getByRole("button", { name: /^Today, 23 Ramadan 1447 AH/ })
    expect(today).toHaveFocus()
    expect(today).toHaveAttribute("aria-current", "date")
    expect(today.closest("td")).toHaveAttribute("data-today")
    expect(within(grid).getByRole("button", { name: /24 Ramadan 1447 AH, Friday/ }).className).toContain(
      "text-destructive",
    )
    expect(
      within(grid)
        .getByRole("button", { name: /29 Shaban 1447/ })
        .closest("td"),
    ).toHaveAttribute("data-outside")
    await user.click(within(grid).getByRole("button", { name: /^1 Ramadan 1447 AH/ }))
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 1, 18))
    expect(screen.getByRole("combobox")).toHaveTextContent("1 Ramadan 1447")
  })

  it("navigates months with ‹ › and zooms out to months and years", async () => {
    const { user } = setup(<HijriDatePicker aria-label="Date" today={TODAY} />)
    await user.click(screen.getByRole("combobox"))
    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Next month" }))
    expect(within(dialog).getByRole("grid")).toHaveAccessibleName("Shawwal 1447")
    await user.click(within(dialog).getByRole("button", { name: "Previous month" }))
    await user.click(within(dialog).getByRole("button", { name: "Ramadan 1447: choose a month" }))
    expect(within(dialog).getByRole("grid", { name: "Months" })).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Next year" }))
    await user.click(within(dialog).getByRole("button", { name: "Previous year" }))
    await user.click(within(dialog).getByRole("button", { name: "1447: choose a year" }))
    expect(within(dialog).getByRole("button", { name: "1440–1451" })).toBeInTheDocument()
    await user.click(within(dialog).getByRole("button", { name: "Next 12 years" }))
    await user.click(within(dialog).getByRole("button", { name: "Previous 12 years" }))
    await user.click(within(dialog).getByRole("button", { name: "1445" }))
    expect(focused()).toHaveAccessibleName("Ramadan 1445")
    await user.click(within(dialog).getByRole("button", { name: "Muharram 1445" }))
    expect(within(dialog).getByRole("grid")).toHaveAccessibleName("Muharram 1445")
    expect(focused()).toHaveAccessibleName(/^1 Muharram 1445 AH/)
  })

  it("supports the keyboard in LTR and RTL", async () => {
    for (const dir of directions) {
      const onChange = vi.fn()
      const { user, unmount } = setup(<HijriDatePicker aria-label="Date" today={TODAY} onChange={onChange} />, {
        dir,
      })
      await user.click(screen.getByRole("combobox"))
      await user.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
      expect(focused()).toHaveAccessibleName(/^24 Ramadan/)
      await user.keyboard("{ArrowDown}")
      expect(focused()).toHaveAccessibleName(/^1 Shawwal/)
      expect(within(screen.getByRole("dialog")).getByRole("grid")).toHaveAccessibleName("Shawwal 1447")
      await user.keyboard("{ArrowUp}{PageUp}")
      expect(focused()).toHaveAccessibleName(/^24 Shaban/)
      await user.keyboard("{PageDown}{Home}")
      expect(focused()).toHaveAccessibleName(/Sunday/)
      await user.keyboard("{End}")
      expect(focused()).toHaveAccessibleName(/Saturday/)
      await user.keyboard(dir === "rtl" ? "{ArrowRight}" : "{ArrowLeft}")
      await user.keyboard("{Enter}")
      expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 13))
      unmount()
    }
  })

  it("does not pick days outside min/max", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <HijriDatePicker aria-label="Date" today={TODAY} min={new Date(2026, 2, 10)} onChange={onChange} />,
    )
    await user.click(screen.getByRole("combobox"))
    const early = within(screen.getByRole("dialog")).getByRole("button", { name: /^1 Ramadan/ })
    expect(early).toHaveAttribute("aria-disabled", "true")
    await user.click(early)
    expect(onChange).not.toHaveBeenCalled()
  })

  it.each(directions)("passes axe and speaks Dhivehi in %s", async (dir) => {
    const { user } = setup(<HijriDatePicker aria-label="ތާރީޚު" defaultValue={TODAY} />, { locale: "dv", dir })
    expect(screen.getByRole("combobox")).toHaveTextContent("23 ރަމަޟާން 1447 (12/03/2026)")
    await user.click(screen.getByRole("combobox"))
    expect(within(screen.getByRole("dialog")).getByRole("grid")).toHaveAccessibleName("ރަމަޟާން 1447")
    await expectNoA11yViolations()
  })
})

describe("HijriCalendar", () => {
  it("renders inline without Gregorian numbers and with a custom week start", () => {
    renderWithOnu(<HijriCalendar today={TODAY} showGregorian={false} weekStartsOn={6} className="cal-x" />)
    expect(screen.getAllByRole("columnheader")[0]).toHaveTextContent("Sa")
    expect(screen.getByRole("grid").closest("[data-slot=hijri-calendar]")).toHaveClass("cal-x")
  })
})
