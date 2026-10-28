import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ForgotPasswordForm, RegisterForm, ResetPasswordForm, SignInForm } from "./auth-forms"

describe("SignInForm", () => {
  it("submits email, password and remember", async () => {
    const onSubmit = vi.fn()
    renderWithOnu(<SignInForm onSubmit={onSubmit} forgotPasswordHref="/forgot" registerHref="/register" />)
    expect(screen.getByRole("region", { name: "Sign in" })).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/Email/), "aisha@example.mv")
    await userEvent.type(screen.getByLabelText(/^Password/), "secret")
    await userEvent.click(screen.getByRole("checkbox", { name: "Remember me" }))
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(onSubmit).toHaveBeenCalledWith({ email: "aisha@example.mv", password: "secret", remember: true })
    expect(screen.getByRole("link", { name: "Forgot password?" })).toHaveAttribute("href", "/forgot")
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/register")
    await expectNoA11yViolations()
  })

  it("passes extraFields values to onSubmit alongside the built-in fields", async () => {
    const onSubmit = vi.fn()
    renderWithOnu(
      <SignInForm
        onSubmit={(values) => onSubmit(values.island, values.email)}
        showRemember={false}
        extraFields={
          <label>
            Island
            <input name="island" defaultValue="Hulhumalé" />
          </label>
        }
      />,
    )
    await userEvent.type(screen.getByLabelText(/Email/), "aisha@example.mv")
    await userEvent.type(screen.getByLabelText(/^Password/), "secret")
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }))
    expect(onSubmit).toHaveBeenCalledWith("Hulhumalé", "aisha@example.mv")
  })

  it("draws the 'or' divider without a background, so it suits the card in dark mode", () => {
    renderWithOnu(<SignInForm sso={<button type="button">Single sign-on</button>} />, { dark: true })
    const label = screen.getByText("or")
    expect(label.closest("[data-slot=divider]")).toBeInTheDocument()
    expect(label.className).not.toMatch(/\bbg-/)
    document.documentElement.classList.remove("dark")
  })

  it("shows/hides the password", async () => {
    renderWithOnu(<SignInForm />)
    const password = screen.getByLabelText(/^Password/)
    expect(password).toHaveAttribute("type", "password")
    await userEvent.click(screen.getByRole("button", { name: "Show password" }))
    expect(password).toHaveAttribute("type", "text")
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true")
  })

  it("shows server errors, processing state, status and the single sign-on slot", async () => {
    renderWithOnu(
      <SignInForm
        errors={{ email: "These credentials do not match our records." }}
        status="Your password has been reset."
        sso={<button type="button">Sign in with eFaas</button>}
        showRemember={false}
        logo={<span>logo</span>}
      />,
    )
    await waitFor(() => expect(screen.getByLabelText(/Email/)).toHaveFocus())
    expect(screen.getByLabelText(/Email/)).toHaveAccessibleDescription("These credentials do not match our records.")
    expect(screen.getByText("Your password has been reset.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign in with eFaas" })).toBeInTheDocument()
    expect(screen.getByText("or")).toBeInTheDocument()
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })

  it("shows the processing state and disables the fields", () => {
    renderWithOnu(<SignInForm processing />)
    expect(screen.getByRole("button", { name: "Sign in" })).toHaveAttribute("aria-busy", "true")
    expect(screen.getByLabelText(/Email/)).toBeDisabled()
    expect(screen.getByRole("checkbox")).toBeDisabled()
  })

  it("renders through the provider link component", () => {
    const Link = ({ children, ...props }: React.ComponentProps<"a">) => (
      <a data-inertia="" {...props}>
        {children}
      </a>
    )
    renderWithOnu(<SignInForm forgotPasswordHref="/forgot" />, { provider: { linkComponent: Link } })
    expect(screen.getByRole("link")).toHaveAttribute("data-inertia")
  })

  it.each(directions)("is translated to Dhivehi (%s)", async (dir) => {
    renderWithOnu(<SignInForm forgotPasswordHref="/forgot" />, { locale: "dv", dir })
    expect(screen.getByRole("heading", { name: "ސައިން އިން" })).toBeInTheDocument()
    expect(screen.getByLabelText(/އީމެއިލް/)).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
  })
})

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
