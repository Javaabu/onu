import * as React from "react"
import { screen, waitFor, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import { FormField } from "../form/form-field"
import { Select } from "./select"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const atolls = [
  { value: "K", label: "Kaafu", group: "North" },
  { value: "AA", label: "Alif Alif", group: "North" },
  { value: "S", label: "Seenu", group: "South" },
  { value: "GN", label: "Gnaviyani", group: "South", disabled: true },
]

describe("Select", () => {
  it("renders options with a placeholder and selects one", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<Select aria-label="Atoll" options={atolls} onValueChange={onValueChange} />)
    const trigger = screen.getByRole("combobox", { name: "Atoll" })
    expect(trigger).toHaveTextContent("Select an option")
    await userEvent.click(trigger)
    expect(screen.getByText("North")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("option", { name: "Seenu" }))
    expect(onValueChange).toHaveBeenCalledWith("S")
    expect(trigger).toHaveTextContent("Seenu")
  })

  it("is keyboard operable and returns focus to the trigger", async () => {
    const user = userEvent.setup()
    renderWithOnu(<Select aria-label="Atoll" options={["Kaafu", "Seenu"]} />)
    const trigger = screen.getByRole("combobox")
    trigger.focus()
    await user.keyboard("{Enter}")
    expect(await screen.findByRole("listbox")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("accepts SelectItem children", async () => {
    renderWithOnu(
      <Select aria-label="Size" placeholder="Pick a size">
        <SelectItem value="s">Small</SelectItem>
        <SelectItem value="l">Large</SelectItem>
      </Select>,
    )
    expect(screen.getByRole("combobox")).toHaveTextContent("Pick a size")
    await userEvent.click(screen.getByRole("combobox"))
    expect(screen.getByRole("option", { name: "Large" })).toBeInTheDocument()
  })

  it("stays compatible with the shadcn composition", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(
      <Select defaultValue="b" onValueChange={onValueChange}>
        <SelectTrigger aria-label="Letter" className="custom">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
          <SelectItem value="b">B</SelectItem>
        </SelectContent>
      </Select>,
    )
    const trigger = screen.getByRole("combobox", { name: "Letter" })
    expect(trigger).toHaveClass("custom")
    expect(trigger).toHaveTextContent("B")
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole("option", { name: "A" }))
    expect(onValueChange).toHaveBeenCalledWith("a")
  })

  it("clears optional fields, controlled", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("K")
      return (
        <>
          <Select aria-label="Atoll" options={atolls} value={value} onValueChange={setValue} clearable />
          <output>[{value}]</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(screen.getByText("[]")).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toHaveTextContent("Select an option")
    expect(screen.getByRole("combobox")).toHaveFocus()
  })

  it("does not offer clear on required fields and wires FormField", () => {
    renderWithOnu(
      <form>
        <FormField label="Atoll" name="atoll" required error="Required">
          <Select options={atolls} defaultValue="K" clearable />
        </FormField>
      </form>,
    )
    const trigger = screen.getByRole("combobox", { name: /Atoll/ })
    expect(trigger).toHaveAttribute("aria-invalid", "true")
    expect(trigger).toHaveAttribute("aria-required", "true")
    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument()
    expect(document.querySelector("select[name=atoll]")).toHaveValue("K")
  })

  it("applies sizes, className, classNames and ref", () => {
    const ref = React.createRef<HTMLButtonElement>()
    const { container } = renderWithOnu(
      <Select aria-label="Atoll" options={atolls} size="lg" ref={ref} className="x" classNames={{ root: "root-x" }} />,
    )
    expect(ref.current).toBe(screen.getByRole("combobox"))
    expect(ref.current).toHaveAttribute("data-size", "lg")
    expect(ref.current).toHaveClass("x")
    expect(container.querySelector("[data-slot=select-field]")).toHaveClass("root-x")
  })

  it("can be disabled", async () => {
    renderWithOnu(<Select aria-label="Atoll" options={atolls} disabled />)
    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it.each(directions)("passes axe in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<Select aria-label="އަތޮޅު" options={[{ value: "K", label: "ކާފު" }]} />, { locale: "dv", dir })
    expect(screen.getByRole("combobox")).toHaveTextContent("އިޚްތިޔާރެއް ކުރައްވާ")
    await expectNoA11yViolations()
  })
})
