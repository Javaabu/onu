import * as React from "react"
import { screen, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Icon } from "../../icons/icon"
import { FormField } from "../form/form-field"
import { SegmentedControl } from "./segmented-control"

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
})
