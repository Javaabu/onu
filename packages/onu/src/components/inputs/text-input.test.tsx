import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Icon } from "../../icons/icon"
import { FormField } from "../form/form-field"
import { TextInput } from "./text-input"
import { Textarea } from "./textarea"

function typeThaana(el: HTMLElement, data: string) {
  for (const ch of data) {
    el.dispatchEvent(
      new InputEvent("beforeinput", { inputType: "insertText", data: ch, cancelable: true, bubbles: true }),
    )
  }
}

describe("TextInput", () => {
  it("is a plain, accessible text input by default", async () => {
    const onChange = vi.fn()
    renderWithOnu(<TextInput aria-label="Name" onChange={onChange} className="extra" />)
    const input = screen.getByRole("textbox", { name: "Name" })
    await userEvent.type(input, "Ali")
    expect(input).toHaveValue("Ali")
    expect(onChange).toHaveBeenCalledTimes(3)
    expect(input).toHaveClass("extra")
    expect(input).not.toHaveAttribute("dir")
    await expectNoA11yViolations()
  })

  it("forwards refs (object and callback)", () => {
    const ref = React.createRef<HTMLInputElement>()
    const cb = vi.fn()
    renderWithOnu(
      <>
        <TextInput aria-label="a" ref={ref} />
        <TextInput aria-label="b" ref={cb} startAddon="@" />
      </>,
    )
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(cb).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it("renders start and end addons with slot classes", () => {
    const { container } = renderWithOnu(
      <TextInput
        aria-label="Price"
        startAddon={<Icon name="search" />}
        endAddon="MVR"
        classNames={{ root: "root-x", input: "input-x", startAddon: "start-x", endAddon: "end-x" }}
      />,
    )
    expect(container.querySelector("[data-slot=input-group]")).toHaveClass("root-x")
    expect(screen.getByRole("textbox")).toHaveClass("input-x")
    expect(container.querySelector(".start-x")).toBeInTheDocument()
    expect(screen.getByText("MVR").closest(".end-x")).toBeInTheDocument()
  })

  it("types Thaana with thaana on and sets dir/lang", () => {
    renderWithOnu(<TextInput aria-label="Name" thaana />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("dir", "rtl")
    expect(input).toHaveAttribute("lang", "dv")
    typeThaana(input, "ahmadu")
    expect(input).toHaveValue("ަހމަދު")
  })

  it("toggles Thaana with the toggle button and announces it", async () => {
    renderWithOnu(<TextInput aria-label="Name" thaana thaanaToggle />)
    const toggle = screen.getByRole("button", { name: /Thaana and Latin/ })
    expect(toggle).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("Thaana typing on")).toBeInTheDocument()
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText("Latin typing on")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toHaveAttribute("dir", "auto")
    await expectNoA11yViolations()
  })

  it("is wired to a FormField", () => {
    renderWithOnu(
      <FormField label="Email" name="email" error="Invalid" required>
        <TextInput type="email" startAddon="@" />
      </FormField>,
    )
    const input = screen.getByLabelText(/Email/)
    expect(input).toHaveAttribute("name", "email")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toBeRequired()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<TextInput thaana thaanaToggle aria-label="ނަން" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ތާނައާއި ލަތީނުގެ ދެމެދު ބަދަލުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("Textarea", () => {
  it("auto-resizes by default and can be fixed", () => {
    renderWithOnu(
      <>
        <Textarea aria-label="a" />
        <Textarea aria-label="b" autoResize={false} />
      </>,
    )
    expect(screen.getByLabelText("b")).toHaveClass("[field-sizing:fixed]")
  })

  it("counts characters, with and without a limit", async () => {
    const onChange = vi.fn()
    renderWithOnu(
      <>
        <Textarea aria-label="a" showCount maxLength={10} onChange={onChange} />
        <Textarea aria-label="b" showCount defaultValue="abc" />
      </>,
    )
    await userEvent.type(screen.getByLabelText("a"), "hey")
    expect(screen.getByText("3 / 10")).toBeInTheDocument()
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByText("3")).toBeInTheDocument()
  })

  it("keeps the counter in LTR order on an RTL page", () => {
    renderWithOnu(<Textarea aria-label="a" showCount maxLength={280} defaultValue="abc" />, {
      locale: "dv",
      dir: "rtl",
    })
    expect(screen.getByText("3 / 280")).toHaveAttribute("dir", "ltr")
  })

  it("tracks a controlled value", () => {
    const { rerender } = renderWithOnu(<Textarea aria-label="a" showCount value="ab" onChange={() => {}} />)
    expect(screen.getByText("2")).toBeInTheDocument()
    rerender(<Textarea aria-label="a" showCount value="abcd" onChange={() => {}} />)
    expect(screen.getByText("4")).toBeInTheDocument()
  })

  it("types Thaana and shows a toggle", () => {
    renderWithOnu(<Textarea thaana thaanaToggle aria-label="Notes" />)
    const ta = screen.getByLabelText("Notes")
    typeThaana(ta, "salAm")
    expect(ta).toHaveValue("ސަލާމ")
    fireEvent.click(screen.getByRole("button", { name: /Thaana and Latin/ }))
    expect(ta).toHaveAttribute("dir", "auto")
  })

  it("passes axe", async () => {
    renderWithOnu(
      <FormField label="Notes" help="Optional">
        <Textarea showCount />
      </FormField>,
    )
    await expectNoA11yViolations()
  })
})
