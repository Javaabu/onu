import * as React from "react"
import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { ProgressBar } from "./progress-bar"

// axe runs are slow in jsdom, especially under coverage on a busy machine.
vi.setConfig({ testTimeout: 20_000 })

describe("ProgressBar", () => {
  afterEach(() => vi.restoreAllMocks())

  it("renders a labelled determinate bar with value text", async () => {
    renderWithOnu(<ProgressBar label="Uploading permit.pdf" value={40} />)
    const bar = screen.getByRole("progressbar", { name: "Uploading permit.pdf" })
    expect(bar).toHaveAttribute("aria-valuenow", "40")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    expect(bar).toHaveAttribute("aria-valuetext", "40%")
    expect(screen.getByText("40%")).toHaveAttribute("aria-hidden", "true")
    const indicator = bar.querySelector("[data-slot=progress-bar-indicator]") as HTMLElement
    expect(indicator.style.width).toBe("40%")
    expect(indicator).toHaveClass("bg-primary")
    await expectNoA11yViolations()
  })

  it("clamps the value and supports max and formatValue", () => {
    renderWithOnu(
      <>
        <ProgressBar label="Files" value={7} max={12} formatValue={(v, max) => `${v} of ${max} files`} />
        <ProgressBar aria-label="Over" value={150} />
        <ProgressBar aria-label="Zero max" value={1} max={0} />
      </>,
    )
    expect(screen.getByRole("progressbar", { name: "Files" })).toHaveAttribute("aria-valuetext", "7 of 12 files")
    expect(screen.getByText("7 of 12 files")).toHaveAttribute("dir", "auto")
    const over = screen.getByRole("progressbar", { name: "Over" })
    expect(over).toHaveAttribute("aria-valuenow", "100")
    expect((over.firstElementChild as HTMLElement).style.width).toBe("100%")
    expect((screen.getByRole("progressbar", { name: "Zero max" }).firstElementChild as HTMLElement).style.width).toBe(
      "0%",
    )
  })

  it("is indeterminate without a value and animates with the Web Animations API", () => {
    const cancel = vi.fn()
    const animate = vi.fn(() => ({ cancel }) as unknown as Animation)
    Object.defineProperty(HTMLElement.prototype, "animate", { value: animate, configurable: true })
    const { unmount } = renderWithOnu(<ProgressBar label="Preparing export…" />)
    const bar = screen.getByRole("progressbar", { name: "Preparing export…" })
    expect(bar).toHaveAttribute("data-state", "indeterminate")
    expect(bar).not.toHaveAttribute("aria-valuenow")
    expect(bar).not.toHaveAttribute("aria-valuetext")
    expect(bar.firstElementChild).toHaveClass("absolute", "start-0")
    expect(animate).toHaveBeenCalledWith(
      [{ insetInlineStart: "-40%" }, { insetInlineStart: "100%" }],
      expect.objectContaining({ iterations: Infinity }),
    )
    unmount()
    expect(cancel).toHaveBeenCalled()
    delete (HTMLElement.prototype as { animate?: unknown }).animate
  })

  it("does not animate under reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("reduce"),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    )
    const animate = vi.fn()
    Object.defineProperty(HTMLElement.prototype, "animate", { value: animate, configurable: true })
    renderWithOnu(<ProgressBar aria-label="Loading" />)
    expect(animate).not.toHaveBeenCalled()
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass("w-full", "opacity-40")
    delete (HTMLElement.prototype as { animate?: unknown }).animate
  })

  it("defaults the accessible name and hides the value without a label", () => {
    renderWithOnu(<ProgressBar value={10} />)
    expect(screen.getByRole("progressbar", { name: "Progress" })).toBeInTheDocument()
    expect(screen.queryByText("10%")).toBeNull()
  })

  it("can show the value without a label, or hide it with a label", () => {
    renderWithOnu(
      <>
        <ProgressBar value={20} showValue aria-label="A" />
        <ProgressBar value={30} showValue={false} label="B" />
      </>,
    )
    expect(screen.getByText("20%")).toBeInTheDocument()
    expect(screen.queryByText("30%")).toBeNull()
  })

  it.each(["success", "warning", "destructive", "info", "muted"] as const)("applies the %s colour", (color) => {
    renderWithOnu(<ProgressBar aria-label="c" value={50} color={color} size="lg" />)
    const bar = screen.getByRole("progressbar")
    expect(bar).toHaveClass("h-3")
    expect(bar.firstElementChild).toHaveClass(color === "muted" ? "bg-muted-foreground" : `bg-${color}`)
  })

  it("accepts className, classNames and ref", () => {
    const ref = React.createRef<HTMLDivElement>()
    renderWithOnu(
      <ProgressBar
        ref={ref}
        label="L"
        value={5}
        className="root-x"
        classNames={{ header: "h-x", label: "l-x", value: "v-x", track: "t-x", indicator: "i-x" }}
      />,
    )
    const bar = screen.getByRole("progressbar")
    expect(ref.current).toBe(bar)
    expect(bar).toHaveClass("t-x")
    expect(bar.firstElementChild).toHaveClass("i-x")
    expect(bar.parentElement).toHaveClass("root-x")
    expect(screen.getByText("L")).toHaveClass("l-x")
    expect(screen.getByText("5%")).toHaveClass("v-x")
    expect(screen.getByText("L").parentElement).toHaveClass("h-x")
  })

  it.each(directions)("fills from the inline start in %s, with Dhivehi strings", async (dir) => {
    renderWithOnu(<ProgressBar value={64} />, { locale: "dv", dir })
    const bar = screen.getByRole("progressbar", { name: "ކުރިއެރުން" })
    expect((bar.firstElementChild as HTMLElement).style.width).toBe("64%")
    expect((bar.firstElementChild as HTMLElement).style.transform).toBe("")
    await expectNoA11yViolations()
  })
})
