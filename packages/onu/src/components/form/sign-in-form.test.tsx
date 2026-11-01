import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SignInForm } from "./sign-in-form"

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
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("aria-pressed", "true")
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

  it("styles the single sign-on slot", () => {
    const { container } = renderWithOnu(
      <SignInForm sso={<button type="button">SSO</button>} classNames={{ sso: "so" }} />,
    )
    expect(container.querySelector('[data-slot="auth-sso"]')).toHaveClass("so")
  })
})
