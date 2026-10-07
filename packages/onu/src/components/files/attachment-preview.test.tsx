import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { AttachmentPreview } from "./attachment-preview"
import { DocumentDownload } from "./document-download"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

describe("AttachmentPreview", () => {
  it("shows an image thumbnail, size and actions, and previews it in a dialog", async () => {
    const onRemove = vi.fn()
    renderWithOnu(
      <AttachmentPreview
        name="beach.jpg"
        url="/media/beach.jpg"
        size={1_048_576}
        onRemove={onRemove}
        alt="Bikini beach"
      />,
    )
    expect(screen.getByRole("img", { name: "Bikini beach" })).toHaveAttribute("loading", "lazy")
    expect(screen.getByText("JPG")).toHaveAttribute("dir", "ltr")
    expect(screen.getByText("1 MB")).toHaveAttribute("dir", "ltr")
    expect(screen.getByRole("link", { name: "Download beach.jpg" })).toHaveAttribute("download", "beach.jpg")
    const preview = screen.getByRole("button", { name: "Preview beach.jpg" })
    await userEvent.click(preview)
    const dialog = screen.getByRole("dialog", { name: "beach.jpg" })
    expect(within(dialog).getByRole("img", { name: "Bikini beach" })).toBeInTheDocument()
    await expectNoA11yViolations()
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(preview).toHaveFocus()
    await userEvent.click(screen.getByRole("button", { name: "Remove beach.jpg" }))
    expect(onRemove).toHaveBeenCalled()
  })

  it("previews PDFs in an iframe and closes with Escape", async () => {
    renderWithOnu(<AttachmentPreview name="Gazette.pdf" url="/files/gazette.pdf" downloadUrl="/dl/gazette" />)
    expect(document.querySelector("[data-kind=pdf]")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Preview Gazette.pdf" }))
    expect(document.querySelector("iframe")).toHaveAttribute("src", "/files/gazette.pdf")
    expect(within(screen.getByRole("dialog")).getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "/dl/gazette",
    )
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("opens other files in a new tab and supports the card variant", () => {
    const { container } = renderWithOnu(
      <>
        <AttachmentPreview name="budget.xlsx" url="/files/budget.xlsx" variant="card" className="card-x" />
        <AttachmentPreview name="photo" url="/files/photo.png" variant="card" preview={false} />
        <AttachmentPreview name="notes.txt" />
      </>,
    )
    expect(screen.getByRole("link", { name: "Open budget.xlsx" })).toHaveAttribute("target", "_blank")
    expect(container.querySelector(".card-x")).toHaveAttribute("data-kind", "spreadsheet")
    expect(screen.getByRole("img", { name: "photo" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open photo" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /notes/ })).not.toBeInTheDocument()
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<AttachmentPreview name="ފޮޓޯ.png" url="/a.png" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ފޮޓޯ.png ބައްލަވާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("DocumentDownload", () => {
  it("shows type and size with a download link", async () => {
    renderWithOnu(
      <DocumentDownload
        title="Annual report 2025"
        description="Ministry of Finance"
        href="/docs/report.pdf"
        size={2_400_000}
        meta={<span>Published 3 March</span>}
      />,
    )
    expect(screen.getByRole("group", { name: "Annual report 2025" })).toBeInTheDocument()
    expect(screen.getByText("PDF")).toHaveAttribute("dir", "ltr")
    expect(screen.getByText("2.3 MB")).toHaveAttribute("dir", "ltr")
    expect(screen.getByText("Published 3 March")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Download Annual report 2025" })).toHaveAttribute(
      "href",
      "/docs/report.pdf",
    )
    await expectNoA11yViolations()
  })

  it("offers English and Dhivehi versions", () => {
    renderWithOnu(
      <DocumentDownload
        title={<span>Tender notice</span>}
        titleText="Tender notice"
        versions={[
          { lang: "en", href: "/en.pdf", size: 1000 },
          { lang: "dv", href: "/dv.pdf" },
          { lang: "ar", href: "/ar.pdf", label: "العربية" },
        ]}
      />,
    )
    const en = screen.getByRole("link", { name: "Download Tender notice in English" })
    expect(en).toHaveAttribute("hreflang", "en")
    expect(en).toHaveTextContent("1,000 B")
    const dv = screen.getByRole("link", { name: "Download Tender notice in ދިވެހި" })
    expect(within(dv).getByText("ދިވެހި")).toHaveAttribute("lang", "dv")
    expect(screen.getByRole("link", { name: "Download Tender notice in العربية" })).toBeInTheDocument()
  })

  it("renders without any link", () => {
    renderWithOnu(<DocumentDownload title="Draft" type="application/msword" />)
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<DocumentDownload title="ރިޕޯޓް" href="/r.pdf" />, { locale: "dv", dir })
    expect(screen.getByRole("link", { name: "ރިޕޯޓް ޑައުންލޯޑްކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
