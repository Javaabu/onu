import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { KanbanBoard, type KanbanColumn } from "./kanban-board"
import { SortableList } from "./sortable-list"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

interface Task {
  id: string
  title: string
}

const tasks: Task[] = [
  { id: "a", title: "Renew licence" },
  { id: "b", title: "Inspect vessel" },
  { id: "c", title: "Collect fee" },
]

function List(props: { onReorder?: (items: Task[]) => void; moveButtons?: boolean }) {
  const [items, setItems] = React.useState(tasks)
  return (
    <SortableList
      aria-label="Tasks"
      items={items}
      getName={(t) => t.title}
      moveButtons={props.moveButtons}
      onReorder={(next) => {
        props.onReorder?.(next)
        setItems(next)
      }}
      renderItem={(task, { handle, moveButtons }) => (
        <div className="gap-2 flex items-center">
          {handle}
          <span>{task.title}</span>
          {moveButtons}
        </div>
      )}
    />
  )
}

const order = () => screen.getAllByRole("listitem").map((li) => li.textContent)

describe("SortableList", () => {
  it("reorders with Move up / Move down buttons and announces the new position", async () => {
    renderWithOnu(<List />)
    expect(screen.getByRole("button", { name: "Move up: Renew licence" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Move down: Renew licence" }))
    expect(order()).toEqual(["Inspect vessel", "Renew licence", "Collect fee"])
    await waitFor(() => expect(screen.getByText("Renew licence moved to position 2 of 3")).toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Move down: Collect fee" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Move up: Collect fee" }))
    expect(order()).toEqual(["Inspect vessel", "Collect fee", "Renew licence"])
  })

  it("moves with Alt+Arrow on the drag handle", async () => {
    renderWithOnu(<List moveButtons={false} />)
    const handle = screen.getByRole("button", { name: "Drag to reorder Inspect vessel" })
    handle.focus()
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}")
    expect(order()).toEqual(["Inspect vessel", "Renew licence", "Collect fee"])
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}")
    expect(order()).toEqual(["Inspect vessel", "Renew licence", "Collect fee"])
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}")
    expect(order()).toEqual(["Renew licence", "Inspect vessel", "Collect fee"])
    await userEvent.keyboard("{ArrowDown}")
    expect(order()).toEqual(["Renew licence", "Inspect vessel", "Collect fee"])
    expect(screen.queryByRole("button", { name: /Move up/ })).not.toBeInTheDocument()
  })

  it.each(directions)("has no axe violations in %s with Dhivehi", async (dir) => {
    renderWithOnu(<List />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "Renew licence ގެ ތަރުތީބު ބަދަލުކުރަން ދަމާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("SortableList as a table", () => {
  function Table(props: { moveButtons?: boolean; disabled?: boolean }) {
    const [rows, setRows] = React.useState(tasks)
    return (
      <SortableList
        aria-label="Stops"
        items={rows}
        getName={(t) => t.title}
        onReorder={setRows}
        moveButtons={props.moveButtons}
        disabled={props.disabled}
        className="wrap-x"
        classNames={{ table: "table-x", item: "row-x", handle: "handle-x" }}
        columns={[{ id: "title", header: "Stop", cell: (t) => t.title, className: "col-x" }]}
      />
    )
  }
  const cells = () => screen.getAllByRole("cell").filter((c) => !c.querySelector("button"))

  it("moves rows with Alt+Arrow on the handle and announces it", async () => {
    renderWithOnu(<Table moveButtons={false} />)
    const table = screen.getByRole("table", { name: "Stops" })
    expect(table).toHaveClass("table-x")
    expect(table.closest("[data-slot=sortable-list]")).toHaveClass("wrap-x")
    expect(screen.getByRole("columnheader", { name: "Reorder" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Stop" })).toHaveClass("col-x")
    const handle = screen.getByRole("button", { name: "Drag to reorder Renew licence" })
    expect(handle).toHaveClass("handle-x")
    expect(handle).toHaveAttribute("aria-keyshortcuts", "Alt+ArrowUp Alt+ArrowDown")
    expect(handle.closest("tr")).toHaveClass("row-x")
    expect(screen.queryByRole("button", { name: /Move up/ })).not.toBeInTheDocument()
    handle.focus()
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}")
    expect(cells().map((c) => c.textContent)).toEqual(["Inspect vessel", "Renew licence", "Collect fee"])
    await waitFor(() => expect(screen.getByText("Renew licence moved to position 2 of 3")).toBeInTheDocument())
    await userEvent.keyboard("{Alt>}{ArrowUp}{/Alt}{Alt>}{ArrowUp}{/Alt}")
    expect(cells().map((c) => c.textContent)).toEqual(["Renew licence", "Inspect vessel", "Collect fee"])
    await expectNoA11yViolations()
  })

  it("has Move up / Move down buttons in the handle column by default", async () => {
    renderWithOnu(<Table />)
    expect(screen.getByRole("button", { name: "Move up: Renew licence" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Move down: Renew licence" }))
    expect(cells().map((c) => c.textContent)).toEqual(["Inspect vessel", "Renew licence", "Collect fee"])
    await expectNoA11yViolations()
  })

  it("can be turned off", () => {
    renderWithOnu(<Table disabled />)
    expect(screen.getByRole("button", { name: "Drag to reorder Renew licence" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Move down: Renew licence" })).toBeDisabled()
  })

  it.each(directions)("has no axe violations in %s with Dhivehi", async (dir) => {
    renderWithOnu(<Table />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "Renew licence ގެ ތަރުތީބު ބަދަލުކުރަން ދަމާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

const columns: KanbanColumn[] = [
  { id: "todo", title: "To do", accentClassName: "bg-chart-1" },
  { id: "doing", title: "In progress", actions: <button type="button">Add</button> },
  { id: "done", title: "Done" },
]

function Board(props: { canMove?: (m: { to: string }) => boolean; onMove?: (m: unknown) => void }) {
  const [items, setItems] = React.useState<Record<string, Task[]>>({
    todo: tasks.slice(0, 2),
    doing: tasks.slice(2),
    done: [],
  })
  return (
    <KanbanBoard
      columns={columns}
      items={items}
      getName={(t) => t.title}
      canMove={props.canMove}
      onItemsChange={(next, move) => {
        props.onMove?.(move)
        setItems(next)
      }}
      renderCard={(task, { handle, moveMenu }) => (
        <div className="gap-2 p-2 flex items-center">
          {handle}
          <span>{task.title}</span>
          {moveMenu}
        </div>
      )}
    />
  )
}

describe("KanbanBoard", () => {
  it("shows columns with counts and cards", async () => {
    renderWithOnu(<Board />)
    const todo = screen.getByRole("region", { name: "To do" })
    expect(within(todo).getByLabelText("2 items")).toBeInTheDocument()
    expect(within(todo).getAllByRole("listitem")).toHaveLength(2)
    expect(within(screen.getByRole("region", { name: "Done" })).getByText("Nothing here")).toBeInTheDocument()
    expect(
      within(screen.getByRole("region", { name: "In progress" })).getByRole("button", { name: "Add" }),
    ).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("moves a card with its Move to… menu and announces it (button alternative to dragging)", async () => {
    const onMove = vi.fn()
    renderWithOnu(<Board onMove={onMove} />)
    await userEvent.click(screen.getByRole("button", { name: "Move to… Renew licence" }))
    const menu = await screen.findByRole("menu")
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((i) => i.textContent),
    ).toEqual(["Move to In progress", "Move to Done"])
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Move to Done" }))
    expect(onMove).toHaveBeenCalledWith({ id: "a", from: "todo", to: "done", index: 0 })
    expect(within(screen.getByRole("region", { name: "Done" })).getByText("Renew licence")).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText("Renew licence moved to Done")).toBeInTheDocument())
  })

  it("refuses moves canMove rejects", async () => {
    const onMove = vi.fn()
    renderWithOnu(<Board onMove={onMove} canMove={(m) => m.to !== "done"} />)
    await userEvent.click(screen.getByRole("button", { name: "Move to… Renew licence" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Move to Done" }))
    expect(onMove).not.toHaveBeenCalled()
  })

  it.each(directions)("works in %s with Dhivehi", async (dir) => {
    renderWithOnu(<Board />, { dir, locale: "dv" })
    expect(
      within(screen.getByRole("region", { name: "Done" })).getByText("މިތާ އެއްވެސް އެއްޗެއް ނެތް"),
    ).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
