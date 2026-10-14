"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"
import { useTranslation } from "../providers/onu-provider"
import { toneVar } from "./_colors"
import type { MapTone } from "./types"
import { registerEnglish } from "../i18n/english"
import { map as en_map } from "../locales/en/map"

registerEnglish({ map: en_map })

export type MapLegendShape = "circle" | "square" | "pin" | "line" | "dashed" | "area" | "gradient"

export const mapLegendSwatchVariants = cva("inline-block shrink-0", {
  variants: {
    size: {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    },
  },
  defaultVariants: { size: "md" },
})

export interface MapLegendSwatchProps
  extends Omit<React.ComponentProps<"svg">, "children">, VariantProps<typeof mapLegendSwatchVariants> {
  tone?: MapTone
  shape?: MapLegendShape
  /** Colours for the `gradient` shape, low to high (CSS colours or tokens). */
  colors?: string[]
}

/**
 * A colour/shape sample that matches how a layer is drawn on the map. Decorative:
 * always pair it with a text label (colour is never the only cue, R14.6).
 */
export function MapLegendSwatch({
  tone = "primary",
  shape = "circle",
  colors,
  size,
  className,
  ...props
}: MapLegendSwatchProps) {
  const color = toneVar(tone)
  const gradientId = React.useId()
  const wide = shape === "line" || shape === "dashed" || shape === "gradient"
  return (
    <svg
      viewBox={wide ? "0 0 32 16" : "0 0 16 16"}
      aria-hidden
      data-slot="map-legend-swatch"
      data-shape={shape}
      className={cn(mapLegendSwatchVariants({ size }), wide && "w-[2em]", className)}
      {...props}
    >
      {shape === "circle" ? (
        <circle cx="8" cy="8" r="6" style={{ fill: color }} className="stroke-background" strokeWidth="1.5" />
      ) : null}
      {shape === "square" ? <rect x="2" y="2" width="12" height="12" rx="2" style={{ fill: color }} /> : null}
      {shape === "area" ? (
        <rect
          x="1.5"
          y="1.5"
          width="13"
          height="13"
          rx="2"
          style={{ fill: color, stroke: color }}
          fillOpacity={0.25}
          strokeWidth="2"
        />
      ) : null}
      {shape === "pin" ? (
        <path
          d="M8 1C5 1 2.8 3.2 2.8 6.1 2.8 9.8 8 15 8 15s5.2-5.2 5.2-8.9C13.2 3.2 11 1 8 1Z"
          style={{ fill: color }}
        />
      ) : null}
      {shape === "line" || shape === "dashed" ? (
        <line
          x1="2"
          y1="8"
          x2="30"
          y2="8"
          style={{ stroke: color }}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={shape === "dashed" ? "5 4" : undefined}
        />
      ) : null}
      {shape === "gradient" ? (
        <>
          <defs>
            <linearGradient id={gradientId}>
              {(colors?.length ? colors : [color]).map((c, i, all) => (
                <stop key={i} offset={`${(i / Math.max(1, all.length - 1)) * 100}%`} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <rect x="1" y="3" width="30" height="10" rx="3" fill={`url(#${gradientId})`} />
        </>
      ) : null}
    </svg>
  )
}

export interface MapLegendItem {
  label: React.ReactNode
  tone?: MapTone
  shape?: MapLegendShape
  colors?: string[]
  /** Extra text, e.g. a count. */
  description?: React.ReactNode
}

export const mapLegendVariants = cva("text-sm", {
  variants: {
    orientation: {
      vertical: "gap-1.5 grid",
      horizontal: "gap-x-4 gap-y-1.5 flex flex-wrap",
    },
  },
  defaultVariants: { orientation: "vertical" },
})

export interface MapLegendProps
  extends Omit<React.ComponentProps<"div">, "title">, VariantProps<typeof mapLegendVariants> {
  items: MapLegendItem[]
  /** Heading above the list. Defaults to "Legend". Pass `null` to hide it. */
  title?: React.ReactNode
  size?: MapLegendSwatchProps["size"]
  classNames?: { title?: string; list?: string; item?: string; swatch?: string }
}

/** A labelled list of legend swatches, for under or over a map. */
export function MapLegend({ items, title, orientation, size = "sm", className, classNames, ...props }: MapLegendProps) {
  const { t } = useTranslation()
  const titleId = React.useId()
  const heading = title === undefined ? t("map.legend") : title
  return (
    <div data-slot="map-legend" className={cn("gap-1.5 grid", className)} {...props}>
      {heading !== null ? (
        <p id={titleId} className={cn("font-medium text-xs text-muted-foreground", classNames?.title)}>
          {heading}
        </p>
      ) : null}
      <ul
        aria-labelledby={heading !== null ? titleId : undefined}
        className={cn(mapLegendVariants({ orientation }), classNames?.list)}
      >
        {items.map((item, i) => (
          <li key={i} className={cn("gap-2 flex items-center", classNames?.item)}>
            <MapLegendSwatch
              tone={item.tone}
              shape={item.shape}
              colors={item.colors}
              size={size}
              className={classNames?.swatch}
            />
            <span>{item.label}</span>
            {item.description ? <span className="text-muted-foreground tabular-nums">{item.description}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
