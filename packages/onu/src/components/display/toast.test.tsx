import * as React from "react"
import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { common as dv_common } from "../../locales/dv/common"
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

describe.each(directions)("Toaster + toast in Dhivehi, %s", (dir) => {
  afterEach(() => {
    act(() => {
      toast.dismiss()
    })
  })

  it("has no axe violations, and a close button big enough to touch", async () => {
    const { container } = renderWithOnu(<Toaster closeButton />, { locale: "dv", dir })
    act(() => {
      toast("ރައްކާކުރެވިއްޖެ")
    })
    const close = await screen.findByRole("button", { name: dv_common.close })
    expect(close).toHaveClass("size-6!", "touch:size-11!")
    await expectNoA11yViolations(container)
  })

  it("dismisses from the close button", async () => {
    renderWithOnu(<Toaster closeButton />, { locale: "dv", dir })
    act(() => {
      toast("ރައްކާކުރެވިއްޖެ")
    })
    await userEvent.click(await screen.findByRole("button", { name: dv_common.close }))
    await waitFor(() => expect(screen.queryByText("ރައްކާކުރެވިއްޖެ")).not.toBeInTheDocument())
  })

  it("runs the action button", async () => {
    const onClick = vi.fn()
    renderWithOnu(<Toaster />, { locale: "dv", dir })
    act(() => {
      toast("ރައްކާކުރެވިއްޖެ", { action: { label: "ބަދަލުކުރޭ", onClick } })
    })
    await userEvent.click(await screen.findByRole("button", { name: "ބަދަލުކުރޭ" }))
    expect(onClick).toHaveBeenCalledOnce()
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
