import * as React from "react"
import { fireEvent, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { FileIcon } from "./file-icon"
import { FileInput, MultipleFileInput } from "./file-input"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const user = () => userEvent.setup({ applyAccept: false })
const file = (name: string, size = 1024, type = "application/pdf") => new File([new Uint8Array(size)], name, { type })
const input = (container: HTMLElement) => container.querySelector<HTMLInputElement>("input[type=file]")!

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

describe("MultipleFileInput", () => {
  it("adds to the selection, skips duplicates and enforces maxFiles", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(
      <MultipleFileInput aria-label="Documents" maxFiles={2} maxSize={1024 * 1024} onChange={onChange} />,
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

  it("is FileInput with append and showLimits", async () => {
    const { container } = renderWithOnu(<FileInput aria-label="Documents" append showLimits maxFiles={1} />)
    expect(screen.getByText("0 of 1")).toBeInTheDocument()
    await user().upload(input(container), file("a.pdf"))
    expect(screen.getByText("1 of 1")).toBeInTheDocument()
    expect(input(container)).toBeDisabled()
  })

  it("can hide the limits", () => {
    renderWithOnu(<MultipleFileInput aria-label="Documents" showLimits={false} maxFiles={3} />)
    expect(screen.queryByText("0 of 3")).not.toBeInTheDocument()
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
