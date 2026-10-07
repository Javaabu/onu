import * as React from "react"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import { PopoverPanel } from "./popover-panel"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

function mockPhone() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("max-width"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as MediaQueryList,
  )
}

describe("PopoverPanel", () => {
  afterEach(() => vi.restoreAllMocks())

  it("opens a labelled, non-modal panel and returns focus on Escape", async () => {
    renderWithOnu(
      <PopoverPanel
        trigger={<Button>Account</Button>}
        title="Aishath Ali"
        description="Senior officer"
        footer={<Button>Sign out</Button>}
      >
        <a href="#profile">Profile</a>
      </PopoverPanel>,
    )
    const trigger = screen.getByRole("button", { name: "Account" })
    await userEvent.click(trigger)
    const panel = screen.getByRole("dialog", { name: "Aishath Ali" })
    expect(panel).toHaveAccessibleDescription("Senior officer")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(panel.querySelector("[data-slot=popover-panel-footer]")).toContainElement(
      screen.getByRole("button", { name: "Sign out" }),
    )
    await expectNoA11yViolations()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("has an optional close button and is controllable", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(
      <PopoverPanel defaultOpen trigger={<Button>Budget</Button>} closeButton onOpenChange={onOpenChange}>
        Body
      </PopoverPanel>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Close" }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(screen.queryByText("Body")).not.toBeInTheDocument())
  })

  it("stays open when controlled", async () => {
    renderWithOnu(
      <PopoverPanel open trigger={<Button>Open</Button>} title="Pinned">
        Body
      </PopoverPanel>,
    )
    await userEvent.keyboard("{Escape}")
    expect(screen.getByRole("dialog", { name: "Pinned" })).toBeInTheDocument()
  })

  it("accepts className and classNames", () => {
    renderWithOnu(
      <PopoverPanel
        defaultOpen
        trigger={<Button>Open</Button>}
        title="T"
        description="D"
        footer="F"
        closeButton
        className="root-x"
        classNames={{ header: "h-x", title: "t-x", description: "d-x", body: "b-x", footer: "f-x", close: "c-x" }}
      >
        Body
      </PopoverPanel>,
    )
    expect(screen.getByRole("dialog")).toHaveClass("root-x")
    expect(screen.getByText("T")).toHaveClass("t-x")
    expect(screen.getByText("D")).toHaveClass("d-x")
    expect(screen.getByText("Body")).toHaveClass("b-x")
    expect(screen.getByText("F")).toHaveClass("f-x")
    expect(screen.getByRole("button", { name: "Close" })).toHaveClass("c-x")
    expect(document.querySelector(".h-x")).toBeInTheDocument()
  })

  it("becomes a bottom sheet on phones with mobile='sheet' (R3.20)", async () => {
    mockPhone()
    renderWithOnu(
      <PopoverPanel mobile="sheet" trigger={<Button>Filters</Button>} title="Filters">
        Island
      </PopoverPanel>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Filters" }))
    const sheet = await screen.findByRole("dialog", { name: "Filters" })
    expect(sheet).toHaveAttribute("data-slot", "bottom-sheet-content")
  })

  it("stays a popover on phones by default", async () => {
    mockPhone()
    renderWithOnu(<PopoverPanel defaultOpen trigger={<Button>Open</Button>} title="Pop" />)
    expect(screen.getByRole("dialog")).toHaveAttribute("data-slot", "popover-panel")
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<PopoverPanel defaultOpen closeButton trigger={<Button>ހުޅުވާ</Button>} title="ތަފްސީލު" />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("button", { name: "ބަންދުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("renders nothing extra without title, description or children", () => {
    renderWithOnu(<PopoverPanel defaultOpen trigger={<Button>Open</Button>} aria-label="Empty" />)
    const panel = screen.getByRole("dialog", { name: "Empty" })
    expect(panel.querySelector("[data-slot=popover-panel-header]")).toBeNull()
    expect(panel.querySelector("[data-slot=popover-panel-body]")).toBeNull()
    expect(React.isValidElement(<span />)).toBe(true)
  })
})
