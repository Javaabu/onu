import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { DateTimePicker } from "./date-time-picker"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

const TODAY = new Date(2026, 2, 12)

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  return { user, ...renderWithOnu(ui, options) }
}

const dialog = () => screen.getByRole("dialog")
const button = (name: string | RegExp) => within(dialog()).getByRole("button", { name })

describe("DateTimePicker (§25.3)", () => {
  it("opens on the calendar", async () => {
    const { user } = setup(<DateTimePicker aria-label="Starts" today={TODAY} />)
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByRole("grid")).toHaveAccessibleName("March 2026")
    expect(document.activeElement).toHaveAccessibleName(/Today, Thursday, March 12th/)
  })

  it("shows a time chip below the calendar that swaps in the steppers, and Back to calendar swaps back", async () => {
    const { user } = setup(<DateTimePicker aria-label="Starts" defaultValue={new Date(2026, 2, 12, 14, 30)} />)
    await user.click(screen.getByRole("combobox"))
    const chip = button("Change time, 2:30 PM")
    expect(chip).toHaveTextContent("2:30 PM")
    await user.click(chip)
    expect(within(dialog()).queryByRole("grid")).not.toBeInTheDocument()
    expect(within(dialog()).getByRole("spinbutton", { name: "Hour" })).toHaveFocus()
    await user.click(button("Back to calendar"))
    expect(within(dialog()).getByRole("grid")).toBeInTheDocument()
    expect(button(/Change time/)).toHaveFocus()
  })

  it("changes the time of the selected date from the steppers", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <DateTimePicker aria-label="Starts" defaultValue={new Date(2026, 2, 12, 14, 30)} onChange={onChange} />,
    )
    await user.click(screen.getByRole("combobox"))
    await user.click(button(/Change time/))
    await user.click(button("Next hour"))
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 2, 12, 15, 30))
  })

  it("Clear time resets the time to 00:00 and keeps the date", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <DateTimePicker aria-label="Starts" defaultValue={new Date(2026, 2, 12, 14, 30)} onChange={onChange} />,
    )
    await user.click(screen.getByRole("combobox"))
    await user.click(button("Clear time"))
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 2, 12, 0, 0))
    expect(button(/Change time/)).toHaveTextContent("12:00 AM")
  })

  it("picking a day without choosing a time sets the time to 00:00", async () => {
    const onChange = vi.fn()
    const { user } = setup(<DateTimePicker aria-label="Starts" today={TODAY} onChange={onChange} />)
    await user.click(screen.getByRole("combobox"))
    await user.click(button(/March 20th, 2026/))
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 2, 20, 0, 0))
    // The panel stays open so the time can still be set.
    expect(dialog()).toBeInTheDocument()
  })

  it("keeps a time chosen before the day", async () => {
    const onChange = vi.fn()
    const { user } = setup(<DateTimePicker aria-label="Starts" today={TODAY} onChange={onChange} />)
    await user.click(screen.getByRole("combobox"))
    await user.click(button(/Change time/))
    expect(within(dialog()).getByRole("spinbutton", { name: "Hour" })).toHaveTextContent("--")
    await user.click(button("PM"))
    expect(onChange).not.toHaveBeenCalled()
    await user.click(button("Back to calendar"))
    expect(button(/Change time/)).toHaveTextContent("12:00 PM")
    await user.click(button(/March 20th, 2026/))
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 2, 20, 12, 0))
    await user.click(button("Clear time"))
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 2, 20, 0, 0))
  })

  it("shows both date and time in the field and posts an ISO date-time", async () => {
    const { container } = renderWithOnu(
      <DateTimePicker aria-label="Starts" name="starts_at" defaultValue={new Date(2026, 2, 12, 14, 30)} />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("12/03/2026 2:30 PM")
    expect(container.querySelector('input[name="starts_at"]')).toHaveValue("2026-03-12T14:30:00")
  })

  it("supports 24-hour time and custom formats", () => {
    renderWithOnu(
      <>
        <DateTimePicker aria-label="a" hourCycle={24} defaultValue={new Date(2026, 2, 12, 14, 30)} />
        <DateTimePicker aria-label="b" format="d MMM yyyy, HH:mm" defaultValue={new Date(2026, 2, 12, 9, 5)} />
      </>,
    )
    expect(screen.getByRole("combobox", { name: /^a/ })).toHaveTextContent("12/03/2026 14:30")
    expect(screen.getByRole("combobox", { name: /^b/ })).toHaveTextContent("12 Mar 2026, 09:05")
  })

  it("Clear empties both date and time; reopening starts on the calendar", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <DateTimePicker aria-label="Starts" defaultValue={new Date(2026, 2, 12, 14, 30)} onChange={onChange} />,
    )
    await user.click(screen.getByRole("combobox"))
    await user.click(button(/Change time/))
    await user.keyboard("{Escape}")
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByRole("grid")).toBeInTheDocument()
    await user.click(button("Clear"))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it.each(directions)("passes axe and speaks Dhivehi in %s", async (dir) => {
    const { user } = setup(<DateTimePicker aria-label="ފެށޭ" defaultValue={new Date(2026, 2, 12, 9, 0)} />, {
      locale: "dv",
      dir,
    })
    await user.click(screen.getByRole("combobox"))
    expect(button("ވަގުތު ފޮހެލާ")).toBeInTheDocument()
    await user.click(button(/ވަގުތު ބަދަލުކުރައްވާ/))
    expect(button("ކެލެންޑަރަށް އެނބުރި")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
