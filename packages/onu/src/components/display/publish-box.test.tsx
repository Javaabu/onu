import * as React from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { PublishBox } from "./publish-box"

const NOW = new Date(2026, 2, 12, 10, 0)

describe("PublishBox", () => {
  it("shows status, visibility and an immediate publish date with actions", async () => {
    const onPublish = vi.fn()
    const onSaveDraft = vi.fn()
    renderWithOnu(
      <PublishBox
        status="draft"
        visibility="public"
        previewHref="/preview/1"
        onSaveDraft={onSaveDraft}
        onPublish={onPublish}
        now={NOW}
      />,
    )
    expect(screen.getByText("Publish", { selector: "[data-slot=card-title]" })).toBeInTheDocument()
    expect(screen.getByText("Draft")).toBeInTheDocument()
    expect(screen.getByText("Public")).toBeInTheDocument()
    expect(screen.getByText("Immediately")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Preview" })).toHaveAttribute("href", "/preview/1")
    await userEvent.click(screen.getByRole("button", { name: "Save draft" }))
    await userEvent.click(screen.getByRole("button", { name: "Publish" }))
    expect(onSaveDraft).toHaveBeenCalled()
    expect(onPublish).toHaveBeenCalled()
  })

  it("says Schedule for a future date and Update when published", () => {
    const { rerender } = renderWithOnu(
      <PublishBox status="scheduled" publishAt={new Date(2026, 2, 20, 9)} onPublish={() => {}} now={NOW} />,
    )
    expect(screen.getByRole("button", { name: "Schedule" })).toBeInTheDocument()
    expect(screen.getByText("Scheduled")).toBeInTheDocument()
    expect(document.querySelector("time")).toBeInTheDocument()
    rerender(<PublishBox status="published" onPublish={() => {}} onSaveDraft={() => {}} visibility="private" />)
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Save draft" })).toBeNull()
    expect(screen.getByText("Private")).toBeInTheDocument()
  })

  it("shows a spinner and blocks double clicks while an action runs", async () => {
    let resolve!: () => void
    const onPublish = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    renderWithOnu(<PublishBox status="draft" onPublish={onPublish} onSaveDraft={() => {}} />)
    const button = screen.getByRole("button", { name: "Publish" })
    await userEvent.click(button)
    expect(button).toBeDisabled()
    expect(screen.getByRole("button", { name: "Save draft" })).toBeDisabled()
    expect(button.querySelector("[data-icon-name=loading]")).toBeInTheDocument()
    resolve()
    await vi.waitFor(() => expect(button).toBeEnabled())
  })

  it("edits status, visibility and the publish date", async () => {
    const user = userEvent.setup()
    const onStatusChange = vi.fn()
    const onPublishAtChange = vi.fn()
    renderWithOnu(
      <PublishBox
        status="draft"
        onStatusChange={onStatusChange}
        visibility="public"
        onVisibilityChange={() => {}}
        publishAt={new Date(2026, 2, 20, 9, 30)}
        onPublishAtChange={onPublishAtChange}
        onPreview={() => {}}
        busy="draft"
      />,
    )
    const date = screen.getByLabelText("Publish on")
    expect(date).toHaveValue("2026-03-20T09:30")
    await user.clear(date)
    expect(onPublishAtChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Draft")
    expect(screen.getByRole("combobox", { name: "Visibility" })).toHaveTextContent("Public")
    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument()
  })

  it("accepts a custom date input and status map", () => {
    renderWithOnu(
      <PublishBox
        status="archived"
        statusMap={{ archived: { tone: "neutral", label: "Archived" } }}
        onPublishAtChange={() => {}}
        renderDateInput={({ id }) => <input id={id} data-testid="custom-date" />}
        title="Status"
      />,
    )
    expect(screen.getByText("Archived")).toBeInTheDocument()
    expect(screen.getByTestId("custom-date")).toBeInTheDocument()
  })

  it.each(directions)("is accessible in %s (dv)", async (dir) => {
    const { container } = renderWithOnu(
      <PublishBox
        status="draft"
        visibility="public"
        onSaveDraft={() => {}}
        onPublish={() => {}}
        onPublishAtChange={() => {}}
      />,
      { dir, locale: "dv" },
    )
    expect(screen.getByRole("button", { name: "ޝާއިޢުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations(container)
  })
})
