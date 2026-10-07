import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { UserProfile, getInitials } from "./user-profile"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("UserProfile", () => {
  it("shows avatar, name and role, and opens the account menu", async () => {
    const onSignOut = vi.fn()
    renderWithOnu(
      <UserProfile
        name="Aishath Shifa"
        subtitle="Administrator"
        profileHref="/profile"
        settingsHref="/settings"
        onSignOut={onSignOut}
        className="extra"
      />,
    )
    const trigger = screen.getByRole("button", { name: "Account menu for Aishath Shifa" })
    expect(trigger).toHaveClass("extra")
    expect(within(trigger).getByText("AS")).toBeInTheDocument()
    expect(within(trigger).getByText("Administrator")).toBeInTheDocument()
    await expectNoA11yViolations()
    await userEvent.click(trigger)
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile")
    expect(within(menu).getByRole("menuitem", { name: "Settings" })).toHaveAttribute("href", "/settings")
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Sign out" }))
    expect(onSignOut).toHaveBeenCalled()
    expect(trigger).toHaveFocus()
  })

  it("renders a compact avatar with custom items", async () => {
    const onSelect = vi.fn()
    renderWithOnu(
      <UserProfile
        compact
        name="Ahmed Ali"
        initials="AA"
        avatarSrc="/a.png"
        items={[
          { label: "Billing", icon: "credit-card", onSelect },
          { label: "Docs", href: "/docs" },
        ]}
        side="top"
        align="start"
      />,
    )
    const trigger = screen.getByRole("button", { name: "Account menu for Ahmed Ali" })
    expect(trigger).toHaveClass("rounded-full")
    expect(within(trigger).queryByText("Ahmed Ali")).toBeNull()
    trigger.focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.click(await screen.findByRole("menuitem", { name: "Billing" }))
    expect(onSelect).toHaveBeenCalled()
  })

  it("derives initials from Latin and Thaana names", () => {
    expect(getInitials("aishath shifa")).toBe("AS")
    expect(getInitials("  Ali  ")).toBe("A")
    expect(getInitials("އަޙްމަދު ޢަލީ")).toBe("އޢ")
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(<UserProfile name="އަޙްމަދު ޢަލީ" onSignOut={() => {}} />, { locale: "dv", dir })
    await userEvent.click(screen.getByRole("button", { name: "އަޙްމަދު ޢަލީ ގެ އެކައުންޓް މެނޫ" }))
    expect(await screen.findByRole("menuitem", { name: "ސައިން އައުޓް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
