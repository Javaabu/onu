import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ContextActionMenu } from "./context-action-menu"
import type { MenuItem } from "./_menu-items"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const items = (onOpen = vi.fn()): MenuItem[] => [
  { label: "Open", icon: "external-link", onSelect: onOpen },
  { label: "Download", icon: "download", shortcut: "⌘S" },
  { type: "separator" },
  { type: "sub", label: "Share with", items: [{ label: "Finance team" }] },
  { label: "Delete", icon: "trash", variant: "destructive" },
]

describe("ContextActionMenu", () => {
  afterEach(() => vi.useRealTimers())

  it("opens on Right-click with the same items as ActionMenu", async () => {
    const onOpen = vi.fn()
    const onOpenChange = vi.fn()
    renderWithOnu(
      <ContextActionMenu items={items(onOpen)} onOpenChange={onOpenChange}>
        permit-2041.pdf
      </ContextActionMenu>,
    )
    fireEvent.contextMenu(screen.getByText("permit-2041.pdf"))
    const menu = await screen.findByRole("menu")
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(menu).toHaveAttribute("data-slot", "context-action-menu-content")
    expect(screen.getAllByRole("menuitem").map((i) => i.textContent)).toEqual([
      "Open",
      "Download⌘S",
      "Share with",
      "Delete",
    ])
    await expectNoA11yViolations()
    await userEvent.click(screen.getByRole("menuitem", { name: "Open" }))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it("opens on long press on touch screens", () => {
    vi.useFakeTimers()
    renderWithOnu(<ContextActionMenu items={items()}>Hold me</ContextActionMenu>)
    const area = screen.getByText("Hold me")
    fireEvent.pointerDown(area, { pointerType: "touch", clientX: 10, clientY: 10 })
    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })

  it("closes with Escape", async () => {
    renderWithOnu(<ContextActionMenu items={items()}>Area</ContextActionMenu>)
    fireEvent.contextMenu(screen.getByText("Area"))
    await screen.findByRole("menu")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
  })

  it("does nothing when disabled", () => {
    renderWithOnu(
      <ContextActionMenu items={items()} disabled>
        Area
      </ContextActionMenu>,
    )
    fireEvent.contextMenu(screen.getByText("Area"))
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  it("renders children as the trigger with asChild, and accepts classNames", async () => {
    renderWithOnu(
      <ContextActionMenu items={items()} asChild className="menu-x" classNames={{ trigger: "t-x", item: "i-x" }}>
        <div data-testid="row">Row</div>
      </ContextActionMenu>,
    )
    const row = screen.getByTestId("row")
    expect(row).toHaveClass("t-x")
    expect(row).toHaveAttribute("data-slot", "context-action-menu-trigger")
    fireEvent.contextMenu(row)
    expect(await screen.findByRole("menu")).toHaveClass("menu-x")
    expect(screen.getByRole("menuitem", { name: "Open" })).toHaveClass("i-x")
  })

  it.each(directions)("works in %s with Dhivehi content", async (dir) => {
    renderWithOnu(<ContextActionMenu items={[{ label: "ހުޅުވާ" }]}>ފައިލު</ContextActionMenu>, {
      locale: "dv",
      dir,
    })
    fireEvent.contextMenu(screen.getByText("ފައިލު"))
    expect(await screen.findByRole("menuitem", { name: "ހުޅުވާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
