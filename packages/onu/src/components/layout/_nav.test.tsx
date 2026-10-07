import * as React from "react"
import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderWithOnu } from "../../../test/utils"
import {
  NavBadge,
  NavIcon,
  NavLink,
  formatCount,
  isItemActive,
  isSelfActive,
  itemKey,
  physicalSide,
  resolveActiveHref,
  type NavItem,
} from "./_nav"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Users", href: "/users", items: [{ label: "New", href: "/users/new" }] },
  { label: "Docs", href: "https://example.com", external: true },
  { label: "Reports", href: "/reports/?tab=1" },
]

describe("nav helpers", () => {
  it("resolves exact and prefix matches, longest first", () => {
    expect(resolveActiveHref(items, undefined)).toBeUndefined()
    expect(resolveActiveHref(items, "/users/new")).toBe("/users/new")
    expect(resolveActiveHref(items, "/users/12/edit")).toBe("/users")
    expect(resolveActiveHref(items, "/users/12", "exact")).toBeUndefined()
    expect(resolveActiveHref(items, "/reports")).toBe("/reports")
    expect(resolveActiveHref(items, "/elsewhere")).toBeUndefined()
    expect(resolveActiveHref(items, "/")).toBe("/")
  })

  it("marks self and ancestors active", () => {
    const active = resolveActiveHref(items, "/users/new")
    expect(isSelfActive(items[1]!, active)).toBe(false)
    expect(isItemActive(items[1]!, active)).toBe(true)
    expect(isItemActive(items[0]!, active)).toBe(false)
    expect(isSelfActive({ label: "x", isActive: true }, undefined)).toBe(true)
    expect(isItemActive(items[2]!, "https://example.com")).toBe(false)
  })

  it("formats keys, counts and sides", () => {
    expect(itemKey({ label: "a", id: "x" }, 0)).toBe("x")
    expect(itemKey({ label: "a", href: "/a" }, 0)).toBe("/a")
    expect(itemKey({ label: "a" }, 3)).toBe("3")
    expect(formatCount(5, "en")).toBe("5")
    expect(formatCount(150, "en")).toBe("99+")
    expect(physicalSide("start", "ltr")).toBe("left")
    expect(physicalSide("start", "rtl")).toBe("right")
    expect(physicalSide("end", "ltr")).toBe("right")
    expect(physicalSide("end", "rtl")).toBe("left")
  })

  it("renders icons, badges and links through the configured link component", () => {
    const Custom = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(function Custom(
      { children, ...props },
      ref,
    ) {
      return (
        <a ref={ref} data-router="yes" {...props}>
          {children}
        </a>
      )
    })
    renderWithOnu(
      <div>
        <NavIcon icon="home" />
        <NavIcon icon={<span data-testid="node-icon" />} />
        <NavIcon icon={undefined} />
        <NavBadge badge={3} />
        <NavBadge badge={0} />
        <NavBadge badge={<b>New</b>} />
        <NavBadge badge={null} />
        <NavLink href="/a">Internal</NavLink>
        <NavLink href="https://x.mv" external>
          External
        </NavLink>
      </div>,
      { provider: { linkComponent: Custom } },
    )
    expect(screen.getByTestId("node-icon")).toBeInTheDocument()
    expect(screen.getByText("3 new")).toHaveClass("sr-only")
    expect(screen.getByText("New")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Internal" })).toHaveAttribute("data-router", "yes")
    const external = screen.getByRole("link", { name: /External/ })
    expect(external).toHaveAttribute("target", "_blank")
    expect(external).toHaveAttribute("rel", "noopener noreferrer")
    expect(external).not.toHaveAttribute("data-router")
    expect(screen.getByText("(opens in a new tab)")).toBeInTheDocument()
  })
})
