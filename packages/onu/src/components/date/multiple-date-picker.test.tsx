import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { MultipleDatePicker } from "./multiple-date-picker"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

const TODAY = new Date(2026, 2, 12)

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  return { user, ...renderWithOnu(ui, options) }
}
const dialog = () => screen.getByRole("dialog")
const day = (name: RegExp) => within(dialog()).getByRole("button", { name })

describe("MultipleDatePicker", () => {
  it("toggles days, keeps them sorted and stays open", async () => {
    const onChange = vi.fn()
    const { user, container } = setup(
      <MultipleDatePicker aria-label="Training days" name="days" today={TODAY} onChange={onChange} />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("Select dates")
    expect(container.querySelector('input[name="days"]')).toHaveValue("")
    await user.click(screen.getByRole("combobox"))
    await user.click(day(/March 20th/))
    await user.click(day(/March 5th/))
    expect(onChange).toHaveBeenLastCalledWith([new Date(2026, 2, 5), new Date(2026, 2, 20)])
    expect(dialog()).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveTextContent("5 Mar 2026, 20 Mar 2026")
    await user.click(day(/March 5th/))
    expect(onChange).toHaveBeenLastCalledWith([new Date(2026, 2, 20)])
    expect(
      Array.from(container.querySelectorAll<HTMLInputElement>('input[name="days[]"]')).map((i) => i.value),
    ).toEqual(["2026-03-20"])
  })

  it("summarises many dates and announces the count", () => {
    renderWithOnu(
      <MultipleDatePicker
        aria-label="Days"
        defaultValue={[new Date(2026, 2, 1), new Date(2026, 2, 2), new Date(2026, 2, 3)]}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("3 dates selected")
    expect(screen.getAllByText("3 dates selected")[1]).toHaveAttribute("aria-live", "polite")
  })

  it("limits the number of dates and clears them", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <MultipleDatePicker
        aria-label="Days"
        today={TODAY}
        maxSelected={1}
        defaultValue={[new Date(2026, 2, 2)]}
        format="dd/MM"
        onChange={onChange}
      />,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("02/03")
    await user.click(screen.getByRole("combobox"))
    expect(day(/March 9th/)).toBeDisabled()
    await user.click(day(/March 2nd/))
    expect(onChange).toHaveBeenLastCalledWith([])
    expect(day(/March 9th/)).not.toBeDisabled()
    await user.click(within(dialog()).getByRole("button", { name: "Clear" }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it.each(directions)("passes axe and speaks Dhivehi in %s", async (dir) => {
    const { user } = setup(
      <MultipleDatePicker aria-label="ދުވަސްތައް" defaultValue={[new Date(2026, 2, 1), new Date(2026, 2, 2), TODAY]} />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("3 ތާރީޚު ހޮވިފައި")
    await user.click(screen.getByRole("combobox"))
    await expectNoA11yViolations()
  })
})
