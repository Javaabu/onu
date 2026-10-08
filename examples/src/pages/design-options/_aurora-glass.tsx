import * as React from "react"
import { cn } from "@javaabu/onu"

import "./aurora-glass.css"

/**
 * Root of an Aurora Glass page: the scoped class, the drifting aurora with film
 * grain, the SVG gradients the charts fade into, and the cursor spotlight for
 * every `.ag-spot` card (mouse only; CSS turns it off for touch and reduced motion).
 */
export function AuroraRoot({ className, children }: { className?: string; children: React.ReactNode }) {
  // Portaled surfaces (phone sidebar, popovers) live outside the root, so mark <body> while mounted.
  React.useEffect(() => {
    document.body.classList.add("ag-portal")
    return () => document.body.classList.remove("ag-portal")
  }, [])

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return
    const card = (event.target as HTMLElement).closest<HTMLElement>(".ag-spot")
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`)
    card.style.setProperty("--my", `${event.clientY - rect.top}px`)
  }, [])

  return (
    <div className={cn("design-aurora-glass", className)} onPointerMove={onPointerMove}>
      <div className="ag-aurora" aria-hidden>
        <div className="ag-aurora__field ag-aurora__field--a" />
        <div className="ag-aurora__field ag-aurora__field--b" />
        <div className="ag-aurora__field ag-aurora__field--c" />
        <div className="ag-aurora__field ag-aurora__field--d" />
        <div className="ag-aurora__curtain" />
        <div className="ag-aurora__grain" />
      </div>
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ag-fade-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--ag-a)", stopOpacity: 0.45 }} />
            <stop offset="100%" style={{ stopColor: "var(--ag-a)", stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="ag-fade-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--ag-b)", stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: "var(--ag-b)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
      </svg>
      {children}
    </div>
  )
}

/** The Raajje Cloud mark: a lit ring around an island dot, in the brand hues. */
export function AuroraMark({ className }: { className?: string }) {
  const id = `ag${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7 shrink-0", className)}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--ag-b)" }} />
          <stop offset="55%" style={{ stopColor: "var(--ag-a)" }} />
          <stop offset="100%" style={{ stopColor: "var(--ag-c)" }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}-g)`} />
      <circle cx="16" cy="16" r="8.5" fill="none" className="ag-mark-line" strokeWidth="2.25" opacity="0.9" />
      <path d="M9.5 19.5c2.2-1.6 4.4-1.6 6.5 0s4.3 1.6 6.5 0" fill="none" className="ag-mark-line" strokeWidth="2" />
      <circle cx="16" cy="13" r="2.2" className="ag-mark-dot" />
    </svg>
  )
}
