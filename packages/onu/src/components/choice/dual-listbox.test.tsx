import * as React from "react"
import { fireEvent, screen, within, configure } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { DualListbox } from "./dual-listbox"

// Interaction-heavy tests: allow for slow, shared CI machines.
vi.setConfig({ testTimeout: 30_000 })
configure({ asyncUtilTimeout: 5_000 })

const permissions = [
  { value: "view", label: "View users" },
  { value: "edit", label: "Edit users" },
  { value: "delete", label: "Delete users", description: "Dangerous" },
  { value: "export", label: "Export users" },
  { value: "root", label: "Root access", disabled: true },
]

const available = () => screen.getByRole("listbox", { name: "Available" })
const chosen = () => screen.getByRole("listbox", { name: "Selected" })
const names = (list: HTMLElement) =>
  within(list)
    .queryAllByRole("option")
    .map((o) => o.textContent)

describe("DualListbox", () => {
  it("marks items and moves them with the buttons, announcing it", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<DualListbox options={permissions} onValueChange={onValueChange} name="permissions" />)
    expect(names(chosen())).toEqual([])
    expect(screen.getByText("No items")).toBeInTheDocument()
    await userEvent.click(within(available()).getByRole("option", { name: "Edit users" }))
    expect(within(available()).getByRole("option", { name: "Edit users" })).toHaveAttribute("aria-selected", "true")
    await userEvent.click(screen.getByRole("button", { name: "Move selected to Selected" }))
    expect(onValueChange).toHaveBeenLastCalledWith(["edit"], [expect.objectContaining({ value: "edit" })])
    expect(names(chosen())).toEqual(["Edit users"])
    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(await screen.findByText("1 item moved to Selected")).toBeInTheDocument()
    expect(document.querySelectorAll("input[name='permissions[]']")).toHaveLength(1)
  })

  it("moves all visible (enabled) items both ways", async () => {
    renderWithOnu(<DualListbox options={permissions} />)
    await userEvent.click(screen.getByRole("button", { name: "Move all to Selected" }))
    expect(names(chosen())).toEqual(["View users", "Edit users", "Delete usersDangerous", "Export users"])
    expect(names(available())).toEqual(["Root access"])
    expect(screen.getByRole("button", { name: "Move all to Selected" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Move all to Available" }))
    expect(names(chosen())).toEqual([])
  })

  it("filters each list with its own search", async () => {
    renderWithOnu(<DualListbox options={permissions} defaultValue={["view"]} />)
    await userEvent.type(screen.getByRole("searchbox", { name: "Filter Available" }), "exp")
    expect(names(available())).toEqual(["Export users"])
    await userEvent.type(screen.getByRole("searchbox", { name: "Filter Selected" }), "zzz")
    expect(screen.getByText("No results for “zzz”")).toBeInTheDocument()
  })

  it("supports the listbox keyboard: arrows, Space, Shift+arrows, Ctrl+A, Enter, Home/End", async () => {
    const user = userEvent.setup()
    renderWithOnu(<DualListbox options={permissions} />)
    const list = available()
    list.focus()
    const optionId = (name: string) => within(list).getByRole("option", { name: new RegExp(name) }).id
    expect(list).toHaveAttribute("aria-activedescendant", optionId("View users"))
    await user.keyboard("{ArrowDown}")
    expect(list).toHaveAttribute("aria-activedescendant", optionId("Edit users"))
    await user.keyboard(" ")
    expect(within(list).getByRole("option", { name: "Edit users" })).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}")
    expect(within(list).getByRole("option", { name: /Delete users/ })).toHaveAttribute("aria-selected", "true")
    await user.keyboard("{Enter}")
    expect(names(chosen())).toEqual(["Edit users", "Delete usersDangerous"])
    await user.keyboard("{End}{Home}{ArrowUp}")
    expect(list).toHaveAttribute("aria-activedescendant", optionId("View users"))
    await user.keyboard("{Enter}")
    expect(names(chosen())).toContain("View users")
    const right = chosen()
    right.focus()
    await user.keyboard("{Control>}a{/Control}")
    expect(
      within(right)
        .getAllByRole("option")
        .every((o) => o.getAttribute("aria-selected") === "true"),
    ).toBe(true)
    await user.click(screen.getByRole("button", { name: "Move selected to Available" }))
    expect(names(chosen())).toEqual([])
  })

  it("moves an item on double click and extends selection with Shift+click", async () => {
    renderWithOnu(<DualListbox options={permissions} />)
    fireEvent.doubleClick(within(available()).getByRole("option", { name: "Export users" }))
    expect(names(chosen())).toEqual(["Export users"])
    await userEvent.click(within(available()).getByRole("option", { name: "View users" }))
    fireEvent.click(within(available()).getByRole("option", { name: /Delete users/ }), { shiftKey: true })
    expect(within(available()).getAllByRole("option", { selected: true })).toHaveLength(3)
  })

  it("is controlled, labelled by a FormField and can be disabled", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<string[]>(["view"])
      return (
        <FormField label="Permissions" help="Pick what this role can do" disabled>
          <DualListbox
            options={permissions}
            value={value}
            onValueChange={setValue}
            availableLabel="All"
            selectedLabel="Granted"
            searchable={false}
          />
        </FormField>
      )
    }
    renderWithOnu(<Controlled />)
    expect(screen.getByRole("group", { name: "Permissions" })).toBeInTheDocument()
    expect(screen.getByRole("listbox", { name: "Granted" })).toHaveAccessibleDescription("Pick what this role can do")
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Move all to Granted" })).toBeDisabled()
    await userEvent.click(
      within(screen.getByRole("listbox", { name: "All" })).getByRole("option", { name: "Edit users" }),
    )
    expect(screen.getByRole("listbox", { name: "All" })).not.toHaveAttribute("aria-selected", "true")
  })

  it.each(directions)("passes axe in %s (dv)", async (dir) => {
    renderWithOnu(
      <DualListbox aria-label="ހުއްދަތައް" options={["ބެލުން", "ބަދަލުކުރުން"]} defaultValue={["ބެލުން"]} />,
      {
        locale: "dv",
        dir,
      },
    )
    expect(screen.getByRole("listbox", { name: "ލިބެން ހުރި" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
