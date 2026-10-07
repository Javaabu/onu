import * as React from "react"
import { act, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { directions, renderWithOnu } from "../../../test/utils"
import { ThemeProvider } from "../../providers/theme-provider"
import { resolveToastPosition, toast, Toaster } from "./toast"

describe("resolveToastPosition", () => {
  it.each([
    ["bottom-end", "ltr", "bottom-right"],
    ["bottom-end", "rtl", "bottom-left"],
    ["bottom-start", "ltr", "bottom-left"],
    ["bottom-start", "rtl", "bottom-right"],
    ["top-end", "rtl", "top-left"],
    ["top-center", "rtl", "top-center"],
  ] as const)("%s in %s → %s", (position, dir, expected) => {
    expect(resolveToastPosition(position, dir)).toBe(expected)
  })
})

describe("Toaster + toast", () => {
  afterEach(() => {
    act(() => {
      toast.dismiss()
    })
  })

  it("shows success, error, warning and info toasts with Onu icons", async () => {
    const { container } = renderWithOnu(<Toaster />)
    act(() => {
      toast.success("Saved")
      toast.error("Failed")
      toast.warning("Careful")
      toast.info("FYI")
    })
    expect(await screen.findByText("Saved")).toBeInTheDocument()
    expect(screen.getByText("Failed")).toBeInTheDocument()
    expect(screen.getByText("Careful")).toBeInTheDocument()
    expect(screen.getByText("FYI")).toBeInTheDocument()
    for (const icon of ["success", "error", "warning", "info"]) {
      expect(container.querySelector(`[data-icon-name=${icon}]`)).toBeInTheDocument()
    }
  })

  it("supports promise toasts", async () => {
    renderWithOnu(<Toaster />)
    let resolve!: (v: string) => void
    const promise = new Promise<string>((r) => (resolve = r))
    act(() => {
      toast.promise(promise, { loading: "Uploading…", success: (v) => `Uploaded ${v}`, error: "Upload failed" })
    })
    expect(await screen.findByText("Uploading…")).toBeInTheDocument()
    await act(async () => {
      resolve("id-card.pdf")
      await promise
    })
    expect(await screen.findByText("Uploaded id-card.pdf")).toBeInTheDocument()
  })

  it.each(directions)("flips the position and labels the region in %s", async (dir) => {
    const { container } = renderWithOnu(
      <ThemeProvider forcedTheme="dark">
        <Toaster position="bottom-end" />
      </ThemeProvider>,
      { dir, locale: dir === "rtl" ? "dv" : "en" },
    )
    act(() => {
      toast("Hello")
    })
    await screen.findByText("Hello")
    const list = container.ownerDocument.querySelector("[data-sonner-toaster]")!
    expect(list).toHaveAttribute("data-x-position", dir === "rtl" ? "left" : "right")
    expect(list).toHaveAttribute("dir", dir)
    expect(list).toHaveAttribute("data-sonner-theme", "dark")
    const region = container.ownerDocument.querySelector("section[aria-label]")!
    expect(region.getAttribute("aria-label")).toContain(dir === "rtl" ? "ނޯޓިފިކޭޝަންތައް" : "Notifications")
    if (dir === "rtl") expect(container.ownerDocument.querySelector("[data-sonner-toast]")).toHaveClass("font-thaana")
  })
})
