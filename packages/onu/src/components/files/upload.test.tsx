import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { UploadProgress, UploadProgressItem } from "./upload-progress"
import type { UploadItem } from "./use-files"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const file = (name: string, size = 2048, type = "application/pdf") => new File([new Uint8Array(size)], name, { type })

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
