import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { EditableDataGrid, type EditableColumn } from "./editable-data-grid"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

interface Item {
  id: string
  name: string
  qty: number
  unit: string
  note?: string
}

const columns: EditableColumn<Item>[] = [
  { id: "name", header: "Item", editable: true, required: true },
  {
    id: "qty",
    header: "Quantity",
    editable: true,
    type: "number",
    align: "end",
    validate: (v) => (Number(v) < 0 ? "Must be 0 or more" : undefined),
  },
  {
    id: "unit",
    header: "Unit",
    editable: true,
    type: "select",
    options: [
      { value: "kg", label: "kg" },
      { value: "box", label: "Box" },
    ],
  },
  { id: "note", header: "Note", accessor: (r) => r.note, cell: (r) => (r.note ? <em>{r.note}</em> : "") },
]

function Grid({
  onCellChange,
}: {
  onCellChange?: (c: { rowId: string; columnId: string; value: string }) => string | void
}) {
  const [rows, setRows] = React.useState<Item[]>([
    { id: "1", name: "Rice", qty: 10, unit: "kg" },
    { id: "2", name: "Sugar", qty: 4, unit: "box", note: "fragile" },
  ])
  return (
    <EditableDataGrid
      aria-label="Stock"
      columns={columns}
      rows={rows}
      onCellChange={(change) => {
        const error = onCellChange?.(change)
        if (error) return error
        setRows((prev) =>
          prev.map((r) =>
            r.id === change.rowId
              ? { ...r, [change.columnId]: change.columnId === "qty" ? Number(change.value) : change.value }
              : r,
          ),
        )
      }}
    />
  )
}

const cell = (row: number, col: number) =>
  within(screen.getAllByRole("row")[row] as HTMLElement).getAllByRole("gridcell")[col] as HTMLElement

describe("EditableDataGrid", () => {
  it("is a grid with arrow-key navigation (§ editable grid)", async () => {
    renderWithOnu(<Grid />)
    const grid = screen.getByRole("grid", { name: "Stock" })
    expect(grid).toHaveAttribute("aria-rowcount", "3")
    expect(cell(1, 0)).toHaveAttribute("tabindex", "0")
    cell(1, 0).focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(cell(1, 1)).toHaveFocus()
    await userEvent.keyboard("{ArrowDown}")
    expect(cell(2, 1)).toHaveFocus()
    await userEvent.keyboard("{End}")
    expect(cell(2, 3)).toHaveFocus()
    expect(cell(2, 3)).toHaveAttribute("aria-readonly", "true")
    await userEvent.keyboard("{Home}")
    expect(cell(2, 0)).toHaveFocus()
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowLeft}")
    expect(cell(1, 0)).toHaveFocus()
    await userEvent.keyboard("{Control>}{End}{/Control}")
    expect(cell(2, 3)).toHaveFocus()
    await userEvent.keyboard("{Control>}{Home}{/Control}{PageDown}")
    expect(cell(2, 0)).toHaveFocus()
    await userEvent.keyboard("{PageUp}")
    expect(cell(1, 0)).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("edits with Enter, saves with Enter and moves down", async () => {
    renderWithOnu(<Grid />)
    cell(1, 0).focus()
    await userEvent.keyboard("{Enter}")
    const input = screen.getByRole("textbox", { name: "Edit Item" })
    expect(input).toHaveFocus()
    await userEvent.clear(input)
    await userEvent.type(input, "Brown rice{Enter}")
    expect(cell(1, 0)).toHaveTextContent("Brown rice")
    await waitFor(() => expect(cell(2, 0)).toHaveFocus())
    expect(await screen.findByText("Saved")).toBeInTheDocument()
  })

  it("Escape cancels an edit and Tab saves and moves on", async () => {
    renderWithOnu(<Grid />)
    cell(1, 0).focus()
    await userEvent.keyboard("{F2}")
    await userEvent.type(screen.getByRole("textbox"), "xxx{Escape}")
    expect(cell(1, 0)).toHaveTextContent("Rice")
    await waitFor(() => expect(cell(1, 0)).toHaveFocus())

    // Typing starts an edit with that character.
    await userEvent.keyboard("W")
    expect(screen.getByRole("textbox")).toHaveValue("W")
    await userEvent.keyboard("heat{Tab}")
    expect(cell(1, 0)).toHaveTextContent("Wheat")
    await waitFor(() => expect(cell(1, 1)).toHaveFocus())
    await userEvent.keyboard("{Enter}{Shift>}{Tab}{/Shift}")
    await waitFor(() => expect(cell(1, 0)).toHaveFocus())
  })

  it("validates before saving and shows the error in the cell", async () => {
    renderWithOnu(<Grid />)
    cell(1, 1).focus()
    await userEvent.keyboard("{Enter}")
    const input = screen.getByRole("textbox", { name: "Edit Quantity" })
    await userEvent.clear(input)
    await userEvent.type(input, "-3{Enter}")
    expect(input).toHaveAttribute("aria-invalid", "true")
    expect(cell(1, 1)).toHaveTextContent("Must be 0 or more")
    expect(cell(1, 1)).toHaveAttribute("aria-invalid", "true")
    await userEvent.clear(input)
    await userEvent.type(input, "abc{Enter}")
    expect(cell(1, 1)).toHaveTextContent("Enter a number")
    await userEvent.clear(input)
    await userEvent.type(input, "7{Enter}")
    expect(cell(1, 1)).toHaveTextContent("7")

    cell(1, 0).focus()
    await userEvent.keyboard("{Enter}")
    await userEvent.clear(screen.getByRole("textbox"))
    await userEvent.keyboard("{Enter}")
    expect(cell(1, 0)).toHaveTextContent("Required")
  })

  it("shows errors returned by onCellChange", async () => {
    renderWithOnu(<Grid onCellChange={(c) => (c.value === "Salt" ? "Already listed" : undefined)} />)
    await userEvent.dblClick(cell(2, 0))
    const input = screen.getByRole("textbox")
    await userEvent.clear(input)
    await userEvent.type(input, "Salt{Enter}")
    expect(cell(2, 0)).toHaveTextContent("Already listed")
  })

  it("edits selects and saves on blur", async () => {
    renderWithOnu(
      <>
        <Grid />
        <button type="button">outside</button>
      </>,
    )
    await userEvent.click(cell(1, 2))
    await userEvent.keyboard("{Enter}")
    const select = screen.getByRole("combobox", { name: "Edit Unit" })
    await userEvent.selectOptions(select, "box")
    await userEvent.click(screen.getByRole("button", { name: "outside" }))
    expect(cell(1, 2)).toHaveTextContent("box")
    // Read-only cells don't edit; letters don't open selects.
    await userEvent.dblClick(cell(1, 3))
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    cell(1, 2).focus()
    await userEvent.keyboard("x")
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
  })

  it.each(directions)("moves visually with the arrow keys in %s", async (dir) => {
    renderWithOnu(<Grid />, { dir, locale: "dv" })
    cell(1, 1).focus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(cell(1, dir === "rtl" ? 2 : 0)).toHaveFocus()
    expect(screen.getAllByText("—").length).toBeGreaterThan(0)
    await expectNoA11yViolations()
  })
})
