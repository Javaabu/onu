import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { EmailInput } from "./email-input"

describe("EmailInput", () => {
  it("is an LTR email field with the email keyboard and autofill", async () => {
    const onChange = vi.fn()
    renderWithOnu(<EmailInput aria-label="Email" onChange={onChange} className="extra" />)
    const input = screen.getByRole("textbox", { name: "Email" })
    expect(input).toHaveAttribute("type", "email")
    expect(input).toHaveAttribute("inputmode", "email")
    expect(input).toHaveAttribute("autocomplete", "email")
    expect(input).toHaveAttribute("dir", "ltr")
    expect(input).toHaveClass("extra")
    await userEvent.type(input, "ali@example.mv")
    expect(input).toHaveValue("ali@example.mv")
    expect(onChange).toHaveBeenCalled()
    await expectNoA11yViolations()
  })

  it("stays LTR even when dir is passed, and shows an icon", () => {
    const { container } = renderWithOnu(<EmailInput aria-label="Email" dir="rtl" showIcon />)
    expect(screen.getByRole("textbox")).toHaveAttribute("dir", "ltr")
    expect(container.querySelector("[data-icon-name=mail]")).toBeInTheDocument()
  })

  it("does not accept a thaana prop at the type level and forwards refs", () => {
    const ref = React.createRef<HTMLInputElement>()
    // @ts-expect-error -- email must stay Latin (R13.3)
    renderWithOnu(<EmailInput aria-label="Email" ref={ref} thaana />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it.each(directions)("is wired to a FormField in %s", async (dir) => {
    renderWithOnu(
      <FormField label="އީމެއިލް" name="email" error="Invalid" required>
        <EmailInput autoComplete="username" />
      </FormField>,
      { dir, locale: "dv" },
    )
    const input = screen.getByLabelText(/އީމެއިލް/)
    expect(input).toHaveAttribute("name", "email")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(input).toHaveAttribute("autocomplete", "username")
    expect(input).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
  })
})
