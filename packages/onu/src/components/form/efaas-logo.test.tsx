import { readFileSync } from "node:fs"
import path from "node:path"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { expectNoA11yViolations } from "../../../test/utils"
import { EFAAS_LOGO_VARIANTS, EfaasLogo, type EfaasLogoVariant } from "./efaas-logo"

const VARIANTS = Object.keys(EFAAS_LOGO_VARIANTS).map(Number) as EfaasLogoVariant[]
const original = (n: number) =>
  readFileSync(
    path.resolve(import.meta.dirname, `../../../scripts/efaas-logos/efaas-${String(n).padStart(2, "0")}.svg`),
    "utf8",
  )

describe("EfaasLogo", () => {
  it("has all 22 official variants", () => {
    expect(VARIANTS).toEqual(Array.from({ length: 22 }, (_, i) => i + 1))
  })

  it("renders an icon mark at once, as an image named eFaas", async () => {
    render(<EfaasLogo variant={9} />)
    const logo = screen.getByRole("img", { name: "eFaas" })
    expect(logo).toHaveAttribute("viewBox", "0 0 144.14 144.14")
    expect(logo.querySelectorAll("path, rect").length).toBeGreaterThan(0)
    expect(logo).toHaveClass("h-10", "w-auto")
    await expectNoA11yViolations()
  })

  it("can be decorative", () => {
    const { container } = render(<EfaasLogo variant={14} decorative />)
    expect(screen.queryByRole("img")).toBeNull()
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })

  it.each(VARIANTS)("variant %i matches eFaas's file: same viewBox, shapes and colours", async (n) => {
    const { container } = render(<EfaasLogo variant={n} />)
    const svg = container.querySelector("svg")!
    const file = original(n)
    expect(svg).toHaveAttribute("viewBox", /viewBox="([^"]+)"/.exec(file)![1])
    // Wordmark logos load on demand; they keep their size (viewBox) meanwhile.
    await waitFor(() => expect(svg).not.toHaveAttribute("data-loading"))
    const count = (tag: string) => (file.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length
    expect(svg.querySelectorAll("path")).toHaveLength(count("path"))
    expect(svg.querySelectorAll("rect")).toHaveLength(count("rect"))
    // Colours come from the file's classes, inlined as fills; no class names that could clash.
    const fills = new Set([...svg.querySelectorAll("path, rect")].map((el) => el.getAttribute("fill")))
    const fileFills = new Set([...file.matchAll(/fill: (#[0-9a-f]+)/g)].map((m) => m[1]))
    expect(fills).toEqual(fileFills)
    expect(svg.querySelector("[class]")).toBeNull()
  })
})
