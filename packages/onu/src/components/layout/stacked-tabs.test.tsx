import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { StackedTabs, type StackedTabItem } from "./stacked-tabs"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: StackedTabItem[] = [
  { value: "general", label: "General", icon: "settings", description: "Name and logo", content: "General panel" },
  { value: "members", label: "Members", badge: 3, content: "Members panel" },
  { value: "billing", label: <b>Billing</b>, textLabel: "Billing", content: "Billing panel" },
  { value: "danger", label: "Danger zone", disabled: true, content: "Danger panel" },
]

describe("StackedTabs", () => {
  it("renders a vertical tablist and moves with Arrow Up/Down", async () => {
    renderWithOnu(<StackedTabs items={items} className="extra" classNames={{ list: "lst", trigger: "trg" }} />)
    const list = screen.getByRole("tablist", { hidden: true })
    expect(list).toHaveAttribute("aria-orientation", "vertical")
    expect(list).toHaveClass("lst")
    const general = screen.getByRole("tab", { name: /General/, hidden: true })
    expect(general).toHaveAttribute("aria-selected", "true")
    expect(general).toHaveClass("trg")
    general.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("tab", { name: /Members/, hidden: true })).toHaveFocus()
    expect(screen.getByText("Members panel")).toBeInTheDocument()
  })

  it("becomes a labelled select in narrow containers that changes the tab", () => {
    const onValueChange = vi.fn()
    renderWithOnu(<StackedTabs items={items} onValueChange={onValueChange} classNames={{ select: "sel" }} />)
    const select = screen.getByRole("combobox", { name: "Choose a section" })
    expect(select.closest("[data-slot=native-select-wrapper]")).toHaveClass("sel")
    expect(screen.getByRole("option", { name: "Billing" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Danger zone" })).toBeDisabled()
    fireEvent.change(select, { target: { value: "billing" } })
    expect(onValueChange).toHaveBeenCalledWith("billing")
    expect(screen.getByText("Billing panel")).toBeInTheDocument()
  })

  it("is controllable and offers a horizontal scroller instead of a select", () => {
    const { rerender } = renderWithOnu(
      <StackedTabs items={items} value="members" mobile="scroll" listLabel="Settings" />,
    )
    expect(screen.queryByRole("combobox")).toBeNull()
    expect(screen.getByRole("tablist", { name: "Settings" })).toHaveClass("overflow-x-auto")
    expect(screen.getByRole("tab", { name: /Members/ })).toHaveAttribute("aria-selected", "true")
    rerender(<StackedTabs items={items} value="general" mobile="scroll" />)
    expect(screen.getByRole("tab", { name: /General/ })).toHaveAttribute("aria-selected", "true")
  })

  it("falls back to the value for non-text labels and starts on the first enabled tab", () => {
    renderWithOnu(
      <StackedTabs
        items={[
          { value: "off", label: "Off", disabled: true },
          { value: "icon-only", label: <span>★</span> },
          { value: "num", label: 7 as unknown as string },
        ]}
      />,
    )
    expect(screen.getByRole("option", { name: "icon-only" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "7" })).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveValue("icon-only")
  })

  it.each(directions)("works in %s with Dhivehi", async (dir) => {
    renderWithOnu(
      <StackedTabs
        mobile="scroll"
        items={[
          { value: "a", label: "އާންމު", content: "a" },
          { value: "b", label: "މެމްބަރުން", content: "b" },
        ]}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("tablist", { name: "ބައެއް ހޮވާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
