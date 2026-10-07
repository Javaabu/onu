import * as React from "react"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  Deferred,
  makeUsers,
  noun,
  setMobile,
  userColumns,
  userFilters,
  type User,
} from "../../../test/listing-fixtures"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import type { BulkAction } from "./bulk-actions"
import { DataTable, type DataTableProps } from "./data-table"
import { trashActions } from "./row-actions"
import { applyListingState, useListingState, type ListingController } from "./use-listing-state"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const ALL = makeUsers(312)
const originalMatchMedia = window.matchMedia
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

let controller: ListingController
function Users({ all = ALL, ...props }: Partial<DataTableProps<User>> & { all?: User[] }) {
  const state = useListingState({ url: false })
  // Tests drive the listing state directly through this handle.
  // eslint-disable-next-line react-hooks/globals
  controller = state
  const { rows, total } = applyListingState(all, state, {
    filterFns: { status: (u, v) => (v as string[]).includes(u.status) },
  })
  return (
    <DataTable
      columns={userColumns}
      data={rows}
      total={total}
      state={state}
      noun={noun}
      caption="Users"
      filters={userFilters}
      {...props}
    />
  )
}

const deleteAction = (run = vi.fn()): BulkAction<unknown> => ({ id: "delete", label: "Delete", destructive: true, run })

describe("DataTable", () => {
  it("renders the checkbox column, data columns, row ⋯ menus and pagination (§25.6)", async () => {
    renderWithOnu(
      <Users bulkActions={[deleteAction()]} rowActions={() => [{ id: "view", label: "View", href: "#" }]} />,
    )
    const table = screen.getByRole("table", { name: "Users" })
    const headers = within(table).getAllByRole("columnheader")
    expect(headers).toHaveLength(6)
    expect(
      within(headers[0] as HTMLElement).getByRole("checkbox", { name: "Select all rows on this page" }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole("button", { name: /^Actions for / })).toHaveLength(25)
    expect(screen.getByText("Showing 1–25 of 312 users")).toBeInTheDocument()
    expect(screen.getByText("Rows per page")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeEnabled()
  })

  it("gives selection checkboxes a 24×24 target (WCAG 2.5.8), the box drawn inside", () => {
    renderWithOnu(<Users bulkActions={[deleteAction()]} />)
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows on this page" })
    expect(selectAll).toHaveClass("size-6")
    expect(selectAll.querySelector("[data-slot=checkbox-box]")).toHaveClass("size-4")
  })

  it("has no axe violations", async () => {
    renderWithOnu(
      <Users all={ALL.slice(0, 4)} bulkActions={[deleteAction()]} rowActions={() => [{ id: "view", label: "View" }]} />,
    )
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Jane Doe" }))
    await expectNoA11yViolations()
  })

  it("sorts by a header: arrow + aria-sort, reverses on the second click, new column starts ascending (§25.6)", async () => {
    renderWithOnu(<Users />)
    const nameHeader = screen.getByRole("columnheader", { name: /Name/ })
    const emailHeader = screen.getByRole("columnheader", { name: /Email/ })
    expect(nameHeader).toHaveAttribute("aria-sort", "none")
    expect(screen.getByRole("columnheader", { name: "Status" })).not.toHaveAttribute("aria-sort")

    await userEvent.click(within(nameHeader).getByRole("button"))
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending")
    expect(nameHeader.querySelector("[data-icon-name=sort-asc]")).toBeInTheDocument()
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Ahmed Ali")
    await waitFor(() => expect(screen.getByText("Sorted by Name, ascending")).toBeInTheDocument())

    await userEvent.click(within(nameHeader).getByRole("button"))
    expect(nameHeader).toHaveAttribute("aria-sort", "descending")
    expect(nameHeader.querySelector("[data-icon-name=sort-desc]")).toBeInTheDocument()

    await userEvent.click(within(emailHeader).getByRole("button"))
    expect(emailHeader).toHaveAttribute("aria-sort", "ascending")
    expect(nameHeader).toHaveAttribute("aria-sort", "none")
  })

  it("disables Previous on the first page and Next on the last (§25.6)", async () => {
    renderWithOnu(<Users />)
    await userEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(screen.getByText("Showing 26–50 of 312 users")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeEnabled()
    act(() => controller.setPage(13))
    expect(screen.getByText("Showing 301–312 of 312 users")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Go to next page" })).toBeDisabled()
  })

  it("goes back to page 1 when rows-per-page changes (§25.6)", async () => {
    renderWithOnu(<Users />)
    act(() => controller.setPage(3))
    await userEvent.click(screen.getByRole("combobox", { name: "Rows per page" }))
    await userEvent.click(await screen.findByRole("option", { name: "50" }))
    expect(screen.getByText("Showing 1–50 of 312 users")).toBeInTheDocument()
  })

  it("goes back to page 1 when sorting, searching or filtering (§25.6)", async () => {
    renderWithOnu(<Users />)
    act(() => controller.setPage(3))
    await userEvent.click(screen.getByRole("button", { name: /Email/ }))
    expect(screen.getByText("Showing 1–25 of 312 users")).toBeInTheDocument()
    act(() => controller.setPage(3))
    act(() => controller.setSearch("user1"))
    expect(screen.getByText(/^Showing 1–/)).toBeInTheDocument()
    act(() => controller.setSearch(""))
    act(() => controller.setPage(2))
    act(() => controller.setFilters({ status: ["banned"] }))
    expect(screen.getByText("Showing 1–25 of 63 users")).toBeInTheDocument()
  })

  it("selects rows, and the header box selects this page with a dash for some (§25.6)", async () => {
    renderWithOnu(<Users bulkActions={[deleteAction()]} />)
    const all = screen.getByRole("checkbox", { name: "Select all rows on this page" })
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Jane Doe" }))
    expect(screen.getByRole("checkbox", { name: "Select Jane Doe" })).toBeChecked()
    expect(all).toHaveAttribute("aria-checked", "mixed")
    expect(all.querySelector("[data-icon-name=minus]")).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Bulk actions" })).toHaveTextContent("1 selected")

    await userEvent.click(all)
    expect(all).toBeChecked()
    expect(screen.getByText("25 selected")).toBeInTheDocument()
    expect(controller.selection).toHaveLength(25)

    await userEvent.click(all)
    expect(all).not.toBeChecked()
    expect(screen.queryByRole("region", { name: "Bulk actions" })).not.toBeInTheDocument()
  })

  it("shows the bulk bar with the count, actions and Clear selection as soon as one row is selected (§25.6)", async () => {
    renderWithOnu(<Users bulkActions={[deleteAction(), { id: "export", label: "Export", run: vi.fn() }]} />)
    expect(screen.queryByRole("region", { name: "Bulk actions" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Jane Doe" }))
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Ahmed Ali" }))
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Mariyam Hassan" }))
    const bar = screen.getByRole("region", { name: "Bulk actions" })
    expect(bar).toHaveTextContent("3 selected")
    expect(within(bar).getByRole("button", { name: "Delete" })).toBeInTheDocument()
    expect(within(bar).getByRole("button", { name: "Export" })).toBeInTheDocument()
    await userEvent.click(within(bar).getByRole("button", { name: "Clear selection" }))
    expect(controller.selection).toEqual([])
  })

  it("asks to confirm a destructive bulk action, runs it with a spinner, then shows success and clears (§25.6)", async () => {
    const deferred = Deferred()
    const run = vi.fn(() => deferred.promise.then(() => undefined))
    renderWithOnu(<Users bulkActions={[deleteAction(run), { id: "export", label: "Export", run: vi.fn() }]} />)
    for (const name of ["Jane Doe", "Ahmed Ali", "Mariyam Hassan"])
      await userEvent.click(screen.getByRole("checkbox", { name: `Select ${name}` }))
    await userEvent.click(screen.getByRole("button", { name: "Delete" }))

    const dialog = await screen.findByRole("alertdialog", { name: "Delete 3 selected users?" })
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }))
    expect(run).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: "Delete" }))
    await userEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }))
    expect(run).toHaveBeenCalledWith(["1", "2", "3"], undefined)

    const bar = screen.getByRole("region", { name: "Bulk actions" })
    expect(bar).toHaveAttribute("aria-busy", "true")
    expect(within(bar).getByText("Working…")).toBeInTheDocument()
    expect(bar.querySelector("[data-slot=spinner]")).toBeInTheDocument()
    expect(within(bar).getByRole("button", { name: /Delete/ })).toBeDisabled()
    expect(within(bar).getByRole("button", { name: "Export" })).toBeDisabled()

    await act(async () => deferred.resolve())
    expect(await screen.findByText("3 users deleted")).toBeInTheDocument()
    expect(controller.selection).toEqual([])
    expect(screen.queryByRole("region", { name: "Bulk actions" })).not.toBeInTheDocument()
  })

  it("shows a small form in the bar for actions that need input (§25.6)", async () => {
    const run = vi.fn()
    const changeStatus: BulkAction<string> = {
      id: "status",
      label: "Change status",
      defaultValue: "active",
      form: ({ id, value, onChange }) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      ),
      run,
      successMessage: (n) => `${n} users updated`,
    }
    renderWithOnu(<Users bulkActions={[changeStatus as BulkAction<unknown>]} />)
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Jane Doe" }))
    await userEvent.click(screen.getByRole("button", { name: "Change status" }))
    const select = screen.getByLabelText("Change status")
    await userEvent.selectOptions(select, "banned")
    await userEvent.click(screen.getByRole("button", { name: "Apply" }))
    expect(run).toHaveBeenCalledWith(["1"], "banned")
    expect(await screen.findByText("1 users updated")).toBeInTheDocument()
  })

  it("clears the selection when moving to another page, searching, filtering or sorting (§25.6)", async () => {
    renderWithOnu(<Users bulkActions={[deleteAction()]} />)
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Jane Doe" }))
    await userEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(screen.queryByText("1 selected")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("checkbox", { name: "Select User 26" }))
    await userEvent.click(screen.getByRole("button", { name: /Name/ }))
    expect(controller.selection).toEqual([])
  })

  it("row ⋯ menu lists only permitted actions, confirms Delete with the name, and Escape closes it (§25.6)", async () => {
    const onDelete = vi.fn()
    renderWithOnu(
      <Users
        all={ALL.slice(0, 3)}
        rowActions={(user) => [
          { id: "view", label: "View", href: `/users/${user.id}` },
          { id: "edit", label: "Edit", onSelect: vi.fn(), permitted: false },
          { id: "delete", label: "Delete", destructive: true, onSelect: () => onDelete(user.id) },
        ]}
      />,
    )
    const trigger = screen.getByRole("button", { name: "Actions for Jane Doe" })
    await userEvent.click(trigger)
    const menu = await screen.findByRole("menu")
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((i) => i.textContent),
    ).toEqual(["View", "Delete"])
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()

    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }))
    const dialog = await screen.findByRole("alertdialog", { name: "Delete Jane Doe?" })
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }))
    expect(onDelete).toHaveBeenCalledWith("1")
  })

  it("opens the record when the row or its name is clicked (§25.6)", async () => {
    const onRowClick = vi.fn()
    const { unmount } = renderWithOnu(
      <Users all={ALL.slice(0, 2)} onRowClick={onRowClick} bulkActions={[deleteAction()]} />,
    )
    await userEvent.click(screen.getByText("user1@example.mv"))
    expect(onRowClick).toHaveBeenCalledWith(ALL[0])
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Ahmed Ali" }))
    expect(onRowClick).toHaveBeenCalledTimes(1)
    unmount()

    const clicked = vi.fn((e: Event) => e.preventDefault())
    renderWithOnu(<Users all={ALL.slice(0, 2)} getRowHref={(u) => `/users/${u.id}`} />)
    const link = screen.getByRole("link", { name: "Jane Doe" })
    expect(link).toHaveAttribute("href", "/users/1")
    link.addEventListener("click", clicked)
    await userEvent.click(screen.getByText("user1@example.mv"))
    expect(clicked).toHaveBeenCalled()
  })

  it("shows 'No users yet' with the main action when there are no records (§25.6)", async () => {
    renderWithOnu(<Users all={[]} emptyAction={<button type="button">New user</button>} />)
    expect(screen.getByText("No users yet")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "New user" })).toBeInTheDocument()
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("names the search and filters when nothing matches, with Clear search and Clear filters (§25.6)", async () => {
    renderWithOnu(<Users />)
    act(() => controller.setSearch("zzz"))
    act(() => controller.setFilters({ status: ["banned"] }))
    expect(screen.getByText("No users match your search")).toBeInTheDocument()
    expect(screen.getByText("Nothing matches “zzz” with the filters Status: Banned.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(controller.search).toBe("")
    act(() => controller.setSearch("zzz"))
    await userEvent.click(screen.getByRole("button", { name: "Clear filters" }))
    expect(controller.filters).toEqual({})
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument()
  })

  it("trash view: no bulk bar, Restore and Delete permanently with confirmation (§25.6)", async () => {
    const onRestore = vi.fn()
    const onForceDelete = vi.fn()
    renderWithOnu(
      <Users
        all={ALL.slice(0, 2)}
        trash
        bulkActions={[deleteAction()]}
        rowActions={() =>
          trashActions((k) => (k === "listing.restore" ? "Restore" : "Delete permanently"), {
            onRestore,
            onForceDelete,
          })
        }
      />,
    )
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Actions for Jane Doe" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Restore" }))
    expect(onRestore).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: "Actions for Jane Doe" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete permanently" }))
    expect(onForceDelete).not.toHaveBeenCalled()
    const dialog = await screen.findByRole("alertdialog", { name: "Permanently delete Jane Doe?" })
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete permanently" }))
    expect(onForceDelete).toHaveBeenCalled()
  })

  it("shows the trash empty state", () => {
    renderWithOnu(<Users all={[]} trash />)
    expect(screen.getByText("Trash is empty")).toBeInTheDocument()
  })

  it("on phones shows labelled cards, a Sort by dropdown and Select all above the cards (§25.6)", async () => {
    setMobile(true)
    renderWithOnu(
      <Users all={ALL.slice(0, 3)} bulkActions={[deleteAction()]} rowActions={() => [{ id: "v", label: "View" }]} />,
    )
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
    const cards = within(screen.getByRole("list", { name: "Users" })).getAllByRole("listitem")
    expect(cards).toHaveLength(3)
    const first = cards[0] as HTMLElement
    expect(within(first).getByText("Email").tagName).toBe("DT")
    expect(within(first).getByText("user1@example.mv").tagName).toBe("DD")
    expect(within(first).getByText("Balance")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("checkbox", { name: "Select all" }))
    expect(controller.selection).toEqual(["1", "2", "3"])

    await userEvent.click(screen.getByRole("combobox", { name: "Sort by" }))
    await userEvent.click(await screen.findByRole("option", { name: "Name, descending" }))
    expect(controller.sort).toEqual({ id: "name", desc: true })
    await expectNoA11yViolations()
  })

  it("shows skeleton rows while loading", () => {
    renderWithOnu(<Users loading />)
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true")
    expect(document.querySelectorAll("[data-slot=data-table-skeleton]")).toHaveLength(5)
  })

  it("shows skeleton cards while loading on phones", () => {
    renderWithOnu(<Users loading layout="cards" />)
    expect(document.querySelector("[data-slot=data-table-cards]")).toHaveAttribute("aria-busy", "true")
  })

  it("hides columns from column visibility state", () => {
    renderWithOnu(<Users all={ALL.slice(0, 1)} />)
    act(() => controller.setColumnVisibility({ email: false }))
    expect(screen.queryByRole("columnheader", { name: /Email/ })).not.toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument()
  })

  it("works without a state controller and without pagination", async () => {
    renderWithOnu(
      <DataTable
        columns={[
          { id: "name", header: "Name", sortable: true },
          { id: "joined", header: "Joined", accessor: (r: { joined: Date }) => r.joined, align: "center" },
          { id: "tags", header: "Tags", accessor: "tags" },
          { id: "note", header: "Note", headerContent: <em>Note</em>, align: "end" },
        ]}
        data={[{ id: "a", name: "Ali", joined: new Date(2026, 0, 2), tags: ["x"], note: "" }]}
        selectable
        striped
        stickyHeader
        density="compact"
        classNames={{ table: "table-x", row: "row-x", cell: "cell-x" }}
        className="root-x"
      />,
    )
    expect(document.querySelector("[data-slot=data-table]")).toHaveClass("root-x")
    expect(screen.getByRole("table")).toHaveClass("table-x")
    expect(screen.getByRole("row", { name: /Ali/ })).toHaveClass("row-x")
    expect(screen.getByText("—")).toBeInTheDocument()
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("checkbox", { name: "Select Ali" }))
    expect(screen.getByRole("checkbox", { name: "Select Ali" })).toBeChecked()
    await userEvent.click(screen.getByRole("button", { name: /Name/ }))
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "ascending")
  })

  it("supports a custom empty state and pagination without a total", () => {
    renderWithOnu(<DataTable columns={userColumns} data={[]} empty={<p>Nothing</p>} pagination />)
    expect(screen.getByText("Nothing")).toBeInTheDocument()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(
      <Users
        all={ALL.slice(0, 3)}
        bulkActions={[deleteAction()]}
        rowActions={() => [{ id: "v", label: "ބައްލަވާ" }]}
      />,
      {
        locale: "dv",
        dir,
      },
    )
    expect(screen.getByRole("checkbox", { name: "މި ސަފްހާގެ ހުރިހާ ރޯއެއް ޚިޔާރުކުރޭ" })).toBeInTheDocument()
    expect(screen.getByText("3 users އިން 1–3 ދައްކަނީ")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("checkbox", { name: "Jane Doe ޚިޔާރުކުރޭ" }))
    expect(screen.getByText("1 ޚިޔާރުކުރެވިފައި")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
