import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Tabs, type TabItem } from "./tabs"

// Overlays and axe are slow under parallel coverage runs.
vi.setConfig({ testTimeout: 30_000 })

const items: TabItem[] = [
  { value: "profile", label: "Profile", icon: "user", content: "Profile panel" },
  { value: "activity", label: "Activity", count: 12, content: "Activity panel" },
  { value: "archived", label: "Archived", disabled: true, content: "Archived panel" },
  { value: "notes", label: "Notes", content: "Notes panel" },
]

describe("Tabs", () => {
  it("renders items with counts and selects the first enabled tab", async () => {
    renderWithOnu(
      <Tabs
        items={items}
        listLabel="Record"
        className="extra"
        classNames={{ list: "lst", trigger: "trg", count: "cnt" }}
      />,
    )
    expect(screen.getByRole("tablist", { name: "Record" })).toHaveClass("lst")
    expect(screen.getByRole("tab", { name: "Profile" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: /Activity/ })).toHaveTextContent("Activity(12)")
    expect(screen.getByText("(12)")).toHaveClass("cnt")
    expect(screen.getByText("Profile panel")).toBeVisible()
    await expectNoA11yViolations()
  })

  it("moves with arrow keys, skipping disabled tabs", async () => {
    renderWithOnu(<Tabs items={items} />)
    await userEvent.click(screen.getByRole("tab", { name: /Activity/ }))
    await userEvent.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Notes" })).toHaveFocus()
    expect(screen.getByText("Notes panel")).toBeVisible()
  })

  it("follows the visual order in RTL (ArrowLeft moves forward)", async () => {
    renderWithOnu(<Tabs items={items} />, { dir: "rtl" })
    await userEvent.click(screen.getByRole("tab", { name: "Profile" }))
    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("tab", { name: /Activity/ })).toHaveFocus()
  })

  it("is controlled and still composes like shadcn Tabs", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <>
        <Tabs items={items} value="notes" onValueChange={onValueChange} variant="line" scrollable={false} />
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Panel A</TabsContent>
          <TabsContent value="b">Panel B</TabsContent>
        </Tabs>
      </>,
    )
    expect(screen.getByRole("tab", { name: "Notes" })).toHaveAttribute("aria-selected", "true")
    await userEvent.click(screen.getByRole("tab", { name: "Profile" }))
    expect(onValueChange).toHaveBeenCalledWith("profile")
    expect(screen.getByRole("tab", { name: "Notes" })).toHaveAttribute("aria-selected", "true")
    await userEvent.click(screen.getByRole("tab", { name: "B" }))
    expect(screen.getByText("Panel B")).toBeVisible()
  })

  it.each(directions)("works in %s with Dhivehi and vertical orientation", async (dir) => {
    renderWithOnu(
      <Tabs
        orientation="vertical"
        items={[
          { value: "a", label: "ޕްރޮފައިލް", content: "a" },
          { value: "b", label: "ހަރަކާތްތައް", count: 3, content: "b" },
        ]}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical")
    await expectNoA11yViolations()
  })
})

const settingsItems: TabItem[] = [
  { value: "general", label: "General", icon: "settings", description: "Name and logo", content: "General panel" },
  { value: "members", label: "Members", badge: 3, content: "Members panel" },
  { value: "billing", label: <b>Billing</b>, textLabel: "Billing", content: "Billing panel" },
  { value: "danger", label: "Danger zone", disabled: true, content: "Danger panel" },
]

describe("Tabs vertical with narrow", () => {
  it("renders a vertical tablist and moves with Arrow Up/Down", async () => {
    renderWithOnu(
      <Tabs
        orientation="vertical"
        narrow="select"
        items={settingsItems}
        className="extra"
        classNames={{ list: "lst", trigger: "trg" }}
      />,
    )
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
    renderWithOnu(
      <Tabs
        orientation="vertical"
        narrow="select"
        items={settingsItems}
        onValueChange={onValueChange}
        classNames={{ select: "sel" }}
      />,
    )
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
      <Tabs orientation="vertical" narrow="scroll" items={settingsItems} value="members" listLabel="Settings" />,
    )
    expect(screen.queryByRole("combobox")).toBeNull()
    expect(screen.getByRole("tablist", { name: "Settings" })).toHaveClass("overflow-x-auto")
    expect(screen.getByRole("tab", { name: /Members/ })).toHaveAttribute("aria-selected", "true")
    rerender(<Tabs orientation="vertical" narrow="scroll" items={settingsItems} value="general" />)
    expect(screen.getByRole("tab", { name: /General/ })).toHaveAttribute("aria-selected", "true")
  })

  it("falls back to the value for non-text labels and starts on the first enabled tab", () => {
    renderWithOnu(
      <Tabs
        orientation="vertical"
        narrow="select"
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
      <Tabs
        orientation="vertical"
        narrow="scroll"
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

describe("Tabs with narrow", () => {
  it("lays out vertical tabs with a select fallback, descriptions, badges and counts", () => {
    renderWithOnu(
      <Tabs
        orientation="vertical"
        narrow="select"
        items={[...settingsItems, { value: "logs", label: "Logs", count: 4, content: "Logs panel" }]}
        classNames={{ count: "cnt" }}
      />,
    )
    expect(document.querySelector("[data-slot=stacked-tabs]")).toBeInTheDocument()
    const list = screen.getByRole("tablist", { hidden: true })
    expect(list).toHaveAttribute("aria-orientation", "vertical")
    expect(list).toHaveAccessibleName("Choose a section")
    expect(screen.getByText("Name and logo")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /Members/, hidden: true })).toHaveTextContent("3 new")
    expect(screen.getByText("(4)")).toHaveClass("cnt")
    fireEvent.change(screen.getByRole("combobox", { name: "Choose a section" }), { target: { value: "billing" } })
    expect(screen.getByRole("tab", { name: "Billing", hidden: true })).toHaveAttribute("aria-selected", "true")
  })

  it("keeps the plain vertical list without narrow, and ignores narrow when horizontal", () => {
    const { rerender } = renderWithOnu(<Tabs orientation="vertical" items={settingsItems} />)
    expect(screen.queryByRole("combobox")).toBeNull()
    expect(document.querySelector("[data-slot=stacked-tabs]")).toBeNull()
    expect(screen.getByText("Name and logo")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /Members/ })).toHaveTextContent("3 new")
    rerender(<Tabs narrow="select" items={settingsItems} />)
    expect(screen.queryByRole("combobox")).toBeNull()
    expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal")
    expect(screen.queryByText("Name and logo")).toBeNull()
  })

  it.each(directions)("works in %s with Dhivehi and a select", async (dir) => {
    renderWithOnu(
      <Tabs
        orientation="vertical"
        narrow="select"
        items={[
          { value: "a", label: "އާންމު", description: "ނަމާއި ލޯގޯ", content: "a" },
          { value: "b", label: "މެމްބަރުން", badge: 2, content: "b" },
        ]}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("combobox", { name: "ބައެއް ހޮވާ" })).toHaveValue("a")
    await expectNoA11yViolations()
  })
})
