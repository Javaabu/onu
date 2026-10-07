"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const DEFAULT_STORAGE_KEY = "onu-theme"

function readStored(key: string): Theme | null {
  try {
    const value = window.localStorage.getItem(key)
    return value === "light" || value === "dark" || value === "system" ? value : null
  } catch {
    return null
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

export interface ThemeProviderProps {
  children?: React.ReactNode
  /** Initial theme when nothing is stored. */
  defaultTheme?: Theme
  /** Fix the theme (no persistence, ignores the user's choice). */
  forcedTheme?: ResolvedTheme
  storageKey?: string
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
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    typeof window === "undefined" ? defaultTheme : (readStored(storageKey) ?? defaultTheme),
  )
  const system = React.useSyncExternalStore(subscribeSystem, systemTheme, () => "light" as const)

  const resolvedTheme: ResolvedTheme = forcedTheme ?? (theme === "system" ? system : theme)

  React.useEffect(() => {
    apply(resolvedTheme, document.documentElement)
  }, [resolvedTheme])

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Storage can be unavailable (private mode); the choice still applies for this visit.
      }
    },
    [storageKey],
  )

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

/**
 * Inline script for `<head>` that applies the stored theme before first paint.
 * `<script dangerouslySetInnerHTML={{ __html: themeScript() }} />`
 */
export function themeScript(storageKey = DEFAULT_STORAGE_KEY, defaultTheme: Theme = "system") {
  return `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultTheme)};var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.dataset.theme=d?"dark":"light";e.style.colorScheme=d?"dark":"light"}catch(_){}})()`
}
