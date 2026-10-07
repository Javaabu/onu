import * as React from "react"
import { act, fireEvent, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { FormField } from "../form/form-field"
import { ImageInput } from "./image-input"
import { useObjectUrl } from "./use-files"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

const user = () => userEvent.setup({ applyAccept: false })
const image = (name = "photo.png", size = 1000) => new File([new Uint8Array(size)], name, { type: "image/png" })
const input = (container: HTMLElement) => container.querySelector<HTMLInputElement>("input[type=file]")!

beforeEach(() => {
  let n = 0
  URL.createObjectURL = vi.fn(() => `blob:preview-${++n}`)
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => vi.useRealTimers())

describe("ImageInput", () => {
  it("picks an image and shows a preview with replace and remove", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<ImageInput alt="Shop front" aria-label="Shop photo" onChange={onChange} />)
    const choose = screen.getByRole("button", { name: "Choose an image" })
    const click = vi.spyOn(input(container), "click")
    await userEvent.click(choose)
    expect(click).toHaveBeenCalled()
    await user().upload(input(container), image())
    expect(onChange).toHaveBeenCalledWith(expect.any(File))
    expect(screen.getByRole("img", { name: "Shop front" })).toHaveAttribute("src", "blob:preview-1")
    expect(screen.getByRole("img", { name: "Shop front" })).toHaveAttribute("loading", "lazy")
    await userEvent.click(screen.getByRole("button", { name: "Replace" }))
    expect(click).toHaveBeenCalledTimes(2)
    await expectNoA11yViolations()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    await user().click(screen.getByRole("button", { name: "Remove" }))
    act(() => vi.runAllTimers())
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole("button", { name: "Choose an image" })).toHaveFocus()
  })

  it("shows an existing image URL and marks its removal for the server", async () => {
    const { container } = renderWithOnu(
      <ImageInput alt="Logo" defaultValue="/logo.png" removeName="remove_logo" shape="circle" />,
    )
    expect(screen.getByRole("img", { name: "Logo" })).toHaveAttribute("src", "/logo.png")
    await userEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(container.querySelector<HTMLInputElement>("input[name=remove_logo]")?.value).toBe("1")
  })

  it("validates type and size", async () => {
    const onReject = vi.fn()
    const { container } = renderWithOnu(<ImageInput alt="x" aria-label="Photo" maxSize={500} onReject={onReject} />)
    await user().upload(input(container), image("big.png", 2000))
    expect(screen.getByRole("alert")).toHaveTextContent("big.png is larger than 500 B.")
    await user().upload(input(container), new File(["x"], "doc.txt", { type: "text/plain" }))
    expect(screen.getByRole("alert")).toHaveTextContent("doc.txt is not an accepted file type.")
    expect(onReject).toHaveBeenCalledTimes(2)
    expect(screen.getByRole("button", { name: "Choose an image" }).getAttribute("aria-describedby")).toContain(
      screen.getByRole("alert").id,
    )
    fireEvent.change(input(container), { target: { files: [] } })
    await user().upload(input(container), image("ok.png", 10))
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("is controlled and wired to a FormField", () => {
    function Controlled() {
      const [value, setValue] = React.useState<File | string | null>("/a.png")
      return (
        <FormField label="Cover" name="cover" error="Required" disabled>
          <ImageInput alt="Cover" value={value} onChange={setValue} placeholder="Add a cover" />
        </FormField>
      )
    }
    const { container } = renderWithOnu(<Controlled />)
    expect(input(container)).toHaveAttribute("name", "cover")
    expect(input(container)).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("button", { name: "Replace" })).toBeDisabled()
  })

  it("renders a custom placeholder and slot classes", () => {
    renderWithOnu(<ImageInput alt="x" aria-label="P" placeholder="Add a cover" classNames={{ empty: "empty-x" }} />)
    expect(screen.getByRole("button", { name: "Add a cover" })).toHaveClass("empty-x")
  })

  it.each(directions)("renders Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<ImageInput alt="ފޮޓޯ" aria-label="ފޮޓޯ" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ފޮޓޯއެއް ހޮވާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("useObjectUrl", () => {
  it("shares one URL per blob and revokes it when unused", () => {
    vi.useFakeTimers()
    const blob = image()
    const a = renderHook(() => useObjectUrl(blob))
    const b = renderHook(() => useObjectUrl(blob))
    expect(a.result.current).toBe(b.result.current)
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    a.unmount()
    act(() => vi.runAllTimers())
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    b.unmount()
    act(() => vi.runAllTimers())
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(a.result.current)
    expect(renderHook(() => useObjectUrl(null)).result.current).toBeUndefined()
  })
})
