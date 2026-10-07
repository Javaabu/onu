import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { TimePanel } from "./time-panel"
import { TimePicker } from "./time-picker"

// Calendars render many buttons; user-event runs slowly when the whole suite runs in parallel.
vi.setConfig({ testTimeout: 30_000 })

const at = (h: number, m: number) => new Date(2026, 2, 12, h, m)

function setup(ui: React.ReactElement, options?: Parameters<typeof renderWithOnu>[1]) {
  const user = userEvent.setup()
  return { user, ...renderWithOnu(ui, options) }
}

const trigger = () => screen.getByRole("combobox")
const dialog = () => screen.getByRole("dialog")
const hour = () => within(dialog()).getByRole("spinbutton", { name: "Hour" })
const minute = () => within(dialog()).getByRole("spinbutton", { name: "Minute" })
const button = (name: string | RegExp) => within(dialog()).getByRole("button", { name })

/** Calls onChange with the last value; renders controlled so the panel reflects it. */
function Controlled(props: Partial<React.ComponentProps<typeof TimePicker>> & { initial?: Date | null }) {
  const { initial = at(14, 30), onChange, ...rest } = props
  const [value, setValue] = React.useState<Date | null>(initial)
  return (
    <TimePicker
      aria-label="Time"
      value={value}
      onChange={(v) => {
        setValue(v)
        onChange?.(v)
      }}
      {...rest}
    />
  )
}

describe("TimePicker — field (§25.2)", () => {
  it("shows a 12-hour time, a 24-hour time, or a placeholder", () => {
    const { rerender } = renderWithOnu(<TimePicker aria-label="Time" value={at(14, 30)} />)
    expect(trigger()).toHaveTextContent("2:30 PM")
    rerender(<TimePicker aria-label="Time" value={at(14, 30)} hourCycle={24} />)
    expect(trigger()).toHaveTextContent("14:30")
    rerender(<TimePicker aria-label="Time" value={null} />)
    expect(trigger()).toHaveTextContent("Select a time")
  })

  it("opens the time panel when clicked", async () => {
    const { user } = setup(<TimePicker aria-label="Time" />)
    await user.click(trigger())
    expect(dialog()).toHaveAccessibleName("Choose a time")
    expect(hour()).toHaveFocus()
  })
})

describe("TimePicker — steppers (§25.2)", () => {
  it("shows hour and minute as large numbers with an AM/PM switch, the current one highlighted", async () => {
    const { user } = setup(<Controlled />)
    await user.click(trigger())
    expect(hour()).toHaveTextContent("2")
    expect(hour()).toHaveAttribute("aria-valuetext", "2 PM")
    expect(minute()).toHaveTextContent("30")
    const period = within(dialog()).getByRole("group", { name: "AM or PM" })
    expect(within(period).getByRole("button", { name: "AM" })).toHaveAttribute("aria-pressed", "false")
    expect(within(period).getByRole("button", { name: "PM" })).toHaveAttribute("aria-pressed", "true")
    await expectNoA11yViolations()
  })

  it("shows -- until a time is chosen", async () => {
    const { user } = setup(<TimePicker aria-label="Time" />)
    await user.click(trigger())
    expect(hour()).toHaveTextContent("--")
    expect(minute()).toHaveTextContent("--")
  })

  it("▲ and ▼ change the value by one", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled onChange={onChange} />)
    await user.click(trigger())
    await user.click(button("Next hour"))
    expect(onChange).toHaveBeenLastCalledWith(at(15, 30))
    await user.click(button("Previous minute"))
    expect(onChange).toHaveBeenLastCalledWith(at(15, 29))
    await user.click(button("Next minute"))
    await user.click(button("Previous hour"))
    expect(onChange).toHaveBeenLastCalledWith(at(14, 30))
  })

  it("wraps around: ▼ on 12 gives 11, ▲ on 59 minutes gives 00", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled initial={at(12, 59)} onChange={onChange} />)
    await user.click(trigger())
    await user.click(button("Previous hour"))
    expect(hour()).toHaveTextContent("11")
    await user.click(button("Next minute"))
    expect(minute()).toHaveTextContent("00")
    expect(onChange).toHaveBeenLastCalledWith(at(11, 0))
  })

  it("never changes the date when the hour wraps", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled initial={at(23, 15)} onChange={onChange} />)
    await user.click(trigger())
    await user.click(button("Next hour"))
    expect(onChange).toHaveBeenLastCalledWith(at(0, 15))
    await user.click(button("Previous hour"))
    expect(onChange).toHaveBeenLastCalledWith(at(23, 15))
  })

  it("AM / PM switches keeping the same hour on the clock", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled initial={at(9, 0)} onChange={onChange} />)
    await user.click(trigger())
    await user.click(button("PM"))
    expect(onChange).toHaveBeenLastCalledWith(at(21, 0))
    expect(hour()).toHaveTextContent("9")
    await user.click(button("AM"))
    expect(onChange).toHaveBeenLastCalledWith(at(9, 0))
  })

  it("Up/Down arrows on a number step it", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled onChange={onChange} />)
    await user.click(trigger())
    await user.keyboard("{ArrowUp}")
    expect(onChange).toHaveBeenLastCalledWith(at(15, 30))
    minute().focus()
    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(onChange).toHaveBeenLastCalledWith(at(15, 28))
  })

  it("A and P switch AM/PM directly", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled initial={at(9, 5)} onChange={onChange} />)
    await user.click(trigger())
    await user.keyboard("p")
    expect(onChange).toHaveBeenLastCalledWith(at(21, 5))
    await user.keyboard("A")
    expect(onChange).toHaveBeenLastCalledWith(at(9, 5))
    onChange.mockClear()
    await user.keyboard("{Control>}p{/Control}")
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe("TimePicker — hour grid (§25.2)", () => {
  it("clicking the hour opens 12 cells laid out like a clock, the current hour highlighted", async () => {
    const { user } = setup(<Controlled />)
    await user.click(trigger())
    await user.click(hour())
    const grid = within(dialog()).getByRole("grid", { name: "Hours" })
    const cells = within(grid).getAllByRole("gridcell")
    expect(cells.map((c) => c.textContent)).toEqual(["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"])
    // 12 sits at the top of the clock, 3 on the right, 6 at the bottom.
    expect(cells[0]).toHaveStyle({ left: "50%", top: "8%" })
    expect(cells[3]).toHaveStyle({ left: "92%" })
    expect(cells[6]).toHaveStyle({ top: "92%" })
    expect(within(grid).getByRole("button", { name: "2 PM" })).toHaveAttribute("data-selected")
    expect(within(grid).getByRole("button", { name: "2 PM" })).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("Back returns to the steppers without changing anything", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled onChange={onChange} />)
    await user.click(trigger())
    await user.click(hour())
    await user.click(button("Back"))
    expect(onChange).not.toHaveBeenCalled()
    expect(hour()).toHaveFocus()
  })

  it("clicking an hour sets it, keeps AM/PM and returns to the steppers", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled onChange={onChange} />)
    await user.click(trigger())
    await user.click(hour())
    await user.click(button("9 PM"))
    expect(onChange).toHaveBeenLastCalledWith(at(21, 30))
    expect(hour()).toHaveTextContent("9")
    expect(button("PM")).toHaveAttribute("aria-pressed", "true")
  })

  it("arrow keys move around the clock and Enter picks", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled initial={at(1, 0)} onChange={onChange} />)
    await user.click(trigger())
    hour().focus()
    await user.keyboard("{Enter}")
    expect(within(dialog()).getByRole("button", { name: "1 AM" })).toHaveFocus()
    await user.keyboard("{ArrowLeft}{ArrowLeft}")
    expect(within(dialog()).getByRole("button", { name: "11 AM" })).toHaveFocus()
    await user.keyboard("{ArrowRight}{ArrowDown}{ArrowUp}{End}")
    expect(within(dialog()).getByRole("button", { name: "11 AM" })).toHaveFocus()
    await user.keyboard("{Home}{Enter}")
    expect(onChange).toHaveBeenLastCalledWith(at(0, 0))
  })
})

describe("TimePicker — minute grid (§25.2)", () => {
  it("clicking the minute opens one cell per step with the current minute highlighted", async () => {
    const { user } = setup(<Controlled />)
    await user.click(trigger())
    await user.click(minute())
    const grid = within(dialog()).getByRole("grid", { name: "Minutes" })
    expect(
      within(grid)
        .getAllByRole("gridcell")
        .map((c) => c.textContent),
    ).toEqual(["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"])
    expect(within(grid).getByRole("button", { name: "30" })).toHaveAttribute("data-selected")
  })

  it("follows minuteStep", async () => {
    const { user } = setup(<Controlled minuteStep={15} />)
    await user.click(trigger())
    await user.click(minute())
    expect(
      within(dialog())
        .getAllByRole("gridcell")
        .map((c) => c.textContent),
    ).toEqual(["00", "15", "30", "45"])
  })

  it("clicking a minute sets it and returns; Back returns without changing", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled onChange={onChange} />)
    await user.click(trigger())
    await user.click(minute())
    await user.click(button("Back"))
    expect(onChange).not.toHaveBeenCalled()
    expect(minute()).toHaveFocus()
    await user.keyboard("{Enter}")
    await user.keyboard("{ArrowRight}{ArrowDown}{Enter}")
    expect(onChange).toHaveBeenLastCalledWith(at(14, 55))
    expect(minute()).toHaveTextContent("55")
  })

  it("highlights no cell when the minute is off the grid", async () => {
    const { user } = setup(<Controlled initial={at(14, 7)} />)
    await user.click(trigger())
    await user.click(minute())
    expect(within(dialog()).queryAllByRole("gridcell", { selected: true })).toHaveLength(0)
  })
})

describe("TimePicker — footer, 24-hour mode and keyboard (§25.2)", () => {
  it("Clear empties the field and closes; it is not offered on required fields", async () => {
    const onChange = vi.fn()
    const { user, unmount } = setup(<TimePicker aria-label="Time" defaultValue={at(9, 0)} onChange={onChange} />)
    await user.click(trigger())
    await user.click(button("Clear"))
    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    unmount()
    const second = setup(<TimePicker aria-label="Time" required defaultValue={at(9, 0)} />)
    await second.user.click(trigger())
    expect(within(dialog()).queryByRole("button", { name: "Clear" })).not.toBeInTheDocument()
  })

  it("Done closes the panel", async () => {
    const { user } = setup(<TimePicker aria-label="Time" />)
    await user.click(trigger())
    await user.click(button("Done"))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("24-hour mode has no AM/PM switch and an hour grid of 00–23", async () => {
    const onChange = vi.fn()
    const { user } = setup(<Controlled hourCycle={24} onChange={onChange} />)
    await user.click(trigger())
    expect(within(dialog()).queryByRole("group", { name: "AM or PM" })).not.toBeInTheDocument()
    expect(hour()).toHaveTextContent("14")
    await user.click(hour())
    const cells = within(dialog()).getAllByRole("gridcell")
    expect(cells.map((c) => c.textContent)).toEqual(Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")))
    await user.click(button("08"))
    expect(onChange).toHaveBeenLastCalledWith(at(8, 30))
    await user.keyboard("p")
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("Escape closes the panel and returns focus to the field", async () => {
    const { user } = setup(<Controlled />)
    await user.click(trigger())
    await user.click(minute())
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(trigger()).toHaveFocus()
  })

  it("starts an empty field at 00:00 on the reference date", async () => {
    const onChange = vi.fn()
    const { user } = setup(
      <TimePicker aria-label="Time" referenceDate={new Date(2026, 4, 1)} onChange={onChange} name="opens_at" />,
    )
    await user.click(trigger())
    await user.click(button("Next hour"))
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 4, 1, 1, 0))
    expect(document.querySelector('input[name="opens_at"]')).toHaveValue("01:00")
  })

  it("starts with AM when the period is picked first", async () => {
    const onChange = vi.fn()
    const { user } = setup(<TimePicker aria-label="Time" referenceDate={new Date(2026, 4, 1)} onChange={onChange} />)
    await user.click(trigger())
    await user.click(button("AM"))
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 4, 1, 0, 0))
  })

  it("works in a FormField", () => {
    renderWithOnu(
      <FormField label="Opening time" name="opens_at" error="Required">
        <TimePicker defaultValue={at(8, 0)} />
      </FormField>,
    )
    expect(trigger()).toHaveAccessibleName("Opening time 8:00 AM")
    expect(trigger()).toHaveAttribute("aria-invalid", "true")
    expect(document.querySelector('input[name="opens_at"]')).toHaveValue("08:00")
  })

  it.each(directions)("speaks Dhivehi in %s", async (dir) => {
    const { user } = setup(<Controlled initial={at(14, 30)} />, { locale: "dv", dir })
    expect(trigger()).toHaveTextContent("2:30 މފ")
    await user.click(trigger())
    expect(within(dialog()).getByRole("spinbutton", { name: "ގަޑި" })).toBeInTheDocument()
    expect(within(dialog()).getByRole("button", { name: "މފ" })).toHaveAttribute("aria-pressed", "true")
    await expectNoA11yViolations()
  })
})

describe("TimePanel", () => {
  it("can be used inline with a controlled view", async () => {
    const onViewChange = vi.fn()
    const user = userEvent.setup()
    renderWithOnu(
      <TimePanel
        value={{ hours: 6, minutes: 45 }}
        onChange={() => {}}
        view="minutes"
        onViewChange={onViewChange}
        className="panel-x"
        classNames={{ grid: "grid-x" }}
      />,
    )
    expect(screen.getByRole("grid", { name: "Minutes" })).toHaveClass("grid-x")
    await user.click(screen.getByRole("button", { name: "Back" }))
    expect(onViewChange).toHaveBeenCalledWith("steppers")
  })
})
