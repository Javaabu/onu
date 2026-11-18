"use client"

import * as React from "react"

import { DEFAULT_THEME_STORAGE_KEY, type ResolvedTheme, type Theme, type ThemeScriptOptions } from "./theme-script"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const storedListeners = new Set<() => void>()
/** Choices made this visit, for when storage is unavailable (private mode). */
const unsaved = new Map<string, Theme>()

function readStored(key: string): Theme | null {
  try {
    const value = window.localStorage.getItem(key)
    return value === "light" || value === "dark" || value === "system" ? value : null
  } catch {
    return unsaved.get(key) ?? null
  }
}

function writeStored(key: string, theme: Theme) {
  try {
    window.localStorage.setItem(key, theme)
    unsaved.delete(key)
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this visit.
    unsaved.set(key, theme)
  }
  for (const listener of storedListeners) listener()
}

/** Follows choices made through `setTheme` and, through the `storage` event, in other tabs. */
function subscribeStored(onChange: () => void) {
  storedListeners.add(onChange)
  window.addEventListener("storage", onChange)
  return () => {
    storedListeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

function systemTheme(): ResolvedTheme {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function subscribeSystem(onChange: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)")
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function apply(resolved: ResolvedTheme, target: HTMLElement) {
  target.classList.toggle("dark", resolved === "dark")
  target.dataset.theme = resolved
  target.style.colorScheme = resolved
}

export interface ThemeProviderProps extends ThemeScriptOptions {
  children?: React.ReactNode
}

/**
 * Light / dark / system theme with persistence (R10.3). Toggles the `.dark`
 * class and `data-theme` on `<html>`, so overlays rendered in portals follow it.
 * Use `themeScript()` in SSR apps to avoid a flash before hydration.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  forcedTheme,
  storageKey = DEFAULT_THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // The server and the hydrating client both render `defaultTheme`; the stored choice follows
  // right after hydration, so the markup matches.
  const stored = React.useSyncExternalStore(
    subscribeStored,
    () => readStored(storageKey),
    () => null,
  )
  const theme = stored ?? defaultTheme
  const system = React.useSyncExternalStore(subscribeSystem, systemTheme, () => "light" as const)

  const resolvedTheme: ResolvedTheme = forcedTheme ?? (theme === "system" ? system : theme)

  React.useEffect(() => {
    apply(resolvedTheme, document.documentElement)
  }, [resolvedTheme])

  const setTheme = React.useCallback((next: Theme) => writeStored(storageKey, next), [storageKey])

  const value = React.useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Current theme. Works without a provider (falls back to light, read-only). */
export function useTheme(): ThemeContextValue {
  return (
    React.useContext(ThemeContext) ?? {
      theme: "light",
      resolvedTheme: "light",
      setTheme: () => {},
    }
  )
}
