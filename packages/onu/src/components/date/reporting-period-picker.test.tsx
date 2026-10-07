import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { fiscalYear, ReportingPeriodPicker } from "./reporting-period-picker"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

const TODAY = new Date(2026, 2, 12)
const end = (y: number, m: number, d: number) => new Date(y, m, d, 23, 59, 59, 999)

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  return { user, ...renderWithOnu(ui, options) }
}
const dialog = () => screen.getByRole("dialog")
const button = (name: string | RegExp) => within(dialog()).getByRole("button", { name })
const radio = (name: string) => within(dialog()).getByRole("radio", { name })

describe("fiscalYear", () => {
  it("works out years, quarters and labels for any start month", () => {
    const calendar = fiscalYear(0)
    expect(calendar.label(2026)).toBe("2026")
    expect(calendar.quarterOf(new Date(2026, 4, 1))).toBe(2)
    const july = fiscalYear(6)
    expect(july.yearOf(new Date(2026, 2, 1))).toBe(2025)
    expect(july.yearOf(new Date(2026, 6, 1))).toBe(2026)
    expect(july.label(2025)).toBe("2025/26")
    expect(july.label(2099)).toBe("2099/00")
    expect(july.quarter(2025, 3)).toEqual({ from: new Date(2026, 0, 1), to: endOfMonthDate(2026, 2) })
    expect(july.quarterOf(new Date(2026, 1, 1))).toBe(3)
    expect(july.range(2025)).toEqual({ from: new Date(2025, 6, 1), to: endOfMonthDate(2026, 5) })
  })
})

function endOfMonthDate(y: number, m: number) {
  return new Date(y, m + 1, 0, 23, 59, 59, 999)
}

describe("ReportingPeriodPicker", () => {
  it("picks a month", async () => {
    const onChange = vi.fn()
    const { user, container } = setup(
      <ReportingPeriodPicker aria-label="Period" name="period" today={TODAY} onChange={onChange} />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("Select a period")
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByRole("radiogroup", { name: "Period type" })).toBeInTheDocument()
    expect(radio("Monthly")).toHaveAttribute("aria-checked", "true")
    await user.click(button("February 2026"))
    expect(onChange).toHaveBeenCalledWith({ type: "monthly", from: new Date(2026, 1, 1), to: end(2026, 1, 28) })
    expect(screen.getByRole("combobox")).toHaveTextContent("February 2026")
    expect(container.querySelector('input[name="period[type]"]')).toHaveValue("monthly")
    expect(container.querySelector('input[name="period[from]"]')).toHaveValue("2026-02-01")
    expect(container.querySelector('input[name="period[to]"]')).toHaveValue("2026-02-28")
  })

  it("picks a quarter of the financial year", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <ReportingPeriodPicker aria-label="Period" fiscalYearStartMonth={6} today={TODAY} onChange={onChange} />,
    )
    await user.click(screen.getByRole("combobox"))
    await user.click(radio("Quarterly"))
    expect(within(dialog()).getByRole("button", { name: "FY 2025/26" })).toBeInTheDocument()
    const grid = within(dialog()).getByRole("grid", { name: "Quarters" })
    expect(within(grid).getByRole("button", { name: "Q3 2025/26" })).toHaveAttribute("aria-current", "date")
    expect(within(grid).getByRole("button", { name: "Q1 2025/26" })).toHaveTextContent("Q1Jul – Sep")
    await user.click(button("Next year"))
    await user.click(button("Previous year"))
    await user.click(within(grid).getByRole("button", { name: "Q2 2025/26" }))
    expect(onChange).toHaveBeenCalledWith({ type: "quarterly", from: new Date(2025, 9, 1), to: end(2025, 11, 31) })
    expect(screen.getByRole("combobox")).toHaveTextContent("Q2 2025/26 (Oct – Dec)")
  })

  it("pages quarters by year with the keyboard", async () => {
    const { user } = setup(<ReportingPeriodPicker aria-label="Period" types={["quarterly"]} today={TODAY} />)
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).queryByRole("radiogroup", { name: "Period type" })).not.toBeInTheDocument()
    expect(document.activeElement).toHaveAccessibleName("Q1 2026")
    await user.keyboard("{PageDown}")
    expect(within(dialog()).getByRole("button", { name: "2027" })).toBeInTheDocument()
    expect(document.activeElement).toHaveAccessibleName("Q1 2027")
    await user.keyboard("{ArrowDown}{Enter}")
    expect(screen.getByRole("combobox")).toHaveTextContent("Q3 2027 (Jul – Sep)")
  })

  it("picks a financial year", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <ReportingPeriodPicker
        aria-label="Period"
        fiscalYearStartMonth={6}
        defaultType="yearly"
        today={TODAY}
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole("combobox"))
    const grid = within(dialog()).getByRole("grid", { name: "Financial years" })
    expect(within(grid).getByRole("button", { name: "FY 2025/26" })).toHaveAttribute("aria-current", "date")
    await user.click(button("Next 12 years"))
    await user.click(button("Previous 12 years"))
    await user.click(within(grid).getByRole("button", { name: "FY 2024/25" }))
    expect(onChange).toHaveBeenCalledWith({ type: "yearly", from: new Date(2024, 6, 1), to: end(2025, 5, 30) })
    expect(screen.getByRole("combobox")).toHaveTextContent("FY 2024/25")
  })

  it("shows calendar years plainly when the year starts in January", async () => {
    const { user } = setup(
      <ReportingPeriodPicker
        aria-label="Period"
        defaultValue={{ type: "yearly", from: new Date(2025, 0, 1), to: end(2025, 11, 31) }}
        today={TODAY}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("2025")
    await user.click(screen.getByRole("combobox"))
    expect(radio("Yearly")).toHaveAttribute("aria-checked", "true")
    expect(within(dialog()).getByRole("button", { name: "2025" })).toHaveAttribute("data-selected")
  })

  it("picks a custom range", async () => {
    const onChange = vi.fn()
    const { user } = setup(<ReportingPeriodPicker aria-label="Period" today={TODAY} onChange={onChange} />)
    await user.click(screen.getByRole("combobox"))
    await user.click(radio("Custom range"))
    await user.click(button(/March 3rd, 2026/))
    expect(onChange).not.toHaveBeenCalled()
    await user.click(button(/March 17th, 2026/))
    expect(onChange).toHaveBeenCalledWith({ type: "custom", from: new Date(2026, 2, 3), to: end(2026, 2, 17) })
    expect(screen.getByRole("combobox")).toHaveTextContent("03/03/2026 – 17/03/2026")
  })

  it("keeps half a custom range as a one-day range on Done", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <ReportingPeriodPicker aria-label="Period" types={["custom"]} today={TODAY} onChange={onChange} />,
    )
    await user.click(screen.getByRole("combobox"))
    await user.click(button(/March 3rd, 2026/))
    await user.click(button("Done"))
    expect(onChange).toHaveBeenCalledWith({ type: "custom", from: new Date(2026, 2, 3), to: end(2026, 2, 3) })
  })

  it("greys out periods outside min and max, and clears", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <ReportingPeriodPicker
        aria-label="Period"
        today={TODAY}
        min={new Date(2026, 0, 1)}
        max={new Date(2026, 5, 30)}
        defaultValue={{ type: "quarterly", from: new Date(2026, 0, 1), to: end(2026, 2, 31) }}
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByRole("button", { name: "Q3 2026" })).toHaveAttribute("aria-disabled", "true")
    expect(within(dialog()).getByRole("button", { name: "Q1 2026" })).toHaveAttribute("data-selected")
    await user.click(radio("Yearly"))
    expect(within(dialog()).getByRole("button", { name: "2025" })).toHaveAttribute("aria-disabled", "true")
    await user.click(button("Clear"))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it.each(directions)("passes axe and speaks Dhivehi in %s", async (dir) => {
    const { user } = setup(
      <ReportingPeriodPicker
        aria-label="މުއްދަތު"
        fiscalYearStartMonth={6}
        defaultValue={{ type: "monthly", from: new Date(2026, 2, 1), to: end(2026, 2, 31) }}
        today={TODAY}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("މާޗު 2026")
    await user.click(screen.getByRole("combobox"))
    expect(radio("މަހުން މަހަށް")).toBeInTheDocument()
    await user.click(radio("ކުއާޓަރުން ކުއާޓަރަށް"))
    expect(within(dialog()).getByRole("button", { name: "2025/26 ގެ 3 ވަނަ ކުއާޓަރ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
