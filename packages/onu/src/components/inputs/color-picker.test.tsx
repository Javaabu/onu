import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { ColorPicker, toHex } from "./color-picker"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

const originalMatchMedia = window.matchMedia
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

describe("toHex", () => {
  it("normalises colours", () => {
    expect(toHex("#1F7A4D")).toBe("#1f7a4d")
    expect(toHex("rgb(255, 0, 0)")).toBe("#ff0000")
    expect(toHex("nope")).toBeNull()
    expect(toHex(null)).toBeNull()
  })
})

describe("ColorPicker", () => {
  it("shows the swatch and hex value and opens a labelled panel", async () => {
    renderWithOnu(<ColorPicker aria-label="Brand colour" defaultValue="#1f7a4d" />)
    const trigger = screen.getByRole("button", { name: "Brand colour" })
    expect(trigger).toHaveTextContent("#1F7A4D")
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog")
    await userEvent.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Choose a colour" })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Hex colour" })).toHaveValue("#1F7A4D")
    expect(screen.getAllByRole("slider", { name: /Hue/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("slider", { name: /Saturation and brightness/ }).length).toBeGreaterThan(0)
    await expectNoA11yViolations()
  })

  it("changes with the hex field, presets and the keyboard", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<ColorPicker aria-label="Colour" defaultValue="#1f7a4d" onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Colour" }))
    const hex = await screen.findByRole("textbox", { name: "Hex colour" })
    await userEvent.clear(hex)
    await userEvent.type(hex, "#2563eb{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("#2563eb")

    await userEvent.click(screen.getByRole("option", { name: "vibrant red" }))
    expect(onValueChange).toHaveBeenLastCalledWith("#dc2626")

    const hue = screen.getAllByRole("slider", { name: /Hue/ })[0]!
    fireEvent.keyDown(hue, { key: "ArrowRight" })
    expect(onValueChange).toHaveBeenCalledTimes(3)
    expect(onValueChange.mock.calls[2]![0]).not.toBe("#dc2626")
  })

  it("closes with Escape and returns focus to the trigger", async () => {
    renderWithOnu(<ColorPicker aria-label="Colour" />)
    const trigger = screen.getByRole("button", { name: "Colour" })
    await userEvent.click(trigger)
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it("shows a placeholder when empty, hides presets and is controlled", async () => {
    function Controlled() {
      const [v, setV] = React.useState<string | null>(null)
      return (
        <>
          <ColorPicker aria-label="Colour" value={v} onValueChange={setV} presets={[]} placeholder="Pick one" />
          <button type="button" onClick={() => setV("#ff0000")}>
            set
          </button>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    const trigger = screen.getByRole("button", { name: "Colour" })
    expect(trigger).toHaveTextContent("Pick one")
    expect(trigger).toHaveAttribute("data-empty", "true")
    await userEvent.click(screen.getByRole("button", { name: "set" }))
    expect(trigger).toHaveTextContent("#FF0000")
    await userEvent.click(trigger)
    await screen.findByRole("dialog")
    expect(screen.queryByRole("listbox", { name: "Preset colours" })).not.toBeInTheDocument()
  })

  it("opens as a bottom sheet on phones", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }))
    renderWithOnu(<ColorPicker aria-label="Colour" defaultOpen />)
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-picker", "sheet")
    expect(screen.getByRole("heading", { name: "Choose a colour" })).toBeInTheDocument()
  })

  it("submits the hex value and is wired by a FormField", () => {
    const { container } = renderWithOnu(
      <form>
        <FormField label="Theme colour" name="colour" error="Required" required>
          <ColorPicker defaultValue="#1F7A4D" classNames={{ trigger: "trig-x" }} />
        </FormField>
      </form>,
    )
    const trigger = screen.getByRole("button", { name: /Theme colour/ })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(trigger).toHaveClass("trig-x")
    expect(new FormData(container.querySelector("form")!).get("colour")).toBe("#1f7a4d")
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<ColorPicker aria-label="ކުލަ" />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "ކުލަ" })).toHaveTextContent("ކުލައެއް ނެތް")
    await userEvent.click(screen.getByRole("button", { name: "ކުލަ" }))
    expect(await screen.findByRole("dialog", { name: "ކުލައެއް ޚިޔާރުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
