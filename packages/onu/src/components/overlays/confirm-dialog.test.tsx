import * as React from "react"
import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { Button } from "../../ui/button"
import { ConfirmDialog, ConfirmProvider, confirm, useConfirm, type ConfirmFunction } from "./confirm-dialog"

// Radix overlays + axe are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

function deferred() {
  let resolve!: () => void
  let reject!: (e: unknown) => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe("ConfirmDialog", () => {
  it("asks with default title and buttons, focusing Cancel", async () => {
    renderWithOnu(<ConfirmDialog trigger={<Button>Approve</Button>} />)
    await userEvent.click(screen.getByRole("button", { name: "Approve" }))
    const dialog = screen.getByRole("alertdialog", { name: "Are you sure?" })
    expect(dialog).toHaveAttribute("data-variant", "default")
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus()
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled()
    await expectNoA11yViolations()
  })

  it("§25.6: a destructive bulk action shows 'Delete 3 selected users?' with Cancel and Delete", async () => {
    const onConfirm = vi.fn()
    renderWithOnu(
      <ConfirmDialog
        trigger={<Button>Delete</Button>}
        variant="destructive"
        title="Delete 3 selected users?"
        description="They will be moved to the trash."
        onConfirm={onConfirm}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Delete" }))
    const dialog = screen.getByRole("alertdialog", { name: "Delete 3 selected users?" })
    expect(dialog).toHaveAccessibleDescription("They will be moved to the trash.")
    expect(dialog.querySelector("[data-slot=confirm-dialog-icon]")).toBeInTheDocument()
    const del = screen.getAllByRole("button", { name: "Delete" }).find((b) => dialog.contains(b))!
    expect(del).toHaveClass("bg-destructive")
    await userEvent.click(del)
    expect(onConfirm).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  })

  it("§25.6: while the action runs it shows a spinner and the buttons can't be clicked again", async () => {
    const job = deferred()
    const onConfirm = vi.fn(() => job.promise)
    renderWithOnu(<ConfirmDialog defaultOpen title="Delete Jane Doe?" variant="destructive" onConfirm={onConfirm} />)
    const confirmButton = screen.getByRole("button", { name: "Delete" })
    await userEvent.click(confirmButton)
    expect(screen.getByRole("status")).toHaveTextContent("Working…")
    expect(confirmButton).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
    expect(screen.getByRole("alertdialog")).toHaveAttribute("aria-busy", "true")
    await userEvent.click(confirmButton)
    await userEvent.keyboard("{Escape}")
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    await act(async () => job.resolve())
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  })

  it("keeps the dialog open and shows the error when the action fails", async () => {
    const job = deferred()
    renderWithOnu(<ConfirmDialog defaultOpen title="Sync?" onConfirm={() => job.promise} />)
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await act(async () => job.reject(new Error("Server didn't respond")))
    expect(await screen.findByRole("alert")).toHaveTextContent("Server didn't respond")
    expect(screen.getByRole("button", { name: "Confirm" })).toBeEnabled()
  })

  it("uses errorMessage, or a generic message, for sync failures", async () => {
    const { unmount } = renderWithOnu(
      <ConfirmDialog
        defaultOpen
        onConfirm={() => {
          throw new Error("boom")
        }}
        errorMessage="Could not delete"
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(screen.getByRole("alert")).toHaveTextContent("Could not delete")
    unmount()
    renderWithOnu(
      <ConfirmDialog
        defaultOpen
        onConfirm={() => {
          throw "not an error"
        }}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(screen.getByRole("alert")).toHaveTextContent("That didn't work. Please try again.")
  })

  it("requires typing the name before confirming", async () => {
    const onConfirm = vi.fn()
    renderWithOnu(
      <ConfirmDialog defaultOpen variant="destructive" confirmText="Kulhudhuffushi" onConfirm={onConfirm} />,
    )
    const input = screen.getByLabelText("To confirm, type “Kulhudhuffushi” below")
    expect(input).toHaveFocus()
    const button = screen.getByRole("button", { name: "Delete" })
    expect(button).toBeDisabled()
    await userEvent.type(input, "Kulhu{Enter}")
    expect(onConfirm).not.toHaveBeenCalled()
    await userEvent.type(input, "dhuffushi")
    expect(button).toBeEnabled()
    await userEvent.type(input, "{Enter}")
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it("switches the confirm field to Thaana for Thaana names", () => {
    renderWithOnu(<ConfirmDialog defaultOpen confirmText="މާލެ" />)
    expect(screen.getByRole("textbox")).toHaveAttribute("lang", "dv")
  })

  it("calls onCancel and onOpenChange(false) on cancel, and resets when reopened", async () => {
    const onCancel = vi.fn()
    const onOpenChange = vi.fn()
    renderWithOnu(
      <ConfirmDialog
        trigger={<Button>Open</Button>}
        confirmText="yes"
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    await userEvent.type(screen.getByRole("textbox"), "ye")
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Open" })).toHaveFocus()
    await userEvent.click(screen.getByRole("button", { name: "Open" }))
    expect(screen.getByRole("textbox")).toHaveValue("")
  })

  it("supports custom labels, icon, children and classNames", () => {
    renderWithOnu(
      <ConfirmDialog
        defaultOpen
        title="Approve?"
        confirmLabel="Approve"
        cancelLabel="Not now"
        icon="success"
        className="root-x"
        classNames={{ title: "title-x", footer: "footer-x", confirm: "confirm-x", cancel: "cancel-x", icon: "icon-x" }}
      >
        <p>Extra details</p>
      </ConfirmDialog>,
    )
    expect(screen.getByRole("alertdialog")).toHaveClass("root-x")
    expect(screen.getByText("Approve?")).toHaveClass("title-x")
    expect(screen.getByRole("button", { name: "Approve" })).toHaveClass("confirm-x")
    expect(screen.getByRole("button", { name: "Not now" })).toHaveClass("cancel-x")
    expect(screen.getByText("Extra details")).toBeInTheDocument()
    expect(document.querySelector(".icon-x [data-icon-name=success]")).toBeInTheDocument()
  })

  it("hides the icon with icon={false}", () => {
    renderWithOnu(<ConfirmDialog defaultOpen variant="destructive" icon={false} />)
    expect(document.querySelector("[data-slot=confirm-dialog-icon]")).toBeNull()
  })

  it.each(directions)("works in %s with Dhivehi strings", async (dir) => {
    renderWithOnu(<ConfirmDialog defaultOpen variant="destructive" />, { locale: "dv", dir })
    expect(screen.getByRole("alertdialog", { name: "ޔަޤީންތޯ؟" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ކެންސަލްކުރޭ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ފޮހެލާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("useConfirm / confirm()", () => {
  afterEach(() => vi.restoreAllMocks())

  function Asker({ onResult, options }: { onResult: (ok: boolean) => void; options?: Parameters<ConfirmFunction>[0] }) {
    const ask = useConfirm()
    return <Button onClick={async () => onResult(await ask(options))}>Ask</Button>
  }

  it("resolves true when confirmed", async () => {
    const onResult = vi.fn()
    renderWithOnu(
      <ConfirmProvider>
        <Asker onResult={onResult} options={{ title: "Delete Aishath Ali?", variant: "destructive" }} />
      </ConfirmProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Ask" }))
    expect(screen.getByRole("alertdialog", { name: "Delete Aishath Ali?" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Delete" }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true))
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole("button", { name: "Ask" })).toHaveFocus())
  })

  it("resolves false when cancelled or dismissed with Escape", async () => {
    const onResult = vi.fn()
    renderWithOnu(
      <ConfirmProvider defaults={{ cancelLabel: "No" }}>
        <Asker onResult={onResult} options="Publish?" />
      </ConfirmProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Ask" }))
    expect(screen.getByRole("alertdialog", { name: "Publish?" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "No" }))
    await waitFor(() => expect(onResult).toHaveBeenLastCalledWith(false))
    await userEvent.click(screen.getByRole("button", { name: "Ask" }))
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(onResult).toHaveBeenCalledTimes(2))
    expect(onResult).toHaveBeenLastCalledWith(false)
  })

  it("waits for an async onConfirm before resolving", async () => {
    const job = deferred()
    const onResult = vi.fn()
    renderWithOnu(
      <ConfirmProvider>
        <Asker onResult={onResult} options={{ onConfirm: () => job.promise }} />
      </ConfirmProvider>,
    )
    await userEvent.click(screen.getByRole("button", { name: "Ask" }))
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }))
    expect(onResult).not.toHaveBeenCalled()
    await act(async () => job.resolve())
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true))
  })

  it("standalone confirm() uses the mounted provider, and a new request cancels the previous one", async () => {
    renderWithOnu(
      <ConfirmProvider>
        <span />
      </ConfirmProvider>,
    )
    let first!: Promise<boolean>
    act(() => {
      first = confirm({ title: "First?" })
    })
    expect(await screen.findByRole("alertdialog", { name: "First?" })).toBeInTheDocument()
    let second!: Promise<boolean>
    act(() => {
      second = confirm("Second?")
    })
    await expect(first).resolves.toBe(false)
    expect(await screen.findByRole("alertdialog", { name: "Second?" })).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }))
    await expect(second).resolves.toBe(true)
  })

  it("falls back to window.confirm without a provider", async () => {
    const native = vi.spyOn(window, "confirm").mockReturnValueOnce(true).mockReturnValueOnce(false)
    const onConfirm = vi.fn()
    await expect(confirm({ title: "Delete?", description: "Gone for good", onConfirm })).resolves.toBe(true)
    expect(native).toHaveBeenCalledWith("Delete?\n\nGone for good")
    expect(onConfirm).toHaveBeenCalledOnce()
    await expect(confirm()).resolves.toBe(false)
    expect(native).toHaveBeenLastCalledWith("Are you sure?")
  })

  it("useConfirm outside a provider returns the fallback", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true)
    const onResult = vi.fn()
    renderWithOnu(<Asker onResult={onResult} options="Sure?" />)
    await userEvent.click(screen.getByRole("button", { name: "Ask" }))
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true))
  })
})
