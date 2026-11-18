import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../test/utils"
import { OnuProvider } from "../providers/onu-provider"
import { renderTypedSignature, SignaturePad } from "./signature-pad"

// userEvent-driven tests can be slow when the whole suite runs in parallel with coverage.
vi.setConfig({ testTimeout: 30_000 })

// jsdom has no canvas; signature_pad is replaced by a small fake that records calls.
const { FakePad, pads } = vi.hoisted(() => {
  const pads: InstanceType<typeof FakePad>[] = []
  class FakePad {
    data: unknown[] = []
    listeners: Record<string, () => void> = {}
    penColor: string
    minWidth: number
    maxWidth: number
    backgroundColor: string
    enabled = true
    constructor(
      public canvas: HTMLCanvasElement,
      options: { penColor: string; minWidth: number; maxWidth: number; backgroundColor: string },
    ) {
      this.penColor = options.penColor
      this.minWidth = options.minWidth
      this.maxWidth = options.maxWidth
      this.backgroundColor = options.backgroundColor
      pads.push(this)
    }
    addEventListener(name: string, fn: () => void) {
      this.listeners[name] = fn
    }
    removeEventListener(name: string) {
      delete this.listeners[name]
    }
    toData() {
      return [...this.data]
    }
    fromData(data: unknown[]) {
      this.data = [...data]
    }
    fromDataURL = vi.fn(async () => undefined)
    clear() {
      this.data = []
    }
    toDataURL() {
      return `data:image/png;base64,${this.data.length}`
    }
    on() {
      this.enabled = true
    }
    off() {
      this.enabled = false
    }
    /** Simulates finishing a stroke. */
    stroke() {
      this.data.push({ points: [] })
      this.listeners.endStroke?.()
    }
  }
  return { FakePad, pads }
})
type FakePad = InstanceType<typeof FakePad>

vi.mock("signature_pad", () => ({ default: FakePad }))

const lastPad = () => pads[pads.length - 1]!

beforeEach(() => {
  pads.length = 0
})
afterEach(() => vi.restoreAllMocks())

describe("renderTypedSignature", () => {
  it("returns null for empty text or without canvas support", () => {
    expect(renderTypedSignature("  ")).toBeNull()
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
    expect(renderTypedSignature("Aishath")).toBeNull()
  })

  it("draws the name and shrinks long names to fit", () => {
    const ctx = {
      font: "",
      fillStyle: "",
      textAlign: "",
      textBaseline: "",
      measureText: vi.fn((text: string) => ({ width: ctx.font.startsWith("72px") ? 10_000 : text.length })),
      fillText: vi.fn(),
    }
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never)
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,typed")
    expect(renderTypedSignature("Aishath Ahmed", { color: "#123" })).toBe("data:image/png;base64,typed")
    expect(ctx.fillText).toHaveBeenCalledWith("Aishath Ahmed", 300, 80)
    expect(ctx.fillStyle).toBe("#123")
    expect(ctx.font).not.toMatch(/^72px/)
  })
})

describe("SignaturePad", () => {
  it("captures strokes as a PNG data URL, with undo and clear", async () => {
    const onValueChange = vi.fn()
    renderWithOnu(<SignaturePad label="Applicant signature" onValueChange={onValueChange} name="signature" />)
    expect(screen.getByRole("group", { name: "Applicant signature" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /Signature drawing area/ })).toHaveClass("touch-none")
    const undo = screen.getByRole("button", { name: "Undo last stroke" })
    const clear = screen.getByRole("button", { name: "Clear signature" })
    expect(undo).toBeDisabled()
    expect(clear).toBeDisabled()
    expect(screen.getByText("Sign above")).toBeInTheDocument()

    act(() => lastPad().stroke())
    act(() => lastPad().stroke())
    expect(onValueChange).toHaveBeenLastCalledWith("data:image/png;base64,2")
    expect(screen.getByText("Signature captured")).toBeInTheDocument()
    expect(document.querySelector<HTMLInputElement>("input[name=signature]")!.value).toBe("data:image/png;base64,2")

    await userEvent.click(undo)
    expect(onValueChange).toHaveBeenLastCalledWith("data:image/png;base64,1")
    await userEvent.click(undo)
    expect(onValueChange).toHaveBeenLastCalledWith(null)

    act(() => lastPad().stroke())
    await userEvent.click(clear)
    expect(onValueChange).toHaveBeenLastCalledWith(null)
    expect(screen.getByText("Signature cleared")).toBeInTheDocument()
    await expectNoA11yViolations()
  })

  it("resizes the canvas without losing the drawing", () => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(300)
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(160)
    const scale = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ scale } as never)
    Object.defineProperty(window, "devicePixelRatio", { value: 2, configurable: true })
    renderWithOnu(<SignaturePad />)
    const canvas = screen.getByRole("img") as HTMLCanvasElement
    expect(canvas.width).toBe(600)
    expect(canvas.height).toBe(320)
    expect(scale).toHaveBeenCalledWith(2, 2)
    act(() => lastPad().stroke())
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200)
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })
    expect(canvas.width).toBe(400)
    expect(lastPad().toData()).toHaveLength(1)
    // Same size: nothing to do.
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })
    expect(lastPad().toData()).toHaveLength(1)
  })

  it("redraws a saved signature after a resize", () => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(300)
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(160)
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ scale: vi.fn() } as never)
    renderWithOnu(<SignaturePad defaultValue="data:image/png;base64,saved" name="signature" />)
    expect(lastPad().fromDataURL).toHaveBeenCalledTimes(1)
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200)
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })
    expect(lastPad().fromDataURL).toHaveBeenCalledTimes(2)
    expect(lastPad().fromDataURL).toHaveBeenLastCalledWith("data:image/png;base64,saved")
    expect(document.querySelector<HTMLInputElement>("input[name=signature]")!.value).toBe("data:image/png;base64,saved")
  })

  it("draws and exports with dark ink, even when the theme text is light", async () => {
    // Dark mode: the text colour is near-white, which would vanish on a white document.
    const computed = window.getComputedStyle.bind(window)
    vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
      const style = computed(element, pseudo)
      return new Proxy(style, {
        get: (target, key) => {
          if (key === "color") return "rgb(250, 250, 250)"
          const value = Reflect.get(target, key) as unknown
          return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(target) : value
        },
      })
    })
    const ctx = { font: "", fillStyle: "", measureText: () => ({ width: 1 }), fillText: vi.fn() }
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as never)
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,typed")
    renderWithOnu(<SignaturePad />)
    expect(lastPad().penColor).toBe("#000")
    // On screen the canvas is inverted in dark mode, so the ink still reads.
    expect(screen.getByRole("img")).toHaveClass("dark:invert")
    await userEvent.click(screen.getByRole("button", { name: "Type" }))
    await userEvent.type(screen.getByRole("textbox"), "A")
    expect(ctx.fillStyle).toBe("#000")
  })

  it("loads a saved signature and follows pen settings and disabled", () => {
    const { rerender } = renderWithOnu(
      <SignaturePad defaultValue="data:image/png;base64,saved" penColor="#0f172a" minWidth={1} />,
    )
    expect(lastPad().fromDataURL).toHaveBeenCalledWith("data:image/png;base64,saved")
    expect(lastPad().penColor).toBe("#0f172a")
    expect(screen.queryByText("Sign above")).not.toBeInTheDocument()
    rerender(<SignaturePad defaultValue="data:image/png;base64,saved" penColor="#dc2626" disabled />)
    expect(lastPad().penColor).toBe("#dc2626")
    expect(lastPad().enabled).toBe(false)
    expect(screen.getByRole("button", { name: "Draw" })).toBeDisabled()
  })

  it("keeps the drawing when the translator changes identity (#66, 4.2)", () => {
    const ui = (maps: object) => (
      <OnuProvider maps={maps}>
        <SignaturePad name="signature" />
      </OnuProvider>
    )
    const { rerender } = render(ui({}))
    act(() => lastPad().stroke())
    // An inline `maps={{…}}` gives the provider a new `t` on every render.
    rerender(ui({}))
    expect(pads).toHaveLength(1)
    expect(lastPad().toData()).toHaveLength(1)
    expect(document.querySelector<HTMLInputElement>("input[name=signature]")!.value).toBe("data:image/png;base64,1")
  })

  it("offers typing the name as an accessible alternative", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
    const onValueChange = vi.fn()
    const onModeChange = vi.fn()
    renderWithOnu(<SignaturePad onValueChange={onValueChange} onModeChange={onModeChange} />)
    const type = screen.getByRole("button", { name: "Type" })
    expect(screen.getByRole("button", { name: "Draw" })).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(type)
    expect(onModeChange).toHaveBeenCalledWith("type")
    expect(type).toHaveAttribute("aria-pressed", "true")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    const name = screen.getByRole("textbox", { name: "Type your full name" })
    await userEvent.type(name, "Aishath")
    expect(onValueChange).toHaveBeenCalled()
    expect(screen.queryByRole("button", { name: "Undo last stroke" })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Clear signature" }))
    expect(name).toHaveValue("")
    await userEvent.click(type)
    expect(onModeChange).toHaveBeenCalledTimes(1)
  })

  it("can hide the typed option and be controlled by mode", () => {
    renderWithOnu(<SignaturePad allowTyped={false} mode="type" classNames={{ typed: "typed-x" }} />)
    expect(screen.queryByRole("button", { name: "Draw" })).not.toBeInTheDocument()
    expect(document.querySelector(".typed-x")).toBeInTheDocument()
  })

  it.each(directions)("uses Dhivehi strings in %s", async (dir) => {
    renderWithOnu(<SignaturePad label="ސޮއި" />, { dir, locale: "dv" })
    expect(screen.getByRole("button", { name: "ސޮއި ފޮހެލާ" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /ސޮއިކުރާ ސަރަހައްދު/ })).toBeInTheDocument()
    await expectNoA11yViolations()
  })
})
