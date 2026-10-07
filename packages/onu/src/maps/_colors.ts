"use client"

import * as React from "react"

import type { MapTone } from "./types"

/** CSS variable behind each tone. */
const TONE_VARS: Record<MapTone, string> = {
  primary: "--primary",
  muted: "--muted-foreground",
  success: "--success",
  warning: "--warning",
  destructive: "--destructive",
  info: "--info",
  "chart-1": "--chart-1",
  "chart-2": "--chart-2",
  "chart-3": "--chart-3",
  "chart-4": "--chart-4",
  "chart-5": "--chart-5",
  "chart-6": "--chart-6",
  "chart-7": "--chart-7",
  "chart-8": "--chart-8",
}

/** Used when the tokens cannot be read (server, tests). Close to the default Onu theme. */
const FALLBACK: Record<MapTone | "background" | "foreground", string> = {
  primary: "#1f7a4d",
  muted: "#6b7280",
  success: "#16a34a",
  warning: "#d97706",
  destructive: "#dc2626",
  info: "#2563eb",
  "chart-1": "#1f7a4d",
  "chart-2": "#2563eb",
  "chart-3": "#d97706",
  "chart-4": "#9333ea",
  "chart-5": "#dc2626",
  "chart-6": "#0891b2",
  "chart-7": "#65a30d",
  "chart-8": "#db2777",
  background: "#ffffff",
  foreground: "#111827",
}

export type MapColors = Record<MapTone | "background" | "foreground", string>

/** Theme CSS variables can be cssVar names or `var()` references; `MapTone` is resolved through `TONE_VARS`. */
export function toneVar(tone: MapTone) {
  return `var(${TONE_VARS[tone]})`
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`
}

let canvasCtx: CanvasRenderingContext2D | null | undefined

/** Converts any CSS colour the browser understands (oklch, color-mix, …) to `#rrggbb`. */
export function cssColorToHex(color: string): string | null {
  const value = color.trim()
  if (!value) return null
  if (/^#[0-9a-f]{6}$/i.test(value)) return value.toLowerCase()
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value)
  if (rgb) return toHex(Number(rgb[1]), Number(rgb[2]), Number(rgb[3]))
  if (typeof document === "undefined" || /jsdom/i.test(navigator.userAgent)) return null
  try {
    if (canvasCtx === undefined) {
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 1
      canvasCtx = canvas.getContext("2d", { willReadFrequently: true })
    }
    if (!canvasCtx) return null
    canvasCtx.clearRect(0, 0, 1, 1)
    canvasCtx.fillStyle = "#000"
    canvasCtx.fillStyle = value
    canvasCtx.fillRect(0, 0, 1, 1)
    const [r = 0, g = 0, b = 0] = canvasCtx.getImageData(0, 0, 1, 1).data
    return toHex(r, g, b)
  } catch {
    return null
  }
}

function readColors(scope: Element | null): MapColors {
  if (typeof document === "undefined" || !document.body) return FALLBACK
  const probe = document.createElement("span")
  probe.style.display = "none"
  ;(scope ?? document.body).appendChild(probe)
  const read = (cssVar: string, fallback: string) => {
    probe.style.color = ""
    probe.style.color = `var(${cssVar})`
    return cssColorToHex(getComputedStyle(probe).color) ?? fallback
  }
  const result = Object.fromEntries(
    (Object.keys(TONE_VARS) as MapTone[]).map((tone) => [tone, read(TONE_VARS[tone], FALLBACK[tone])]),
  ) as MapColors
  result.background = read("--background", FALLBACK.background)
  result.foreground = read("--foreground", FALLBACK.foreground)
  probe.remove()
  return result
}

function readDark() {
  if (typeof document === "undefined") return false
  const html = document.documentElement
  return html.classList.contains("dark") || html.dataset.theme === "dark"
}

function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
  return () => observer.disconnect()
}

/** `true` when dark mode is on (`.dark` or `data-theme="dark"` on `<html>`, R10.2). */
export function useIsDark() {
  return React.useSyncExternalStore(subscribeTheme, readDark, () => false)
}

/**
 * The theme's colours as `#rrggbb`, for engines that cannot read CSS variables
 * (Google shapes, terra-draw, deck.gl). Updates when the theme or primary colour changes.
 */
export function useMapColors(scope?: React.RefObject<Element | null>): MapColors {
  const [colors, setColors] = React.useState<MapColors>(FALLBACK)
  React.useEffect(() => {
    const update = () => setColors(readColors(scope?.current ?? null))
    update()
    return subscribeTheme(update)
  }, [scope])
  return colors
}

/** `#rrggbb` → `[r, g, b]` for deck.gl. */
export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export { FALLBACK as FALLBACK_MAP_COLORS }
