import * as React from "react"
import { screen, configure, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Icon } from "../../icons/icon"
import { FormField } from "../form/form-field"
import { SegmentedControl, ViewSwitcher } from "./segmented-control"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const views = [
  { value: "list", label: "List", icon: <Icon name="list" /> },
  { value: "grid", label: "Grid", icon: <Icon name="grid" /> },
  { value: "kanban", label: "Board", icon: <Icon name="kanban" />, disabled: true },
]

describe("SegmentedControl", () => {
  it("selects the first option by default and always keeps one selected", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<SegmentedControl aria-label="View" options={views} onValueChange={onValueChange} />)
    const list = screen.getByRole("radio", { name: "List" })
    expect(list).toHaveAttribute("aria-checked", "true")
    await userEvent.click(list)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(list).toHaveAttribute("aria-checked", "true")
    await userEvent.click(screen.getByRole("radio", { name: "Grid" }))
    expect(onValueChange).toHaveBeenCalledWith("grid")
    expect(screen.getByRole("radio", { name: "Board" })).toBeDisabled()
  })

  it.each(directions)("arrow keys follow the visual order in %s", async (dir) => {
    renderWithOnu(<SegmentedControl aria-label="Period" options={["Day", "Week", "Month"]} />, { dir })
    screen.getByRole("radio", { name: "Day" }).focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Week" })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(screen.getByRole("radio", { name: "Week" })).toHaveAttribute("aria-checked", "true")
  })

  it("is controlled, icon-only, sized and full width", () => {
    function Controlled() {
      const [value, setValue] = React.useState("grid")
      return (
        <SegmentedControl
          aria-label="View"
          options={views}
          value={value}
          onValueChange={setValue}
          iconOnly
          size="lg"
          fullWidth
          className="x"
          classNames={{ item: "item-x" }}
        />
      )
    }
    renderWithOnu(<Controlled />)
    const group = screen.getByRole("radiogroup", { name: "View" })
    expect(group).toHaveClass("x", "w-full")
    expect(group).toHaveAttribute("data-size", "lg")
    const grid = screen.getByRole("radio", { name: "Grid" })
    expect(grid).toHaveAttribute("aria-checked", "true")
    expect(grid).toHaveClass("item-x")
    expect(grid).not.toHaveTextContent("Grid")
  })

  it("never truncates labels and scrolls when space runs out", () => {
    renderWithOnu(<SegmentedControl aria-label="Side" options={["Side by side", "Tabs", "Ends"]} />)
    const group = screen.getByRole("radiogroup", { name: "Side" })
    expect(group).toHaveClass("overflow-x-auto", "max-w-full")
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toHaveClass("shrink-0", "whitespace-nowrap")
      expect(radio).not.toHaveClass("min-w-0")
      expect(radio.querySelector(".truncate")).toBeNull()
    }
    expect(screen.getByRole("radio", { name: "Side by side" })).toHaveTextContent("Side by side")
  })

  it("is labelled by a FormField and submits its name", async () => {
    renderWithOnu(
      <FormField label="Frequency" name="frequency" required>
        <SegmentedControl options={["Daily", "Weekly"]} defaultValue="Weekly" />
      </FormField>,
    )
    expect(screen.getByRole("radiogroup", { name: /Frequency/ })).toBeInTheDocument()
    expect(document.querySelector("input[name=frequency]")).toHaveValue("Weekly")
    await expectNoA11yViolations()
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(<SegmentedControl aria-label="މުއްދަތު" options={["ދުވަސް", "ހަފްތާ"]} />, { locale: "dv", dir })
    await expectNoA11yViolations()
  })

  it("names icon-only segments by their labels, with a tooltip, and keeps text for options without an icon", () => {
    renderWithOnu(
      <SegmentedControl
        aria-label="View"
        iconOnly
        options={[
          { value: "table", label: "Table", icon: <Icon name="table" /> },
          { value: "map", label: "Map" },
        ]}
      />,
    )
    const table = screen.getByRole("radio", { name: "Table" })
    expect(table).toHaveAttribute("title", "Table")
    expect(table).not.toHaveTextContent("Table")
    const map = screen.getByRole("radio", { name: "Map" })
    expect(map).toHaveTextContent("Map")
    expect(map).not.toHaveAttribute("title")
  })

  it.each(directions)("passes axe icon-only in %s (dv)", async (dir) => {
    renderWithOnu(
      <SegmentedControl
        aria-label="ބައްޓަން"
        iconOnly
        options={[
          { value: "list", label: "ލިސްޓު", icon: <Icon name="list" /> },
          { value: "grid", label: "ގްރިޑް", icon: <Icon name="grid" /> },
        ]}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByRole("radio", { name: "ލިސްޓު" })).toHaveAttribute("aria-checked", "true")
    await expectNoA11yViolations()
  })
})

describe("ViewSwitcher", () => {
  it("switches views with buttons and arrow keys", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<ViewSwitcher onValueChange={onValueChange} />)
    const group = screen.getByRole("radiogroup", { name: "View" })
    expect(group).toHaveAttribute("data-slot", "view-switcher")
    const table = within(group).getByRole("radio", { name: "Table" })
    expect(table).toBeChecked()
    await userEvent.click(within(group).getByRole("radio", { name: "Grid" }))
    expect(onValueChange).toHaveBeenCalledWith("grid")
    expect(within(group).getByRole("radio", { name: "Grid" })).toBeChecked()
    // Clicking the active view keeps it on.
    await userEvent.click(within(group).getByRole("radio", { name: "Grid" }))
    expect(within(group).getByRole("radio", { name: "Grid" })).toBeChecked()
    await userEvent.keyboard("{ArrowRight}")
    expect(within(group).getByRole("radio", { name: "Board" })).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("supports custom views, labels and controlled value", () => {
    renderWithOnu(
      <ViewSwitcher
        value="map"
        showLabels
        views={["list", { value: "map", label: "Map", icon: "map-pin" }, "custom"]}
      />,
    )
    expect(screen.getByRole("radio", { name: "Map" })).toBeChecked()
    expect(screen.getByText("List")).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "custom" })).toBeInTheDocument()
  })

  it.each(directions)("follows visual order in %s", async (dir) => {
    renderWithOnu(<ViewSwitcher />, { dir, locale: "dv" })
    const first = screen.getByRole("radio", { name: "ޓޭބަލް" })
    first.focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    expect(screen.getByRole("radio", { name: "ލިސްޓު" })).toHaveFocus()
    await expectNoA11yViolations()
  })
})
