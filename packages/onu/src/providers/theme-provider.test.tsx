import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { hydrateAfterServer } from "../../test/hydrate"
import { controllableMatchMedia } from "../../test/match-media"
import { ThemeProvider, themeScript, useTheme, type ThemeProviderProps } from "./theme-provider"

const DARK_QUERY = "(prefers-color-scheme: dark)"

function Probe() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button type="button" onClick={() => setTheme("dark")}>
        Dark
      </button>
      <button type="button" onClick={() => setTheme("system")}>
        System
      </button>
    </>
  )
}

const renderTheme = (props: Omit<ThemeProviderProps, "children"> = {}) =>
  render(
    <ThemeProvider {...props}>
      <Probe />
    </ThemeProvider>,
  )
const text = (id: string) => screen.getByTestId(id).textContent
const html = () => document.documentElement

describe("ThemeProvider", () => {
  let media: ReturnType<typeof controllableMatchMedia>
  beforeEach(() => {
    media = controllableMatchMedia(() => false)
  })
  afterEach(() => {
    media.restore()
    localStorage.clear()
    html().removeAttribute("data-theme")
    html().style.colorScheme = ""
  })

  it("follows the system setting by default, live", () => {
    renderTheme()
    expect(text("theme")).toBe("system")
    expect(text("resolved")).toBe("light")
    expect(html()).not.toHaveClass("dark")
    expect(html()).toHaveAttribute("data-theme", "light")
    act(() => media.set((q) => q === DARK_QUERY))
    expect(text("resolved")).toBe("dark")
    expect(html()).toHaveClass("dark")
    expect(html()).toHaveAttribute("data-theme", "dark")
    expect(html().style.colorScheme).toBe("dark")
  })

  it("sets and persists the user's choice", async () => {
    const user = userEvent.setup()
    renderTheme({ defaultTheme: "light" })
    expect(text("resolved")).toBe("light")
    await user.click(screen.getByRole("button", { name: "Dark" }))
    expect(text("theme")).toBe("dark")
    expect(html()).toHaveClass("dark")
    expect(localStorage.getItem("onu-theme")).toBe("dark")
    await user.click(screen.getByRole("button", { name: "System" }))
    expect(text("resolved")).toBe("light")
    expect(localStorage.getItem("onu-theme")).toBe("system")
  })

  it("starts from the stored theme, under a custom storage key, ignoring junk", () => {
    localStorage.setItem("app-theme", "dark")
    const { unmount } = renderTheme({ storageKey: "app-theme", defaultTheme: "light" })
    expect(text("theme")).toBe("dark")
    unmount()
    localStorage.setItem("app-theme", "purple")
    renderTheme({ storageKey: "app-theme", defaultTheme: "light" })
    expect(text("theme")).toBe("light")
  })

  it("hydrates the server's default, then switches to the stored theme without a mismatch", async () => {
    const { container, errors } = await hydrateAfterServer(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
      () => localStorage.setItem("onu-theme", "dark"),
    )
    expect(errors).toEqual([])
    expect(container.querySelector('[data-testid="theme"]')).toHaveTextContent("dark")
    expect(html()).toHaveClass("dark")
  })

  it("follows a theme chosen in another tab", () => {
    renderTheme({ defaultTheme: "light" })
    act(() => {
      localStorage.setItem("onu-theme", "dark")
      window.dispatchEvent(new StorageEvent("storage", { key: "onu-theme", newValue: "dark" }))
    })
    expect(text("theme")).toBe("dark")
  })

  it("forces a theme regardless of the choice", async () => {
    const user = userEvent.setup()
    renderTheme({ forcedTheme: "dark", defaultTheme: "light" })
    expect(text("resolved")).toBe("dark")
    expect(html()).toHaveClass("dark")
    await user.click(screen.getByRole("button", { name: "System" }))
    expect(text("resolved")).toBe("dark")
  })

  it("still applies the choice when storage is unavailable", async () => {
    const user = userEvent.setup()
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    renderTheme({ defaultTheme: "light" })
    expect(text("theme")).toBe("light")
    await user.click(screen.getByRole("button", { name: "Dark" }))
    expect(text("resolved")).toBe("dark")
    get.mockRestore()
    set.mockRestore()
  })
})

describe("useTheme", () => {
  it("is light and read-only without a provider", () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe("light")
    expect(result.current.resolvedTheme).toBe("light")
    expect(() => result.current.setTheme("dark")).not.toThrow()
  })
})

describe("themeScript", () => {
  let media: ReturnType<typeof controllableMatchMedia>
  afterEach(() => {
    media.restore()
    localStorage.clear()
    html().removeAttribute("data-theme")
    html().style.colorScheme = ""
  })

  const run = (...args: Parameters<typeof themeScript>) => new Function(themeScript(...args))()

  it("applies the stored theme before React loads", () => {
    media = controllableMatchMedia(() => false)
    localStorage.setItem("onu-theme", "dark")
    run()
    expect(html()).toHaveClass("dark")
    expect(html()).toHaveAttribute("data-theme", "dark")
    expect(html().style.colorScheme).toBe("dark")
  })

  it("resolves system and the default, with a custom key", () => {
    media = controllableMatchMedia((q) => q === DARK_QUERY)
    run({ storageKey: "app-theme", defaultTheme: "system" })
    expect(html()).toHaveClass("dark")
    localStorage.setItem("app-theme", "light")
    run({ storageKey: "app-theme", defaultTheme: "system" })
    expect(html()).not.toHaveClass("dark")
    expect(html()).toHaveAttribute("data-theme", "light")
  })

  it("falls back to the default for a junk stored value, like the provider", () => {
    media = controllableMatchMedia(() => false)
    localStorage.setItem("onu-theme", "purple")
    run({ defaultTheme: "dark" })
    expect(html()).toHaveClass("dark")
    render(
      <ThemeProvider defaultTheme="dark">
        <Probe />
      </ThemeProvider>,
    )
    expect(text("resolved")).toBe("dark")
  })

  it("applies a forced theme over the stored one, like the provider", () => {
    media = controllableMatchMedia(() => false)
    localStorage.setItem("onu-theme", "light")
    run({ forcedTheme: "dark" })
    expect(html()).toHaveClass("dark")
    expect(html()).toHaveAttribute("data-theme", "dark")
  })
})
