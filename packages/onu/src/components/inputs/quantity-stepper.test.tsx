import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { QuantityStepper } from "./quantity-stepper"
import { UnitInput } from "./unit-input"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

afterEach(() => vi.useRealTimers())

describe("QuantityStepper", () => {
  it("steps with the − and + buttons and stops at min and max", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <QuantityStepper aria-label="Tickets" defaultValue={1} min={1} max={3} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole("spinbutton", { name: "Tickets" })
    const minus = screen.getByRole("button", { name: "Decrease" })
    const plus = screen.getByRole("button", { name: "Increase" })
    expect(minus).toBeDisabled()
    await userEvent.click(plus)
    await userEvent.click(plus)
    expect(input).toHaveValue("3")
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    expect(plus).toBeDisabled()
    await userEvent.click(minus)
    expect(input).toHaveValue("2")
    await expectNoA11yViolations()
  })

  it("repeats while the button is held", () => {
    vi.useFakeTimers()
    renderWithOnu(<QuantityStepper aria-label="Qty" defaultValue={0} repeatDelay={300} repeatInterval={50} />)
    const plus = screen.getByRole("button", { name: "Increase" })
    fireEvent.pointerDown(plus, { button: 0 })
    expect(screen.getByRole("spinbutton")).toHaveValue("1")
    act(() => vi.advanceTimersByTime(300 + 50 * 4))
    expect(screen.getByRole("spinbutton")).toHaveValue("5")
    act(() => window.dispatchEvent(new Event("pointerup")))
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByRole("spinbutton")).toHaveValue("5")
  })

  it("stops repeating at the limit and on pointer leave", () => {
    vi.useFakeTimers()
    renderWithOnu(<QuantityStepper aria-label="Qty" defaultValue={0} max={2} repeatDelay={100} repeatInterval={10} />)
    const plus = screen.getByRole("button", { name: "Increase" })
    fireEvent.pointerDown(plus, { button: 0 })
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByRole("spinbutton")).toHaveValue("2")
    const minus = screen.getByRole("button", { name: "Decrease" })
    fireEvent.pointerDown(minus, { button: 0 })
    fireEvent.pointerLeave(minus)
    act(() => vi.advanceTimersByTime(500))
    expect(screen.getByRole("spinbutton")).toHaveValue("1")
    fireEvent.pointerDown(minus, { button: 2 })
    expect(screen.getByRole("spinbutton")).toHaveValue("1")
  })

  it("works from the keyboard: arrow keys in the field and Enter on the buttons", async () => {
    renderWithOnu(<QuantityStepper aria-label="Qty" defaultValue={5} step={5} />)
    const input = screen.getByRole("spinbutton")
    input.focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(input).toHaveValue("10")
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }), { detail: 0 })
    expect(input).toHaveValue("5")
    // A mouse click (detail 1) is handled on pointer down, not twice.
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }), { detail: 1 })
    expect(input).toHaveValue("5")
  })

  it("is controlled, sized and disabled", () => {
    function Controlled() {
      const [v, setV] = React.useState(2)
      return <QuantityStepper aria-label="Qty" value={v} onValueChange={setV} size="lg" className="x-root" />
    }
    const { container, rerender } = renderWithOnu(<Controlled />)
    fireEvent.pointerDown(screen.getByRole("button", { name: "Increase" }), { button: 0 })
    fireEvent.pointerUp(window)
    expect(screen.getByRole("spinbutton")).toHaveValue("3")
    expect(container.querySelector("[data-slot=input-group]")).toHaveClass("x-root", "h-12")
    rerender(<QuantityStepper aria-label="Qty" disabled />)
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled()
  })

  it("falls back to min when cleared", async () => {
    renderWithOnu(<QuantityStepper aria-label="Qty" defaultValue={4} min={1} />)
    const input = screen.getByRole("spinbutton")
    await userEvent.clear(input)
    await userEvent.tab()
    expect(input).toHaveValue("1")
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<QuantityStepper aria-label="އަދަދު" />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "އިތުރުކުރޭ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "މަދުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("UnitInput", () => {
  it("shows a fixed unit at the end or start", () => {
    const { container, rerender } = renderWithOnu(<UnitInput aria-label="Weight" unit="kg" defaultValue={12} />)
    const addon = container.querySelector("[data-slot=input-group-addon]")
    expect(addon).toHaveAttribute("data-align", "inline-end")
    expect(screen.getByText("kg")).toBeInTheDocument()
    rerender(<UnitInput aria-label="Price" unit="MVR" unitPosition="start" classNames={{ unit: "u-x" }} />)
    expect(container.querySelector("[data-slot=input-group-addon]")).toHaveAttribute("data-align", "inline-start")
    expect(screen.getByText("MVR")).toHaveClass("u-x")
  })

  it("renders a unit select and reports changes", async () => {
    const onUnitChange = vi.fn()
    const { container } = renderWithOnu(
      <form>
        <UnitInput
          aria-label="Distance"
          defaultValue={5}
          units={[
            { value: "m", label: "m" },
            { value: "km", label: "km" },
          ]}
          defaultUnit="km"
          unitName="distance_unit"
          onUnitChange={onUnitChange}
        />
      </form>,
    )
    const select = screen.getByRole("combobox", { name: "Unit" })
    expect(select).toHaveTextContent("km")
    await userEvent.click(select)
    await userEvent.click(await screen.findByRole("option", { name: "m" }))
    expect(onUnitChange).toHaveBeenCalledWith("m")
    expect(new FormData(container.querySelector("form")!).get("distance_unit")).toBe("m")
    await expectNoA11yViolations(container)
  })

  it.each(directions)("labels the unit select in Dhivehi in %s", (dir) => {
    renderWithOnu(<UnitInput aria-label="ދިގުމިން" units={[{ value: "cm", label: "cm" }]} />, { dir, locale: "dv" })
    expect(screen.getByRole("combobox", { name: "މިންވަރު" })).toBeInTheDocument()
    expect(screen.getByRole("spinbutton")).toHaveAttribute("dir", "ltr")
  })
})
