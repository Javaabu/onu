import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SiteFooter } from "./site-footer"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

describe("SiteFooter", () => {
  it("renders columns, social links, copyright, legal links and a language slot", async () => {
    renderWithOnu(
      <SiteFooter
        logo={<span>Javaabu</span>}
        description="Software for the Maldives"
        name="Javaabu Pvt Ltd"
        year={2026}
        columns={[
          {
            title: "Services",
            links: [
              { label: "Web", href: "/web" },
              { label: "Docs", href: "https://docs.mv", external: true },
            ],
          },
          { title: "Company", links: [{ label: "About", href: "/about" }] },
        ]}
        social={[{ label: "Facebook", href: "https://facebook.com/javaabu", icon: "globe" }]}
        legalLinks={[{ label: "Privacy", href: "/privacy" }]}
        languageSwitcher={<button type="button">ދިވެހި</button>}
        className="extra"
        classNames={{ columnTitle: "ttl", link: "lnk" }}
      >
        <p>Extra</p>
      </SiteFooter>,
    )
    const footer = screen.getByRole("contentinfo")
    expect(footer).toHaveClass("extra")
    expect(screen.getByRole("navigation", { name: "Services" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Company" })).toHaveClass("ttl")
    expect(screen.getByRole("link", { name: "Web" })).toHaveClass("lnk")
    expect(screen.getByRole("link", { name: /Docs/ })).toHaveAttribute("target", "_blank")
    expect(screen.getByRole("list", { name: "Social links" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Facebook" })).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.getByText("© 2026 Javaabu Pvt Ltd. All rights reserved.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Privacy" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ދިވެހި" })).toBeInTheDocument()
    expect(screen.getByText("Extra")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("renders a minimal footer with a custom copyright and the current year by default", () => {
    const { rerender } = renderWithOnu(<SiteFooter copyright="Custom line" />)
    expect(screen.getByText("Custom line")).toBeInTheDocument()
    rerender(<SiteFooter name="Onu" legalLinks={[{ label: "Terms", href: "/terms" }]} />)
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} Onu`))).toBeInTheDocument()
  })

  it("renders only the parts it is given", () => {
    const { container, rerender } = renderWithOnu(
      <SiteFooter columns={[{ title: "Links", links: [{ label: "A", href: "/a" }] }]} />,
    )
    expect(container.querySelector("[data-slot=site-footer-brand]")).toBeNull()
    expect(container.querySelector("[data-slot=site-footer-bottom]")).toBeNull()
    rerender(<SiteFooter description="Only a description" languageSwitcher={<span>lang</span>} />)
    expect(screen.getByText("Only a description")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=site-footer-columns]")).toBeNull()
    expect(screen.getByText("lang")).toBeInTheDocument()
    rerender(<SiteFooter logo={<span>Logo</span>} />)
    expect(container.querySelector("[data-slot=site-footer-brand]")).toBeInTheDocument()
    rerender(<SiteFooter />)
    expect(container.querySelector("footer")!.children[0]!.children).toHaveLength(0)
  })

  it.each(directions)("translates in %s", async (dir) => {
    renderWithOnu(
      <SiteFooter name="ޖާވާބު" year={2026} social={[{ label: "X", href: "https://x.com", icon: "share" }]} />,
      {
        locale: "dv",
        dir,
      },
    )
    expect(screen.getByText("© 2026 ޖާވާބު. ހުރިހާ ޙައްޤެއް ރައްކާތެރިކޮށްފައި.")).toBeInTheDocument()
    expect(screen.getByRole("list", { name: "ސޯޝަލް މީޑިއާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
