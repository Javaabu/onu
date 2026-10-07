import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import {
  FilterConditionBuilder,
  formatQuery,
  type ConditionField,
  type ConditionGroup,
} from "./filter-condition-builder"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const fields: ConditionField[] = [
  { name: "name", label: "Name" },
  { name: "balance", label: "Balance", inputType: "number" },
  {
    name: "island",
    label: "Island",
    valueEditorType: "select",
    values: [
      { name: "male", label: "Malé" },
      { name: "addu", label: "Addu" },
    ],
  },
  {
    name: "tags",
    label: "Tags",
    valueEditorType: "multiselect",
    values: [
      { name: "vip", label: "VIP" },
      { name: "new", label: "New" },
    ],
  },
]

function Builder({ initial, onChange }: { initial: ConditionGroup; onChange?: (q: ConditionGroup) => void }) {
  const [query, setQuery] = React.useState(initial)
  return (
    <>
      <FilterConditionBuilder
        fields={fields}
        query={query}
        showNotToggle
        onQueryChange={(q) => {
          setQuery(q)
          onChange?.(q)
        }}
      />
      <output data-testid="sql">{formatQuery(query, "sql")}</output>
    </>
  )
}

describe("FilterConditionBuilder", () => {
  it("adds, edits and removes conditions with Onu controls", async () => {
    renderWithOnu(<Builder initial={{ combinator: "and", rules: [] }} />)
    await userEvent.click(screen.getByRole("button", { name: "Add condition" }))
    const field = screen.getByRole("combobox", { name: "Field" })
    expect(
      within(field)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["Name", "Balance", "Island", "Tags"])
    const operator = screen.getByRole("combobox", { name: "Operator" })
    expect(within(operator).getByRole("option", { name: "contains" })).toBeInTheDocument()
    await userEvent.type(screen.getByRole("textbox", { name: "Value" }), "Ali")
    expect(screen.getByTestId("sql")).toHaveTextContent("(name = 'Ali')")

    await userEvent.selectOptions(operator, "contains")
    expect(screen.getByTestId("sql")).toHaveTextContent("name like '%Ali%'")
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Operator" }), "null")
    expect(screen.queryByRole("textbox", { name: "Value" })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Remove condition" }))
    expect(screen.queryByRole("combobox", { name: "Field" })).not.toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("edits numbers, ranges, selects and multiselects, groups and Not", async () => {
    renderWithOnu(
      <Builder
        initial={{
          combinator: "or",
          rules: [
            { field: "balance", operator: "between", value: "10,20" },
            { field: "island", operator: "=", value: "male" },
            { field: "tags", operator: "in", value: "vip" },
          ],
        }}
      />,
    )
    const [from, to] = screen.getAllByRole("spinbutton")
    expect(from).toHaveAttribute("dir", "ltr")
    await userEvent.clear(to as HTMLElement)
    await userEvent.type(to as HTMLElement, "50")
    await userEvent.clear(from as HTMLElement)
    await userEvent.type(from as HTMLElement, "5")
    expect(screen.getByTestId("sql")).toHaveTextContent("balance between '5' and '50'")

    const values = screen.getAllByRole("combobox", { name: "Value" })
    await userEvent.selectOptions(values[0] as HTMLElement, "addu")
    expect(screen.getByTestId("sql")).toHaveTextContent("island = 'addu'")
    await userEvent.selectOptions(screen.getByRole("listbox", { name: "Value" }), ["vip", "new"])
    expect(screen.getByTestId("sql")).toHaveTextContent("tags in ('vip', 'new')")

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Match" }), "and")
    expect(screen.getByTestId("sql")).toHaveTextContent(" and ")
    await userEvent.click(screen.getByRole("checkbox", { name: "Not" }))
    expect(screen.getByTestId("sql")).toHaveTextContent(/^NOT/)

    await userEvent.click(screen.getByRole("button", { name: "Add group" }))
    expect(screen.getByRole("button", { name: "Remove group" })).toBeInTheDocument()
  })

  it("can turn groups off and starts from a default query", async () => {
    const onChange = vi.fn()
    renderWithOnu(
      <FilterConditionBuilder
        fields={fields}
        allowGroups={false}
        defaultQuery={{ combinator: "and", rules: [] }}
        onQueryChange={onChange}
      />,
    )
    expect(screen.queryByRole("button", { name: "Add group" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Add condition" }))
    expect(onChange).toHaveBeenCalled()
  })

  it.each(directions)("speaks Dhivehi in %s", async (dir) => {
    renderWithOnu(<Builder initial={{ combinator: "and", rules: [{ field: "name", operator: "=", value: "" }] }} />, {
      dir,
      locale: "dv",
    })
    expect(screen.getByRole("button", { name: "ޝަރުތެއް އިތުރުކުރޭ" })).toBeInTheDocument()
    expect(
      within(screen.getByRole("combobox", { name: "ޝަރުތު" })).getByRole("option", { name: "އަކީ" }),
    ).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
