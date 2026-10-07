import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { createBarcodeDetector, QrCodeScanner, type BarcodeDetectorLike } from "./qr-code-scanner"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

vi.mock("barcode-detector/ponyfill", () => ({
  BarcodeDetector: class {
    polyfill = true
    detect = vi.fn(async () => [])
  },
}))

function fakeStream({ torch = false } = {}) {
  const track = {
    stop: vi.fn(),
    getCapabilities: vi.fn(() => (torch ? { torch: true } : {})),
    applyConstraints: vi.fn(async () => undefined),
  }
  const stream = {
    getTracks: () => [track],
    getVideoTracks: () => [track],
  } as unknown as MediaStream
  return { stream, track }
}

function mockCamera(impl: () => Promise<MediaStream>) {
  const getUserMedia = vi.fn(impl)
  Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia }, configurable: true })
  return getUserMedia
}

function detectorReturning(values: string[][]): () => Promise<BarcodeDetectorLike> {
  let i = 0
  return async () => ({
    detect: vi.fn(async () => (values[Math.min(i++, values.length - 1)] ?? []).map((rawValue) => ({ rawValue }))),
  })
}

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined)
  vi.spyOn(HTMLMediaElement.prototype, "readyState", "get").mockReturnValue(4)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector
})

describe("createBarcodeDetector", () => {
  it("uses the native detector when it supports QR codes", async () => {
    class Native {
      static getSupportedFormats = async () => ["qr_code"]
      native = true
      constructor(public options: unknown) {}
      detect = async () => []
    }
    ;(globalThis as { BarcodeDetector?: unknown }).BarcodeDetector = Native
    const detector = (await createBarcodeDetector()) as unknown as Native
    expect(detector.native).toBe(true)
    expect(detector.options).toEqual({ formats: ["qr_code"] })
  })

  it("falls back to the polyfill when the format is missing or there is no native API", async () => {
    ;(globalThis as { BarcodeDetector?: unknown }).BarcodeDetector = class {
      static getSupportedFormats = async () => ["ean_13"]
    }
    expect(await createBarcodeDetector()).toHaveProperty("polyfill", true)
    delete (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector
    expect(await createBarcodeDetector(["qr_code", "ean_13"])).toHaveProperty("polyfill", true)
  })
})

describe("QrCodeScanner", () => {
  it("asks for the camera, scans a code, then stops the camera", async () => {
    const { stream, track } = fakeStream()
    const getUserMedia = mockCamera(async () => stream)
    const onScan = vi.fn()
    const onStatusChange = vi.fn()
    renderWithOnu(
      <QrCodeScanner
        onScan={onScan}
        onStatusChange={onStatusChange}
        scanInterval={10}
        createDetector={detectorReturning([[], ["MV-PERMIT-2026-0042"]])}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Start camera" }))
    expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: "environment" }, audio: false })
    await waitFor(() => expect(onScan).toHaveBeenCalledWith("MV-PERMIT-2026-0042"))
    expect(onStatusChange).toHaveBeenCalledWith("requesting")
    expect(onStatusChange).toHaveBeenCalledWith("scanning")
    expect(track.stop).toHaveBeenCalled()
    expect(screen.getByText("Code scanned: MV-PERMIT-2026-0042")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Start camera" })).toBeInTheDocument()
  })

  it("keeps scanning in continuous mode and can be stopped", async () => {
    const { stream, track } = fakeStream()
    mockCamera(async () => stream)
    const onScan = vi.fn()
    renderWithOnu(
      <QrCodeScanner onScan={onScan} continuous scanInterval={5} createDetector={detectorReturning([["A"], ["B"]])} />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Start camera" }))
    await waitFor(() => expect(onScan).toHaveBeenCalledWith("B"))
    expect(screen.getByText("Point the camera at a QR code")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Stop camera" }))
    expect(track.stop).toHaveBeenCalled()
  })

  it("shows the torch toggle only when the camera supports it", async () => {
    const { stream, track } = fakeStream({ torch: true })
    mockCamera(async () => stream)
    renderWithOnu(<QrCodeScanner onScan={vi.fn()} createDetector={detectorReturning([[]])} autoStart />)
    const torch = await screen.findByRole("button", { name: "Turn on torch" })
    await userEvent.click(torch)
    expect(track.applyConstraints).toHaveBeenCalledWith({ advanced: [{ torch: true }] })
    expect(screen.getByRole("button", { name: "Turn off torch" })).toHaveAttribute("aria-pressed", "true")
  })

  it("reports a torch failure through onError", async () => {
    const { stream, track } = fakeStream({ torch: true })
    track.applyConstraints.mockRejectedValueOnce(new Error("no torch"))
    mockCamera(async () => stream)
    const onError = vi.fn()
    renderWithOnu(
      <QrCodeScanner onScan={vi.fn()} onError={onError} createDetector={detectorReturning([[]])} autoStart />,
    )
    await userEvent.click(await screen.findByRole("button", { name: "Turn on torch" }))
    expect(onError).toHaveBeenCalled()
  })

  it.each([
    ["NotAllowedError", /Camera access was blocked/],
    ["NotFoundError", /No camera was found/],
    ["AbortError", /could not be started/],
  ])("shows a message when getUserMedia fails with %s", async (name, message) => {
    const onError = vi.fn()
    mockCamera(async () => {
      throw Object.assign(new Error(name), { name })
    })
    renderWithOnu(<QrCodeScanner onScan={vi.fn()} onError={onError} />)
    await userEvent.click(screen.getByRole("button", { name: "Start camera" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(message)
    expect(onError).toHaveBeenCalled()
    expect(screen.getByRole("textbox", { name: "Enter the code manually" })).toBeInTheDocument()
  })

  it("says when the browser has no camera API or no decoder", async () => {
    Object.defineProperty(navigator, "mediaDevices", { value: undefined, configurable: true })
    const { unmount } = renderWithOnu(<QrCodeScanner onScan={vi.fn()} />)
    await userEvent.click(screen.getByRole("button", { name: "Start camera" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot scan codes/)
    expect(screen.queryByRole("button", { name: "Start camera" })).not.toBeInTheDocument()
    unmount()

    const { stream, track } = fakeStream()
    mockCamera(async () => stream)
    renderWithOnu(
      <QrCodeScanner
        onScan={vi.fn()}
        createDetector={async () => {
          throw new Error("no wasm")
        }}
      />,
    )
    await userEvent.click(screen.getByRole("button", { name: "Start camera" }))
    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot scan codes/)
    expect(track.stop).toHaveBeenCalled()
  })

  it("stops the camera on unmount, even while the permission prompt is open", async () => {
    let resolve: ((s: MediaStream) => void) | undefined
    mockCamera(() => new Promise<MediaStream>((r) => (resolve = r)))
    const { unmount } = renderWithOnu(<QrCodeScanner onScan={vi.fn()} createDetector={detectorReturning([[]])} />)
    await userEvent.click(screen.getByRole("button", { name: "Start camera" }))
    expect(screen.getByText("Waiting for camera permission…")).toBeInTheDocument()
    unmount()
    const { stream, track } = fakeStream()
    await act(async () => resolve?.(stream))
    expect(track.stop).toHaveBeenCalled()

    const second = fakeStream()
    mockCamera(async () => second.stream)
    const view = renderWithOnu(<QrCodeScanner onScan={vi.fn()} createDetector={detectorReturning([[]])} autoStart />)
    await screen.findByRole("button", { name: "Stop camera" })
    view.unmount()
    expect(second.track.stop).toHaveBeenCalled()
  })

  it("accepts a manually entered code with Enter or the button", async () => {
    const onScan = vi.fn()
    renderWithOnu(<QrCodeScanner onScan={onScan} />)
    const field = screen.getByRole("textbox", { name: "Enter the code manually" })
    expect(field).toHaveAttribute("dir", "ltr")
    await userEvent.type(field, "  {Enter}")
    expect(onScan).not.toHaveBeenCalled()
    await userEvent.type(field, "TKT-001{Enter}")
    expect(onScan).toHaveBeenCalledWith("TKT-001")
    expect(field).toHaveValue("")
    await userEvent.type(field, "TKT-002")
    await userEvent.click(screen.getByRole("button", { name: "Use code" }))
    expect(onScan).toHaveBeenLastCalledWith("TKT-002")
    await expectNoA11yViolations()
  })

  it("can hide manual entry", () => {
    renderWithOnu(<QrCodeScanner onScan={vi.fn()} manualEntry={false} />)
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  it.each(directions)("uses Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<QrCodeScanner onScan={vi.fn()} />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "ކެމެރާ ހުޅުވާ" })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "ކޯޑު އަތުން ލިޔުއްވާ" })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
