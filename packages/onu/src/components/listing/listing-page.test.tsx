import * as React from "react"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { makeUsers, noun, userColumns, userFilters, type User } from "../../../test/listing-fixtures"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ListingPage, type ListingPageProps } from "./listing-page"
import { applyListingState, useListingState } from "./use-listing-state"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const ALL = makeUsers(60)
afterEach(() => window.history.replaceState(null, "", "/"))

function UsersPage(props: Partial<ListingPageProps<User>>) {
  const state = useListingState()
  const { rows, total } = applyListingState(ALL, state, {
    filterFns: { status: (u, v) => (Array.isArray(v) ? v.includes(u.status) : u.status === v) },
  })
  return (
    <ListingPage
      title="Users"
      description="Everyone with access"
      state={state}
      columns={userColumns}
      data={rows}
      total={total}
      noun={noun}
      filters={userFilters}
      primaryAction={<button type="button">New user</button>}
      trashHref="/users/trash"
      trashHasItems
      links={[{ label: "Import", href: "/users/import", icon: "upload" }]}
      onExport={vi.fn()}
      columnToggle
      bulkActions={[{ id: "delete", label: "Delete", destructive: true, run: vi.fn() }]}
      {...props}
    />
  )
}

describe("ListingPage", () => {
  it("shows the header, toolbar, table and pagination, top to bottom (§25.6)", async () => {
    renderWithOnu(<UsersPage />)
    const page = screen.getByRole("region", { name: "Users" })
    expect(within(page).getByRole("heading", { level: 1, name: "Users" })).toBeInTheDocument()
    expect(within(page).getByRole("button", { name: "New user" })).toBeInTheDocument()
    const trash = within(page).getByRole("link", { name: /Trash/ })
    expect(trash).toHaveAttribute("href", "/users/trash")
    expect(trash).toHaveTextContent("(Trash has items)")
    expect(trash.querySelector("[data-slot=link-dot]")).toBeInTheDocument()
    expect(within(page).getByRole("link", { name: "Import" })).toBeInTheDocument()
    expect(within(page).getByRole("searchbox", { name: "Search" })).toBeInTheDocument()
    expect(within(page).getByRole("button", { name: "Filters" })).toBeInTheDocument()
    expect(within(page).getByRole("button", { name: "Export" })).toBeInTheDocument()
    expect(within(page).getByRole("button", { name: /Columns/ })).toBeInTheDocument()
    expect(within(page).queryByRole("region", { name: "Active filters" })).not.toBeInTheDocument()
    expect(within(page).getByRole("table", { name: "Users" })).toBeInTheDocument()
    expect(within(page).getByText("Showing 1–25 of 60 users")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("searches on Enter, filters with pills and a count badge, and keeps it all in the URL (§25.6, §25.7)", async () => {
    renderWithOnu(<UsersPage />)
    await userEvent.type(screen.getByRole("searchbox"), "user1{Enter}")
    expect(new URLSearchParams(window.location.search).get("search")).toBe("user1")
    expect(screen.getByText(/^Showing 1–\d+ of \d+ users$/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Filters" }))
    const panel = await screen.findByRole("dialog", { name: "Filters" })
    await userEvent.click(within(panel).getByRole("checkbox", { name: "Banned" }))
    await userEvent.click(within(panel).getByRole("button", { name: "Apply" }))
    expect(screen.getByRole("button", { name: "Filters, 1 applied" })).toBeInTheDocument()
    const pills = screen.getByRole("region", { name: "Active filters" })
    expect(within(pills).getByText("Banned")).toBeInTheDocument()
    expect(new URLSearchParams(window.location.search).getAll("filter[status][]")).toEqual(["banned"])

    await userEvent.click(within(pills).getByRole("button", { name: "Remove filter Status: Banned" }))
    await waitFor(() => expect(screen.queryByRole("region", { name: "Active filters" })).not.toBeInTheDocument())
    expect(new URLSearchParams(window.location.search).has("filter[status][]")).toBe(false)
  })

  it("shows the main action in the empty state and supports status tabs", async () => {
    window.history.replaceState(null, "", "/?search=nobody-at-all")
    renderWithOnu(
      <UsersPage
        tabs={[
          { value: "all", label: "All", count: 60 },
          { value: "banned", label: "Banned", count: 12 },
        ]}
      />,
    )
    expect(screen.getByText("No users match your search")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }))
    await userEvent.click(screen.getByRole("tab", { name: "Banned (12)" }))
    expect(screen.getByText("Showing 1–12 of 12 users")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("tab", { name: "All (60)" }))
    expect(screen.getByText("Showing 1–25 of 60 users")).toBeInTheDocument()
  })

  it("renders custom content instead of the table and works without a state", () => {
    renderWithOnu(
      <ListingPage title={<span>People</span>} columns={userColumns} data={[]} searchable={false}>
        <p>Grid goes here</p>
      </ListingPage>,
    )
    expect(screen.getByText("Grid goes here")).toBeInTheDocument()
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
  })

  it("keeps the pagination footer and a Sort by menu around custom views", async () => {
    renderWithOnu(
      <UsersPage>
        <ul aria-label="User cards">
          <li>card</li>
        </ul>
      </UsersPage>,
    )
    expect(screen.queryByRole("table")).not.toBeInTheDocument()
    expect(screen.getByRole("list", { name: "User cards" })).toBeInTheDocument()
    expect(screen.getByText("Showing 1–25 of 60 users")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Go to next page" }))
    expect(screen.getByText("Showing 26–50 of 60 users")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Sort by" })).toBeInTheDocument()
    expect(screen.getAllByRole("combobox", { name: "Sort by" })).toHaveLength(1)
  })

  it.each(directions)("works in %s with Dhivehi", async (dir) => {
    renderWithOnu(<UsersPage title="ބޭނުންކުރާ މީހުން" noun={{ one: "މީހާ", other: "މީހުން" }} />, {
      dir,
      locale: "dv",
    })
    expect(screen.getByRole("link", { name: /ޓްރޭޝް/ })).toBeInTheDocument()
    expect(screen.getByText("60 މީހުން އިން 1–25 ދައްކަނީ")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
