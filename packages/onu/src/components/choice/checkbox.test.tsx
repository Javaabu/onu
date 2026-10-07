import * as React from "react"
import { screen, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { Checkbox } from "./checkbox"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

describe("Checkbox", () => {
  it("renders a bare box like the shadcn primitive", async () => {
    const onCheckedChange = vi.fn()
    renderWithOnu(<Checkbox aria-label="Accept" className="box-x" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole("checkbox", { name: "Accept" })
    expect(box).toHaveClass("box-x")
    await userEvent.click(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(box).toBeChecked()
  })

  it("has a clickable label and a description", async () => {
    renderWithOnu(
      <Checkbox
        label="Send me SMS updates"
        description="We text you when your application status changes."
        classNames={{ root: "root-x", label: "label-x", description: "desc-x" }}
        size="lg"
      />,
    )
    const box = screen.getByRole("checkbox", { name: "Send me SMS updates" })
    expect(box).toHaveAccessibleDescription("We text you when your application status changes.")
    expect(box).toHaveAttribute("data-size", "lg")
    await userEvent.click(screen.getByText("Send me SMS updates"))
    expect(box).toBeChecked()
    expect(box.closest("[data-slot=checkbox-field]")).toHaveClass("root-x")
    expect(screen.getByText("Send me SMS updates")).toHaveClass("label-x")
  })

  it("shows the indeterminate state", () => {
    renderWithOnu(<Checkbox label="Select all" indeterminate />)
    const box = screen.getByRole("checkbox", { name: "Select all" })
    expect(box).toHaveAttribute("aria-checked", "mixed")
    expect(box.querySelector("[data-icon-name=minus]")).toBeInTheDocument()
  })

  it("is controlled and can be placed after its label", async () => {
    function Controlled() {
      const [checked, setChecked] = React.useState(true)
      return (
        <Checkbox
          label="Active"
          labelPosition="start"
          checked={checked}
          onCheckedChange={(c) => setChecked(c === true)}
        />
      )
    }
    renderWithOnu(<Controlled />)
    const box = screen.getByRole("checkbox", { name: "Active" })
    expect(box).toBeChecked()
    box.focus()
    await userEvent.keyboard(" ")
    expect(box).not.toBeChecked()
    expect(box.closest("[data-slot=checkbox-field]")).toHaveClass("flex-row-reverse")
  })

  it("wires a FormField and stays disabled", () => {
    renderWithOnu(
      <FormField label="Terms" name="terms" required error="You must accept" disabled>
        <Checkbox label="I accept the terms" />
      </FormField>,
    )
    const box = screen.getByRole("checkbox", { name: /I accept the terms/ })
    expect(box).toHaveAttribute("aria-invalid", "true")
    expect(box).toBeDisabled()
  })

  it.each(directions)("passes axe in %s with Dhivehi", async (dir) => {
    renderWithOnu(<Checkbox label="ޝަރުތުތައް ގަބޫލުކުރަން" description="ތަފްސީލު" />, { locale: "dv", dir })
    await expectNoA11yViolations()
  })
})
