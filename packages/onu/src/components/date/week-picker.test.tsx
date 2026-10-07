import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { WeekPicker } from "./week-picker"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

const TODAY = new Date(2026, 2, 12)

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  return { user, ...renderWithOnu(ui, options) }
}
const dialog = () => screen.getByRole("dialog")
const day = (name: RegExp) => within(dialog()).getByRole("button", { name })

describe("WeekPicker", () => {
  it("selects the whole week of the clicked day", async () => {
    const onChange = vi.fn()
    const { user, container } = setup(<WeekPicker aria-label="Week" name="week" today={TODAY} onChange={onChange} />)
    expect(screen.getByRole("combobox")).toHaveTextContent("Select a week")
    await user.click(screen.getByRole("combobox"))
    expect(within(dialog()).getByLabelText("Week 12")).toHaveTextContent("12")
    await user.click(day(/Wednesday, March 18th/))
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 2, 15))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveTextContent("Week 12, 2026 (15 Mar – 21 Mar)")
    expect(container.querySelector('input[name="week"]')).toHaveValue("2026-03-15")
  })

  it("highlights the selected week and previews the hovered week", async () => {
    const { user } = setup(<WeekPicker aria-label="Week" defaultValue={new Date(2026, 2, 17)} today={TODAY} />)
    await user.click(screen.getByRole("combobox"))
    expect(day(/Sunday, March 15th/)).toHaveAttribute("data-range-start", "true")
    expect(day(/Tuesday, March 17th/)).toHaveAttribute("data-range-middle", "true")
    expect(day(/Saturday, March 21st/)).toHaveAttribute("data-range-end", "true")
    expect(day(/Tuesday, March 17th/).closest("td")).toHaveAttribute("aria-selected", "true")
    expect(within(dialog()).getByRole("grid").closest("[data-slot=calendar]")?.className).toContain(
      "[&_.rdp-week:hover_.rdp-day:not([data-outside])]:bg-muted/60",
    )
  })

  it("follows weekStartsOn and a custom label", async () => {
    const { user } = setup(
      <WeekPicker
        aria-label="Week"
        weekStartsOn={1}
        defaultValue={new Date(2026, 2, 12)}
        formatWeek={(s, e) => `${s.getDate()}–${e.getDate()}`}
        min={new Date(2026, 2, 3)}
        today={TODAY}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("9–15")
    await user.click(screen.getByRole("combobox"))
    const before = day(/Monday, March 2nd/)
    expect(before).toBeDisabled()
    await user.click(within(dialog()).getByRole("button", { name: "Clear" }))
    expect(screen.getByRole("combobox")).toHaveTextContent("Select a week")
  })

  it.each(directions)("passes axe and speaks Dhivehi in %s", async (dir) => {
    const { user } = setup(<WeekPicker aria-label="ހަފްތާ" defaultValue={TODAY} today={TODAY} />, { locale: "dv", dir })
    expect(screen.getByRole("combobox")).toHaveTextContent("2026 ގެ 11 ވަނަ ހަފްތާ")
    await user.click(screen.getByRole("combobox"))
    await expectNoA11yViolations()
  })
})
