import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { DropzoneUploader } from "./dropzone-uploader"
import type { UploadContext } from "./file-utils"
import { UploadProgress, UploadProgressItem } from "./upload-progress"
import type { UploadItem } from "./use-files"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const user = () => userEvent.setup({ applyAccept: false })
const file = (name: string, size = 2048, type = "application/pdf") => new File([new Uint8Array(size)], name, { type })
const fileInput = (container: HTMLElement) => container.querySelector<HTMLInputElement>("input[type=file]")!

/** An uploader whose calls can be resolved, rejected and inspected from the test. */
function controllableUploader() {
  const calls: { file: File; ctx: UploadContext; resolve: (v: unknown) => void; reject: (e: unknown) => void }[] = []
  const upload = vi.fn(
    (f: File, ctx: UploadContext) =>
      new Promise((resolve, reject) => {
        calls.push({ file: f, ctx, resolve, reject })
        ctx.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))
      }),
  )
  return { upload, calls }
}

describe("UploadProgressItem", () => {
  it.each([
    ["queued", "Waiting…"],
    ["uploading", "Uploading… 40%"],
    ["success", "Uploaded"],
    ["cancelled", "Cancelled"],
  ] as const)("shows the %s state", (status, text) => {
    renderWithOnu(
      <ul>
        <UploadProgressItem
          name="a.pdf"
          size={1024}
          progress={40}
          status={status}
          onCancel={vi.fn()}
          onRemove={vi.fn()}
        />
      </ul>,
    )
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it("shows errors with retry and remove, and a progress bar while busy", async () => {
    const onRetry = vi.fn()
    const onRemove = vi.fn()
    const { rerender } = renderWithOnu(
      <ul>
        <UploadProgressItem
          name="a.pdf"
          progress={0}
          status="error"
          error="Too big"
          onRetry={onRetry}
          onRemove={onRemove}
        />
      </ul>,
    )
    expect(screen.getByText("Too big")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Retry upload of a.pdf" }))
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(onRetry).toHaveBeenCalled()
    expect(onRemove).toHaveBeenCalled()
    rerender(
      <ul>
        <UploadProgressItem name="a.pdf" progress={0} status="error" />
      </ul>,
    )
    expect(screen.getByText("Upload failed")).toBeInTheDocument()
    rerender(
      <ul>
        <UploadProgressItem name="a.pdf" progress={30} status="uploading" classNames={{ progress: "p" }} />
      </ul>,
    )
    expect(screen.getByRole("progressbar", { name: "Upload progress for a.pdf" })).toHaveClass("p")
  })

  it("renders a list with an announcement region and nothing when empty", async () => {
    const items: UploadItem[] = [{ id: "1", file: file("a.pdf"), status: "uploading", progress: 10 }]
    const { container, rerender } = renderWithOnu(<UploadProgress items={items} announcement="Uploading a.pdf" />)
    expect(screen.getByRole("list", { name: "Uploads" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Uploading a.pdf")
    await expectNoA11yViolations()
    rerender(<UploadProgress items={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe("DropzoneUploader", () => {
  it("has a keyboard-operable browse button and collects files without an uploader", async () => {
    const onChange = vi.fn()
    const onFilesAdded = vi.fn()
    const { container } = renderWithOnu(
      <DropzoneUploader onChange={onChange} onFilesAdded={onFilesAdded} accept=".pdf" className="extra" />,
    )
    expect(container.querySelector("[data-slot=dropzone-uploader]")).toHaveClass("extra")
    const browse = screen.getByRole("button", { name: "Browse files" })
    const click = vi.spyOn(fileInput(container), "click")
    browse.focus()
    await userEvent.keyboard("{Enter}")
    expect(click).toHaveBeenCalled()
    await user().upload(fileInput(container), [file("a.pdf"), file("b.png", 10, "image/png")])
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "a.pdf" })]))
    expect(onFilesAdded).toHaveBeenCalled()
    expect(screen.getByText("b.png is not an accepted file type.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(onChange).toHaveBeenLastCalledWith([])
    await expectNoA11yViolations()
  })

  it("accepts dropped files and shows the drag state", async () => {
    const { container } = renderWithOnu(<DropzoneUploader multiple={false} />)
    const zone = container.querySelector("[data-slot=dropzone]")!
    const dropped = file("drop.pdf")
    const dataTransfer = {
      files: [dropped],
      items: [{ kind: "file", type: "application/pdf", getAsFile: () => dropped }],
      types: ["Files"],
    }
    fireEvent.dragEnter(zone, { dataTransfer })
    await waitFor(() => expect(zone).toHaveAttribute("data-drag-active"))
    expect(screen.getByText("Drop to upload")).toBeInTheDocument()
    fireEvent.drop(zone, { dataTransfer })
    expect(await screen.findByText("drop.pdf")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Browse file" })).toBeInTheDocument()
  })

  it("accepts pasted files on the zone and, optionally, the document", async () => {
    const onFilesAdded = vi.fn()
    const { container, rerender } = renderWithOnu(<DropzoneUploader onFilesAdded={onFilesAdded} />)
    const zone = container.querySelector("[data-slot=dropzone]")!
    const pasted = file("pasted.png", 10, "image/png")
    fireEvent.paste(zone, {
      clipboardData: {
        files: [pasted],
        types: ["Files"],
        items: [{ kind: "file", type: "image/png", getAsFile: () => pasted }],
      },
    })
    await waitFor(() => expect(onFilesAdded).toHaveBeenCalledTimes(1))
    fireEvent.paste(zone, { clipboardData: { files: [], types: ["text/plain"], items: [] } })
    rerender(<DropzoneUploader onFilesAdded={onFilesAdded} pasteFromDocument />)
    const paste = (target: EventTarget, files: File[]) => {
      const event = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent
      Object.defineProperty(event, "clipboardData", { value: { files, types: [], items: [] } })
      act(() => {
        target.dispatchEvent(event)
      })
    }
    paste(document, [file("doc.png", 10, "image/png")])
    expect(onFilesAdded).toHaveBeenCalledTimes(2)
    paste(document, [])
    // Pastes inside the zone are left to react-dropzone.
    paste(zone, [file("inside.png", 10, "image/png")])
    expect(onFilesAdded).toHaveBeenCalledTimes(2)
  })

  it("uploads with progress when given an uploader, and enforces maxFiles", async () => {
    const { upload, calls } = controllableUploader()
    const onReject = vi.fn()
    const { container } = renderWithOnu(
      <DropzoneUploader
        upload={upload}
        maxFiles={1}
        name="files"
        onReject={onReject}
        title="Drop slips"
        description="PDF only"
        size="lg"
      />,
    )
    expect(screen.getByText("Drop slips")).toBeInTheDocument()
    expect(screen.getByText("PDF only")).toBeInTheDocument()
    await user().upload(fileInput(container), [file("a.pdf"), file("b.pdf")])
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1))
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ code: "too-many-files" })])
    await act(async () => calls[0]!.resolve({ id: 9 }))
    expect(container.querySelector<HTMLInputElement>("input[name='files[]']")?.value).toBe("9")
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(screen.queryByRole("list", { name: "Uploads" })).not.toBeInTheDocument()
  })

  it("wires to a FormField and respects disabled", async () => {
    const onFilesAdded = vi.fn()
    const { container } = renderWithOnu(
      <FormField label="Slips" error="Required" disabled>
        <DropzoneUploader onFilesAdded={onFilesAdded} />
      </FormField>,
    )
    const browse = screen.getByRole("button", { name: /Slips/ })
    expect(browse).toBeDisabled()
    expect(browse).toHaveAttribute("aria-invalid", "true")
    expect(container.querySelector("[data-slot=dropzone]")).toHaveAttribute("data-disabled")
    fireEvent.paste(container.querySelector("[data-slot=dropzone]")!, { clipboardData: { files: [file("x.pdf")] } })
    expect(onFilesAdded).not.toHaveBeenCalled()
  })

  it.each(directions)("renders Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<DropzoneUploader />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ފައިލުތައް ހޯދާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
