"use client"

import * as React from "react"
import { Cell } from "recharts"

import { seriesRange, type ChartDatum } from "./_shared"

const ChartGradientContext = React.createContext<boolean | undefined>(undefined)

export interface ChartStyleProviderProps {
  /** `false` draws solid fills in every Onu chart inside; `true` turns gradient fills back on. */
  gradient: boolean
  children?: React.ReactNode
}

/**
 * Sets the fill style of every Onu chart inside, e.g. `gradient={false}` for print views or a
 * flat brand. A chart's own `gradient` prop wins over it.
 */
export function ChartStyleProvider({ gradient, children }: ChartStyleProviderProps) {
  return <ChartGradientContext.Provider value={gradient}>{children}</ChartGradientContext.Provider>
}

/**
 * Whether a chart draws gradient fills: the `gradient` prop, else the nearest
 * {@link ChartStyleProvider}, else `true`. Forced-colours mode always falls back to solid (in CSS).
 */
export function useChartGradient(gradient?: boolean): boolean {
  const fromProvider = React.useContext(ChartGradientContext)
  return gradient ?? fromProvider ?? true
}

/** A gradient stop: `opacity` with gradients on, `solid` in forced-colours mode. */
export interface GradientStop {
  offset: number
  opacity: number
}

export interface GradientDef {
  id: string
  /** Any CSS colour, usually `var(--color-<key>)` set by `ChartContainer`. */
  color: string
  /** Vector in the filled shape's bounding box (0–1). */
  x1: number
  y1: number
  x2: number
  y2: number
  stops: GradientStop[]
  /** Opacity of every stop in forced-colours mode (a flat fill). */
  solid: number
}

/**
 * Prefix for this chart instance's gradient ids. `useId` keeps several charts on one page
 * from clashing; anything that is not safe in a `url(#…)` reference is stripped.
 */
export function useGradientId(): string {
  return `onu-fill-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
}

/**
 * Classes for `ChartContainer` when gradients are on: in forced-colours (high contrast) mode
 * every stop takes its solid opacity, so fills are flat again.
 */
export const GRADIENT_FALLBACK =
  "forced-colors:[&_[data-slot=chart-gradient-stop]]:[stop-opacity:var(--onu-stop-solid)]!"

/** `<defs>` with one `<linearGradient>` per definition. Render inside a Recharts chart. */
export function ChartGradients({ defs }: { defs: GradientDef[] }) {
  if (!defs.length) return null
  return (
    <defs data-slot="chart-gradients">
      {defs.map((def) => (
        <linearGradient key={def.id} id={def.id} x1={def.x1} y1={def.y1} x2={def.x2} y2={def.y2}>
          {def.stops.map((stop, index) => (
            <stop
              key={index}
              offset={stop.offset}
              data-slot="chart-gradient-stop"
              // Styles (not presentation attributes) so `var()` colours resolve in every engine.
              style={
                {
                  stopColor: def.color,
                  stopOpacity: stop.opacity,
                  "--onu-stop-solid": def.solid,
                } as React.CSSProperties
              }
            />
          ))}
        </linearGradient>
      ))}
    </defs>
  )
}

/** Opacity at the top of an area and at its baseline. */
export interface AreaStrength {
  top: number
  base: number
}

/** A soft wash: strong under the line, almost clear at the baseline. */
export const AREA_STRENGTH: AreaStrength = { top: 0.5, base: 0.03 }
/** Stacked bands stay readable at their lower edge, where they meet the band below. */
export const STACKED_AREA_STRENGTH: AreaStrength = { top: 0.6, base: 0.2 }

/**
 * A vertical area gradient that is strongest away from the zero line. Positive areas fade
 * downwards, negative areas fade upwards and areas that cross zero fade towards it from both
 * sides. `range` is the series' lowest and highest value (the area's bounding box includes 0).
 */
export function areaGradient(
  id: string,
  color: string,
  range: { min: number; max: number } | null,
  strength: AreaStrength,
  solid: number,
): GradientDef {
  const { top, base } = strength
  let stops: GradientStop[] = [
    { offset: 0, opacity: top },
    { offset: 1, opacity: base },
  ]
  if (range && range.max <= 0 && range.min < 0) {
    stops = [
      { offset: 0, opacity: base },
      { offset: 1, opacity: top },
    ]
  } else if (range && range.min < 0 && range.max > 0) {
    const zero = range.max / (range.max - range.min)
    stops = [
      { offset: 0, opacity: top },
      { offset: zero, opacity: base },
      { offset: 1, opacity: top },
    ]
  }
  return { id, color, x1: 0, y1: 0, x2: 0, y2: 1, stops, solid }
}

/** Opacity at the bar's base (the value end is always 1). */
export const BAR_BASE = 0.72

/** Which way a bar grows on screen, from its base to its value. */
export type BarDirection = "up" | "down" | "left" | "right"

const BAR_VECTORS: Record<BarDirection, [number, number, number, number]> = {
  up: [0, 1, 0, 0],
  down: [0, 0, 0, 1],
  right: [0, 0, 1, 0],
  left: [1, 0, 0, 0],
}

/** A bar gradient running from a lighter base to the full series colour at the value end. */
export function barGradient(id: string, color: string, direction: BarDirection, base = BAR_BASE): GradientDef {
  const [x1, y1, x2, y2] = BAR_VECTORS[direction]
  return {
    id,
    color,
    x1,
    y1,
    x2,
    y2,
    stops: [
      { offset: 0, opacity: base },
      { offset: 1, opacity: 1 },
    ],
    solid: 1,
  }
}

/**
 * Directions of a series' positive and negative bars. Vertical bars grow up (down when negative);
 * horizontal bars grow towards the inline end: right in LTR, left in RTL (the value axis is reversed).
 */
export function barDirections(horizontal: boolean, rtl: boolean): { positive: BarDirection; negative: BarDirection } {
  if (!horizontal) return { positive: "up", negative: "down" }
  return rtl ? { positive: "left", negative: "right" } : { positive: "right", negative: "left" }
}

/** `url(#id)` for a `fill`. */
export function fillUrl(id: string) {
  return `url(#${id})`
}

/** Opacity of solid (non-gradient) area fills. */
export function solidAreaOpacity(stacked: boolean) {
  return stacked ? 0.4 : 0.15
}

export interface SeriesFills {
  defs: GradientDef[]
  /** `fill` per series (same order). */
  fill: string[]
  /** `fillOpacity` for area series. */
  fillOpacity: number
  /** Per-bar `<Cell>`s for series with both positive and negative bars, else `undefined`. */
  cells: (React.ReactNode[] | undefined)[]
}

interface SeriesFillOptions {
  gradient: boolean
  gradientId: string
  series: { key: string }[]
  data: ChartDatum[]
}

/** Fills for area series: a vertical fade per series, or the flat series colour. */
export function areaSeriesFills({
  gradient,
  gradientId,
  series,
  data,
  stacked = false,
  strength,
}: SeriesFillOptions & { stacked?: boolean; strength?: AreaStrength }): SeriesFills {
  const solid = solidAreaOpacity(stacked)
  if (!gradient) {
    return {
      defs: [],
      fill: series.map((s) => `var(--color-${s.key})`),
      fillOpacity: solid,
      cells: series.map(() => undefined),
    }
  }
  const defs = series.map((s, i) =>
    areaGradient(
      `${gradientId}-${i}`,
      `var(--color-${s.key})`,
      // A stacked band's box does not start at zero: keep a plain top-to-bottom fade.
      stacked ? null : seriesRange(data, s.key),
      strength ?? (stacked ? STACKED_AREA_STRENGTH : AREA_STRENGTH),
      solid,
    ),
  )
  return { defs, fill: defs.map((d) => fillUrl(d.id)), fillOpacity: 1, cells: series.map(() => undefined) }
}

/**
 * Fills for bar series: each bar runs from a lighter base to the full colour at its value end,
 * mirrored for negative bars and for horizontal bars in RTL. Flat colours without gradients.
 */
export function barSeriesFills({
  gradient,
  gradientId,
  series,
  data,
  horizontal = false,
  rtl = false,
  base,
}: SeriesFillOptions & { horizontal?: boolean; rtl?: boolean; base?: number }): SeriesFills {
  const result: SeriesFills = { defs: [], fill: [], fillOpacity: 1, cells: [] }
  const directions = barDirections(horizontal, rtl)
  series.forEach((s, i) => {
    const color = `var(--color-${s.key})`
    if (!gradient) {
      result.fill.push(color)
      result.cells.push(undefined)
      return
    }
    const range = seriesRange(data, s.key)
    const positive = barGradient(`${gradientId}-${i}`, color, directions.positive, base)
    const negative = barGradient(`${gradientId}-${i}-neg`, color, directions.negative, base)
    if (range && range.max <= 0 && range.min < 0) {
      result.defs.push(negative)
      result.fill.push(fillUrl(negative.id))
      result.cells.push(undefined)
    } else if (range && range.min < 0) {
      result.defs.push(positive, negative)
      result.fill.push(fillUrl(positive.id))
      result.cells.push(
        data.map((datum, index) => {
          const value = datum[s.key]
          const id = typeof value === "number" && value < 0 ? negative.id : positive.id
          return <Cell key={index} fill={fillUrl(id)} />
        }),
      )
    } else {
      result.defs.push(positive)
      result.fill.push(fillUrl(positive.id))
      result.cells.push(undefined)
    }
  })
  return result
}
