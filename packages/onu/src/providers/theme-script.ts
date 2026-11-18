// No "use client": `themeScript` is called from Server Components (a root layout's <head>).

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

export const DEFAULT_THEME_STORAGE_KEY = "onu-theme"

/** Options shared by `ThemeProvider` and `themeScript`. */
export interface ThemeScriptOptions {
  /** Initial theme when nothing is stored. */
  defaultTheme?: Theme
  /** Fix the theme (no persistence, ignores the user's choice). */
  forcedTheme?: ResolvedTheme
  storageKey?: string
}

/**
 * Inline script for `<head>` that applies the stored theme before first paint. Pass the same
 * options as `ThemeProvider` so the two agree. Works in Server Components.
 * `<script dangerouslySetInnerHTML={{ __html: themeScript() }} />`
 */
export function themeScript({
  storageKey = DEFAULT_THEME_STORAGE_KEY,
  defaultTheme = "system",
  forcedTheme,
}: ThemeScriptOptions = {}) {
  const pick = forcedTheme
    ? `var t=${JSON.stringify(forcedTheme)}`
    : `var t=localStorage.getItem(${JSON.stringify(storageKey)});if(t!=="light"&&t!=="dark"&&t!=="system")t=${JSON.stringify(defaultTheme)}`
  return `(function(){try{${pick};var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.dataset.theme=d?"dark":"light";e.style.colorScheme=d?"dark":"light"}catch(_){}})()`
}
