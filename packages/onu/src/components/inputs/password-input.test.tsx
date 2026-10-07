import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { PasswordInput, scorePassword } from "./password-input"

const getInput = (container: HTMLElement) => container.querySelector("input")!

describe("scorePassword", () => {
  it("scores from very weak to strong", () => {
    expect(scorePassword("")).toBe(0)
    expect(scorePassword("abc")).toBeLessThanOrEqual(1)
    expect(scorePassword("password123")).toBeLessThanOrEqual(1)
    expect(scorePassword("aaaaaaaaaaaa")).toBeLessThanOrEqual(1)
    expect(scorePassword("Maldives2026")).toBeGreaterThanOrEqual(2)
    expect(scorePassword("Hulhumale'-Ferry#Rides!")).toBe(4)
  })
})

describe("PasswordInput", () => {
  it("is a password field with a show/hide toggle", async () => {
    const onVisibleChange = vi.fn()
    const { container } = renderWithOnu(
      <PasswordInput aria-label="Password" onVisibleChange={onVisibleChange} className="wrap-x" />,
    )
    const input = getInput(container)
    expect(input).toHaveAttribute("type", "password")
    expect(input).toHaveAttribute("autocomplete", "current-password")
    expect(input).toHaveAttribute("dir", "ltr")
    expect(container.firstChild).toHaveClass("wrap-x")
    const toggle = screen.getByRole("button", { name: "Show password" })
    expect(toggle).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(toggle)
    expect(input).toHaveAttribute("type", "text")
    expect(toggle).toHaveAttribute("aria-pressed", "true")
    expect(onVisibleChange).toHaveBeenCalledWith(true)
    await userEvent.click(toggle)
    expect(input).toHaveAttribute("type", "password")
    await expectNoA11yViolations()
  })

  it("supports controlled visibility and no toggle", () => {
    const { container, rerender } = renderWithOnu(<PasswordInput aria-label="Password" visible />)
    expect(getInput(container)).toHaveAttribute("type", "text")
    rerender(<PasswordInput aria-label="Password" visible={false} toggleable={false} />)
    expect(getInput(container)).toHaveAttribute("type", "password")
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("warns when Caps Lock is on and hides the warning on blur", async () => {
    const onKeyDown = vi.fn()
    const onKeyUp = vi.fn()
    const onBlur = vi.fn()
    const { container } = renderWithOnu(
      <PasswordInput aria-label="Password" onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={onBlur} />,
    )
    const input = getInput(container)
    fireEvent.keyDown(input, { key: "A", getModifierState: (k: string) => k === "CapsLock" })
    // jsdom does not pass getModifierState through init; emulate with modifierCapsLock.
    fireEvent.keyUp(input, { key: "A", modifierCapsLock: true })
    expect(await screen.findByText("Caps Lock is on")).toBeInTheDocument()
    expect(input.getAttribute("aria-describedby")).toContain("caps")
    expect(onKeyDown).toHaveBeenCalled()
    expect(onKeyUp).toHaveBeenCalled()
    fireEvent.blur(input)
    expect(screen.queryByText("Caps Lock is on")).not.toBeInTheDocument()
    expect(onBlur).toHaveBeenCalled()
  })

  it("can turn the Caps Lock warning off", () => {
    const { container } = renderWithOnu(<PasswordInput aria-label="Password" capsLockWarning={false} />)
    fireEvent.keyUp(getInput(container), { key: "A", modifierCapsLock: true })
    expect(screen.queryByText("Caps Lock is on")).not.toBeInTheDocument()
  })

  it("shows a strength meter as the user types", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<PasswordInput aria-label="New password" strength onChange={onChange} />)
    const input = getInput(container)
    expect(input).toHaveAttribute("autocomplete", "new-password")
    expect(container.querySelector("[data-slot=password-strength]")).not.toBeInTheDocument()
    await userEvent.type(input, "abc")
    expect(screen.getByText(/Password strength: (Very weak|Weak)/)).toBeInTheDocument()
    await userEvent.clear(input)
    await userEvent.type(input, "Hulhumale'-Ferry#Rides!")
    expect(screen.getByText("Password strength: Strong")).toBeInTheDocument()
    expect(container.querySelector("[data-score='4']")).toBeInTheDocument()
    expect(onChange).toHaveBeenCalled()
    await expectNoA11yViolations()
  })

  it("accepts a custom scorer and a controlled value", () => {
    renderWithOnu(<PasswordInput aria-label="Password" strength={() => 2} value="x" onChange={() => {}} />)
    expect(screen.getByText("Password strength: Fair")).toBeInTheDocument()
  })

  it("forwards refs and wires a FormField", () => {
    const ref = React.createRef<HTMLInputElement>()
    renderWithOnu(
      <FormField label="Password" name="password" error="Too short" required>
        <PasswordInput ref={ref} endAddon={<span>!</span>} />
      </FormField>,
    )
    expect(ref.current).toHaveAttribute("name", "password")
    expect(ref.current).toHaveAttribute("aria-invalid", "true")
    expect(ref.current?.getAttribute("aria-describedby")).toMatch(/-error/)
    expect(screen.getByText("!")).toBeInTheDocument()
  })

  it.each(directions)("uses Dhivehi strings in %s and stays LTR", async (dir) => {
    const { container } = renderWithOnu(<PasswordInput aria-label="ޕާސްވޯޑް" strength defaultValue="abc" />, {
      dir,
      locale: "dv",
    })
    expect(screen.getByRole("button", { name: "ޕާސްވޯޑް ދައްކާ" })).toBeInTheDocument()
    expect(screen.getByText(/ޕާސްވޯޑުގެ ވަރުގަދަކަން/)).toBeInTheDocument()
    expect(getInput(container)).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
  })
})
