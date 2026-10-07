import * as React from "react"
import { act, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { CookieConsent, openCookiePreferences, readCookieConsent, useCookieConsent } from "./cookie-consent"

function Reader() {
  const consent = useCookieConsent()
  return <p data-testid="reader">{consent ? JSON.stringify(consent.categories) : "none"}</p>
}

describe("CookieConsent", () => {
  afterEach(() => window.localStorage.clear())

  it("shows a banner until the user decides", () => {
    renderWithOnu(<CookieConsent policyHref="/privacy" />)
    const banner = screen.getByRole("region", { name: "We use cookies" })
    expect(within(banner).getByRole("link", { name: "Cookie policy" })).toHaveAttribute("href", "/privacy")
    expect(within(banner).getByRole("button", { name: "Accept all" })).toBeInTheDocument()
    expect(within(banner).getByRole("button", { name: "Reject non-essential" })).toBeInTheDocument()
  })

  it("accept all stores every category and hides the banner", async () => {
    const onChange = vi.fn()
    renderWithOnu(
      <>
        <CookieConsent onChange={onChange} />
        <Reader />
      </>,
    )
    expect(screen.getByTestId("reader")).toHaveTextContent("none")
    await userEvent.click(screen.getByRole("button", { name: "Accept all" }))
    expect(screen.queryByRole("region")).toBeNull()
    expect(onChange.mock.calls[0]![0].categories).toEqual({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
    })
    expect(screen.getByTestId("reader")).toHaveTextContent('"marketing":true')
    expect(readCookieConsent()?.version).toBe(1)
  })

  it("reject non-essential keeps only required categories", async () => {
    renderWithOnu(<CookieConsent />)
    await userEvent.click(screen.getByRole("button", { name: "Reject non-essential" }))
    expect(readCookieConsent()?.categories).toEqual({
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    })
  })

  it("preferences dialog saves chosen categories; necessary is locked on", async () => {
    const user = userEvent.setup()
    renderWithOnu(<CookieConsent />)
    const trigger = screen.getByRole("button", { name: "Preferences" })
    await user.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Cookie preferences" })
    const necessary = within(dialog).getByRole("switch", { name: "Strictly necessary" })
    expect(necessary).toBeChecked()
    expect(necessary).toBeDisabled()
    await user.click(within(dialog).getByRole("switch", { name: "Analytics" }))
    await user.click(within(dialog).getByRole("button", { name: "Save preferences" }))
    expect(readCookieConsent()?.categories).toMatchObject({ analytics: true, marketing: false })
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("cancel discards, reject in the dialog stores rejection", async () => {
    const user = userEvent.setup()
    renderWithOnu(<CookieConsent />)
    await user.click(screen.getByRole("button", { name: "Preferences" }))
    await user.click(screen.getByRole("button", { name: "Cancel" }))
    expect(readCookieConsent()).toBeNull()
    await user.click(screen.getByRole("button", { name: "Preferences" }))
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Reject non-essential" }))
    expect(readCookieConsent()?.categories.analytics).toBe(false)
  })

  it("stays hidden on later visits, asks again on a new version, and reopens preferences", async () => {
    window.localStorage.setItem(
      "onu-cookie-consent",
      JSON.stringify({ categories: { necessary: true, analytics: true }, version: 1, updatedAt: "" }),
    )
    const { rerender } = renderWithOnu(<CookieConsent />)
    expect(screen.queryByRole("region")).toBeNull()
    act(() => openCookiePreferences())
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("switch", { name: "Analytics" })).toBeChecked()
    expect(within(dialog).getByRole("switch", { name: "Marketing" })).not.toBeChecked()
    rerender(<CookieConsent version={2} />)
    expect(screen.getByRole("region", { hidden: true })).toBeInTheDocument()
  })

  it("supports custom categories and a controlled dialog", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(
      <CookieConsent
        categories={[
          { id: "core", label: "Core", required: true },
          { id: "stats", label: "Stats", defaultEnabled: true },
        ]}
        preferencesOpen
        onPreferencesOpenChange={onOpenChange}
        title="Cookies"
        description="Custom text"
      />,
    )
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByRole("switch", { name: "Stats" })).toBeChecked()
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("tolerates unavailable storage", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    expect(readCookieConsent("other-key")).toBeNull()
    spy.mockRestore()
  })

  it.each(directions)("is accessible in %s (dv)", async (dir) => {
    const { container } = renderWithOnu(<CookieConsent />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "ހުރިހާ ކުކީއެއް ގަބޫލުކުރަން" })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
