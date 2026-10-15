import * as React from "react"
import { cn } from "@javaabu/onu"

/** The Onu mark, drawn in the current primary colour so it re-brands with the theme. */
export function BrandMark({ className }: { className?: string }) {
  // Onu means bamboo: two leaning culms with nodes and leaves, on a primary gradient tile.
  const id = `onu-mark-${React.useId().replace(/:/g, "")}`
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-6 shrink-0", className)}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "color-mix(in oklab, var(--primary), white 14%)" }} />
          <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--primary), black 10%)" }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      <g className="fill-primary-foreground">
        <g transform="rotate(-7 13 26)">
          <path d="M11.3 27.5h3.6l-.15-6.9h-3.3z" />
          <path d="M11.5 19.6h3.3l-.15-6.1h-3z" />
          <path d="M11.7 12.5h3l-.2-6.2c0-.6-.4-1-1.3-1s-1.3.4-1.3 1z" />
          <rect x="10.6" y="19.85" width="5" height="1.05" rx=".5" />
          <rect x="10.9" y="12.75" width="4.6" height="1.05" rx=".5" />
        </g>
        <g transform="rotate(6 20 27)" opacity=".78">
          <path d="M18.7 27.5h2.8l-.12-6.8h-2.56z" />
          <path d="M18.9 19.7h2.5l-.12-3.6c0-.55-.38-.9-1.13-.9s-1.13.35-1.13.9z" />
          <rect x="18.05" y="19.95" width="4.1" height="1" rx=".5" />
        </g>
        <path d="M15.6 12.9c.9-3.2 3.2-5.3 6.2-6.1-.4 2.9-2.7 5.4-6.2 6.1z" />
        <path d="M15.4 13.7c2.6-1.1 5.5-.9 7.6.6-2.4 1.5-5.3 1.3-7.6-.6z" opacity=".85" />
        <path d="M11.4 20.4c-2.1-1.9-4.7-2.5-7-1.8 1.3 2.2 4 3.1 7 1.8z" opacity=".9" />
      </g>
    </svg>
  )
}
