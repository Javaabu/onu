import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ForgotPasswordForm } from "./forgot-password-form"

describe("ForgotPasswordForm", () => {
  it("submits the email and shows the sent status", async () => {
    const onSubmit = vi.fn()
    renderWithOnu(<ForgotPasswordForm onSubmit={onSubmit} signInHref="/login" status="Reset link sent." />)
    await userEvent.type(screen.getByLabelText(/Email/), "a@b.mv")
    await userEvent.click(screen.getByRole("button", { name: "Email reset link" }))
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.mv" })
    expect(screen.getByRole("status")).toHaveTextContent("Reset link sent.")
    expect(screen.getByRole("link", { name: "Back to sign in" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
