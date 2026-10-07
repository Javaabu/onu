import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { MonthPicker, YearPicker } from "./month-picker"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

const TODAY = new Date(2026, 2, 12)

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  return { user, ...renderWithOnu(ui, options) }
}
const dialog = () => screen.getByRole("dialog")

describe("MonthPicker", () => {
  it("opens on the 12 months of the year and picks one", async () => {
    const onChange = vi.fn()
    const { user, container } = setup(
      <MonthPicker aria-label="Payroll month" name="month" today={TODAY} onChange={onChange} />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("Select a month")
    await user.click(screen.getByRole("combobox"))
    const grid = within(dialog()).getByRole("grid", { name: "Months" })
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(12)
    expect(within(grid).getByRole("button", { name: "March 2026" })).toHaveFocus()
    await user.click(within(grid).getByRole("button", { name: "July 2026" }))
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 6, 1))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveTextContent("July 2026")
    expect(container.querySelector('input[name="month"]')).toHaveValue("2026-07")
  })

  it("zooms out to years and back to months", async () => {
    const { user } = setup(<MonthPicker aria-label="Month" defaultValue={new Date(2024, 0, 1)} today={TODAY} />)
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByRole("button", { name: "January 2024" })).toHaveAttribute("data-selected")
    await user.click(within(dialog()).getByRole("button", { name: "2024: choose a year" }))
    await user.click(within(dialog()).getByRole("button", { name: "2025" }))
    expect(within(dialog()).getByRole("button", { name: "May 2025" })).toBeInTheDocument()
  })

  it("respects min and max and a custom format", async () => {
    const { user } = setup(
      <MonthPicker
        aria-label="Month"
        today={TODAY}
        min={new Date(2026, 1, 1)}
        max={new Date(2026, 9, 31)}
        format="MM/yyyy"
        defaultValue={new Date(2026, 4, 1)}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("05/2026")
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByRole("button", { name: "January 2026" })).toHaveAttribute("aria-disabled", "true")
    expect(within(dialog()).getByRole("button", { name: "November 2026" })).toHaveAttribute("aria-disabled", "true")
    expect(within(dialog()).getByRole("button", { name: "Next year" })).toBeDisabled()
  })

  it("clears on optional fields", async () => {
    const onChange = vi.fn()
    const { user } = setup(<MonthPicker aria-label="Month" defaultValue={TODAY} onChange={onChange} />)
    await user.click(screen.getByRole("combobox"))
    await user.click(within(dialog()).getByRole("button", { name: "Clear" }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it.each(directions)("passes axe with Dhivehi month names in %s", async (dir) => {
    const { user } = setup(<MonthPicker aria-label="މަސް" defaultValue={new Date(2026, 2, 1)} />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("combobox")).toHaveTextContent("މާޗު 2026")
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByRole("button", { name: "ޖުލައި 2026" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("YearPicker", () => {
  it("picks a year from a 12-year grid", async () => {
    const onChange = vi.fn()
    const { user, container } = renderWithOnu(
      <FormField label="Financial year" name="year">
        <YearPicker today={TODAY} onChange={onChange} />
      </FormField>,
    ) as ReturnType<typeof renderWithOnu> & { user?: never }
    const u = userEvent.setup()
    expect(screen.getByRole("combobox")).toHaveTextContent("Select a year")
    await u.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByRole("grid", { name: "Years" })).toBeInTheDocument()
    await u.click(within(dialog()).getByRole("button", { name: "Next 12 years" }))
    await u.click(within(dialog()).getByRole("button", { name: "2030" }))
    expect(onChange).toHaveBeenCalledWith(new Date(2030, 0, 1))
    expect(screen.getByRole("combobox")).toHaveAccessibleName("Financial year 2030")
    expect(container.querySelector('input[name="year"]')).toHaveValue("2030")
    void user
  })
})
