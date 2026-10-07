import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import { ConfirmProvider } from "./confirm-dialog"
import { ActionMenu } from "./action-menu"
import { visibleItems, type MenuItem } from "./_menu-items"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

function rowActions(handlers: {
  view?: () => void
  edit?: () => void
  remove?: () => void
  move?: (to: string) => void
}) {
  return [
    { id: "view", label: "View", icon: "eye", onSelect: handlers.view },
    { id: "edit", label: "Edit", icon: "edit", shortcut: "⌘E", onSelect: handlers.edit },
    { id: "archive", label: "Archive", hidden: true },
    { type: "separator" },
    {
      type: "sub",
      label: "Move to island",
      icon: "map-pin",
      items: [
        { label: "Malé", onSelect: () => handlers.move?.("Malé") },
        { label: "Addu City", onSelect: () => handlers.move?.("Addu City") },
      ],
    },
    { type: "separator" },
    {
      id: "delete",
      label: "Delete",
      icon: "trash",
      variant: "destructive",
      confirm: { title: "Delete Jane Doe?", variant: "destructive" },
      onSelect: handlers.remove,
    },
  ] satisfies MenuItem[]
}

describe("visibleItems", () => {
  it("drops hidden items and dangling or doubled separators", () => {
    const items: MenuItem[] = [
      { type: "separator" },
      { label: "A" },
      { label: "B", hidden: true },
      { type: "separator" },
      { type: "separator" },
      { label: "C" },
      { type: "separator" },
      { label: "D", hidden: true },
    ]
    expect(visibleItems(items).map((i) => ("label" in i ? i.label : "—"))).toEqual(["A", "—", "C"])
  })
})

describe("ActionMenu", () => {
  it("§25.6: clicking ⋯ opens the row's actions; only allowed actions are listed", async () => {
    const view = vi.fn()
    renderWithOnu(<ActionMenu items={rowActions({ view })} />)
    const trigger = screen.getByRole("button", { name: "More actions" })
    await userEvent.click(trigger)
    const menu = screen.getByRole("menu")
    const items = within(menu).getAllByRole("menuitem")
    expect(items.map((i) => i.textContent)).toEqual(["View", "Edit⌘E", "Move to island", "Delete"])
    expect(within(menu).queryByText("Archive")).not.toBeInTheDocument()
    expect(within(menu).getAllByRole("separator")).toHaveLength(2)
    expect(within(menu).getByText("Delete").closest("[role=menuitem]")).toHaveAttribute("data-variant", "destructive")
    expect(within(menu).getByText("⌘E")).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations()
    await userEvent.click(within(menu).getByText("View"))
    expect(view).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
  })

  it("§25.6: Escape closes the menu and focus returns to ⋯ (§25.10)", async () => {
    renderWithOnu(<ActionMenu items={rowActions({})} />)
    const trigger = screen.getByRole("button", { name: "More actions" })
    await userEvent.click(trigger)
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("§25.6: choosing Delete closes the menu, then asks 'Delete Jane Doe?' before deleting", async () => {
    const remove = vi.fn()
    renderWithOnu(
      <ConfirmProvider>
        <ActionMenu items={rowActions({ remove })} />
      </ConfirmProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: "More actions" }))
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }))
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    const dialog = await screen.findByRole("alertdialog", { name: "Delete Jane Doe?" })
    expect(remove).not.toHaveBeenCalled()
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }))
    await waitFor(() => expect(remove).toHaveBeenCalledOnce())
  })

  it("does not run a confirmed action when the user cancels", async () => {
    const remove = vi.fn()
    renderWithOnu(
      <ConfirmProvider>
        <ActionMenu items={[{ label: "Delete", confirm: "Delete Jane Doe?", onSelect: remove }]} />
      </ConfirmProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: "More actions" }))
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }))
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    expect(remove).not.toHaveBeenCalled()
  })

  it("is keyboard operable: Enter opens, arrows move, Enter selects", async () => {
    const edit = vi.fn()
    renderWithOnu(<ActionMenu items={rowActions({ edit })} />)
    screen.getByRole("button", { name: "More actions" }).focus()
    await userEvent.keyboard("{Enter}")
    expect(screen.getByRole("menuitem", { name: "View" })).toHaveFocus()
    await userEvent.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: /Edit/ })).toHaveFocus()
    await userEvent.keyboard("{Enter}")
    expect(edit).toHaveBeenCalledOnce()
  })

  it.each(directions)("opens submenus with the inline-end arrow key in %s (R11.5)", async (dir) => {
    const move = vi.fn()
    renderWithOnu(<ActionMenu items={rowActions({ move })} />, { dir })
    screen.getByRole("button", { name: "More actions" }).focus()
    await userEvent.keyboard("{Enter}")
    const sub = screen.getByRole("menuitem", { name: "Move to island" })
    sub.focus()
    await userEvent.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}")
    const subMenu = await screen.findByRole("menu", { name: "Move to island" })
    await waitFor(() => expect(within(subMenu).getByRole("menuitem", { name: "Malé" })).toHaveFocus())
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(move).toHaveBeenCalledWith("Addu City")
  })

  it("renders checkbox and radio items that keep the menu open", async () => {
    function View() {
      const [island, setIsland] = React.useState(true)
      const [sort, setSort] = React.useState("name")
      return (
        <ActionMenu
          trigger={<Button>View</Button>}
          items={[
            { type: "label", label: "Columns" },
            {
              type: "checkbox",
              label: "Island",
              icon: "map-pin",
              shortcut: "⌘I",
              checked: island,
              onCheckedChange: setIsland,
            },
            { type: "separator" },
            {
              type: "radio",
              label: "Sort by",
              value: sort,
              onValueChange: setSort,
              options: [
                { value: "name", label: "Name", icon: "user" },
                { value: "salary", label: "Salary (MVR)" },
              ],
            },
            {
              type: "group",
              label: "More",
              items: [{ label: "Reset" }],
            },
          ]}
        />
      )
    }
    renderWithOnu(<View />)
    await userEvent.click(screen.getByRole("button", { name: "View" }))
    const checkbox = screen.getByRole("menuitemcheckbox", { name: /Island/ })
    expect(checkbox).toHaveAttribute("aria-checked", "true")
    await userEvent.click(checkbox)
    expect(screen.getByRole("menuitemcheckbox", { name: /Island/ })).toHaveAttribute("aria-checked", "false")
    expect(screen.getByText("Columns")).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: "Reset" }).closest("[role=group]")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Salary (MVR)" }))
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    await userEvent.click(screen.getByRole("button", { name: "View" }))
    expect(screen.getByRole("menuitemradio", { name: "Salary (MVR)" })).toHaveAttribute("aria-checked", "true")
  })

  it("renders links through the OnuProvider link component and disabled items", async () => {
    const Link = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(function Link(
      { children, ...props },
      ref,
    ) {
      return (
        <a ref={ref} data-router-link="" {...props}>
          {children}
        </a>
      )
    })
    renderWithOnu(
      <ActionMenu
        items={[
          { label: "Docs", href: "/docs", icon: "external-link" },
          { label: "Closed", href: "/closed", disabled: true },
        ]}
      />,
      { provider: { linkComponent: Link } },
    )
    await userEvent.click(screen.getByRole("button", { name: "More actions" }))
    const link = screen.getByRole("menuitem", { name: "Docs" })
    expect(link.tagName).toBe("A")
    expect(link).toHaveAttribute("href", "/docs")
    expect(link).toHaveAttribute("data-router-link")
    expect(screen.getByRole("menuitem", { name: "Closed" })).toHaveAttribute("aria-disabled", "true")
  })

  it("accepts a custom label, className and classNames, and is controllable", () => {
    renderWithOnu(
      <ActionMenu
        open
        label="Actions for Aishath Ali"
        items={[{ label: "View" }]}
        className="menu-x"
        classNames={{ trigger: "trigger-x", item: "item-x" }}
      />,
    )
    expect(screen.getByRole("button", { name: "Actions for Aishath Ali", hidden: true })).toHaveClass("trigger-x")
    expect(screen.getByRole("menu")).toHaveClass("menu-x")
    expect(screen.getByRole("menuitem", { name: "View" })).toHaveClass("item-x")
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<ActionMenu defaultOpen items={[{ label: "ބައްލަވާ", icon: "eye" }]} />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "އިތުރު ޢަމަލުތައް", hidden: true })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
