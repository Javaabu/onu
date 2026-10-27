import * as React from "react"
import { act, fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { NumberInput, numberSymbols, parseLocaleNumber } from "./number-input"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

afterEach(() => vi.useRealTimers())

describe("parseLocaleNumber", () => {
  it("parses locale-formatted numbers", () => {
    expect(parseLocaleNumber("1,234.5", "en")).toBe(1234.5)
    expect(parseLocaleNumber(" -12 ", "en")).toBe(-12)
    expect(parseLocaleNumber("−12", "en")).toBe(-12)
    expect(parseLocaleNumber("", "en")).toBeNull()
    expect(parseLocaleNumber("-", "en")).toBeUndefined()
    expect(parseLocaleNumber("1.234,5", "de")).toBe(1234.5)
    expect(numberSymbols("de")).toEqual({ group: ".", decimal: "," })
  })
})

describe("NumberInput", () => {
  it("formats when not editing and shows the raw number while editing", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<NumberInput aria-label="Amount" defaultValue={1234.5} onValueChange={onValueChange} />)
    const input = screen.getByRole("spinbutton", { name: "Amount" })
    expect(input).toHaveValue("1,234.5")
    expect(input).toHaveAttribute("aria-valuenow", "1234.5")
    expect(input).toHaveAttribute("aria-valuetext", "1,234.5")
    expect(input).toHaveAttribute("dir", "ltr")
    await userEvent.click(input)
    expect(input).toHaveValue("1234.5")
    await userEvent.clear(input)
    await userEvent.type(input, "2500")
    expect(onValueChange).toHaveBeenLastCalledWith(2500)
    await userEvent.tab()
    expect(input).toHaveValue("2,500")
    await expectNoA11yViolations()
  })

  it("ignores letters and keeps partial input until blur", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<NumberInput aria-label="Count" onValueChange={onValueChange} />)
    const input = screen.getByRole("spinbutton")
    await userEvent.type(input, "1a2")
    expect(input).toHaveValue("12")
    await userEvent.clear(input)
    await userEvent.type(input, "-")
    expect(input).toHaveValue("-")
    await userEvent.tab()
    expect(input).toHaveValue("")
    expect(onValueChange).toHaveBeenLastCalledWith(null)
  })

  it("steps with arrow keys and Page Up/Down, within min and max", async () => {
    renderWithOnu(<NumberInput aria-label="Guests" defaultValue={2} min={1} max={30} />)
    const input = screen.getByRole("spinbutton")
    expect(input).toHaveAttribute("aria-valuemin", "1")
    expect(input).toHaveAttribute("aria-valuemax", "30")
    expect(input).toHaveAttribute("inputmode", "numeric")
    input.focus()
    await userEvent.keyboard("{ArrowUp}{ArrowUp}")
    expect(input).toHaveValue("4")
    await userEvent.keyboard("{PageUp}")
    expect(input).toHaveValue("14")
    await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}")
    expect(input).toHaveValue("24")
    await userEvent.keyboard("{PageUp}")
    expect(input).toHaveValue("30")
    await userEvent.keyboard("{PageDown}{PageDown}{PageDown}{PageDown}")
    expect(input).toHaveValue("1")
    await userEvent.keyboard("{ArrowDown}")
    expect(input).toHaveValue("1")
  })

  it("clamps on blur and steps from empty", async () => {
    renderWithOnu(<NumberInput aria-label="Percent" min={0} max={100} />)
    const input = screen.getByRole("spinbutton")
    input.focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(input).toHaveValue("0")
    await userEvent.clear(input)
    await userEvent.type(input, "150")
    await userEvent.tab()
    expect(input).toHaveValue("100")
  })

  it("keeps decimal steps precise", async () => {
    renderWithOnu(<NumberInput aria-label="Weight" defaultValue={0.1} step={0.1} />)
    const input = screen.getByRole("spinbutton")
    expect(input).toHaveAttribute("inputmode", "decimal")
    input.focus()
    await userEvent.keyboard("{ArrowUp}{ArrowUp}")
    expect(input).toHaveValue("0.3")
  })

  it("steps while not focused using keyboard events", () => {
    renderWithOnu(<NumberInput aria-label="Qty" defaultValue={5} />)
    const input = screen.getByRole("spinbutton")
    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(input).toHaveValue("4")
    fireEvent.keyDown(input, { key: "x" })
    expect(input).toHaveValue("4")
  })

  it("never changes on the scroll wheel", () => {
    renderWithOnu(<NumberInput aria-label="Qty" defaultValue={5} />)
    const input = screen.getByRole("spinbutton")
    input.focus()
    fireEvent.wheel(input, { deltaY: -100 })
    fireEvent.blur(input)
    expect(input).toHaveValue("5")
  })

  it("respects readOnly and a consumer onKeyDown that prevents default", () => {
    const { rerender } = renderWithOnu(<NumberInput aria-label="Qty" defaultValue={5} readOnly />)
    fireEvent.keyDown(screen.getByRole("spinbutton"), { key: "ArrowUp" })
    expect(screen.getByRole("spinbutton")).toHaveValue("5")
    rerender(<NumberInput aria-label="Qty" defaultValue={5} onKeyDown={(e) => e.preventDefault()} />)
    fireEvent.keyDown(screen.getByRole("spinbutton"), { key: "ArrowUp" })
    expect(screen.getByRole("spinbutton")).toHaveValue("5")
  })

  it("is controlled", async () => {
    function Controlled() {
      const [v, setV] = React.useState<number | null>(10)
      return (
        <>
          <NumberInput aria-label="Qty" value={v} onValueChange={setV} />
          <output>{String(v)}</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    screen.getByRole("spinbutton").focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(screen.getByText("11")).toBeInTheDocument()
  })

  it("formats currency and percentages", async () => {
    renderWithOnu(
      <>
        <NumberInput
          aria-label="Fee"
          defaultValue={1500}
          formatOptions={{ style: "currency", currency: "MVR", maximumFractionDigits: 2 }}
        />
        <NumberInput aria-label="Rate" defaultValue={0.15} formatOptions={{ style: "percent" }} />
      </>,
    )
    expect((screen.getByRole("spinbutton", { name: "Fee" }) as HTMLInputElement).value).toMatch(/MVR\s1,500\.00/)
    expect(screen.getByRole("spinbutton", { name: "Fee" })).toHaveAttribute("inputmode", "decimal")
    const rate = screen.getByRole("spinbutton", { name: "Rate" })
    expect(rate).toHaveValue("15%")
    await userEvent.click(rate)
    expect(rate).toHaveValue("15")
    await userEvent.clear(rate)
    await userEvent.type(rate, "20")
    await userEvent.tab()
    expect(rate).toHaveValue("20%")
  })

  it("submits the raw number via a hidden input named by the FormField", () => {
    const { container } = renderWithOnu(
      <form>
        <FormField label="Amount" name="amount" required>
          <NumberInput defaultValue={1234} />
        </FormField>
      </form>,
    )
    const data = new FormData(container.querySelector("form")!)
    expect(data.get("amount")).toBe("1234")
    expect(screen.getByLabelText(/Amount/)).toBeRequired()
  })

  it.each(directions)("works in %s with the Dhivehi locale", async (dir) => {
    renderWithOnu(<NumberInput aria-label="އަދަދު" defaultValue={12000} />, { dir, locale: "dv" })
    const input = screen.getByRole("spinbutton")
    expect(input).toHaveValue("12,000")
    expect(input).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
  })
})

describe("NumberInput stepper", () => {
  it("steps with the − and + buttons and stops at min and max", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <NumberInput stepper aria-label="Tickets" defaultValue={1} min={1} max={3} onValueChange={onValueChange} />,
    )
    const input = screen.getByRole("spinbutton", { name: "Tickets" })
    const minus = screen.getByRole("button", { name: "Decrease" })
    const plus = screen.getByRole("button", { name: "Increase" })
    expect(minus).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(plus)
    await userEvent.click(plus)
    expect(input).toHaveValue("3")
    expect(onValueChange).toHaveBeenLastCalledWith(3)
    expect(plus).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(minus)
    expect(input).toHaveValue("2")
    await expectNoA11yViolations()
  })

  it("repeats while the button is held", () => {
    vi.useFakeTimers()
    renderWithOnu(<NumberInput stepper aria-label="Qty" defaultValue={0} repeatDelay={300} repeatInterval={50} />)
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
    renderWithOnu(
      <NumberInput stepper aria-label="Qty" defaultValue={0} max={2} repeatDelay={100} repeatInterval={10} />,
    )
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
    renderWithOnu(<NumberInput stepper aria-label="Qty" defaultValue={5} step={5} />)
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
      return <NumberInput stepper aria-label="Qty" value={v} onValueChange={setV} size="lg" className="x-root" />
    }
    const { container, rerender } = renderWithOnu(<Controlled />)
    fireEvent.pointerDown(screen.getByRole("button", { name: "Increase" }), { button: 0 })
    fireEvent.pointerUp(window)
    expect(screen.getByRole("spinbutton")).toHaveValue("3")
    expect(container.querySelector("[data-slot=input-group]")).toHaveClass("x-root", "h-12")
    rerender(<NumberInput stepper aria-label="Qty" disabled />)
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled()
  })

  it("falls back to min when cleared", async () => {
    renderWithOnu(<NumberInput stepper aria-label="Qty" defaultValue={4} min={1} />)
    const input = screen.getByRole("spinbutton")
    await userEvent.clear(input)
    await userEvent.tab()
    expect(input).toHaveValue("1")
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<NumberInput stepper aria-label="އަދަދު" />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "އިތުރުކުރޭ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "މަދުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("NumberInput units", () => {
  it("shows a fixed unit at the end or start", () => {
    const { container, rerender } = renderWithOnu(<NumberInput aria-label="Weight" unit="kg" defaultValue={12} />)
    const addon = container.querySelector("[data-slot=input-group-addon]")
    expect(addon).toHaveAttribute("data-align", "inline-end")
    expect(screen.getByText("kg")).toBeInTheDocument()
    rerender(<NumberInput aria-label="Price" unit="MVR" unitPosition="start" classNames={{ unit: "u-x" }} />)
    expect(container.querySelector("[data-slot=input-group-addon]")).toHaveAttribute("data-align", "inline-start")
    expect(screen.getByText("MVR")).toHaveClass("u-x")
  })

  it("renders a unit select and reports changes", async () => {
    const onUnitChange = vi.fn()
    const { container } = renderWithOnu(
      <form>
        <NumberInput
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

  it("combines a unit with the stepper and your own addons, the unit next to the number", () => {
    const { container } = renderWithOnu(
      <NumberInput stepper aria-label="Weight" unit="kg" endAddon={<span>max</span>} defaultValue={2} />,
    )
    const end = container.querySelector("[data-slot=input-group-addon][data-align=inline-end]")!
    expect(Array.from(end.children).map((el) => el.getAttribute("data-slot") ?? el.textContent)).toEqual([
      "unit",
      "max",
      "number-input-increment",
    ])
    expect(container.querySelector("[data-slot=input-group-addon][data-align=inline-start]")!.children).toHaveLength(1)
  })

  it.each(directions)("labels the unit select in Dhivehi in %s", (dir) => {
    renderWithOnu(<NumberInput aria-label="ދިގުމިން" units={[{ value: "cm", label: "cm" }]} />, { dir, locale: "dv" })
    expect(screen.getByRole("combobox", { name: "މިންވަރު" })).toBeInTheDocument()
    expect(screen.getByRole("spinbutton")).toHaveAttribute("dir", "ltr")
  })
})
