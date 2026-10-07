import * as React from "react"
import { screen, waitFor, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { EditableSelect } from "./editable-select"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const titles = ["Director", "Deputy Director", "Assistant Director", { value: "x", label: "Intern", disabled: true }]

describe("EditableSelect", () => {
  it("suggests while typing and keeps custom text", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<EditableSelect aria-label="Job title" options={titles} onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox", { name: "Job title" })
    expect(input).toHaveAttribute("aria-expanded", "false")
    await userEvent.type(input, "dep")
    expect(input).toHaveAttribute("aria-expanded", "true")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Use “dep”", "Deputy Director"])
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("dep", null)
    expect(input).toHaveValue("dep")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("picks a suggestion with arrow keys and moves the active descendant", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<EditableSelect aria-label="Job title" options={titles} onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox")
    input.focus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getAllByRole("option")).toHaveLength(4)
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option")[0]!.id)
    await userEvent.keyboard("{ArrowDown}{ArrowUp}{ArrowUp}{ArrowDown}{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(
      "Deputy Director",
      expect.objectContaining({ label: "Deputy Director" }),
    )
    expect(input).toHaveValue("Deputy Director")
  })

  it("opens with the button, selects by click and closes with Escape", async () => {
    renderWithOnu(<EditableSelect aria-label="Job title" options={titles} defaultValue="Director" />)
    await userEvent.click(screen.getByRole("button", { name: "Show options" }))
    expect(screen.getByRole("option", { name: "Director" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("option", { name: "Intern" }))
    expect(screen.getByRole("combobox")).toHaveValue("Director")
    await userEvent.click(screen.getByRole("option", { name: "Assistant Director" }))
    expect(screen.getByRole("combobox")).toHaveValue("Assistant Director")
    await userEvent.keyboard("{ArrowUp}")
    expect(screen.getByRole("listbox")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    expect(screen.getByRole("combobox")).toHaveFocus()
  })

  it("shows an empty message and closes on Tab", async () => {
    renderWithOnu(<EditableSelect aria-label="Job title" options={titles} showCustomOption={false} />)
    await userEvent.type(screen.getByRole("combobox"), "zzz")
    expect(screen.getByText("No results for “zzz”")).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("is controlled", async () => {
    function Controlled() {
      const [value, setValue] = React.useState("Hello")
      return (
        <>
          <EditableSelect aria-label="t" options={titles} value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    renderWithOnu(<Controlled />)
    await userEvent.type(screen.getByRole("combobox"), "!")
    expect(screen.getByText("Hello!")).toBeInTheDocument()
  })

  it("types Thaana and shows a toggle", async () => {
    renderWithOnu(<EditableSelect aria-label="މަޤާމު" options={["ޑިރެކްޓަރ"]} thaana thaanaToggle />, { locale: "dv" })
    const input = screen.getByRole("combobox")
    expect(input).toHaveAttribute("lang", "dv")
    expect(screen.getByRole("button", { name: "ތާނައާއި ލަތީނުގެ ދެމެދު ބަދަލުކުރޭ" })).toBeInTheDocument()
  })

  it("wires a FormField and overrides", () => {
    const ref = React.createRef<HTMLInputElement>()
    renderWithOnu(
      <FormField label="Title" name="title" required>
        <EditableSelect options={titles} ref={ref} className="root-x" classNames={{ input: "input-x" }} />
      </FormField>,
    )
    const input = screen.getByRole("combobox", { name: /Title/ })
    expect(input).toBe(ref.current)
    expect(input).toHaveAttribute("name", "title")
    expect(input).toBeRequired()
    expect(input).toHaveClass("input-x")
    expect(input.closest("[data-slot=editable-select]")).toHaveClass("root-x")
  })

  it.each(directions)("passes axe in %s, open and closed", async (dir) => {
    renderWithOnu(<EditableSelect aria-label="Job title" options={titles} />, { dir })
    await expectNoA11yViolations()
    await userEvent.click(screen.getByRole("button", { name: "Show options" }))
    await expectNoA11yViolations()
  })
})
