import * as React from "react"
import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { makeUsers, type User } from "../../../test/listing-fixtures"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { EmptyState } from "./empty-state"
import { ListView } from "./list-view"
import { propagateTreeSelection, TreeView, type TreeNode } from "./tree-view"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const users = makeUsers(3)

describe.each(["list", "grid"] as const)("ListView layout=%s", (layout) => {
  it("renders items with title, description, meta, media and actions", async () => {
    renderWithOnu(
      <ListView
        layout={layout}
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
      <ListView
        layout={layout}
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
      <ListView
        layout={layout}
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
    const { rerender } = renderWithOnu(<ListView layout={layout} items={[]} title={(u: User) => u.name} loading />)
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true")
    rerender(<ListView layout={layout} items={[]} title={(u: User) => u.name} empty={<EmptyState />} />)
    expect(screen.getByText("No records yet")).toBeInTheDocument()
    rerender(
      <ListView
        layout={layout}
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
      <ListView
        layout={layout}
        items={users.slice(0, 1)}
        title={() => "ޖަމީލާ"}
        onSelectionChange={vi.fn()}
        getName={() => "ޖަމީލާ"}
      />,
      {
        dir,
        locale: "dv",
      },
    )
    expect(screen.getByRole("checkbox", { name: "ޖަމީލާ ޚިޔާރުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("ListView layout", () => {
  it("lays items out as a list by default and as a grid of cards with layout=grid", () => {
    const { rerender } = renderWithOnu(<ListView aria-label="Users" items={users} title={(u: User) => u.name} />)
    const list = screen.getByRole("list", { name: "Users" })
    expect(list).toHaveAttribute("data-slot", "list-view")
    expect(list).toHaveClass("divide-y")
    rerender(<ListView aria-label="Users" variant="cards" items={users} title={(u: User) => u.name} />)
    expect(screen.getByRole("list")).toHaveClass("gap-2")
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("rounded-lg", "border")
    rerender(
      <ListView aria-label="Users" layout="grid" minItemWidth="10rem" items={users} title={(u: User) => u.name} />,
    )
    const grid = screen.getByRole("list", { name: "Users" })
    expect(grid).toHaveAttribute("data-slot", "grid-view")
    expect(grid.style.getPropertyValue("--onu-grid-min")).toBe("10rem")
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("rounded-xl")
  })

  it("shows row skeletons for a list and card skeletons for a grid", () => {
    const { rerender } = renderWithOnu(<ListView items={[]} title={(u: User) => u.name} loading />)
    expect(screen.getAllByRole("listitem")).toHaveLength(4)
    rerender(<ListView layout="grid" items={[]} title={(u: User) => u.name} loading />)
    expect(screen.getAllByRole("listitem")).toHaveLength(6)
    expect(screen.getByRole("list")).toHaveAttribute("aria-busy", "true")
  })

  it.each(directions)("passes axe as a grid in %s with Dhivehi", async (dir) => {
    renderWithOnu(
      <ListView
        layout="grid"
        aria-label="ބޭނުންވެރިން"
        items={users.slice(0, 2)}
        title={() => "ޖަމީލާ"}
        media={() => <span aria-hidden="true">ޖ</span>}
        itemActions={() => [{ id: "edit", label: "ބަދަލުކުރޭ" }]}
        onSelectionChange={vi.fn()}
      />,
      { dir, locale: "dv" },
    )
    expect(screen.getByRole("list", { name: "ބޭނުންވެރިން" })).toHaveAttribute("data-slot", "grid-view")
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

  it("shows a parent as partly selected when only some rows under it are", async () => {
    const wards: TreeNode[] = [
      {
        id: "male",
        label: "Malé",
        children: [
          { id: "henveiru", label: "Henveiru" },
          { id: "maafannu", label: "Maafannu" },
        ],
      },
    ]
    const { rerender } = renderWithOnu(
      <TreeView items={wards} selectionMode="multiple" defaultExpandedKeys={["male"]} selectedKeys={["henveiru"]} />,
    )
    const parent = () => within(screen.getAllByRole("row")[0] as HTMLElement).getByRole("checkbox")
    expect(parent()).toBePartiallyChecked()
    rerender(<TreeView items={wards} selectionMode="multiple" defaultExpandedKeys={["male"]} selectedKeys={["male"]} />)
    expect(parent()).toBeChecked()
    expect(parent()).not.toBePartiallyChecked()
    rerender(<TreeView items={wards} selectionMode="multiple" defaultExpandedKeys={["male"]} selectedKeys={[]} />)
    expect(parent()).not.toBeChecked()
    expect(parent()).not.toBePartiallyChecked()
    await expectNoA11yViolations()
  })

  it("propagates selection to children and back up to parents with selectionPropagation", async () => {
    const onSelectionChange = vi.fn()
    const wards: TreeNode[] = [
      {
        id: "male",
        label: "Malé",
        children: [
          { id: "henveiru", label: "Henveiru" },
          { id: "maafannu", label: "Maafannu" },
          { id: "galolhu", label: "Galolhu", disabled: true },
        ],
      },
      { id: "addu", label: "Addu City" },
    ]
    renderWithOnu(
      <TreeView
        items={wards}
        selectionMode="multiple"
        selectionPropagation
        defaultExpandedKeys={["male"]}
        onSelectionChange={onSelectionChange}
      />,
    )
    const box = (name: string) => within(screen.getByRole("row", { name: new RegExp(name) })).getByRole("checkbox")
    // Ticking the parent ticks its (enabled) children.
    await userEvent.click(box("Malé"))
    expect(onSelectionChange).toHaveBeenLastCalledWith(["male", "henveiru", "maafannu"])
    expect(box("Henveiru")).toBeChecked()
    // Unticking one child: the parent becomes partly selected.
    await userEvent.click(box("Henveiru"))
    expect(onSelectionChange).toHaveBeenLastCalledWith(["maafannu"])
    expect(box("Malé")).toBePartiallyChecked()
    // Ticking it again completes the parent.
    await userEvent.click(box("Henveiru"))
    expect(onSelectionChange).toHaveBeenLastCalledWith(["male", "henveiru", "maafannu"])
    expect(box("Malé")).toBeChecked()
    // Unticking the parent clears everything under it.
    await userEvent.click(box("Malé"))
    expect(onSelectionChange).toHaveBeenLastCalledWith([])
  })

  it("propagateTreeSelection settles parents from their children", () => {
    const wards: TreeNode[] = [
      {
        id: "p",
        label: "P",
        children: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
    ]
    expect(propagateTreeSelection(wards, new Set(), new Set(["a", "b"]))).toEqual(["p", "a", "b"])
    expect(propagateTreeSelection(wards, new Set(["p", "a", "b"]), new Set(["a", "b"]))).toEqual([])
    expect(propagateTreeSelection(wards, new Set(["p", "a", "b"]), new Set(["p", "b"]))).toEqual(["b"])
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
