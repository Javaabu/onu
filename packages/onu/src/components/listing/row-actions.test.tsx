import * as React from "react"
import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Deferred, setMobile } from "../../../test/listing-fixtures"
import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { RecordActionsMenu } from "./record-actions-menu"
import { RowActions, trashActions, type RecordAction } from "./row-actions"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const originalMatchMedia = window.matchMedia
afterEach(() => {
  window.matchMedia = originalMatchMedia
})

describe("RowActions", () => {
  it("opens a menu of permitted actions for the row (§25.6)", async () => {
    const onEdit = vi.fn()
    renderWithOnu(
      <RowActions
        name="Jane Doe"
        actions={[
          { id: "view", label: "View", icon: "eye", href: "/users/1" },
          { id: "edit", label: "Edit", icon: "edit", onSelect: onEdit },
          { id: "ban", label: "Ban", permitted: false },
          { id: "archive", label: "Archive", disabled: true, separator: true },
        ]}
        classNames={{ trigger: "trigger-x" }}
      />,
    )
    const trigger = screen.getByRole("button", { name: "Actions for Jane Doe" })
    expect(trigger).toHaveClass("trigger-x")
    await userEvent.click(trigger)
    const menu = await screen.findByRole("menu")
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((i) => i.textContent),
    ).toEqual(["View", "Edit", "Archive"])
    expect(within(menu).getByRole("menuitem", { name: "View" })).toHaveAttribute("href", "/users/1")
    expect(within(menu).getByRole("separator")).toBeInTheDocument()
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Edit" }))
    expect(onEdit).toHaveBeenCalled()
    await expectNoA11yViolations()
  })

  it("closes the menu and then asks 'Delete Jane Doe?' (§25.6)", async () => {
    const deferred = Deferred()
    const onDelete = vi.fn(() => deferred.promise)
    renderWithOnu(
      <RowActions
        name="Jane Doe"
        actions={[{ id: "delete", label: "Delete", destructive: true, onSelect: onDelete }]}
      />,
    )
    const trigger = screen.getByRole("button", { name: "Actions for Jane Doe" })
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole("menuitem", { name: "Delete" }))
    const dialog = await screen.findByRole("alertdialog", { name: "Delete Jane Doe?" })
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }))
    expect(onDelete).toHaveBeenCalled()
    expect(within(dialog).getByRole("button", { name: "Delete" })).toBeDisabled()
    await act(async () => deferred.resolve())
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("Escape closes the menu and returns focus (§25.6)", async () => {
    renderWithOnu(<RowActions name="Jane" actions={[{ id: "v", label: "View" }]} />)
    const trigger = screen.getByRole("button", { name: "Actions for Jane" })
    await userEvent.click(trigger)
    await screen.findByRole("menu")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it("supports custom confirmations and skipping them", async () => {
    const onApprove = vi.fn()
    const onRemove = vi.fn()
    renderWithOnu(
      <RowActions
        name="Form 12"
        actions={[
          {
            id: "approve",
            label: "Approve",
            confirm: { title: "Approve Form 12?", confirmLabel: "Yes, approve" },
            onSelect: onApprove,
          },
          { id: "remove", label: "Remove", destructive: true, confirm: false, onSelect: onRemove },
          { id: "suspend", label: "Suspend", confirm: true },
        ]}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Actions for Form 12" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Remove" }))
    expect(onRemove).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: "Actions for Form 12" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Approve" }))
    const dialog = await screen.findByRole("alertdialog", { name: "Approve Form 12?" })
    await userEvent.click(within(dialog).getByRole("button", { name: "Yes, approve" }))
    expect(onApprove).toHaveBeenCalled()

    await userEvent.click(screen.getByRole("button", { name: "Actions for Form 12" }))
    await userEvent.click(await screen.findByRole("menuitem", { name: "Suspend" }))
    expect(await screen.findByRole("alertdialog", { name: "Suspend Form 12?" })).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
  })

  it("renders nothing without permitted actions", () => {
    const { container } = renderWithOnu(<RowActions name="x" actions={[{ id: "a", label: "A", permitted: false }]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("builds trash actions from handlers and permissions", () => {
    const t = (k: string) => k
    expect(trashActions(t, { onRestore: vi.fn() }).map((a) => a.permitted)).toEqual([true, false])
    expect(
      trashActions(t, { onRestore: vi.fn(), onForceDelete: vi.fn() }, { restore: false }).map((a) => a.permitted),
    ).toEqual([false, true])
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<RowActions name="ޖަމީލާ" actions={[{ id: "delete", label: "ފޮހެލާ", destructive: true }]} />, {
      locale: "dv",
      dir,
    })
    await userEvent.click(screen.getByRole("button", { name: "ޖަމީލާ އާ ގުޅޭ ކަންކަން" }))
    await userEvent.click(await screen.findByRole("menuitem"))
    expect(await screen.findByRole("alertdialog", { name: "ޖަމީލާ ފޮހެލަންތަ؟" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("RecordActionsMenu", () => {
  const actions: RecordAction[] = [
    { id: "logs", label: "Logs", icon: "history", href: "/users/1/logs" },
    { id: "approve", label: "Approve", onSelect: vi.fn() },
    { id: "delete", label: "Delete", destructive: true, onSelect: vi.fn() },
    { id: "hidden", label: "Hidden", permitted: false },
  ]

  it("shows the first actions as buttons and the rest in a menu on wider screens", async () => {
    setMobile(false)
    renderWithOnu(<RecordActionsMenu name="Jane Doe" actions={actions} />)
    expect(screen.getByRole("link", { name: "Logs" })).toHaveAttribute("href", "/users/1/logs")
    await userEvent.click(screen.getByRole("button", { name: "Approve" }))
    expect(actions[1]?.onSelect).toHaveBeenCalled()
    await userEvent.click(screen.getByRole("button", { name: "More actions" }))
    const menu = await screen.findByRole("menu")
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((i) => i.textContent),
    ).toEqual(["Delete"])
    await userEvent.click(within(menu).getByRole("menuitem"))
    expect(await screen.findByRole("alertdialog", { name: "Delete Jane Doe?" })).toBeInTheDocument()
  })

  it("asks before a risky button action", async () => {
    setMobile(false)
    renderWithOnu(<RecordActionsMenu name="Jane Doe" maxVisible={3} actions={actions} size="sm" />)
    expect(screen.queryByRole("button", { name: "More actions" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Delete" }))
    expect(await screen.findByRole("alertdialog", { name: "Delete Jane Doe?" })).toBeInTheDocument()
  })

  it("puts everything in the menu on phones", async () => {
    setMobile(true)
    renderWithOnu(<RecordActionsMenu name="Jane Doe" actions={actions} />)
    expect(screen.queryByRole("link", { name: "Logs" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "More actions" }))
    expect((await screen.findAllByRole("menuitem")).map((i) => i.textContent)).toEqual(["Logs", "Approve", "Delete"])
    await expectNoA11yViolations()
  })

  it("renders nothing without permitted actions", () => {
    const { container } = renderWithOnu(<RecordActionsMenu name="x" actions={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
