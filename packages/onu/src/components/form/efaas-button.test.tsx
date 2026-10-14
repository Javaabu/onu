import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { EfaasButton } from "./efaas-button"
import { SignInForm } from "./auth-forms"

describe("EfaasButton", () => {
  it("is a button with the eFaas wording and the blue variant by default", async () => {
    const onClick = vi.fn()
    renderWithOnu(<EfaasButton onClick={onClick} />)
    const button = screen.getByRole("button", { name: "Sign in with eFaas" })
    expect(button).toHaveAttribute("type", "button")
    expect(button).toHaveAttribute("data-variant", "blue")
    expect(button.className).toContain("bg-[#164998]")
    expect(button.style.fontFamily).toContain("Poppins")
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("is a plain link with href, and supports the register wording and the other variants", () => {
    renderWithOnu(
      <>
        <EfaasButton href="/login/efaas" variant="white" />
        <EfaasButton intent="register" variant="black" shape="square" />
      </>,
    )
    const link = screen.getByRole("link", { name: "Sign in with eFaas" })
    expect(link).toHaveAttribute("href", "/login/efaas")
    expect(link.className).toContain("bg-white")
    const register = screen.getByRole("button", { name: "Register with eFaas" })
    expect(register.className).toContain("bg-[#333333]")
    expect(register.className).toContain("rounded-none")
  })

  it("shows the supplied logo, and only the logo when iconOnly", () => {
    const { rerender } = renderWithOnu(<EfaasButton logo={<svg data-testid="logo" />} iconOnly />)
    expect(screen.getByTestId("logo").parentElement).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByRole("button", { name: "Sign in with eFaas" })).toBeInTheDocument()
    expect(screen.getByText("Sign in with eFaas")).toHaveClass("sr-only")
    // Without a logo the label stays visible.
    rerender(<EfaasButton iconOnly />)
    expect(screen.getByText("Sign in with eFaas")).not.toHaveClass("sr-only")
  })

  it("announces the redirect and ignores clicks while loading", async () => {
    const onClick = vi.fn()
    renderWithOnu(<EfaasButton loading onClick={onClick} />)
    const button = screen.getByRole("button", { name: "Redirecting to eFaas…" })
    expect(button).toHaveAttribute("aria-busy", "true")
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("uses Dhivehi wording", () => {
    renderWithOnu(<EfaasButton href="/login/efaas" />, { locale: "dv", dir: "rtl" })
    const link = screen.getByRole("link", { name: "eFaas އިން ސައިން އިން ކުރައްވާ" })
    expect(link.style.fontFamily).toContain("MV Waheed")
  })

  it.each(directions)("has no axe violations in a sign-in form (%s)", async (dir) => {
    renderWithOnu(<SignInForm onSubmit={() => {}} efaas={<EfaasButton href="/login/efaas" fullWidth />} />, {
      dir,
    })
    expect(screen.getByRole("link", { name: "Sign in with eFaas" })).toHaveClass("w-full")
    await expectNoA11yViolations()
  })
})
