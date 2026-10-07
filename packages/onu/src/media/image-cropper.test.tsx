import * as React from "react"
import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { AvatarUpload, initials } from "./avatar-upload"
import { cropImage, cropImageToFile, loadImage, rotatedSize } from "./crop-image"
import { ImageCropper, type ImageCropperHandle } from "./image-cropper"

// axe and user-event are slow on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

// react-easy-crop needs layout; a small stand-in exposes its props so the wrapper can be tested.
const cropperProps = vi.hoisted(() => ({ current: null as null | Record<string, unknown> }))
vi.mock("react-easy-crop", () => ({
  default: (props: Record<string, unknown>) => {
    cropperProps.current = props
    const area = props.cropperProps as React.HTMLAttributes<HTMLDivElement>
    return (
      <div
        data-testid="cropper"
        data-zoom={String(props.zoom)}
        data-rotation={String(props.rotation)}
        data-aspect={String(props.aspect)}
      >
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <div tabIndex={0} {...area} />
      </div>
    )
  },
}))

/** Fake canvas + image so cropImage runs in jsdom. */
function mockCanvas() {
  const ctx = { translate: vi.fn(), rotate: vi.fn(), drawImage: vi.fn(), imageSmoothingQuality: "" }
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never)
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (cb, type) {
    cb(new Blob(["x"], { type: type ?? "image/png" }))
  })
  class FakeImage {
    naturalWidth = 400
    naturalHeight = 200
    crossOrigin = ""
    onload?: () => void
    onerror?: () => void
    addEventListener() {}
    removeEventListener() {}
    set src(value: string) {
      setTimeout(() => (value.includes("broken") ? this.onerror?.() : this.onload?.()), 0)
    }
  }
  vi.stubGlobal("Image", FakeImage)
  return ctx
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:img")
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("crop helpers", () => {
  it("computes rotated bounds", () => {
    expect(rotatedSize(400, 200, 90)).toEqual({ width: expect.closeTo(200), height: expect.closeTo(400) })
    expect(rotatedSize(400, 200, 0)).toEqual({ width: 400, height: 200 })
  })

  it("crops, rotates and scales to a Blob or File", async () => {
    const ctx = mockCanvas()
    const blob = await cropImage("/a.jpg", { x: 10, y: 10, width: 200, height: 100 }, { rotation: 90, maxSize: 100 })
    expect(blob.type).toBe("image/jpeg")
    expect(ctx.rotate).toHaveBeenCalledWith(Math.PI / 2)
    expect(ctx.drawImage).toHaveBeenLastCalledWith(expect.anything(), 10, 10, 200, 100, 0, 0, 100, 50)
    const f = await cropImageToFile("/a.jpg", { x: 0, y: 0, width: 10, height: 10 }, "me.png", { type: "image/png" })
    expect(f).toBeInstanceOf(File)
    expect(f.name).toBe("me.png")
    expect(f.type).toBe("image/png")
  })

  it("rejects broken images, missing canvas support and failed exports", async () => {
    mockCanvas()
    await expect(loadImage("/broken.jpg")).rejects.toThrow(/Could not load/)
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) => cb(null))
    await expect(cropImage("/a.jpg", { x: 0, y: 0, width: 1, height: 1 })).rejects.toThrow(/export/)
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
    await expect(cropImage("/a.jpg", { x: 0, y: 0, width: 1, height: 1 })).rejects.toThrow(/Canvas/)
  })
})

describe("ImageCropper", () => {
  it("zooms, rotates and resets with buttons, sliders and keys", async () => {
    renderWithOnu(<ImageCropper src="/photo.jpg" alt="Shop front" />)
    const stage = screen.getByTestId("cropper")
    const area = screen.getByRole("group", { name: "Crop area for Shop front" })
    expect(area).toHaveAccessibleDescription(/arrow keys/)
    await userEvent.click(screen.getByRole("button", { name: "Zoom in" }))
    expect(stage).toHaveAttribute("data-zoom", "1.1")
    fireEvent.keyDown(area, { key: "+" })
    expect(stage).toHaveAttribute("data-zoom", "1.2")
    fireEvent.keyDown(area, { key: "-" })
    fireEvent.keyDown(area, { key: "x" })
    expect(stage).toHaveAttribute("data-zoom", "1.1")
    await userEvent.click(screen.getByRole("button", { name: "Zoom out" }))
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: "Rotate left" }))
    expect(stage).toHaveAttribute("data-rotation", "270")
    await userEvent.click(screen.getByRole("button", { name: "Rotate right" }))
    await userEvent.click(screen.getByRole("button", { name: "Rotate right" }))
    expect(stage).toHaveAttribute("data-rotation", "90")
    screen.getByRole("slider", { name: "Zoom" }).focus()
    await userEvent.keyboard("{End}")
    expect(stage).toHaveAttribute("data-zoom", "3")
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled()
    screen.getByRole("slider", { name: "Rotation" }).focus()
    await userEvent.keyboard("{Home}")
    expect(stage).toHaveAttribute("data-rotation", "0")
    act(() => (cropperProps.current!.onZoomChange as (z: number) => void)(2))
    act(() => (cropperProps.current!.onRotationChange as (r: number) => void)(45))
    act(() => (cropperProps.current!.onCropChange as (p: unknown) => void)({ x: 5, y: 5 }))
    await userEvent.click(screen.getByRole("button", { name: "Reset" }))
    expect(stage).toHaveAttribute("data-zoom", "1")
    expect(stage).toHaveAttribute("data-rotation", "0")
    await expectNoA11yViolations()
  })

  it("switches aspect ratios, including free cropping", async () => {
    const onAspectChange = vi.fn()
    renderWithOnu(
      <ImageCropper
        src="/photo.jpg"
        alt="x"
        aspect={16 / 9}
        rotatable={false}
        aspectOptions={[
          { label: "16:9", value: 16 / 9 },
          { label: "1:1", value: 1 },
          { label: "Free", value: undefined },
        ]}
        onAspectChange={onAspectChange}
      />,
    )
    expect(screen.queryByRole("slider", { name: "Rotation" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: "1:1" }))
    expect(onAspectChange).toHaveBeenCalledWith(1)
    expect(screen.getByTestId("cropper")).toHaveAttribute("data-aspect", "1")
    act(() => (cropperProps.current!.onMediaLoaded as (s: unknown) => void)({ width: 300, height: 200 }))
    await userEvent.click(screen.getByRole("radio", { name: "Free" }))
    expect(screen.getByTestId("cropper")).toHaveAttribute("data-aspect", "1.5")
    await userEvent.click(screen.getByRole("radio", { name: "Free" }))
    expect(onAspectChange).toHaveBeenCalledTimes(2)
  })

  it("outputs the crop as a Blob or File through its ref", async () => {
    mockCanvas()
    const ref = React.createRef<ImageCropperHandle>()
    const onCropComplete = vi.fn()
    renderWithOnu(<ImageCropper ref={ref} src={new Blob(["x"])} alt="x" onCropComplete={onCropComplete} />)
    await expect(ref.current!.getBlob()).rejects.toThrow(/Nothing to crop/)
    await expect(ref.current!.getFile("a.jpg")).rejects.toThrow(/Nothing to crop/)
    const area = { x: 1, y: 2, width: 30, height: 30 }
    act(() => (cropperProps.current!.onCropComplete as (a: unknown, b: unknown) => void)({}, area))
    expect(onCropComplete).toHaveBeenCalledWith(area, 0)
    expect(ref.current!.getCrop()).toEqual({ area, rotation: 0 })
    await expect(ref.current!.getBlob({ type: "image/png" })).resolves.toBeInstanceOf(Blob)
    await expect(ref.current!.getFile("crop.jpg")).resolves.toMatchObject({ name: "crop.jpg" })
    act(() => ref.current!.reset())
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<ImageCropper src="/a.jpg" alt="ފޮޓޯ" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ޒޫމް އިން" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})

describe("AvatarUpload", () => {
  const pick = (container: HTMLElement) => container.querySelector<HTMLInputElement>("input[type=file]")!
  const photo = (size = 1000) => new File([new Uint8Array(size)], "me.png", { type: "image/png" })

  it("makes initials", () => {
    expect(initials("Aishath Shifa Mohamed")).toBe("AS")
    expect(initials("އަޙްމަދު ނާޒިމް")).toBe("އނ")
    expect(initials("  ")).toBe("")
  })

  it("shows initials, then crops a picked photo in a dialog and returns focus", async () => {
    mockCanvas()
    const onChange = vi.fn()
    const { container } = renderWithOnu(<AvatarUpload personName="Aishath Shifa" onChange={onChange} />)
    expect(screen.getByRole("img", { name: "Aishath Shifa (no photo)" })).toHaveTextContent("AS")
    const change = screen.getByRole("button", { name: "Upload photo" })
    const click = vi.spyOn(pick(container), "click")
    await userEvent.click(change)
    expect(click).toHaveBeenCalled()
    await userEvent.upload(pick(container), photo())
    const dialog = await screen.findByRole("dialog", { name: "Crop photo" })
    expect(dialog).toBeInTheDocument()
    act(() =>
      (cropperProps.current!.onCropComplete as (a: unknown, b: unknown) => void)(
        {},
        { x: 0, y: 0, width: 10, height: 10 },
      ),
    )
    await userEvent.click(screen.getByRole("button", { name: "Save photo" }))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: "me.jpg" })))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Change photo" })).toHaveFocus()
    await expectNoA11yViolations()
  })

  it("falls back to the original file when cropping fails, and can cancel", async () => {
    const onChange = vi.fn()
    const { container } = renderWithOnu(<AvatarUpload personName="Ali" onChange={onChange} size="xl" />)
    await userEvent.upload(pick(container), photo())
    await userEvent.click(await screen.findByRole("button", { name: "Cancel" }))
    expect(onChange).not.toHaveBeenCalled()
    await userEvent.upload(pick(container), photo())
    await userEvent.click(await screen.findByRole("button", { name: "Save photo" }))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ name: "me.png" })))
  })

  it("skips the crop step, validates, removes and shows existing photos", async () => {
    const onChange = vi.fn()
    const onReject = vi.fn()
    const { container } = renderWithOnu(
      <AvatarUpload
        personName="Ali"
        defaultValue="/ali.jpg"
        crop={false}
        maxSize={500}
        onChange={onChange}
        onReject={onReject}
      />,
    )
    expect(container.querySelector("[data-slot=avatar-upload]")).toBeInTheDocument()
    await userEvent.upload(pick(container), photo(2000))
    expect(screen.getByRole("alert")).toHaveTextContent("me.png is larger than 500 B.")
    expect(onReject).toHaveBeenCalled()
    await userEvent.upload(pick(container), photo(100))
    expect(onChange).toHaveBeenCalledWith(expect.any(File))
    fireEvent.change(pick(container), { target: { files: [] } })
    await userEvent.click(screen.getByRole("button", { name: "Remove photo" }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole("button", { name: "Upload photo" })).toHaveFocus()
  })

  it.each(directions)("uses Dhivehi labels in %s", async (dir) => {
    renderWithOnu(<AvatarUpload personName="އަޙްމަދު" />, { locale: "dv", dir })
    expect(screen.getByRole("button", { name: "ފޮޓޯ އަޕްލޯޑުކުރޭ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
