import * as React from "react"
import { act, fireEvent, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { FileIcon } from "./file-icon"
import { defaultUploadValue, FileInput, type FileInputEntry, type FileInputProps } from "./file-input"
import { UploadError, type UploadContext } from "./file-utils"
import { UploadProgress } from "./upload-progress"
import { useUploadQueue } from "./use-files"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const user = () => userEvent.setup({ applyAccept: false })
const file = (name: string, size = 1024, type = "application/pdf") => new File([new Uint8Array(size)], name, { type })
const input = (container: HTMLElement) => container.querySelector<HTMLInputElement>("input[type=file]")!
const trigger = (container: HTMLElement) => container.querySelector<HTMLElement>("[data-slot=file-input-trigger]")!
const hiddenValues = (container: HTMLElement, name: string) =>
  Array.from(container.querySelectorAll<HTMLInputElement>(`input[type=hidden][name='${name}']`)).map((i) => i.value)
const filesData = (files: File[]) => ({ files, types: ["Files"] })

const permit: FileInputEntry = {
  id: 11,
  name: "permit-hulhumale.pdf",
  size: 120_000,
  type: "application/pdf",
  url: "/files/11",
}
const photo: FileInputEntry = {
  id: "22",
  name: "site-photo.jpg",
  type: "image/jpeg",
  thumbnailUrl: "/thumbs/22.jpg",
}

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

/** A parent that keeps the value in state, like an edit form. */
function Controlled({
  initial,
  onValueChange,
  ...props
}: Omit<FileInputProps, "value" | "onValueChange"> & {
  initial: FileInputEntry[]
  onValueChange?: (v: FileInputEntry[]) => void
}) {
  const [value, setValue] = React.useState(initial)
  return (
    <>
      <FileInput
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

describe("FileInput", () => {
  it("is a labelled native file input with a summary", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<FileInput aria-label="Passport copy" onChange={onChange} className="extra" />)
    const el = screen.getByLabelText("Passport copy")
    expect(el).toHaveAttribute("type", "file")
    expect(screen.getByText("Choose file")).toBeInTheDocument()
    expect(screen.getByText("No file chosen")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=file-input]")).toHaveClass("extra")
    await user().upload(el, file("passport.pdf"))
    expect(onChange).toHaveBeenCalledWith([expect.any(File)])
    expect(screen.getAllByText("passport.pdf").length).toBeGreaterThan(0)
    expect(screen.getByRole("list", { name: "Selected files" })).toBeInTheDocument()
    expect(screen.getByText("1 KB")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("replaces the selection in single mode and keeps it when the picker is cancelled", async () => {
    const { container } = renderWithOnu(<FileInput aria-label="Doc" />)
    await user().upload(input(container), file("a.pdf"))
    await user().upload(input(container), file("b.pdf"))
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument()
    fireEvent.change(input(container), { target: { files: [] } })
    expect(screen.getAllByText("b.pdf").length).toBeGreaterThan(0)
  })

  it("validates type and size with translated messages", async () => {
    const onReject = vi.fn()
    const { container } = renderWithOnu(
      <FileInput aria-label="Doc" accept=".pdf" maxSize={2048} minSize={10} onReject={onReject} />,
    )
    await user().upload(input(container), file("photo.png", 100, "image/png"))
    expect(screen.getByText("photo.png is not an accepted file type.")).toBeInTheDocument()
    await user().upload(input(container), file("huge.pdf", 5000))
    expect(screen.getByText("huge.pdf is larger than 2 KB.")).toBeInTheDocument()
    await user().upload(input(container), file("tiny.pdf", 1))
    expect(screen.getByText("tiny.pdf is smaller than 10 B.")).toBeInTheDocument()
    expect(onReject).toHaveBeenCalledTimes(3)
    expect(input(container).getAttribute("aria-describedby")).toContain(
      screen.getByText("tiny.pdf is smaller than 10 B.").closest("[aria-live]")!.id,
    )
    expect(screen.getByText("No file chosen")).toBeInTheDocument()
  })

  it("is controlled", async () => {
    function Controlled() {
      const [files, setFiles] = React.useState<File[]>([file("existing.pdf")])
      return (
        <>
          <FileInput aria-label="Doc" multiple value={files} onChange={setFiles} />
          <output>{files.length}</output>
        </>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    expect(screen.getByText("existing.pdf", { selector: "[data-slot=file-row] bdi" })).toBeInTheDocument()
    await user().upload(input(container), [file("a.pdf"), file("b.pdf")])
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("2 files selected")).toBeInTheDocument()
  })

  it("removes files with the keyboard and returns focus to the input", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <FileInput aria-label="Doc" defaultValue={[file("a.pdf"), file("b.pdf")]} multiple onChange={onChange} />,
    )
    const remove = screen.getByRole("button", { name: "Remove a.pdf" })
    remove.focus()
    await userEvent.keyboard("{Enter}")
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "b.pdf" })])
    expect(input(container)).toHaveFocus()
  })

  it("is wired to a FormField and can be disabled", () => {
    renderWithOnu(
      <FormField label="Attachment" name="attachment" error="Required" required>
        <FileInput size="lg" />
      </FormField>,
    )
    const el = screen.getByLabelText(/Attachment/)
    expect(el).toHaveAttribute("name", "attachment")
    expect(el).toHaveAttribute("aria-invalid", "true")
    expect(el).toBeRequired()
  })

  it("supports custom labels, pickDisabled and slot classes", () => {
    const { container } = renderWithOnu(
      <FileInput
        aria-label="Doc"
        buttonLabel="Browse"
        placeholder="Nothing yet"
        pickDisabled
        classNames={{ root: "r", trigger: "t", button: "b", summary: "s" }}
      />,
    )
    expect(screen.getByText("Browse")).toHaveClass("b")
    expect(screen.getByText("Nothing yet").parentElement).toHaveClass("s")
    expect(container.querySelector(".r .t")).toBeInTheDocument()
    expect(input(container)).toBeDisabled()
  })

  it("hides the list when showList is false", async () => {
    const { container } = renderWithOnu(<FileInput aria-label="Doc" showList={false} />)
    await user().upload(input(container), file("a.pdf"))
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
  })

  it.each(directions)("renders Dhivehi strings in %s", async (dir) => {
    const { container } = renderWithOnu(<FileInput aria-label="ފައިލް" multiple />, { locale: "dv", dir })
    expect(screen.getByText("ފައިލުތައް ހޮވާ")).toBeInTheDocument()
    await user().upload(input(container), [file("a.pdf"), file("b.pdf")])
    expect(screen.getByText("2 ފައިލް ހޮވިއްޖެ")).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("FileInput append and showLimits", () => {
  it("adds to the selection, skips duplicates and enforces maxFiles", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <FileInput append showLimits aria-label="Documents" maxFiles={2} maxSize={1024 * 1024} onChange={onChange} />,
    )
    expect(screen.getByText("Up to 2 files · 1 MB max each")).toBeInTheDocument()
    expect(screen.getByText("0 of 2")).toBeInTheDocument()
    const a = file("a.pdf")
    await user().upload(input(container), a)
    await user().upload(input(container), [a, file("b.pdf"), file("c.pdf")])
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: "a.pdf" }),
      expect.objectContaining({ name: "b.pdf" }),
    ])
    expect(screen.getByText("c.pdf was not added: only 2 files are allowed.")).toBeInTheDocument()
    expect(screen.getByText("2 of 2")).toBeInTheDocument()
    expect(input(container)).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(input(container)).not.toBeDisabled()
    await expectNoA11yViolations()
  })

  it("stops picking once maxFiles is reached", async () => {
    const { container } = renderWithOnu(<FileInput aria-label="Documents" append showLimits maxFiles={1} />)
    expect(screen.getByText("0 of 1")).toBeInTheDocument()
    await user().upload(input(container), file("a.pdf"))
    expect(screen.getByText("1 of 1")).toBeInTheDocument()
    expect(input(container)).toBeDisabled()
  })

  it("hides the limits without showLimits", () => {
    renderWithOnu(<FileInput append aria-label="Documents" maxFiles={3} />)
    expect(screen.queryByText("0 of 3")).not.toBeInTheDocument()
  })
})

describe("FileInput appearance=dropzone", () => {
  it("is named by its button, takes the keyboard and collects files without an uploader", async () => {
    const onChange = vi.fn()
    const onFilesAdded = vi.fn()
    const { container } = renderWithOnu(
      <FileInput
        appearance="dropzone"
        multiple
        onChange={onChange}
        onFilesAdded={onFilesAdded}
        accept=".pdf"
        className="extra"
      />,
    )
    expect(container.querySelector("[data-slot=file-input]")).toHaveClass("extra")
    expect(container.querySelector("[data-slot=file-input]")).toHaveAttribute("data-appearance", "dropzone")
    const el = screen.getByLabelText("Browse files")
    expect(el).toBe(input(container))
    expect(el).toHaveAccessibleDescription("or browse your device. You can also paste from the clipboard.")
    expect(screen.getByText("Drag and drop files here")).toBeInTheDocument()
    await userEvent.tab()
    expect(el).toHaveFocus()
    await user().upload(el, [file("a.pdf"), file("b.png", 10, "image/png")])
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "a.pdf" })])
    expect(onFilesAdded).toHaveBeenCalled()
    expect(screen.getByText("b.png is not an accepted file type.")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(onChange).toHaveBeenLastCalledWith([])
    expect(el).toHaveFocus()
    expect(screen.getByText("a.pdf removed")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("accepts dropped files and shows the drag state", async () => {
    const { container } = renderWithOnu(<FileInput appearance="dropzone" />)
    const zone = trigger(container)
    const dropped = file("drop.pdf")
    fireEvent.dragEnter(zone, { dataTransfer: filesData([dropped]) })
    expect(zone).toHaveAttribute("data-drag-active")
    expect(screen.getByText("Drop to upload")).toBeInTheDocument()
    fireEvent.dragLeave(zone, { relatedTarget: null })
    expect(zone).not.toHaveAttribute("data-drag-active")
    fireEvent.dragOver(zone, { dataTransfer: filesData([dropped]) })
    expect(fireEvent.drop(zone, { dataTransfer: filesData([dropped]) })).toBe(false)
    expect(zone).not.toHaveAttribute("data-drag-active")
    expect(screen.getByText("drop.pdf")).toBeInTheDocument()
    expect(screen.getByLabelText("Browse file")).toBe(input(container))
    // A file dropped next to the zone does not replace the page.
    expect(fireEvent.drop(document.body, { dataTransfer: filesData([dropped]) })).toBe(false)
  })

  it("accepts pasted files on the field and, optionally, the document", async () => {
    const onFilesAdded = vi.fn()
    const { container, rerender } = renderWithOnu(
      <FileInput appearance="dropzone" multiple onFilesAdded={onFilesAdded} />,
    )
    const zone = trigger(container)
    fireEvent.paste(input(container), { clipboardData: { files: [file("pasted.png", 10, "image/png")] } })
    expect(onFilesAdded).toHaveBeenCalledTimes(1)
    expect(screen.getByText("pasted.png")).toBeInTheDocument()
    fireEvent.paste(zone, { clipboardData: { files: [], types: ["text/plain"] } })
    expect(onFilesAdded).toHaveBeenCalledTimes(1)
    const paste = (target: EventTarget, files: File[]) => {
      const event = new Event("paste", { bubbles: true, cancelable: true }) as ClipboardEvent
      Object.defineProperty(event, "clipboardData", { value: { files, types: [], items: [] } })
      act(() => {
        target.dispatchEvent(event)
      })
    }
    paste(document, [file("doc.png", 10, "image/png")])
    expect(onFilesAdded).toHaveBeenCalledTimes(1)
    rerender(<FileInput appearance="dropzone" multiple onFilesAdded={onFilesAdded} pasteFromDocument />)
    paste(document, [file("doc.png", 10, "image/png")])
    expect(onFilesAdded).toHaveBeenCalledTimes(2)
    paste(document, [])
    // A paste inside the field is taken once, not again by the document listener.
    paste(zone, [file("inside.png", 10, "image/png")])
    expect(onFilesAdded).toHaveBeenCalledTimes(3)
  })

  it("uploads with progress when given an uploader, and enforces maxFiles", async () => {
    const { upload, calls } = controllableUploader()
    const onReject = vi.fn()
    const { container } = renderWithOnu(
      <FileInput
        appearance="dropzone"
        multiple
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
    expect(input(container)).toHaveAccessibleDescription("PDF only")
    await user().upload(input(container), [file("a.pdf"), file("b.pdf")])
    expect(upload).toHaveBeenCalledTimes(1)
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ code: "too-many-files" })])
    // The limit is reached: picking stops until a file is removed.
    expect(input(container)).toBeDisabled()
    await act(async () => calls[0]!.resolve({ id: 9 }))
    expect(container.querySelector<HTMLInputElement>("input[name='files[]']")?.value).toBe("9")
    expect(input(container)).not.toHaveAttribute("name")
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(screen.queryByRole("list", { name: "Uploads" })).not.toBeInTheDocument()
    expect(input(container)).not.toBeDisabled()
    expect(input(container)).toHaveFocus()
  })

  it("wires to a FormField and respects disabled", async () => {
    const onFilesAdded = vi.fn()
    const { container } = renderWithOnu(
      <FormField label="Slips" error="Required" disabled>
        <FileInput appearance="dropzone" onFilesAdded={onFilesAdded} />
      </FormField>,
    )
    const el = screen.getByLabelText(/Slips/)
    expect(el).toBe(input(container))
    expect(el).toBeDisabled()
    expect(el).toHaveAttribute("aria-invalid", "true")
    fireEvent.paste(trigger(container), { clipboardData: { files: [file("x.pdf")] } })
    fireEvent.drop(trigger(container), { dataTransfer: filesData([file("x.pdf")]) })
    expect(onFilesAdded).not.toHaveBeenCalled()
  })

  it.each(directions)("renders Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<FileInput appearance="dropzone" multiple />, { locale: "dv", dir })
    expect(screen.getByLabelText("ފައިލުތައް ހޯދާ")).toHaveAttribute("type", "file")
    await expectNoA11yViolations()
  })
})

describe("FileInput value with stored files", () => {
  it("shows already-uploaded files from defaultValue and removes them (uncontrolled)", async () => {
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(
      <FileInput
        appearance="dropzone"
        multiple
        name="documents"
        required
        defaultValue={[permit, photo]}
        onValueChange={onValueChange}
      />,
    )
    const list = screen.getByRole("list", { name: "Selected files" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
    expect(within(list).getByRole("link", { name: "Open permit-hulhumale.pdf" })).toHaveAttribute("href", "/files/11")
    expect(list.querySelector("img")).toHaveAttribute("src", "/thumbs/22.jpg")
    expect(hiddenValues(container, "documents[]")).toEqual(["11", "22"])
    // Stored files are not on the input, so it is not required.
    expect(input(container)).not.toHaveAttribute("required")

    await userEvent.click(screen.getByRole("button", { name: "Remove permit-hulhumale.pdf" }))
    expect(onValueChange).toHaveBeenLastCalledWith([photo])
    expect(screen.queryByText("permit-hulhumale.pdf")).not.toBeInTheDocument()
    expect(hiddenValues(container, "documents[]")).toEqual(["22"])
    expect(input(container)).toHaveFocus()
    expect(screen.getByText("permit-hulhumale.pdf removed")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("adds picked files to a controlled value next to existing ones", async () => {
    const onValueChange = vi.fn()
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <Controlled
        appearance="dropzone"
        multiple
        initial={[permit]}
        onValueChange={onValueChange}
        onChange={onChange}
        maxFiles={3}
      />,
    )
    const receipt = file("receipt.pdf")
    await user().upload(input(container), [receipt])
    expect(onValueChange).toHaveBeenLastCalledWith([permit, expect.any(File)])
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "receipt.pdf" })])
    expect(screen.getByText("receipt.pdf")).toBeInTheDocument()
    // Picking the same file again is ignored; existing files count toward maxFiles.
    await user().upload(input(container), [receipt, file("a.pdf"), file("b.pdf")])
    expect(screen.getByText("b.pdf was not added: only 3 files are allowed.")).toBeInTheDocument()
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
    const { container } = renderWithOnu(
      <FileInput appearance="dropzone" multiple value={[permit]} onValueChange={onValueChange} />,
    )
    await user().upload(input(container), [file("new.pdf")])
    expect(onValueChange).toHaveBeenCalledWith([permit, expect.any(File)])
    expect(screen.queryByText("new.pdf")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove permit-hulhumale.pdf" }))
    expect(onValueChange).toHaveBeenLastCalledWith([])
    expect(screen.getByText("permit-hulhumale.pdf")).toBeInTheDocument()
  })

  it("adds finished uploads to the value and keeps existing files", async () => {
    const { upload, calls } = controllableUploader()
    const onValueChange = vi.fn()
    const { container } = renderWithOnu(
      <Controlled
        appearance="dropzone"
        multiple
        upload={upload}
        name="documents"
        initial={[permit]}
        onValueChange={onValueChange}
      />,
    )
    const stored = screen.getByRole("list", { name: "Attachments" })
    expect(within(stored).getByText("permit-hulhumale.pdf")).toBeInTheDocument()
    expect(hiddenValues(container, "documents[]")).toEqual(["11"])

    await user().upload(input(container), [file("slip.pdf", 2048), file("form.pdf")])
    expect(upload).toHaveBeenCalledTimes(2)
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
    expect(input(container)).toHaveFocus()

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
      <FileInput
        appearance="dropzone"
        upload={upload}
        name="avatar"
        getValue={getValue}
        defaultValue={[photo]}
        onValueChange={onValueChange}
      />,
    )
    expect(hiddenValues(container, "avatar")).toEqual(["22"])
    await user().upload(input(container), [file("me.png", 10, "image/png")])
    await act(async () => calls[0]!.resolve({ key: "abc" }))
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ id: "abc", name: "me.png" })])
    expect(screen.queryByText("site-photo.jpg")).not.toBeInTheDocument()
    expect(hiddenValues(container, "avatar")).toEqual(["abc"])

    // A response without a value is uploaded but not added.
    await user().upload(input(container), [file("other.png", 10, "image/png")])
    await act(async () => calls[1]!.resolve({}))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(screen.getByText("other.png")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remove other.png" }))
    expect(onValueChange).toHaveBeenCalledTimes(1)
  })

  it("keeps the uncontrolled behaviour without value props", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<FileInput appearance="dropzone" multiple onChange={onChange} />)
    expect(screen.queryByRole("list")).not.toBeInTheDocument()
    await user().upload(input(container), [file("a.pdf")])
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "a.pdf" })])
    expect(container.querySelector("input[type=hidden]")).toBeNull()
  })

  it("disables removing while disabled", () => {
    renderWithOnu(<FileInput appearance="dropzone" disabled defaultValue={[permit]} />)
    expect(screen.getByRole("button", { name: "Remove permit-hulhumale.pdf" })).toBeDisabled()
  })

  it.each(directions)("shows existing files in Dhivehi (%s)", async (dir) => {
    renderWithOnu(<FileInput appearance="dropzone" defaultValue={[{ id: 1, name: "ހުއްދަ.pdf", size: 2048 }]} />, {
      locale: "dv",
      dir,
    })
    expect(screen.getAllByText("ހުއްދަ.pdf").length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: /ހުއްދަ\.pdf/ })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("FileInput uploads", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("shares the value, uploads and hidden inputs with the compact trigger", async () => {
    const { upload, calls } = controllableUploader()
    const onValueChange = vi.fn()
    const inputRef = React.createRef<HTMLInputElement>()
    const { container } = renderWithOnu(
      <Controlled
        aria-label="Documents"
        buttonLabel="Pick"
        ref={inputRef}
        multiple
        upload={upload}
        name="documents"
        maxFiles={2}
        initial={[permit]}
        onValueChange={onValueChange}
      />,
    )
    expect(container.querySelector("[data-slot=file-input]")).toHaveAttribute("data-appearance", "input")
    expect(inputRef.current).toBe(input(container))
    expect(input(container)).toHaveAccessibleName("Documents")
    expect(input(container)).not.toHaveAttribute("name")
    expect(screen.getByText("Pick")).toBeInTheDocument()
    // Existing files are listed, summarised and submitted.
    expect(within(screen.getByRole("list", { name: "Attachments" })).getByText("permit-hulhumale.pdf")).toBeVisible()
    expect(screen.getByText("1 file uploaded")).toBeInTheDocument()
    expect(hiddenValues(container, "documents[]")).toEqual(["11"])

    // Existing files count toward maxFiles.
    await user().upload(input(container), [file("a.pdf"), file("b.pdf")])
    expect(screen.getByText("b.pdf was not added: only 2 files are allowed.")).toBeInTheDocument()
    expect(upload).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Uploading 1 file…")).toBeInTheDocument()
    expect(input(container)).toBeDisabled()
    await act(async () => calls[0]!.resolve({ id: 12 }))
    expect(onValueChange).toHaveBeenLastCalledWith([permit, expect.objectContaining({ id: "12", name: "a.pdf" })])
    expect(hiddenValues(container, "documents[]")).toEqual(["11", "12"])
    expect(screen.getByText("2 files uploaded")).toBeInTheDocument()

    // Removing announces the file and returns focus to the input.
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(hiddenValues(container, "documents[]")).toEqual(["11"])
    expect(input(container)).toHaveFocus()
    expect(screen.getByText("a.pdf removed")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("collects files without an uploader in append mode, skipping duplicates", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<FileInput append aria-label="Files" onChange={onChange} />)
    const a = file("a.pdf")
    await user().upload(input(container), [a])
    expect(onChange).toHaveBeenLastCalledWith([a])
    expect(input(container)).toHaveAccessibleDescription("a.pdf")
    await user().upload(input(container), [a, file("b.pdf")])
    expect(onChange).toHaveBeenLastCalledWith([a, expect.objectContaining({ name: "b.pdf" })])
    expect(screen.getByText("2 files selected")).toBeInTheDocument()
    expect(within(screen.getByRole("list", { name: "Selected files" })).getAllByRole("listitem")).toHaveLength(2)
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "b.pdf" })])
    expect(input(container)).toHaveFocus()
  })

  it("wires to a FormField and respects disabled", () => {
    renderWithOnu(
      <FormField label="Slip" error="Required" disabled required>
        <FileInput upload={vi.fn()} />
      </FormField>,
    )
    const el = screen.getByLabelText(/Slip/)
    expect(el).toBeDisabled()
    expect(el).toHaveAttribute("aria-invalid", "true")
    // Uploads are submitted as ids, so the empty input must not block the form.
    expect(el).not.toHaveAttribute("required")
    expect(el).toHaveAttribute("aria-required", "true")
  })

  it("uploads as soon as a file is chosen, shows progress and announces the result", async () => {
    const { upload, calls } = controllableUploader()
    const onUploaded = vi.fn()
    const onItemsChange = vi.fn()
    const { container } = renderWithOnu(
      <form aria-label="f">
        <FileInput
          aria-label="Transfer slip"
          name="slip"
          upload={upload}
          onUploaded={onUploaded}
          onItemsChange={onItemsChange}
        />
      </form>,
    )
    await user().upload(input(container), file("slip.pdf"))
    expect(upload).toHaveBeenCalledTimes(1)
    expect(input(container)).not.toHaveAttribute("name")
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
    expect(hiddenValues(container, "slip")).toEqual(["42"])
    await expectNoA11yViolations()

    // Single mode: another file replaces it once it is stored.
    expect(input(container)).not.toBeDisabled()
    await user().upload(input(container), file("slip-2.pdf"))
    expect(screen.getByText("slip.pdf")).toBeInTheDocument()
    await act(async () => calls[1]!.resolve({ id: 43 }))
    expect(screen.queryByText("slip.pdf")).not.toBeInTheDocument()
    expect(hiddenValues(container, "slip")).toEqual(["43"])
  })

  it("cancels, retries and removes uploads", async () => {
    const { upload, calls } = controllableUploader()
    const { container } = renderWithOnu(<FileInput multiple aria-label="Docs" upload={upload} />)
    await user().upload(input(container), [file("a.pdf"), file("b.pdf")])
    expect(upload).toHaveBeenCalledTimes(2)
    await userEvent.click(screen.getByRole("button", { name: "Cancel upload of a.pdf" }))
    expect(await screen.findByText("Cancelled")).toBeInTheDocument()
    expect(screen.getByText("Upload of a.pdf cancelled")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Retry upload of a.pdf" }))
    expect(upload).toHaveBeenCalledTimes(3)
    await act(async () => calls[2]!.resolve("ok"))
    await userEvent.click(screen.getByRole("button", { name: "Remove a.pdf" }))
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument()
    expect(input(container)).toHaveFocus()
    expect(screen.getByText("a.pdf removed")).toBeInTheDocument()
  })

  it("shows Laravel errors and calls onError", async () => {
    const { upload, calls } = controllableUploader()
    const onError = vi.fn()
    const { container } = renderWithOnu(<FileInput aria-label="Doc" upload={upload} onError={onError} />)
    await user().upload(input(container), file("a.pdf"))
    await act(async () => calls[0]!.reject(new UploadError("The file must be a PDF.", 422)))
    expect(screen.getByText("The file must be a PDF.")).toBeInTheDocument()
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }), expect.any(UploadError))
    // Another file replaces the failed one.
    await user().upload(input(container), file("b.pdf"))
    expect(screen.queryByText("The file must be a PDF.")).not.toBeInTheDocument()
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
        <FileInput url="/api/uploads" uploadOptions={{ headers: { "X-CSRF-TOKEN": "t" } }} />
      </FormField>,
    )
    await user().upload(input(container), file("p.pdf"))
    await waitFor(() => expect(screen.getByText("Uploaded")).toBeInTheDocument())
    expect(sent[0]).toMatchObject({ url: "/api/uploads", headers: { "X-CSRF-TOKEN": "t" } })
    expect(container.querySelector<HTMLInputElement>("input[name=photo_id]")?.value).toBe("abc")
  })

  it("uses getValue and multiple hidden inputs", async () => {
    const { upload, calls } = controllableUploader()
    const { container } = renderWithOnu(
      <FileInput multiple aria-label="Docs" name="docs" upload={upload} getValue={(r) => (r as { key: string }).key} />,
    )
    await user().upload(input(container), [file("a.pdf"), file("b.pdf")])
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
      <FileInput
        aria-label="Permit"
        name="permit"
        upload={upload}
        value={[permit]}
        onValueChange={onValueChange}
        classNames={{ list: "uploads" }}
      />,
    )
    expect(screen.getByText("permit-hulhumale.pdf")).toBeInTheDocument()
    expect(hiddenValues(container, "permit")).toEqual(["11"])
    await user().upload(input(container), file("new.pdf"))
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

  it("takes files dropped on the compact trigger, and pasted while it has focus", async () => {
    const { upload } = controllableUploader()
    const { container } = renderWithOnu(<FileInput multiple aria-label="Doc" upload={upload} />)
    fireEvent.dragOver(trigger(container), { dataTransfer: filesData([file("x.pdf")]) })
    expect(trigger(container)).toHaveAttribute("data-drag-active")
    expect(fireEvent.drop(trigger(container), { dataTransfer: filesData([file("x.pdf")]) })).toBe(false)
    expect(upload).toHaveBeenCalledTimes(1)
    fireEvent.paste(input(container), { clipboardData: { files: [file("y.png", 10, "image/png")] } })
    expect(upload).toHaveBeenCalledTimes(2)
    // The compact trigger leaves drops elsewhere on the page alone.
    expect(fireEvent.drop(document.body, { dataTransfer: filesData([file("z.pdf")]) })).toBe(true)
  })

  it.each(directions)("works in Dhivehi (%s)", async (dir) => {
    const { upload } = controllableUploader()
    const { container } = renderWithOnu(
      <FileInput aria-label="ފައިލް" upload={upload} defaultValue={[{ id: 1, name: "ހުއްދަ.pdf", size: 2048 }]} />,
      { locale: "dv", dir },
    )
    expect(screen.getByText("ހުއްދަ.pdf")).toBeInTheDocument()
    await user().upload(input(container), file("a.pdf"))
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

describe("useUploadQueue (through FileInput)", () => {
  it("aborts in-flight uploads on unmount", async () => {
    const { upload, calls } = controllableUploader()
    const { container, unmount } = renderWithOnu(<FileInput aria-label="Doc" upload={upload} />)
    await user().upload(input(container), file("a.pdf"))
    unmount()
    expect(calls[0]!.ctx.signal.aborted).toBe(true)
  })

  it("clamps progress and keeps items queued without an uploader", async () => {
    const { upload, calls } = controllableUploader()
    const { container } = renderWithOnu(<FileInput aria-label="Doc" upload={upload} />)
    await user().upload(input(container), file("a.pdf"))
    act(() => calls[0]!.ctx.onProgress(150))
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100")
    renderWithOnu(<QueueOnly />)
    await userEvent.click(screen.getByRole("button", { name: "Add" }))
    expect(screen.getByText("Waiting…")).toBeInTheDocument()
  })
})

describe("FileIcon", () => {
  it("picks an icon and colour by type, and can be labelled", () => {
    const { container } = renderWithOnu(
      <>
        <FileIcon name="budget.xlsx" />
        <FileIcon type="application/pdf" size="lg" label="PDF" className="x" />
      </>,
    )
    const icons = container.querySelectorAll("[data-slot=file-icon]")
    expect(icons[0]).toHaveAttribute("data-kind", "spreadsheet")
    expect(icons[1]).toHaveAttribute("data-kind", "pdf")
    expect(icons[1]).toHaveClass("x", "size-12")
    expect(screen.getByRole("img", { name: "PDF" })).toBeInTheDocument()
  })
})
