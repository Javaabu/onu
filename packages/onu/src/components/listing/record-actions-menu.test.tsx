import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { setMobile } from "../../../test/listing-fixtures"
import { expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { RecordActionsMenu } from "./record-actions-menu"
import type { RecordAction } from "./_actions"

// Interaction-heavy tests: allow for slow CI machines and coverage instrumentation.
vi.setConfig({ testTimeout: 30_000 })

const originalMatchMedia = window.matchMedia
afterEach(() => {
  window.matchMedia = originalMatchMedia
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
