import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { encode } from "uqr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { encodeQrCode, QrCode, qrCodePath, qrCodeToPng, qrCodeToSvg, qrCodeVariants, qrLogoBox } from "./qr-code"

const URL_VALUE = "https://verify.trade.gov.mv/BL-2026-04417"

/** Number of dark modules a path draws (sum of its horizontal runs). */
function pathArea(d: string) {
  return [...d.matchAll(/h(\d+)v1/g)].reduce((sum, m) => sum + Number(m[1]), 0)
}
const darkCount = (modules: boolean[][]) => modules.flat().filter(Boolean).length

function mockCanvas({ blob = true } = {}) {
  const ctx = { fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() }
  const sizes: number[] = []
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement) {
    sizes.push(this.width)
    return ctx as unknown as CanvasRenderingContext2D
  } as never)
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) =>
    cb(blob ? new Blob(["png"], { type: "image/png" }) : null),
  )
  return { ctx, sizes }
}

function mockImage(fail = false) {
  class FakeImage {
    naturalWidth = 200
    naturalHeight = 100
    crossOrigin = ""
    onload?: () => void
    onerror?: () => void
    set src(_value: string) {
      setTimeout(() => (fail ? this.onerror?.() : this.onload?.()), 0)
    }
  }
  vi.stubGlobal("Image", FakeImage)
}

let saved: Blob[] = []
beforeEach(() => {
  saved = []
  URL.createObjectURL = vi.fn((blob: Blob) => {
    saved.push(blob)
    return "blob:qr"
  })
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.documentElement.classList.remove("dark")
})

describe("QR helpers", () => {
  it("encodes with uqr and drops the border", () => {
    const m = encodeQrCode("TKT-2026-0042", "Q")
    const ref = encode("TKT-2026-0042", { ecc: "Q", border: 0 })
    expect(m.size).toBe(ref.size)
    expect(m.version).toBe(ref.version)
    expect(m.modules).toEqual(ref.data)
    expect(m.level).toBe("Q")
  })

  it("encodes Thaana as UTF-8", () => {
    expect(encodeQrCode("ހުޅުމާލެ").size).toBeGreaterThanOrEqual(21)
  })

  it("throws when the text does not fit", () => {
    expect(() => encodeQrCode("x".repeat(8000), "H")).toThrow()
  })

  it("merges runs and skips the logo area", () => {
    const modules = [
      [true, true, false, true],
      [false, true, true, true],
    ]
    expect(qrCodePath(modules)).toBe("M0 0h2v1h-2zM3 0h1v1h-1zM1 1h3v1h-3z")
    expect(qrCodePath(modules, 4)).toContain("M4 4h2")
    expect(pathArea(qrCodePath(modules, 0, { x: 1, y: 0, size: 2 }))).toBe(3)
  })

  it("centres the logo box on the module grid and clamps its size", () => {
    expect(qrLogoBox(25, 0.22)).toEqual({ x: 9, y: 9, size: 7 })
    expect(qrLogoBox(25, 0.2)).toEqual({ x: 10, y: 10, size: 5 })
    expect(qrLogoBox(21, 0.9).size).toBe(7)
    expect(qrLogoBox(21, 0).size).toBe(3)
  })

  it("builds a standalone SVG with resolved colours and the logo", () => {
    const m = encodeQrCode("hello")
    const svg = qrCodeToSvg(m, {
      foreground: "rgb(1, 2, 3)",
      background: "white",
      logo: { src: "/logo.svg?a=1&b=2", box: qrLogoBox(m.size) },
    })
    expect(svg).toContain(`viewBox="0 0 ${m.size + 8} ${m.size + 8}"`)
    expect(svg).toContain('fill="rgb(1, 2, 3)"')
    expect(svg).toContain('href="/logo.svg?a=1&amp;b=2"')
    expect(qrCodeToSvg(m, { quietZone: 0 })).toContain(`viewBox="0 0 ${m.size} ${m.size}"`)
  })

  it("draws a PNG with one rectangle per dark module", async () => {
    const { ctx, sizes } = mockCanvas()
    const m = encodeQrCode("hello")
    const blob = await qrCodeToPng(m, { pixels: 290 })
    expect(blob.type).toBe("image/png")
    const total = m.size + 8
    expect(sizes[0]).toBe(total * Math.round(290 / total))
    // Background + modules.
    expect(ctx.fillRect).toHaveBeenCalledTimes(1 + darkCount(m.modules))
  })

  it("draws the logo when it loads, and skips it when it does not", async () => {
    mockImage()
    const { ctx } = mockCanvas()
    const m = encodeQrCode("hello", "H")
    await qrCodeToPng(m, { logo: { src: "/logo.png", box: qrLogoBox(m.size) } })
    expect(ctx.drawImage).toHaveBeenCalledTimes(1)
    const [, , , w, h] = ctx.drawImage.mock.calls[0]!
    expect(w).toBeCloseTo((h as number) * 2)

    vi.unstubAllGlobals()
    mockImage(true)
    ctx.drawImage.mockClear()
    await qrCodeToPng(m, { logo: { src: "/missing.png", box: qrLogoBox(m.size), excavate: false } })
    expect(ctx.drawImage).not.toHaveBeenCalled()
  })

  it("rejects when the canvas cannot export", async () => {
    mockCanvas({ blob: false })
    await expect(qrCodeToPng(encodeQrCode("a"))).rejects.toThrow()
    vi.restoreAllMocks()
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
    await expect(qrCodeToPng(encodeQrCode("a"))).rejects.toThrow()
  })
})

describe("QrCode", () => {
  it("renders an SVG image whose modules match the encoder's matrix", () => {
    renderWithOnu(<QrCode value={URL_VALUE} />)
    const svg = screen.getByRole("img", { name: "QR code" })
    const ref = encode(URL_VALUE, { ecc: "M", border: 0 })
    const root = svg.closest("[data-slot=qr-code]")!
    expect(root).toHaveAttribute("data-modules", String(ref.size))
    expect(root).toHaveAttribute("data-level", "M")
    expect(root).toHaveAttribute("data-version", String(ref.version))
    expect(svg).toHaveAttribute("viewBox", `0 0 ${ref.size + 8} ${ref.size + 8}`)
    expect(svg).toHaveAttribute("width", "160")
    const path = svg.querySelector("path")!
    expect(path).toHaveAttribute("fill", "currentColor")
    expect(pathArea(path.getAttribute("d")!)).toBe(darkCount(ref.data))
  })

  it("uses the size, level and quiet zone", () => {
    renderWithOnu(<QrCode value="A" size={96} level="H" quietZone={0} />)
    const svg = screen.getByRole("img")
    const ref = encode("A", { ecc: "H", border: 0 })
    expect(svg).toHaveAttribute("width", "96")
    expect(svg).toHaveAttribute("viewBox", `0 0 ${ref.size} ${ref.size}`)
    expect(svg.closest("[data-slot=qr-code]")).toHaveAttribute("data-level", "H")
  })

  it("takes its accessible name from label or aria-label", () => {
    const { rerender } = renderWithOnu(<QrCode value="x" label="Verify licence BL-2026-04417" />)
    expect(screen.getByRole("img", { name: "Verify licence BL-2026-04417" })).toBeInTheDocument()
    rerender(<QrCode value="x" aria-label="Pay MVR 150.00" />)
    expect(screen.getByRole("img", { name: "Pay MVR 150.00" })).toBeInTheDocument()
  })

  it("forces level H and clears the centre when there is a logo", () => {
    renderWithOnu(<QrCode value={URL_VALUE} level="L" logo={{ src: "/logo.svg", size: 0.25 }} />)
    const svg = screen.getByRole("img")
    const ref = encode(URL_VALUE, { ecc: "H", border: 0 })
    expect(svg.closest("[data-slot=qr-code]")).toHaveAttribute("data-level", "H")
    expect(svg.closest("[data-slot=qr-code]")).toHaveAttribute("data-modules", String(ref.size))
    const logo = svg.querySelector("[data-slot=qr-code-logo]")!
    expect(logo).toHaveAttribute("href", "/logo.svg")
    expect(pathArea(svg.querySelector("path")!.getAttribute("d")!)).toBeLessThan(darkCount(ref.data))
  })

  it("can keep modules behind the logo", () => {
    renderWithOnu(<QrCode value="hello" logo={{ src: "/logo.svg", excavate: false }} />)
    const ref = encode("hello", { ecc: "H", border: 0 })
    expect(pathArea(screen.getByRole("img").querySelector("path")!.getAttribute("d")!)).toBe(darkCount(ref.data))
  })

  it("accepts a logo URL string", () => {
    renderWithOnu(<QrCode value="hello" logo="/logo.svg" />)
    expect(screen.getByRole("img").querySelector("image")).toHaveAttribute("href", "/logo.svg")
  })

  it("shows an alert when the text is too long", () => {
    renderWithOnu(<QrCode value={"x".repeat(8000)} download copyable />)
    expect(screen.getByRole("alert")).toHaveTextContent("This is too long to fit in a QR code.")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("shows a caption and the value", () => {
    renderWithOnu(<QrCode value="ހުޅުމާލެ" caption="Scan to verify" showValue />)
    expect(screen.getByText("Scan to verify")).toHaveAttribute("data-slot", "qr-code-caption")
    expect(screen.getByText("ހުޅުމާލެ")).toHaveAttribute("dir", "auto")
  })

  it("downloads an SVG with the resolved colours", async () => {
    const onDownload = vi.fn()
    const user = userEvent.setup()
    renderWithOnu(<QrCode value="hello" download={["svg"]} filename="licence" onDownload={onDownload} />)
    expect(screen.queryByRole("button", { name: "Download PNG" })).not.toBeInTheDocument()
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe("licence.svg")
    })
    await user.click(screen.getByRole("button", { name: "Download SVG" }))
    await waitFor(() => expect(onDownload).toHaveBeenCalled())
    const [format, blob] = onDownload.mock.calls[0]!
    expect(format).toBe("svg")
    expect(blob.type).toBe("image/svg+xml")
    expect(saved[0]).toBe(blob)
    expect(click).toHaveBeenCalled()
    const text = await (blob as Blob).text()
    const m = encodeQrCode("hello")
    expect(text).toContain(`viewBox="0 0 ${m.size + 8} ${m.size + 8}"`)
    expect(pathArea(text)).toBe(darkCount(m.modules))
  })

  it("downloads a PNG drawn on a canvas", async () => {
    const { ctx, sizes } = mockCanvas()
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined)
    const onDownload = vi.fn()
    const user = userEvent.setup()
    renderWithOnu(<QrCode value="hello" download downloadSize={512} onDownload={onDownload} />)
    await user.click(screen.getByRole("button", { name: "Download PNG" }))
    await waitFor(() => expect(onDownload).toHaveBeenCalledWith("png", expect.any(Blob)))
    expect(onDownload.mock.calls[0]![1].type).toBe("image/png")
    const m = encodeQrCode("hello")
    expect(sizes[0]).toBe((m.size + 8) * Math.round(512 / (m.size + 8)))
    expect(ctx.fillRect).toHaveBeenCalledTimes(1 + darkCount(m.modules))
  })

  it("keeps working when the PNG export fails", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
    const onDownload = vi.fn()
    const user = userEvent.setup()
    renderWithOnu(<QrCode value="hello" download={["png"]} onDownload={onDownload} />)
    const button = screen.getByRole("button", { name: "Download PNG" })
    await user.click(button)
    await waitFor(() => expect(button).toBeEnabled())
    expect(onDownload).not.toHaveBeenCalled()
  })

  it("copies the value and announces it", async () => {
    const user = userEvent.setup()
    const writeText = vi.fn(async () => undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    const onCopy = vi.fn()
    renderWithOnu(<QrCode value="TKT-2026-0042" copyable onCopy={onCopy} />)
    await user.click(screen.getByRole("button", { name: "Copy text" }))
    expect(writeText).toHaveBeenCalledWith("TKT-2026-0042")
    expect(onCopy).toHaveBeenCalledWith("TKT-2026-0042")
    expect(await screen.findByText("Text copied")).toBeInTheDocument()
  })

  it("announces a failed copy", async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn(async () => Promise.reject(new Error("no"))) },
      configurable: true,
    })
    document.execCommand = vi.fn(() => false)
    const onCopy = vi.fn()
    renderWithOnu(<QrCode value="x" copyable onCopy={onCopy} />)
    await user.click(screen.getByRole("button", { name: "Copy text" }))
    expect(await screen.findByText("Could not copy")).toBeInTheDocument()
    expect(onCopy).not.toHaveBeenCalled()
  })

  it("buttons are keyboard operable", async () => {
    const user = userEvent.setup()
    const writeText = vi.fn(async () => undefined)
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    renderWithOnu(<QrCode value="x" copyable download={["svg"]} />)
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined)
    await user.tab()
    expect(screen.getByRole("button", { name: "Download SVG" })).toHaveFocus()
    await user.tab()
    await user.keyboard("{Enter}")
    expect(writeText).toHaveBeenCalledWith("x")
  })

  it("applies tone variants, className and classNames", () => {
    renderWithOnu(
      <QrCode
        value="x"
        tone="theme"
        className="custom-root"
        classNames={{ svg: "custom-svg", actions: "custom-actions", button: "custom-button" }}
        copyable
      />,
    )
    const svg = screen.getByRole("img")
    expect(svg.closest("[data-slot=qr-code]")).toHaveClass("custom-root")
    expect(svg).toHaveClass("custom-svg", "bg-background", "text-foreground")
    expect(svg).not.toHaveClass("dark:bg-foreground")
    expect(screen.getByRole("group")).toHaveClass("custom-actions")
    expect(screen.getByRole("button")).toHaveClass("custom-button")
    expect(qrCodeVariants()).toContain("dark:bg-foreground")
    expect(qrCodeVariants({ tone: "transparent" })).toContain("bg-transparent")
  })

  it("passes ref and native props to the root", () => {
    const ref = { current: null as HTMLDivElement | null }
    renderWithOnu(<QrCode ref={ref} value="x" id="ticket-qr" />)
    expect(ref.current).toHaveAttribute("id", "ticket-qr")
  })

  it("uses Dhivehi labels", () => {
    renderWithOnu(<QrCode value="x" download copyable />, { locale: "dv" })
    expect(screen.getByRole("img", { name: "ކިއުއާރް ކޯޑު" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "PNG ޑައުންލޯޑްކުރޭ" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ލިޔުން ކޮޕީކުރޭ" })).toBeInTheDocument()
  })

  it.each(directions)("never mirrors the code in %s", async (dir) => {
    const { container } = renderWithOnu(<QrCode value="x" download copyable caption="Scan" />, { dir })
    const svg = screen.getByRole("img")
    expect(svg.getAttribute("class")).not.toMatch(/scale-x|rotate/)
    await expectNoA11yViolations(container)
  })

  it("has no axe violations in dark mode with a logo", async () => {
    const { container } = renderWithOnu(<QrCode value="x" logo="/logo.svg" showValue />, { dark: true })
    await expectNoA11yViolations(container)
  })
})
