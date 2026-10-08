import * as React from "react"
import { act, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { DropzoneUploader, type DropzoneFile, type DropzoneUploaderProps } from "./dropzone-uploader"
import type { UploadContext } from "./file-utils"

vi.setConfig({ testTimeout: 20_000 })

const user = () => userEvent.setup({ applyAccept: false })
const file = (name: string, size = 2048, type = "application/pdf") => new File([new Uint8Array(size)], name, { type })
const fileInput = (container: HTMLElement) => container.querySelector<HTMLInputElement>("input[type=file]")!
const hiddenValues = (container: HTMLElement, name: string) =>
  Array.from(container.querySelectorAll<HTMLInputElement>(`input[type=hidden][name='${name}']`)).map((i) => i.value)

const permit: DropzoneFile = {
  id: 11,
  name: "permit-hulhumale.pdf",
  size: 120_000,
  type: "application/pdf",
  url: "/files/11",
}
const photo: DropzoneFile = {
  id: "22",
  name: "site-photo.jpg",
  type: "image/jpeg",
  thumbnailUrl: "/thumbs/22.jpg",
}

function controllableUploader() {
  const calls: { file: File; resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = []
  const upload = vi.fn(
    (f: File, ctx: UploadContext) =>
      new Promise((resolve, reject) => {
        calls.push({ file: f, resolve, reject })
        ctx.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
      }),
  )
  return { upload, calls }
}

/** A parent that keeps the value in state, like an edit form. */
function Controlled({
  initial,
  onValueChange,
  ...props
}: Omit<DropzoneUploaderProps, "value" | "onValueChange"> & {
  initial: DropzoneFile[]
  onValueChange?: (v: DropzoneFile[]) => void
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <>
      <DropzoneUploader
        {...props}
        value={value}
        onValueChange={(next) => {
          onValueChange?.(next)
          setValue(next)
        }}
      />
      <button type="button" onClick={() => setValue([])}>
        Clear all
      </button>
    </>
  )
}

describe("DropzoneUploader value", () => {
  it("shows already-uploaded files from defaultValue and removes them (uncontrolled)", async () => {
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(
      <DropzoneUploader name="documents" defaultValue={[permit, photo]} onValueChange={onValueChange} />,
    )
    const list = screen.getByRole("list", { name: "Selected files" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
    expect(within(list).getByRole("link", { name: "Open permit-hulhumale.pdf" })).toHaveAttribute("href", "/files/11")
    expect(list.querySelector("img")).toHaveAttribute("src", "/thumbs/22.jpg")
    expect(hiddenValues(container, "documents[]")).toEqual(["11", "22"])

    await userEvent.click(screen.getByRole("button", { name: "Remove permit-hulhumale.pdf" }))
    expect(onValueChange).toHaveBeenLastCalledWith([photo])
    expect(screen.queryByText("permit-hulhumale.pdf")).not.toBeInTheDocument()
    expect(hiddenValues(container, "documents[]")).toEqual(["22"])
    expect(screen.getByRole("button", { name: "Browse files" })).toHaveFocus()
    expect(screen.getByText("permit-hulhumale.pdf removed")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("adds picked files to a controlled value next to existing ones", async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <Controlled initial={[permit]} onValueChange={onValueChange} onChange={onChange} maxFiles={3} />,
    )
    const receipt = file("receipt.pdf")
    await user().upload(fileInput(container), [receipt])
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith([permit, expect.any(File)]))
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "receipt.pdf" })])
    expect(screen.getByText("receipt.pdf")).toBeInTheDocument()
    // Picking the same file again is ignored; existing files count toward maxFiles.
    await user().upload(fileInput(container), [receipt, file("a.pdf"), file("b.pdf")])
    await waitFor(() => expect(screen.getByText("b.pdf was not added: only 3 files are allowed.")).toBeInTheDocument())
    expect(onValueChange).toHaveBeenLastCalledWith([
      permit,
      expect.any(File),
      expect.objectContaining({ name: "a.pdf" }),
    ])

    await userEvent.click(screen.getByRole("button", { name: "Remove receipt.pdf" }))
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "a.pdf" })])
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }))
    expect(screen.queryByRole("list", { name: "Selected files" })).not.toBeInTheDocument()
  })

  it("is fully controlled: the parent decides what is shown", async () => {
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(<DropzoneUploader value={[permit]} onValueChange={onValueChange} />)
    await user().upload(fileInput(container), [file("new.pdf")])
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith([permit, expect.any(File)]))
    expect(screen.queryByText("new.pdf")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove permit-hulhumale.pdf" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(screen.getByText("permit-hulhumale.pdf")).toBeInTheDocument()
  })

  it("adds finished uploads to the value and keeps existing files", async () => {
    const { upload, calls } = controllableUploader()
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(
      <Controlled upload={upload} name="documents" initial={[permit]} onValueChange={onValueChange} />,
    )
    const stored = screen.getByRole("list", { name: "Attachments" })
    expect(within(stored).getByText("permit-hulhumale.pdf")).toBeInTheDocument()
    expect(hiddenValues(container, "documents[]")).toEqual(["11"])

    await user().upload(fileInput(container), [file("slip.pdf"), file("form.pdf")])
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
    // Both finish in the same tick: both are added.
    await act(async () => {
      calls[0]!.resolve({ id: 31 })
      calls[1]!.resolve({ data: { id: 32 } })
    })
    expect(onValueChange).toHaveBeenLastCalledWith([
      permit,
      expect.objectContaining({
        id: "31",
        name: "slip.pdf",
        size: 2048,
        type: "application/pdf",
        response: { id: 31 },
      }),
      expect.objectContaining({ id: "32", name: "form.pdf" }),
    ])
    expect(hiddenValues(container, "documents[]")).toEqual(["11", "31", "32"])
    // Finished uploads stay in the upload list, not twice.
    const uploads = screen.getByRole("list", { name: "Uploads" })
    expect(within(uploads).getAllByText("Uploaded")).toHaveLength(2)
    expect(within(stored).queryByText("slip.pdf")).not.toBeInTheDocument()

    // Removing a finished upload removes it from the value.
    await userEvent.click(within(uploads).getByRole("button", { name: "Remove slip.pdf" }))
    expect(onValueChange).toHaveBeenLastCalledWith([permit, expect.objectContaining({ id: "32" })])
    expect(hiddenValues(container, "documents[]")).toEqual(["11", "32"])
    expect(screen.getByRole("button", { name: "Browse files" })).toHaveFocus()

    // The parent clearing the value clears the finished uploads too.
    await userEvent.click(screen.getByRole("button", { name: "Clear all" }))
    expect(screen.queryByText("form.pdf")).not.toBeInTheDocument()
    expect(screen.queryByText("permit-hulhumale.pdf")).not.toBeInTheDocument()
    expect(hiddenValues(container, "documents[]")).toEqual([])
  })

  it("replaces the file in single mode and skips uploads without a value", async () => {
    const { upload, calls } = controllableUploader()
    const onValueChange = vi.fn()
    const getValue = (r: unknown) => (r as { key?: string }).key
    const { container } = renderWithOnu(
      <DropzoneUploader
        upload={upload}
        multiple={false}
        name="avatar"
        getValue={getValue}
        defaultValue={[photo]}
        onValueChange={onValueChange}
      />,
    )
    expect(hiddenValues(container, "avatar")).toEqual(["22"])
    await user().upload(fileInput(container), [file("me.png", 10, "image/png")])
    await act(async () => calls[0]!.resolve({ key: "abc" }))
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: "abc", name: "me.png" })])
    expect(screen.queryByText("site-photo.jpg")).not.toBeInTheDocument()
    expect(hiddenValues(container, "avatar")).toEqual(["abc"])

    // A response without a value is uploaded but not added.
    await user().upload(fileInput(container), [file("other.png", 10, "image/png")])
    await act(async () => calls[1]!.resolve({}))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(screen.getByText("other.png")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove other.png" }))
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it("keeps the uncontrolled behaviour without value props", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<DropzoneUploader onChange={onChange} />)
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
    await user().upload(fileInput(container), [file("a.pdf")])
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "a.pdf" })]))
    expect(container.querySelector("input[type=hidden]")).toBeNull()
  })

  it("disables removing while disabled", () => {
    renderWithOnu(<DropzoneUploader disabled defaultValue={[permit]} />)
    expect(screen.getByRole("button", { name: "Remove permit-hulhumale.pdf" })).toBeDisabled()
  })

  it.each(directions)("shows existing files in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<DropzoneUploader defaultValue={[{ id: 1, name: "ހުއްދަ.pdf", size: 2048 }]} />, {
      locale: "dv",
      dir,
    })
    expect(screen.getByText("ހުއްދަ.pdf")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /ހުއްދަ\.pdf/ })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
