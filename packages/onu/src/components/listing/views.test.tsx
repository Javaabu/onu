import * as React from "react"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { makeUsers, type User } from "../../../test/listing-fixtures"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { EmptyState } from "./empty-state"
import { GridView } from "./grid-view"
import { ListView } from "./list-view"
import { TreeView, type TreeNode } from "./tree-view"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const users = makeUsers(3)

describe.each([
  ["ListView", ListView],
  ["GridView", GridView],
] as const)("%s", (_, View) => {
  it("renders items with title, description, meta, media and actions", async () => {
    renderWithOnu(
      <View
        aria-label="Users"
        items={users}
        title={(u: User) => u.name}
        description={(u: User) => u.email}
        meta={(u: User) => <span>{u.island}</span>}
        media={(u: User) => <span aria-hidden="true">{u.name[0]}</span>}
        getHref={(u: User) => `/users/${u.id}`}
        itemActions={() => [{ id: "edit", label: "Edit" }]}
      />,
    )
    const list = screen.getByRole("list", { name: "Users" })
    const items = within(list).getAllByRole("listitem")
    expect(items).toHaveLength(3)
    expect(within(items[0] as HTMLElement).getByRole("link", { name: "Jane Doe" })).toHaveAttribute("href", "/users/1")
    expect(within(items[0] as HTMLElement).getByText("user1@example.mv")).toBeInTheDocument()
    expect(within(items[0] as HTMLElement).getByRole("button", { name: "Actions for Jane Doe" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("selects items and opens them on click", async () => {
    const onSelectionChange = vi.fn()
    const onItemClick = vi.fn()
    renderWithOnu(
      <View
        items={users}
        title={(u: User) => u.name}
        selection={["2"]}
        onSelectionChange={onSelectionChange}
        onItemClick={onItemClick}
      />,
    )
    expect(screen.getByRole("checkbox", { name: "Select Ahmed Ali" })).toBeChecked()
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Jane Doe" }))
    expect(onSelectionChange).toHaveBeenCalledWith(["2", "1"])
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Ahmed Ali" }))
    expect(onSelectionChange).toHaveBeenCalledWith([])
    expect(onItemClick).not.toHaveBeenCalled()
    await userEvent.click(screen.getByText("Mariyam Hassan"))
    expect(onItemClick).toHaveBeenCalledWith(users[2])
  })

  it("follows the link when the item is clicked", async () => {
    const clicked = vi.fn((e: Event) => e.preventDefault())
    renderWithOnu(
      <View
        items={users.slice(0, 1)}
        title={(u: User) => u.name}
        description={(u: User) => u.email}
        getHref={() => "/x"}
      />,
    )
    screen.getByRole("link").addEventListener("click", clicked)
    await userEvent.click(screen.getByText("user1@example.mv"))
    expect(clicked).toHaveBeenCalled()
  })

  it("shows loading skeletons, the empty state and custom items", () => {
    const { rerender } = renderWithOnu(<View items={[]} title={(u: User) => u.name} loading />)
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true")
    rerender(<View items={[]} title={(u: User) => u.name} empty={<EmptyState />} />)
    expect(screen.getByText("No records yet")).toBeInTheDocument()
    rerender(
      <View
        items={[{ id: "x", label: 7 }]}
        title={(i: { label: number }) => i.label}
        renderItem={(i, parts) => <div data-testid="custom">{parts.title}</div>}
        onSelectionChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId("custom")).toHaveTextContent("7")
  })

  it.each(directions)("works in %s with Dhivehi", async (dir) => {
    renderWithOnu(
      <View items={users.slice(0, 1)} title={() => "ޖަމީލާ"} onSelectionChange={vi.fn()} getName={() => "ޖަމީލާ"} />,
      {
        dir,
        locale: "dv",
      },
    )
    expect(screen.getByRole("checkbox", { name: "ޖަމީލާ ޚިޔާރުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

const tree: TreeNode[] = [
  {
    id: "male",
    label: "Malé",
    icon: "folder",
    children: [
      { id: "henveiru", label: "Henveiru", end: <span>12</span> },
      { id: "galolhu", label: "Galolhu", disabled: true },
    ],
  },
  { id: "addu", label: "Addu City", icon: <span>A</span> },
]

describe("TreeView", () => {
  it("expands and collapses with the chevron and the keyboard", async () => {
    const onAction = vi.fn()
    const onExpandedChange = vi.fn()
    renderWithOnu(<TreeView aria-label="Wards" items={tree} onAction={onAction} onExpandedChange={onExpandedChange} />)
    const treeEl = screen.getByRole("treegrid", { name: "Wards" })
    expect(within(treeEl).getAllByRole("row")).toHaveLength(2)
    await userEvent.click(screen.getByRole("button", { name: "Expand Malé" }))
    expect(onExpandedChange).toHaveBeenCalledWith(["male"])
    expect(within(treeEl).getAllByRole("row")).toHaveLength(4)
    expect(screen.getByRole("button", { name: "Collapse Malé" })).toBeInTheDocument()

    await userEvent.keyboard("{ArrowDown}")
    await userEvent.keyboard("{Enter}")
    expect(onAction).toHaveBeenCalledWith("henveiru")
    await expectNoA11yViolations()
  })

  it("selects with checkboxes in multiple mode", async () => {
    const onSelectionChange = vi.fn()
    renderWithOnu(
      <TreeView
        items={tree}
        selectionMode="multiple"
        defaultExpandedKeys={["male"]}
        onSelectionChange={onSelectionChange}
      />,
    )
    const rows = screen.getAllByRole("row")
    await userEvent.click(within(rows[1] as HTMLElement).getByRole("checkbox"))
    expect(onSelectionChange).toHaveBeenCalledWith(["henveiru"])
    await userEvent.keyboard("{Control>}a{/Control}")
    expect(onSelectionChange).toHaveBeenLastCalledWith(["male", "henveiru", "galolhu", "addu"])
  })

  it("shows the empty state", () => {
    renderWithOnu(<TreeView items={[]} empty="No wards" />)
    expect(screen.getByText("No wards")).toBeInTheDocument()
  })

  it.each(directions)("navigates in %s", async (dir) => {
    renderWithOnu(<TreeView items={tree} />, { dir, locale: "dv" })
    const rows = screen.getAllByRole("row")
    fireEvent.focus(rows[0] as HTMLElement)
    ;(rows[0] as HTMLElement).focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(4))
    expect(screen.getByRole("treegrid", { name: "ގަސް" })).toBeInTheDocument()
  })
})
