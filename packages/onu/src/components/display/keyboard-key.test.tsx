import * as React from "react"
import { screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { directions, expectNoA11yViolations, renderWithOnu } from "../../../test/utils"
import { detectPlatform, formatShortcut, KeyboardKey } from "./keyboard-key"

describe("formatShortcut", () => {
  it.each([
    ["mod+k", "mac", "⌘K"],
    ["mod+k", "other", "Ctrl+K"],
    ["ctrl+shift+p", "mac", "⌃⇧P"],
    ["ctrl+shift+p", "other", "Ctrl+Shift+P"],
    ["alt+enter", "other", "Alt+↵"],
    ["option+esc", "mac", "⌥Esc"],
    ["cmd+backspace", "other", "Win+⌫"],
    ["g d", "other", "G D"],
    ["ctrl++", "other", "Ctrl++"],
    ["tab", "mac", "⇥"],
    ["space", "mac", "␣"],
    ["up down left right del", "other", "↑ ↓ ← → Del"],
    ["F12", "other", "F12"],
  ] as const)("%s on %s → %s", (shortcut, platform, expected) => {
    expect(formatShortcut(shortcut, platform)).toBe(expected)
  })
})

describe("detectPlatform", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("detects Apple platforms", () => {
    vi.stubGlobal("navigator", { platform: "MacIntel", userAgent: "" })
    expect(detectPlatform()).toBe("mac")
    vi.stubGlobal("navigator", { userAgentData: { platform: "Windows" }, platform: "", userAgent: "" })
    expect(detectPlatform()).toBe("other")
  })
})

describe("KeyboardKey", () => {
  it("renders a single key from children", () => {
    renderWithOnu(<KeyboardKey>Esc</KeyboardKey>)
    expect(screen.getByText("Esc").tagName).toBe("KBD")
  })

  it("renders a platform combo with spoken names for screen readers", () => {
    const { container } = renderWithOnu(<KeyboardKey keys="mod+k" platform="mac" />)
    expect(container.querySelector("[data-slot=keyboard-key]")).toHaveAttribute("data-platform", "mac")
    expect(screen.getByText("Command K")).toHaveClass("sr-only")
    const keys = container.querySelectorAll("kbd[aria-hidden]")
    expect(Array.from(keys, (k) => k.textContent)).toEqual(["⌘", "K"])
  })

  it("adds + separators on other platforms and 'then' between steps", () => {
    const { container } = renderWithOnu(<KeyboardKey keys="ctrl+s g" platform="other" classNames={{ key: "k" }} />)
    expect(screen.getByText("Control S, then G")).toBeInTheDocument()
    expect(container).toHaveTextContent("Ctrl+Sthen")
    expect(container.querySelector("kbd.k")).toBeInTheDocument()
  })

  it("speaks key names in Dhivehi", () => {
    renderWithOnu(<KeyboardKey keys="shift+enter" platform="other" />, { locale: "dv" })
    expect(screen.getByText("ޝިފްޓް އެންޓަރ")).toBeInTheDocument()
  })

  it.each(directions)("keeps keys in LTR order in %s", async (dir) => {
    const { container } = renderWithOnu(<KeyboardKey keys="mod+k" platform="other" className="custom" />, { dir })
    expect(container.querySelector("[data-slot=keyboard-key]")).toHaveClass("custom")
    expect(container.querySelector("[data-slot=keyboard-key]")).toHaveAttribute("dir", "ltr")
    await expectNoA11yViolations(container)
  })
})
