import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TextInput } from "./text-input"
import { ThaanaToggle } from "./thaana-toggle"

const button = () => screen.getByRole("button", { name: "Switch between Thaana and Latin typing" })
const region = (container: HTMLElement) => container.querySelector("[aria-live]")!

function Controlled({ onToggle }: { onToggle?: (enabled: boolean) => void }) {
  const [enabled, setEnabled] = React.useState(true)
  return (
    <ThaanaToggle
      enabled={enabled}
      onToggle={() => {
        setEnabled(!enabled)
        onToggle?.(!enabled)
      }}
    />
  )
}

describe("ThaanaToggle", () => {
  it("shows the active mode and exposes it with aria-pressed", () => {
    const { rerender } = renderWithOnu(<ThaanaToggle enabled onToggle={() => {}} />)
    expect(button()).toHaveAttribute("aria-pressed", "true")
    expect(button()).toHaveTextContent("ދ")
    expect(button().querySelector("span")).toHaveAttribute("lang", "dv")
    expect(button()).toHaveAttribute("title", "Switch between Thaana and Latin typing (Alt+Shift+T)")
    expect(button()).toHaveAttribute("type", "button")

    rerender(<ThaanaToggle enabled={false} onToggle={() => {}} />)
    expect(button()).toHaveAttribute("aria-pressed", "false")
    expect(button()).toHaveTextContent("A")
    expect(button().querySelector("span")).toHaveAttribute("lang", "en")
  })

  it("calls onToggle when pressed, by mouse or keyboard", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    renderWithOnu(<Controlled onToggle={onToggle} />)
    await user.click(button())
    expect(onToggle).toHaveBeenLastCalledWith(false)
    expect(button()).toHaveAttribute("aria-pressed", "false")
    button().focus()
    await user.keyboard("{Enter}")
    expect(onToggle).toHaveBeenLastCalledWith(true)
    await user.keyboard(" ")
    expect(onToggle).toHaveBeenCalledTimes(3)
  })

  it("announces the new mode in a polite live region", async () => {
    const user = userEvent.setup()
    const { container } = renderWithOnu(<Controlled />)
    expect(region(container)).toHaveAttribute("aria-live", "polite")
    expect(region(container)).toHaveTextContent("Thaana typing on")
    await user.click(button())
    expect(region(container)).toHaveTextContent("Latin typing on")
  })

  it("keeps focus in the field: pressing the mouse does not move focus", () => {
    renderWithOnu(<ThaanaToggle enabled onToggle={() => {}} />)
    const event = fireEvent.mouseDown(button())
    expect(event).toBe(false) // default prevented
  })

  it("passes classes and button props through", () => {
    renderWithOnu(<ThaanaToggle enabled onToggle={() => {}} className="toggle-x" disabled />)
    expect(button()).toHaveClass("toggle-x", "touch:min-h-11")
    expect(button()).toBeDisabled()
  })

  it("speaks Dhivehi labels in the Dhivehi locale", () => {
    const { container } = renderWithOnu(<ThaanaToggle enabled onToggle={() => {}} />, { locale: "dv" })
    const toggle = container.querySelector("[data-slot=thaana-toggle]")!
    expect(toggle.getAttribute("aria-label")).not.toBe("Switch between Thaana and Latin typing")
    expect(region(container).textContent).not.toBe("Thaana typing on")
  })

  it("switches a text input between Thaana and Latin", async () => {
    const user = userEvent.setup()
    renderWithOnu(<TextInput aria-label="Name" thaana thaanaToggle />)
    const input = screen.getByRole("textbox", { name: "Name" })
    expect(input).toHaveAttribute("dir", "rtl")
    expect(input).toHaveAttribute("lang", "dv")
    await user.click(button())
    expect(button()).toHaveAttribute("aria-pressed", "false")
    expect(input).toHaveAttribute("dir", "auto")
    expect(input).not.toHaveAttribute("lang")
  })

  it.each(directions)("has no axe violations (%s)", async (dir) => {
    renderWithOnu(<TextInput aria-label="Name" thaana thaanaToggle />, { dir })
    await expectNoA11yViolations()
  })
})
