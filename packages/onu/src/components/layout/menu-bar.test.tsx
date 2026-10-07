import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { MenuBar, type MenuBarMenu } from "./menu-bar"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

function menus(handlers: { onSave?: () => void; onWrap?: (v: boolean) => void; onZoom?: (v: string) => void } = {}) {
  return [
    {
      label: "File",
      items: [
        { label: "New", icon: "add", shortcut: "⌘N" },
        { label: "Save", shortcut: "⌘S", onSelect: handlers.onSave },
        { type: "separator" },
        { label: "Open docs", href: "/docs" },
        { label: "Delete", variant: "destructive", disabled: true },
        { type: "sub", label: "Export", icon: "download", items: [{ label: "PDF" }, { label: "CSV" }] },
      ],
    },
    {
      label: "View",
      items: [
        { type: "label", label: "Display" },
        { type: "checkbox", label: "Word wrap", checked: true, onCheckedChange: handlers.onWrap ?? (() => {}) },
        {
          type: "radio",
          value: "100",
          onValueChange: handlers.onZoom ?? (() => {}),
          options: [
            { value: "100", label: "100%" },
            { value: "150", label: "150%" },
          ],
        },
      ],
    },
  ] satisfies MenuBarMenu[]
}

describe("MenuBar", () => {
  it("renders a menubar and runs item actions", async () => {
    const onSave = vi.fn()
    renderWithOnu(<MenuBar menus={menus({ onSave })} className="extra" classNames={{ trigger: "trg" }} />)
    const bar = screen.getByRole("menubar")
    expect(bar).toHaveClass("extra", "overflow-x-auto")
    const file = screen.getByRole("menuitem", { name: "File" })
    expect(file).toHaveClass("trg")
    await userEvent.click(file)
    const menu = await screen.findByRole("menu")
    expect(within(menu).getByText("⌘N")).toBeInTheDocument()
    expect(within(menu).getByRole("menuitem", { name: "Open docs" })).toHaveAttribute("href", "/docs")
    expect(within(menu).getByRole("menuitem", { name: "Delete" })).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(within(menu).getByRole("menuitem", { name: /Save/ }))
    expect(onSave).toHaveBeenCalled()
    await expectNoA11yViolations()
  })

  it("supports checkbox and radio items", async () => {
    const onWrap = vi.fn()
    const onZoom = vi.fn()
    renderWithOnu(<MenuBar menus={menus({ onWrap, onZoom })} />)
    await userEvent.click(screen.getByRole("menuitem", { name: "View" }))
    await userEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Word wrap" }))
    expect(onWrap).toHaveBeenCalledWith(false)
    await userEvent.click(screen.getByRole("menuitem", { name: "View" }))
    await userEvent.click(await screen.findByRole("menuitemradio", { name: "150%" }))
    expect(onZoom).toHaveBeenCalledWith("150")
  })

  it("moves between menus with arrow keys in visual order (RTL mirrors)", async () => {
    renderWithOnu(<MenuBar menus={menus()} />, { dir: "rtl" })
    const file = screen.getByRole("menuitem", { name: "File" })
    file.focus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("menuitem", { name: "View" })).toHaveFocus()
  })

  it("opens submenus", async () => {
    renderWithOnu(<MenuBar menus={menus()} />)
    await userEvent.click(screen.getByRole("menuitem", { name: "File" }))
    const sub = await screen.findByRole("menuitem", { name: "Export" })
    sub.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(await screen.findByRole("menuitem", { name: "PDF" })).toBeInTheDocument()
  })

  it.each(directions)("renders Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<MenuBar menus={[{ label: "ފައިލް", items: [{ label: "ސޭވްކުރޭ" }] }]} />, { locale: "dv", dir })
    expect(screen.getByRole("menuitem", { name: "ފައިލް" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
