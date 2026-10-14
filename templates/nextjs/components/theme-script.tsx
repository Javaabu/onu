"use client"

import { themeScript } from "@javaabu/onu"

/**
 * Applies the stored theme before the first paint (no light/dark flash).
 *
 * `@javaabu/onu` is a client module, so `themeScript()` can't be called from a
 * Server Component; this small client component renders the script during SSR.
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript() }} suppressHydrationWarning />
}
