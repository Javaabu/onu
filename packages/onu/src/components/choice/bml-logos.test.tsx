import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { BmlConnectLogo, BmlTransferLogo } from "./bml-logos"

describe("BML logos", () => {
  it("are images named after the brand, or decorative", async () => {
    renderWithOnu(
      <>
        <BmlTransferLogo />
        <BmlConnectLogo />
        <BmlConnectLogo title="Pay by card" />
        <BmlTransferLogo decorative data-testid="hidden" />
      </>,
    )
    expect(screen.getByRole("img", { name: "Bank of Maldives" })).toHaveAttribute("data-slot", "bml-transfer-logo")
    expect(screen.getByRole("img", { name: "BML Connect" })).toHaveAttribute("data-slot", "bml-connect-logo")
    expect(screen.getByRole("img", { name: "Pay by card" })).toBeInTheDocument()
    expect(screen.getByTestId("hidden")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getAllByRole("img")).toHaveLength(3)
    await expectNoA11yViolations()
  })

  it("gives each instance its own gradient and clip ids", () => {
    const { container } = renderWithOnu(
      <>
        <BmlConnectLogo />
        <BmlConnectLogo />
      </>,
    )
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id)
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size).toBe(ids.length)
    // Every url(#…) reference resolves inside the same logo.
    for (const svg of container.querySelectorAll("svg")) {
      for (const el of svg.querySelectorAll("[fill^='url('], [clip-path]")) {
        const ref = (el.getAttribute("fill") ?? el.getAttribute("clip-path"))!.match(/url\(#(.+)\)/)![1]!
        expect(svg.querySelector(`[id="${ref}"]`)).not.toBeNull()
      }
    }
  })

  it("keeps the wordmark left to right and readable without the Gilroy font", () => {
    renderWithOnu(<BmlConnectLogo />, { dir: "rtl", locale: "dv" })
    const svg = screen.getByRole("img", { name: "BML Connect" })
    expect(svg).toHaveAttribute("direction", "ltr")
    const text = svg.querySelector("text")!
    expect(text.textContent).toBe("BMLPaymentGateway")
    expect(text.getAttribute("font-family")).toMatch(/sans-serif$/)
  })
})
