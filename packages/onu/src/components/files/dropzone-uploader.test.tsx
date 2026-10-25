import * as React from "react"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import {
  defaultUploadValue,
  DropzoneUploader,
  InstantFileUpload,
  type DropzoneFile,
  type DropzoneUploaderProps,
} from "./dropzone-uploader"
import { UploadError, type UploadContext } from "./file-utils"
import { UploadProgress } from "./upload-progress"
import { useUploadQueue } from "./use-files"

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

describe("DropzoneUploader appearance=input", () => {
  it("renders a compact FileInput trigger with the same value, uploads and hidden inputs", async () => {
    const { upload, calls } = controllableUploader()
    const onValueChange = vi.fn()
    const inputRef = React.createRef<HTMLInputElement>()
    const { container } = renderWithOnu(
      <Controlled
        appearance="input"
        inputProps={{ "aria-label": "Documents", buttonLabel: "Pick" }}
        inputRef={inputRef}
        upload={upload}
        name="documents"
        maxFiles={2}
        initial={[permit]}
        onValueChange={onValueChange}
      />,
    )
    expect(container.querySelector("[data-slot=dropzone]")).toBeNull()
    expect(container.querySelector("[data-slot=instant-file-upload]")).toBeInTheDocument()
    expect(inputRef.current).toBe(fileInput(container))
    expect(fileInput(container)).toHaveAccessibleName("Documents")
    expect(fileInput(container)).toHaveAttribute("name", "")
    expect(screen.getByText("Pick")).toBeInTheDocument()
    // Existing files are listed, summarised and submitted.
    expect(within(screen.getByRole("list", { name: "Attachments" })).getByText("permit-hulhumale.pdf")).toBeVisible()
    expect(screen.getByText("1 file uploaded")).toBeInTheDocument()
    expect(hiddenValues(container, "documents[]")).toEqual(["11"])

    // Existing files count toward maxFiles.
    await user().upload(fileInput(container), [file("a.pdf"), file("b.pdf")])
    expect(screen.getByText("b.pdf was not added: only 2 files are allowed.")).toBeInTheDocument()
    expect(upload).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Uploading 1 file…")).toBeInTheDocument()
    await act(async () => calls[0]!.resolve({ id: 12 }))
    expect(onValueChange).toHaveBeenLastCalledWith([permit, expect.objectContaining({ id: "12", name: "a.pdf" })])
    expect(hiddenValues(container, "documents[]")).toEqual(["11", "12"])
    expect(screen.getByText("2 files uploaded")).toBeInTheDocument()

    // Removing returns focus to the input.
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(hiddenValues(container, "documents[]")).toEqual(["11"])
    expect(fileInput(container)).toHaveFocus()
    expect(screen.getByText("a.pdf removed")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("collects files without an uploader, skipping duplicates", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <DropzoneUploader appearance="input" inputProps={{ "aria-label": "Files" }} onChange={onChange} />,
    )
    const a = file("a.pdf")
    await user().upload(fileInput(container), [a])
    expect(onChange).toHaveBeenLastCalledWith([a])
    expect(fileInput(container)).toHaveAccessibleDescription("a.pdf")
    await user().upload(fileInput(container), [a, file("b.pdf")])
    expect(onChange).toHaveBeenLastCalledWith([a, expect.objectContaining({ name: "b.pdf" })])
    expect(screen.getByText("2 files selected")).toBeInTheDocument()
    expect(within(screen.getByRole("list", { name: "Selected files" })).getAllByRole("listitem")).toHaveLength(2)
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "b.pdf" })])
    expect(fileInput(container)).toHaveFocus()
  })

  it("wires to a FormField and respects disabled", () => {
    renderWithOnu(
      <FormField label="Slip" error="Required" disabled>
        <DropzoneUploader appearance="input" upload={vi.fn()} />
      </FormField>,
    )
    const input = screen.getByLabelText("Slip")
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute("aria-invalid", "true")
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    const { upload } = controllableUploader()
    const { container } = renderWithOnu(
      <DropzoneUploader
        appearance="input"
        multiple={false}
        inputProps={{ "aria-label": "ފައިލް" }}
        upload={upload}
        defaultValue={[{ id: 1, name: "ހުއްދަ.pdf", size: 2048 }]}
      />,
      { locale: "dv", dir },
    )
    expect(screen.getByText("ހުއްދަ.pdf")).toBeInTheDocument()
    await user().upload(fileInput(container), file("a.pdf"))
    expect(screen.getByText("1 ފައިލް އަޕްލޯޑުކުރަނީ…")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("InstantFileUpload", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("uploads as soon as a file is chosen, shows progress and announces the result", async () => {
    const { upload, calls } = controllableUploader()
    const onUploaded = vi.fn()
    const onItemsChange = vi.fn()
    const { container } = renderWithOnu(
      <form aria-label="f">
        <InstantFileUpload
          aria-label="Transfer slip"
          name="slip"
          upload={upload}
          onUploaded={onUploaded}
          onItemsChange={onItemsChange}
        />
      </form>,
    )
    expect(container.querySelector("[data-slot=instant-file-upload]")).toBeInTheDocument()
    await user().upload(fileInput(container), file("slip.pdf"))
    expect(upload).toHaveBeenCalledTimes(1)
    expect(fileInput(container)).toHaveAttribute("name", "")
    expect(screen.getByText("Uploading 1 file…")).toBeInTheDocument()
    act(() => calls[0]!.ctx.onProgress(55))
    expect(screen.getByText("Uploading… 55%")).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "55")
    await act(async () => calls[0]!.resolve({ data: { id: 42 } }))
    expect(screen.getByText("Uploaded")).toBeInTheDocument()
    expect(screen.getByText("1 file uploaded")).toBeInTheDocument()
    expect(screen.getByText("slip.pdf uploaded")).toBeInTheDocument()
    expect(onUploaded).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success", response: { data: { id: 42 } } }),
    )
    expect(onItemsChange).toHaveBeenCalled()
    expect(container.querySelector<HTMLInputElement>("input[type=hidden][name=slip]")?.value).toBe("42")
    // Single mode: one file at a time.
    expect(fileInput(container)).toBeDisabled()
    await expectNoA11yViolations()
  })

  it("cancels, retries and removes uploads", async () => {
    const { upload, calls } = controllableUploader()
    const { container } = renderWithOnu(<InstantFileUpload aria-label="Docs" multiple upload={upload} />)
    await user().upload(fileInput(container), [file("a.pdf"), file("b.pdf")])
    expect(upload).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByRole("button", { name: "Cancel upload of a.pdf" }))
    expect(await screen.findByText("Cancelled")).toBeInTheDocument()
    expect(screen.getByText("Upload of a.pdf cancelled")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Retry upload of a.pdf" }))
    expect(upload).toHaveBeenCalledTimes(3)
    await act(async () => calls[2]!.resolve("ok"))
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument()
    expect(fileInput(container)).toHaveFocus()
  })

  it("shows Laravel errors and calls onError", async () => {
    const { upload, calls } = controllableUploader()
    const onError = vi.fn()
    const { container } = renderWithOnu(<InstantFileUpload aria-label="Doc" upload={upload} onError={onError} />)
    await user().upload(fileInput(container), file("a.pdf"))
    await act(async () => calls[0]!.reject(new UploadError("The file must be a PDF.", 422)))
    expect(screen.getByText("The file must be a PDF.")).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }), expect.any(UploadError))
    // A failed upload frees the slot again.
    expect(fileInput(container)).not.toBeDisabled()
    await user().upload(fileInput(container), file("b.pdf"))
    await act(async () => calls[1]!.reject("weird"))
    expect(screen.getAllByText("Upload failed").length).toBe(1)
  })

  it("uses the built-in XHR uploader for a url", async () => {
    const sent: { url: string; headers: Record<string, string> }[] = []
    class Xhr {
      upload = {}
      headers: Record<string, string> = {}
      url = ""
      status = 200
      responseText = '{"id":"abc"}'
      onload?: () => void
      open(_m: string, url: string) {
        this.url = url
      }
      setRequestHeader(k: string, v: string) {
        this.headers[k] = v
      }
      send() {
        sent.push({ url: this.url, headers: this.headers })
        setTimeout(() => this.onload?.(), 0)
      }
      abort() {}
    }
    vi.stubGlobal("XMLHttpRequest", Xhr)
    const { container } = renderWithOnu(
      <FormField label="Photo" name="photo_id">
        <InstantFileUpload url="/api/uploads" uploadOptions={{ headers: { "X-CSRF-TOKEN": "t" } }} />
      </FormField>,
    )
    await user().upload(fileInput(container), file("p.pdf"))
    await waitFor(() => expect(screen.getByText("Uploaded")).toBeInTheDocument())
    expect(sent[0]).toMatchObject({ url: "/api/uploads", headers: { "X-CSRF-TOKEN": "t" } })
    expect(container.querySelector<HTMLInputElement>("input[name=photo_id]")?.value).toBe("abc")
  })

  it("uses getValue and multiple hidden inputs", async () => {
    const { upload, calls } = controllableUploader()
    const { container } = renderWithOnu(
      <InstantFileUpload
        aria-label="Docs"
        multiple
        name="docs"
        upload={upload}
        getValue={(r) => (r as { key: string }).key}
      />,
    )
    await user().upload(fileInput(container), [file("a.pdf"), file("b.pdf")])
    await act(async () => {
      calls[0]!.resolve({ key: "k1" })
      calls[1]!.resolve({})
    })
    const hidden = container.querySelectorAll<HTMLInputElement>("input[type=hidden]")
    expect(hidden).toHaveLength(1)
    expect(hidden[0]).toHaveAttribute("name", "docs[]")
  })

  it("takes a controlled value with existing files", async () => {
    const { upload, calls } = controllableUploader()
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(
      <InstantFileUpload
        aria-label="Permit"
        name="permit"
        upload={upload}
        value={[permit]}
        onValueChange={onValueChange}
        classNames={{ progress: "uploads" }}
      />,
    )
    expect(screen.getByText("permit-hulhumale.pdf")).toBeInTheDocument()
    expect(hiddenValues(container, "permit")).toEqual(["11"])
    await user().upload(fileInput(container), file("new.pdf"))
    expect(screen.getByRole("list", { name: "Uploads" })).toHaveClass("uploads")
    await act(async () => calls[0]!.resolve({ id: 13 }))
    // Single mode: a finished upload replaces the value.
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: "13", name: "new.pdf" })])
  })

  it("reads ids from common response shapes", () => {
    expect(defaultUploadValue({ id: 1 })).toBe("1")
    expect(defaultUploadValue({ uuid: "u" })).toBe("u")
    expect(defaultUploadValue({ data: { id: 5 } })).toBe("5")
    expect(defaultUploadValue("x")).toBe("x")
    expect(defaultUploadValue(null)).toBeUndefined()
    expect(defaultUploadValue(true)).toBeUndefined()
    expect(defaultUploadValue({})).toBeUndefined()
  })

  it("takes files dropped on the input", async () => {
    const { upload } = controllableUploader()
    const { container } = renderWithOnu(<InstantFileUpload aria-label="Doc" upload={upload} />)
    const event = fireEvent.drop(fileInput(container), { dataTransfer: { files: [file("x.pdf")], types: ["Files"] } })
    // react-dropzone must not cancel drops outside a drop zone; the native input handles them.
    expect(event).toBe(true)
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    const { upload } = controllableUploader()
    const { container } = renderWithOnu(<InstantFileUpload aria-label="ފައިލް" upload={upload} />, {
      locale: "dv",
      dir,
    })
    await user().upload(fileInput(container), file("a.pdf"))
    expect(screen.getByText("1 ފައިލް އަޕްލޯޑުކުރަނީ…")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

function QueueOnly() {
  const queue = useUploadQueue({})
  return (
    <>
      <button type="button" onClick={() => queue.add([file("b.pdf")])}>
        Add
      </button>
      <UploadProgress items={queue.items} />
    </>
  )
}

describe("useUploadQueue (through InstantFileUpload)", () => {
  it("aborts in-flight uploads on unmount", async () => {
    const { upload, calls } = controllableUploader()
    const { container, unmount } = renderWithOnu(<InstantFileUpload aria-label="Doc" upload={upload} />)
    await user().upload(fileInput(container), file("a.pdf"))
    unmount()
    expect(calls[0]!.ctx.signal.aborted).toBe(true)
  })

  it("clamps progress and keeps items queued without an uploader", async () => {
    const { upload, calls } = controllableUploader()
    const { container } = renderWithOnu(<InstantFileUpload aria-label="Doc" upload={upload} />)
    await user().upload(fileInput(container), file("a.pdf"))
    act(() => calls[0]!.ctx.onProgress(150))
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100")
    renderWithOnu(<QueueOnly />)
    await userEvent.click(screen.getByRole("button", { name: "Add" }))
    expect(screen.getByText("Waiting…")).toBeInTheDocument()
  })
})
