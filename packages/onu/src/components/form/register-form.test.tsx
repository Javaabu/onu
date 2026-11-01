import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { RegisterForm } from "./register-form"

describe("RegisterForm", () => {
  it("submits every field and requires the terms when given", async () => {
    const onSubmit = vi.fn()
    renderWithOnu(<RegisterForm onSubmit={onSubmit} termsHref="/terms" signInHref="/login" title="Join" />)
    expect(screen.getByRole("heading", { name: "Join" })).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/Full name/), "Mohamed Ibrahim")
    await userEvent.type(screen.getByLabelText(/Email/), "mohamed@example.mv")
    await userEvent.type(screen.getByLabelText(/^Password/), "pw123456")
    await userEvent.type(screen.getByLabelText(/Confirm password/), "pw123456")
    const terms = screen.getByRole("checkbox", { name: /I agree/ })
    expect(terms).toBeRequired()
    await userEvent.click(terms)
    await userEvent.click(screen.getByRole("button", { name: "Create account" }))
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Mohamed Ibrahim",
      email: "mohamed@example.mv",
      password: "pw123456",
      password_confirmation: "pw123456",
      terms: true,
    })
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login")
    expect(screen.getByRole("link", { name: "Read the terms and conditions" })).toHaveAttribute("href", "/terms")
    await expectNoA11yViolations()
  })

  it("shows a terms error and types the name in Thaana", () => {
    renderWithOnu(<RegisterForm termsHref="/t" nameThaana errors={{ terms: "You must accept the terms." }} />, {
      locale: "dv",
    })
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription("You must accept the terms.")
    expect(screen.getByLabelText(/ފުރިހަމަ ނަން/)).toHaveAttribute("lang", "dv")
  })
})
