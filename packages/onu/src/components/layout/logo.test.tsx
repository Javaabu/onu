import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Logo } from "./logo"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("Logo", () => {
  it("links home with light and dark sources", async () => {
    const { container } = renderWithOnu(
      <Logo src="/logo.svg" darkSrc="/logo-dark.svg" alt="Javaabu" className="extra" classNames={{ link: "lnk" }} />,
    )
    const link = screen.getByRole("link", { name: "Javaabu, home" })
    expect(link).toHaveAttribute("href", "/")
    expect(link).toHaveClass("lnk")
    const imgs = container.querySelectorAll("img")
    expect(imgs).toHaveLength(2)
    expect(imgs[0]).toHaveClass("dark:hidden")
    expect(imgs[1]).toHaveClass("hidden", "dark:block")
    expect(container.querySelector("[data-slot=logo]")).toHaveClass("extra")
    await expectNoA11yViolations()
  })

  it("renders without a link, with a wordmark or a custom mark", async () => {
    renderWithOnu(
      <>
        <Logo src="/a.svg" alt="Plain" href={null} />
        <Logo alt="Word" href={null} text="Onu" />
        <Logo alt="Mark" href={null}>
          <svg data-testid="mark" />
        </Logo>
        <Logo alt="Slot" href="/home" asChild text="Slot">
          <svg data-testid="slot-mark" />
        </Logo>
      </>,
    )
    expect(screen.getByRole("img", { name: "Plain" })).toBeInTheDocument()
    expect(screen.getByText("Onu")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Mark" })).toContainElement(screen.getByTestId("mark"))
    expect(screen.getByTestId("slot-mark")).toHaveClass("h-8")
    expect(screen.getByRole("link", { name: "Slot, home" })).toHaveAttribute("href", "/home")
    await expectNoA11yViolations()
  })

  it.each(directions)("translates the home link in %s", (dir) => {
    renderWithOnu(<Logo src="/a.svg" alt="ޖާވާބު" />, { locale: "dv", dir })
    expect(screen.getByRole("link", { name: "ޖާވާބު، ފުރަތަމަ ސަފްޙާ" })).toBeInTheDocument()
  })
})
