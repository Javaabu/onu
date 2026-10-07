import * as React from "react"
import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { AdditionalFilesUpload, type AdditionalFilesValue, type ExistingAttachment } from "./additional-files-upload"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const user = () => userEvent.setup({ applyAccept: false })
const file = (name: string, size = 1024, type = "application/pdf") => new File([new Uint8Array(size)], name, { type })
const picker = (container: HTMLElement) => container.querySelector<HTMLInputElement>("input[type=file]:not([hidden])")!

const existing: ExistingAttachment[] = [
  { id: 1, name: "Lease agreement.pdf", url: "/files/1", size: 240_000, description: "Signed copy" },
  { id: 2, name: "Site photo.jpg", type: "image/jpeg", thumbnailUrl: "/thumbs/2.jpg" },
]

describe("AdditionalFilesUpload", () => {
  it("lists existing attachments with open and remove/restore", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<AdditionalFilesUpload existing={existing} onChange={onChange} name="files" />)
    expect(screen.getByRole("list", { name: "Attachments" })).toBeInTheDocument()
    expect(screen.getByText("Signed copy")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open Lease agreement.pdf" })).toHaveAttribute("href", "/files/1")
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await user().click(screen.getByRole("button", { name: "Remove Lease agreement.pdf" }))
    act(() => vi.runAllTimers())
    vi.useRealTimers()
    expect(onChange).toHaveBeenLastCalledWith({ removed: [1], added: [] })
    expect(screen.getByText("Will be removed")).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Lease agreement.pdf will be removed when you save")
    const restore = screen.getByRole("button", { name: "Restore Lease agreement.pdf" })
    expect(restore).toHaveFocus()
    expect(container.querySelector<HTMLInputElement>("input[name='files[removed][]']")?.value).toBe("1")
    await user().click(restore)
    expect(onChange).toHaveBeenLastCalledWith({ removed: [], added: [] })
    expect(screen.getByRole("status")).toHaveTextContent("Lease agreement.pdf restored")
    await expectNoA11yViolations()
  })

  it("adds new files with a name and description (Thaana-capable)", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <AdditionalFilesUpload onChange={onChange} thaana name="docs" aria-label="Add supporting documents" />,
    )
    expect(screen.getByText("No attachments yet")).toBeInTheDocument()
    await user().upload(screen.getByLabelText("Add supporting documents"), [file("id-card.pdf"), file("photo.pdf")])
    expect(screen.getByRole("status")).toHaveTextContent("2 files added")
    const names = screen.getAllByLabelText("Display name")
    expect(names[0]).toHaveValue("id-card")
    expect(names[0]).toHaveAttribute("lang", "dv")
    expect(names[0]).toHaveAttribute("name", "docs[added][0][name]")
    await user().type(screen.getAllByLabelText("Description")[0]!, "x")
    const last = onChange.mock.calls.at(-1)![0] as AdditionalFilesValue
    expect(last.added[0]!.description).not.toBe("")
    expect(container.querySelector("input[type=file][name='docs[added][1][file]']")).toBeInTheDocument()
    expect(screen.getByText("2 attachments")).toBeInTheDocument()
    await user().click(screen.getByRole("button", { name: "Remove photo.pdf" }))
    expect(picker(container)).toHaveFocus()
    expect(screen.getByRole("status")).toHaveTextContent("photo.pdf removed")
  })

  it("is controlled, respects maxFiles and can hide the fields", async () => {
    function Controlled() {
      const [value, setValue] = React.useState<AdditionalFilesValue>({ removed: [2], added: [] })
      return (
        <AdditionalFilesUpload
          existing={existing}
          value={value}
          onChange={setValue}
          maxFiles={2}
          withName={false}
          withDescription={false}
          classNames={{ list: "list-x", picker: "picker-x" }}
        />
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    expect(screen.getByText("1 of 2")).toBeInTheDocument()
    expect(container.querySelector(".list-x")).toBeInTheDocument()
    await user().upload(picker(container), [file("a.pdf"), file("b.pdf")])
    expect(screen.getByText("2 of 2")).toBeInTheDocument()
    expect(screen.queryByLabelText("Display name")).not.toBeInTheDocument()
    expect(picker(container)).toBeDisabled()
    expect(screen.getByText("b.pdf was not added: only 2 files are allowed.")).toBeInTheDocument()
  })

  it("disables every action when disabled", () => {
    renderWithOnu(<AdditionalFilesUpload existing={existing} disabled />)
    expect(screen.getByRole("button", { name: "Remove Lease agreement.pdf" })).toBeDisabled()
  })

  it.each(directions)("renders Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<AdditionalFilesUpload existing={existing} />, { locale: "dv", dir })
    expect(screen.getByRole("list", { name: "އެޓޭޗްމަންޓްތައް" })).toBeInTheDocument()
    expect(screen.getByText("ފައިލުތައް އިތުރުކުރޭ")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
