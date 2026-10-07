import * as React from "react"
import { screen, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { Switch } from "./switch"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

describe("Switch", () => {
  it("toggles with a label and description", async () => {
    const onCheckedChange = vi.fn()
    renderWithOnu(<Switch label="Email notifications" description="Daily digest" onCheckedChange={onCheckedChange} />)
    const sw = screen.getByRole("switch", { name: "Email notifications" })
    expect(sw).toHaveAccessibleDescription("Daily digest")
    await userEvent.click(screen.getByText("Email notifications"))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(sw).toBeChecked()
  })

  it("renders bare, controlled, with size and label position", async () => {
    function Controlled() {
      const [on, setOn] = React.useState(false)
      return (
        <>
          <Switch aria-label="Dark" size="sm" className="sw-x" checked={on} onCheckedChange={setOn} />
          <Switch label="Start" labelPosition="start" />
        </>
      )
    }
    renderWithOnu(<Controlled />)
    const sw = screen.getByRole("switch", { name: "Dark" })
    expect(sw).toHaveClass("sw-x")
    expect(sw).toHaveAttribute("data-size", "sm")
    sw.focus()
    await userEvent.keyboard("{Enter}")
    expect(sw).toBeChecked()
    expect(screen.getByRole("switch", { name: "Start" }).closest("[data-slot=switch-field]")).toHaveClass(
      "flex-row-reverse",
    )
  })

  it("wires a FormField", () => {
    renderWithOnu(
      <FormField label="Public" name="public">
        <Switch />
      </FormField>,
    )
    expect(screen.getByRole("switch", { name: "Public" })).toHaveAttribute("id")
  })

  it.each(directions)("passes axe in %s", async (dir) => {
    renderWithOnu(<Switch label="ނޯޓިފިކޭޝަން" />, { locale: "dv", dir })
    await expectNoA11yViolations()
  })
})
