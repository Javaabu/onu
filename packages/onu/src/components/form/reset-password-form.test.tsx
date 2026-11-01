import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ResetPasswordForm } from "./reset-password-form"

describe("ResetPasswordForm", () => {
  it("submits the token, email and new password", async () => {
    const onSubmit = vi.fn()
    renderWithOnu(
      <ResetPasswordForm
        token="abc123"
        onSubmit={onSubmit}
        emailReadOnly
        defaultValues={{ email: "a@b.mv" }}
        signInHref="/login"
        submitLabel="Save password"
      />,
    )
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("readonly")
    await userEvent.type(screen.getByLabelText(/New password/), "n3w")
    await userEvent.type(screen.getByLabelText(/Confirm password/), "n3w")
    await userEvent.click(screen.getByRole("button", { name: "Save password" }))
    expect(onSubmit).toHaveBeenCalledWith({
      token: "abc123",
      email: "a@b.mv",
      password: "n3w",
      password_confirmation: "n3w",
    })
    await expectNoA11yViolations()
  })

  it("submits natively without onSubmit", () => {
    renderWithOnu(<ResetPasswordForm token="t" formProps={{ action: "/reset", method: "post" }} />)
    const form = document.querySelector("form")!
    expect(form).toHaveAttribute("action", "/reset")
    expect(form.querySelector("input[name=token]")).toHaveValue("t")
  })
})
