import * as React from "react"
import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { setMobile, userFilters } from "../../../test/listing-fixtures"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ActiveFilterChips } from "./active-filter-chips"
import { FilterPanel } from "./filter-panel"
import type { FilterDefinition, FilterValues } from "./listing-types"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const originalMatchMedia = window.matchMedia
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

function Harness({
  filters = userFilters,
  initial = {},
  onApply,
  sheet,
}: {
  filters?: FilterDefinition[]
  initial?: FilterValues
  onApply?: (v: FilterValues) => void
  sheet?: boolean
}) {
  const [value, setValue] = React.useState<FilterValues>(initial)
  return (
    <>
      <FilterPanel
        filters={filters}
        value={value}
        sheet={sheet}
        onApply={(next) => {
          onApply?.(next)
          setValue(next)
        }}
      />
      <ActiveFilterChips
        filters={filters}
        value={value}
        onRemove={(key) => setValue(({ [key]: _, ...rest }) => rest)}
        onClearAll={() => setValue({})}
      />
      <output data-testid="applied">{JSON.stringify(value)}</output>
    </>
  )
}

const applied = () => JSON.parse(screen.getByTestId("applied").textContent ?? "{}") as FilterValues
const openPanel = async () => {
  await userEvent.click(screen.getByRole("button", { name: /Filters/ }))
  return screen.findByRole("dialog", { name: "Filters" })
}

describe("FilterPanel", () => {
  it("opens a dropdown listing every filter with its control and footer buttons (§25.7)", async () => {
    renderWithOnu(<Harness />)
    const panel = await openPanel()
    expect(panel).toHaveAttribute("data-slot", "filter-panel")
    expect(within(panel).getByRole("group", { name: "Status" })).toBeInTheDocument()
    expect(within(panel).getByRole("checkbox", { name: "Active" })).toBeInTheDocument()
    expect(within(panel).getByRole("group", { name: "Created" })).toBeInTheDocument()
    expect(within(panel).getByRole("combobox", { name: "Date" })).toBeInTheDocument()
    expect(within(panel).getByRole("button", { name: /From/ })).toBeInTheDocument()
    expect(within(panel).getByRole("button", { name: /To/ })).toBeInTheDocument()
    expect(within(panel).getByRole("combobox", { name: "Verified" })).toBeInTheDocument()
    expect(within(panel).getByRole("textbox", { name: "Email contains" })).toBeInTheDocument()
    expect(within(panel).getByRole("radiogroup", { name: "Deleted records" })).toBeInTheDocument()
    for (const name of ["Hide", "Include", "Only"])
      expect(within(panel).getByRole("radio", { name })).toBeInTheDocument()
    expect(within(panel).getByRole("button", { name: "Clear all" })).toBeInTheDocument()
    expect(within(panel).getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    expect(within(panel).getByRole("button", { name: "Apply" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("does not change the list until Apply (§25.7)", async () => {
    const onApply = vi.fn()
    renderWithOnu(<Harness onApply={onApply} />)
    const panel = await openPanel()
    await userEvent.click(within(panel).getByRole("checkbox", { name: "Active" }))
    await userEvent.type(within(panel).getByRole("textbox", { name: "Email contains" }), "gov.mv")
    expect(onApply).not.toHaveBeenCalled()
    expect(applied()).toEqual({})
    await userEvent.click(within(panel).getByRole("button", { name: "Apply" }))
    expect(applied()).toEqual({ status: ["active"], email: "gov.mv" })
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it.each([
    ["Cancel", async (panel: HTMLElement) => userEvent.click(within(panel).getByRole("button", { name: "Cancel" }))],
    ["Escape", async () => userEvent.keyboard("{Escape}")],
    ["clicking outside", async () => userEvent.click(document.body)],
  ])("%s closes the panel and throws away the changes (§25.7)", async (_, close) => {
    renderWithOnu(<Harness initial={{ status: ["banned"] }} />)
    const panel = await openPanel()
    await userEvent.click(within(panel).getByRole("checkbox", { name: "Active" }))
    await close(panel)
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(applied()).toEqual({ status: ["banned"] })
  })

  it("reopening shows the filters currently applied (§25.7)", async () => {
    renderWithOnu(<Harness initial={{ status: ["banned"] }} />)
    let panel = await openPanel()
    await userEvent.click(within(panel).getByRole("checkbox", { name: "Active" }))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    panel = await openPanel()
    expect(within(panel).getByRole("checkbox", { name: "Active" })).not.toBeChecked()
    expect(within(panel).getByRole("checkbox", { name: "Banned" })).toBeChecked()
  })

  it("Clear all removes every filter straight away and closes the panel (§25.7)", async () => {
    renderWithOnu(<Harness initial={{ status: ["banned"], email: "x" }} />)
    const panel = await openPanel()
    await userEvent.click(within(panel).getByRole("button", { name: "Clear all" }))
    expect(applied()).toEqual({})
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("each filter has its own Clear link (§25.7)", async () => {
    renderWithOnu(<Harness initial={{ status: ["banned"], email: "x" }} />)
    const panel = await openPanel()
    expect(within(panel).queryByRole("button", { name: "Clear Verified" })).not.toBeInTheDocument()
    await userEvent.click(within(panel).getByRole("button", { name: "Clear Status" }))
    expect(within(panel).getByRole("checkbox", { name: "Banned" })).not.toBeChecked()
    await userEvent.click(within(panel).getByRole("button", { name: "Apply" }))
    expect(applied()).toEqual({ email: "x" })
  })

  it("shows the count of active filters on the button (§25.7)", () => {
    renderWithOnu(<Harness initial={{ status: ["banned"], email: "x" }} />)
    const button = screen.getByRole("button", { name: "Filters, 2 applied" })
    expect(within(button).getByText("2")).toBeInTheDocument()
  })

  it("opens a bottom sheet on phones (§25.7)", async () => {
    setMobile(true)
    renderWithOnu(<Harness />)
    await userEvent.click(screen.getByRole("button", { name: /Filters/ }))
    const sheet = await screen.findByRole("dialog", { name: "Filters" })
    expect(sheet).toHaveAttribute("data-vaul-drawer-direction", "bottom")
    await userEvent.click(within(sheet).getByRole("checkbox", { name: "Banned" }))
    await userEvent.click(within(sheet).getByRole("button", { name: "Apply" }))
    expect(applied()).toEqual({ status: ["banned"] })
  })

  it("supports Select with search for long lists, single selects, Yes/No and Deleted records", async () => {
    const islands = ["Malé", "Hulhumalé", "Addu", "Fuvahmulah", "Kulhudhuffushi", "Thinadhoo", "Naifaru", "Eydhafushi"]
    const filters: FilterDefinition[] = [
      { type: "select", key: "island", label: "Island", options: islands.map((i) => ({ value: i, label: i })) },
      {
        type: "select",
        key: "role",
        label: "Role",
        multiple: false,
        options: [
          { value: "admin", label: "Admin" },
          { value: "editor", label: "Editor" },
        ],
      },
      {
        type: "select",
        key: "atoll",
        label: "Atoll",
        multiple: false,
        searchable: true,
        options: [
          { value: "K", label: "Kaafu" },
          { value: "S", label: "Seenu" },
        ],
      },
      { type: "boolean", key: "verified", label: "Verified" },
      { type: "trashed", key: "trashed", label: "Deleted records" },
    ]
    renderWithOnu(<Harness filters={filters} />)
    const panel = await openPanel()

    await userEvent.click(within(panel).getByRole("combobox", { name: /Island/ }))
    const search = await screen.findByRole("combobox", { name: "Search options…" })
    await userEvent.type(search, "hulhum")
    expect(screen.getAllByRole("option").map((o) => o.textContent)[0]).toBe("Hulhumalé")
    expect(screen.queryByRole("option", { name: "Addu" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("option", { name: "Hulhumalé" }))
    await userEvent.clear(search)
    await userEvent.click(screen.getByRole("option", { name: "Addu" }))
    await userEvent.click(screen.getByRole("option", { name: "Malé" }))
    expect(screen.getByRole("option", { name: "Malé" })).toHaveAttribute("aria-checked", "true")
    await userEvent.click(screen.getByRole("option", { name: "Malé" }))
    await userEvent.keyboard("{Escape}")
    expect(within(panel).getByRole("combobox", { name: /Island/ })).toHaveTextContent("Hulhumalé, Addu")

    await userEvent.click(within(panel).getByRole("combobox", { name: "Role" }))
    await userEvent.click(await screen.findByRole("option", { name: "Editor" }))

    await userEvent.click(within(panel).getByRole("combobox", { name: /Atoll/ }))
    await userEvent.click(await screen.findByRole("option", { name: "Seenu" }))

    await userEvent.click(within(panel).getByRole("combobox", { name: "Verified" }))
    await userEvent.click(await screen.findByRole("option", { name: "No" }))

    await userEvent.click(within(panel).getByRole("radio", { name: "Only" }))

    await userEvent.click(within(panel).getByRole("button", { name: "Apply" }))
    expect(applied()).toEqual({
      island: ["Hulhumalé", "Addu"],
      role: "editor",
      atoll: "S",
      verified: "0",
      trashed: "only",
    })
    expect(screen.getByText("Hulhumalé, Addu")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove filter Verified: No" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove filter Deleted records: Only" })).toBeInTheDocument()
  })

  it("picks a date range with a Date field chooser and From/To pickers (§25.7)", async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 2, 15) })
    renderWithOnu(<Harness />)
    const panel = await openPanel()
    await userEvent.click(within(panel).getByRole("combobox", { name: "Date" }))
    await userEvent.click(await screen.findByRole("option", { name: "Updated" }))
    await userEvent.click(within(panel).getByRole("button", { name: /From/ }))
    const grid = await screen.findByRole("grid")
    await userEvent.click(within(grid).getByRole("button", { name: /March 1st/ }))
    await waitFor(() => expect(screen.queryByRole("grid")).not.toBeInTheDocument())
    expect(within(panel).getByRole("button", { name: /From/ })).toHaveTextContent("1 Mar")
    await userEvent.click(within(panel).getByRole("button", { name: "Apply" }))
    expect(applied()).toEqual({ created: { field: "updated_at", from: "2026-03-01" } })
    expect(screen.getByText(/from 1 Mar/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove filter Updated: from 1 Mar" })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it("uses a custom render function for any filter", async () => {
    const filters: FilterDefinition[] = [
      {
        type: "custom",
        key: "min",
        label: "Minimum balance",
        render: ({ value, onChange, id }) => (
          <input
            id={id}
            aria-label="Minimum"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        ),
        format: (v) => `MVR ${v as string}`,
      },
    ]
    renderWithOnu(<Harness filters={filters} />)
    const panel = await openPanel()
    await userEvent.type(within(panel).getByLabelText("Minimum"), "500")
    await userEvent.click(within(panel).getByRole("button", { name: "Apply" }))
    expect(screen.getByText("MVR 500")).toBeInTheDocument()
  })

  it("supports controlled open state and a custom trigger", async () => {
    const onOpenChange = vi.fn()
    renderWithOnu(
      <FilterPanel
        filters={userFilters}
        value={{}}
        onApply={vi.fn()}
        open
        onOpenChange={onOpenChange}
        trigger="Refine"
        classNames={{ trigger: "trigger-x" }}
      />,
    )
    expect(screen.getByRole("button", { name: "Refine" })).toHaveClass("trigger-x")
    expect(await screen.findByRole("dialog")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<Harness initial={{ status: ["active"] }} />, { locale: "dv", dir })
    await userEvent.click(screen.getByRole("button", { name: "ފިލްޓަރުތައް، 1 ހިންގާފައި" }))
    const panel = await screen.findByRole("dialog", { name: "ފިލްޓަރުތައް" })
    expect(within(panel).getByRole("button", { name: "ހިންގާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("ActiveFilterChips", () => {
  it("shows a pill per filter; ✕ removes it; Clear all appears with two or more (§25.7)", async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 5, 1) })
    renderWithOnu(
      <Harness
        initial={{
          status: ["active"],
          created: { field: "created_at", from: "2026-03-01", to: "2026-03-31" },
          email: "gov",
          verified: "1",
          trashed: "with",
        }}
      />,
    )
    vi.useRealTimers()
    const region = screen.getByRole("region", { name: "Active filters" })
    const pills = within(region).getAllByRole("listitem")
    expect(pills.map((p) => p.textContent)).toEqual([
      "Status: Active",
      "Created: 1 Mar → 31 Mar",
      "Verified: Yes",
      "Email contains: gov",
      "Deleted records: Include",
    ])
    await userEvent.click(screen.getByRole("button", { name: "Remove filter Status: Active" }))
    expect(applied()).not.toHaveProperty("status")
    await waitFor(() => expect(screen.getByRole("button", { name: /Remove filter Created/ })).toHaveFocus())
    await userEvent.click(within(region).getByRole("button", { name: "Clear all" }))
    expect(applied()).toEqual({})
    expect(screen.queryByRole("region", { name: "Active filters" })).not.toBeInTheDocument()
  })

  it("hides Clear all with a single pill and formats open-ended ranges", () => {
    renderWithOnu(<Harness initial={{ created: { to: "2025-03-31" } }} />)
    expect(screen.getByText("until 31 Mar 2025")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument()
  })

  it("accepts classNames and hides pills a custom format rejects", () => {
    act(() => {
      renderWithOnu(
        <ActiveFilterChips
          filters={[
            { type: "text", key: "a", label: "A" },
            { type: "text", key: "b", label: "B", format: () => null },
          ]}
          value={{ a: "x", b: "y" }}
          onRemove={vi.fn()}
          classNames={{ chip: "chip-x" }}
        />,
      )
    })
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
    expect(screen.getByRole("listitem")).toHaveClass("chip-x")
  })
})
