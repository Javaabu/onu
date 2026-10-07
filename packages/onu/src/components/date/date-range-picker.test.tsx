import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { DateRangePicker } from "./date-range-picker"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

const TODAY = new Date(2026, 2, 12)

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  return { user, ...renderWithOnu(ui, options) }
}

const dialog = () => screen.getByRole("dialog")
const button = (name: string | RegExp) => within(dialog()).getByRole("button", { name })

describe("DateRangePicker (§25.4)", () => {
  it("shows From and To side by side, each opening a date picker", async () => {
    const { user } = setup(<DateRangePicker today={TODAY} aria-label="Leave" />)
    expect(screen.getByRole("group", { name: "Leave" })).toBeInTheDocument()
    const from = screen.getByRole("combobox", { name: /From/ })
    const to = screen.getByRole("combobox", { name: /To/ })
    await user.click(from)
    expect(within(dialog()).getByRole("grid")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await user.click(to)
    expect(within(dialog()).getByRole("grid")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("allows open-ended ranges", async () => {
    const onChange = vi.fn()
    const { user } = setup(<DateRangePicker today={TODAY} onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: /From/ }))
    await user.click(button(/March 1st, 2026/))
    expect(onChange).toHaveBeenLastCalledWith({ from: new Date(2026, 2, 1), to: null })
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("treats a To date without a time as the end of that day", async () => {
    const onChange = vi.fn()
    const { user } = setup(<DateRangePicker today={TODAY} onChange={onChange} />)
    await user.click(screen.getByRole("combobox", { name: /To/ }))
    await user.click(button(/March 31st, 2026/))
    expect(onChange).toHaveBeenLastCalledWith({ from: null, to: new Date(2026, 2, 31, 23, 59, 59, 999) })
    expect(screen.getByRole("combobox", { name: /To/ })).toHaveTextContent("31/03/2026")
  })

  it('shows "End date is before start date" when To is before From', async () => {
    const { user } = setup(<DateRangePicker today={TODAY} defaultValue={{ from: new Date(2026, 2, 20), to: null }} />)
    await user.click(screen.getByRole("combobox", { name: /To/ }))
    await user.click(button(/March 10th, 2026/))
    expect(screen.getByRole("alert")).toHaveTextContent("End date is before start date")
    expect(screen.getByRole("combobox", { name: /To/ })).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("combobox", { name: /To/ })).toHaveAccessibleDescription("End date is before start date")
  })

  it("picks times too with withTime; To defaults to the end of the day", async () => {
    const onChange = vi.fn()
    const { user, container } = setup(
      <DateRangePicker today={TODAY} withTime name="period" onChange={onChange} hourCycle={24} />,
    )
    await user.click(screen.getByRole("combobox", { name: /To/ }))
    await user.click(button(/March 31st, 2026/))
    expect(onChange).toHaveBeenLastCalledWith({ from: null, to: new Date(2026, 2, 31, 23, 59) })
    expect(container.querySelector('input[name="period[to]"]')).toHaveValue("2026-03-31T23:59:00")
    await user.keyboard("{Escape}")
    await user.click(screen.getByRole("combobox", { name: /From/ }))
    await user.click(button(/March 31st, 2026/))
    await user.click(button(/Change time/))
    await user.click(within(dialog()).getByRole("spinbutton", { name: "Hour" }))
    await user.click(button("23"))
    await user.click(within(dialog()).getByRole("spinbutton", { name: "Minute" }))
    await user.click(button("55"))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    await user.click(button("Next minute"))
    await user.click(button("Next minute"))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    await user.click(button("Next hour"))
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 2, 31, 0, 57),
      to: new Date(2026, 2, 31, 23, 59),
    })
  })

  it("is controlled and posts name[from] and name[to]", async () => {
    function Controlled() {
      const [value, setValue] = React.useState({ from: new Date(2026, 0, 1) as Date | null, to: null as Date | null })
      return <DateRangePicker name="period" value={value} onChange={setValue} today={TODAY} />
    }
    const { user, container } = setup(<Controlled />)
    expect(container.querySelector('input[name="period[from]"]')).toHaveValue("2026-01-01")
    expect(container.querySelector('input[name="period[to]"]')).toHaveValue("")
    await user.click(screen.getByRole("combobox", { name: /To/ }))
    await user.click(button(/March 3rd, 2026/))
    expect(container.querySelector('input[name="period[to]"]')).toHaveValue("2026-03-03")
  })

  it("supports custom names, labels, placeholders and classNames", () => {
    const { container } = renderWithOnu(
      <DateRangePicker
        name="ignored"
        names={{ from: "start_date", to: "end_date" }}
        labels={{ from: "Check-in", to: "Check-out" }}
        placeholders={{ from: "Arrival", to: "Departure" }}
        className="root-x"
        classNames={{ field: "field-x", label: "label-x", trigger: "trigger-x" }}
      />,
    )
    expect(container.querySelector('input[name="start_date"]')).toBeInTheDocument()
    expect(container.querySelector('input[name="end_date"]')).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: /Check-in/ })).toHaveTextContent("Arrival")
    expect(screen.getByRole("combobox", { name: /Check-out/ })).toHaveClass("trigger-x")
    expect(screen.getByRole("group")).toHaveClass("root-x")
    expect(container.querySelectorAll(".field-x")).toHaveLength(2)
    expect(screen.getByText("Check-in")).toHaveClass("label-x")
  })

  it("is labelled by its FormField and takes its name and state", async () => {
    const { container } = renderWithOnu(
      <FormField label="Leave period" name="leave" help="Inclusive" disabled>
        <DateRangePicker defaultValue={{ from: new Date(2026, 2, 1), to: new Date(2026, 2, 5) }} />
      </FormField>,
    )
    expect(screen.getByRole("group", { name: "Leave period" })).toBeInTheDocument()
    const from = screen.getByRole("combobox", { name: /Leave period From/ })
    expect(from).toBeDisabled()
    expect(from).toHaveAccessibleDescription("Inclusive")
    expect(screen.getByText("Leave period").closest("label")).toHaveAttribute("for", from.id)
    expect(container.querySelector('input[name="leave[from]"]')).toHaveValue("2026-03-01")
    expect(container.querySelectorAll('input[name="leave"]')).toHaveLength(0)
    await expectNoA11yViolations()
  })

  it.each(directions)("speaks Dhivehi in %s", async (dir) => {
    renderWithOnu(<DateRangePicker defaultValue={{ from: new Date(2026, 2, 20), to: new Date(2026, 2, 1) }} />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("group", { name: "ތާރީޚުގެ މުއްދަތު" })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: /ފެށޭ ތާރީޚު/ })).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent("ނިމޭ ތާރީޚަކީ ފެށޭ ތާރީޚުގެ ކުރީގެ ތާރީޚެއް")
    await expectNoA11yViolations()
  })
})
