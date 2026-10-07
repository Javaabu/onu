import * as React from "react"
import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { BulkActionBar, type BulkAction } from "./bulk-actions"
import { EmptyState } from "./empty-state"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const noun = { one: "user", other: "users" }

function Bar({
  actions,
  initial = ["1", "2"],
  onSuccess,
  onError,
}: {
  actions: BulkAction<unknown>[]
  initial?: string[]
  onSuccess?: (m: string) => void
  onError?: (e: unknown) => void
}) {
  const [selected, setSelected] = React.useState(initial)
  return (
    <>
      <BulkActionBar
        selected={selected}
        actions={actions}
        noun={noun}
        onClearSelection={() => setSelected([])}
        onSuccess={onSuccess}
        onError={onError}
      />
      <button type="button" onClick={() => setSelected(["9"])}>
        select one
      </button>
    </>
  )
}

describe("BulkActionBar", () => {
  it("hides actions the user can't do and confirms non-destructive actions when asked", async () => {
    const run = vi.fn(() => "Archived!")
    const onSuccess = vi.fn()
    renderWithOnu(
      <Bar
        onSuccess={onSuccess}
        actions={[
          { id: "archive", label: "Archive", confirm: true, run },
          { id: "ban", label: "Ban", permitted: false, run: vi.fn() },
        ]}
      />,
    )
    expect(screen.queryByRole("button", { name: "Ban" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Archive" }))
    const dialog = await screen.findByRole("alertdialog", { name: "Archive 2 selected users?" })
    await userEvent.click(within(dialog).getByRole("button", { name: "Archive" }))
    expect(await screen.findByText("Archived!")).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalledWith("Archived!", expect.objectContaining({ id: "archive" }), ["1", "2"])
  })

  it("keeps the selection and shows an error when an action fails", async () => {
    const onError = vi.fn()
    renderWithOnu(
      <Bar
        onError={onError}
        actions={[
          { id: "a", label: "Approve", run: () => Promise.reject(new Error("Server said no")) },
          { id: "b", label: "Notify", run: () => Promise.reject("x") },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Approve" }))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Server said no")
    expect(alert).toHaveFocus()
    expect(screen.getByText("2 selected")).toBeInTheDocument()
    expect(onError).toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "Notify" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("That didn't work. Please try again.")
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("uses default and custom success messages, and hides them on the next selection", async () => {
    renderWithOnu(
      <Bar
        actions={[
          { id: "verify", label: "Verify", run: vi.fn() },
          { id: "flag", label: "Flag", run: vi.fn(), successMessage: "Flagged" },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Verify" }))
    const message = await screen.findByText("Verify: 2 users done")
    expect(message.closest("[data-slot=bulk-action-message]")).toHaveFocus()
    await userEvent.click(screen.getByRole("button", { name: "select one" }))
    expect(screen.queryByText("Verify: 2 users done")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Flag" }))
    expect(await screen.findByText("Flagged")).toBeInTheDocument()
  })

  it("cancels an input form and closes it when the selection empties", async () => {
    const run = vi.fn()
    renderWithOnu(<Bar actions={[{ id: "s", label: "Change status", form: ({ id }) => <input id={id} />, run }]} />)
    await userEvent.click(screen.getByRole("button", { name: "Change status" }))
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.getByRole("button", { name: "Change status" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Change status" }))
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }))
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
    expect(run).not.toHaveBeenCalled()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<Bar actions={[{ id: "delete", label: "ފޮހެލާ", destructive: true, run: vi.fn() }]} />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByRole("region", { name: "އެއްފަހަރާ ކުރާ ކަންކަން" })).toHaveTextContent("2 ޚިޔާރުކުރެވިފައި")
    await userEvent.click(screen.getByRole("button", { name: "ފޮހެލާ" }))
    expect(
      await screen.findByRole("alertdialog", { name: "ޚިޔާރުކުރެވިފައިވާ 2 users ފޮހެލަންތަ؟" }),
    ).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("EmptyState", () => {
  it("shows no-records, no-results and trash variants", async () => {
    const onClearSearch = vi.fn()
    const { rerender } = renderWithOnu(
      <EmptyState noun={noun} action={<button type="button">New user</button>} bordered />,
    )
    expect(screen.getByText("No users yet")).toBeInTheDocument()
    expect(screen.getByText("When users are added, they'll show up here.")).toBeInTheDocument()
    await expectNoA11yViolations()

    rerender(<EmptyState variant="no-results" noun={noun} search="jane" onClearSearch={onClearSearch} />)
    expect(screen.getByText("No users match your search")).toBeInTheDocument()
    expect(screen.getByText("Nothing matches “jane”.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Clear search" }))
    expect(onClearSearch).toHaveBeenCalled()

    rerender(<EmptyState variant="no-results" filters={["Status: Active"]} onClearFilters={vi.fn()} />)
    expect(screen.getByText("Nothing matches the filters Status: Active.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument()

    rerender(<EmptyState variant="no-results" />)
    expect(screen.getByText("Try different words or fewer filters.")).toBeInTheDocument()

    rerender(
      <EmptyState variant="trash" icon={null} title="Bin is empty" description="Nothing deleted" className="x" />,
    )
    expect(screen.getByText("Bin is empty")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveClass("x")
    rerender(<EmptyState icon={<svg data-testid="custom" />}>extra</EmptyState>)
    expect(screen.getByTestId("custom")).toBeInTheDocument()
    expect(screen.getByText("extra")).toBeInTheDocument()
  })

  it("speaks Dhivehi", () => {
    renderWithOnu(<EmptyState noun={{ one: "މީހާ", other: "މީހުން" }} />, { locale: "dv" })
    expect(screen.getByText("އަދި އެއްވެސް މީހުން އެއް ނެތް")).toBeInTheDocument()
  })
})
