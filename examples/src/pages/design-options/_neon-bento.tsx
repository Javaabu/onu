import * as React from "react"
import { LanguageSwitcher, cn } from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useDv } from "../_shared/i18n"
import "./neon-bento.css"

export const NB_ROUTES = {
  index: "/pages/design-options/neon-bento-index",
  dashboard: "/pages/design-options/neon-bento-dashboard",
}

/** Moves the hover spotlight of the tile under the pointer. */
function spotlight(event: React.PointerEvent<HTMLElement>) {
  const tile = (event.target as HTMLElement).closest<HTMLElement>(".nb-tile")
  if (!tile) return
  const r = tile.getBoundingClientRect()
  tile.style.setProperty("--mx", `${event.clientX - r.left}px`)
  tile.style.setProperty("--my", `${event.clientY - r.top}px`)
}

/** Root of the Neon Bento option: scoped theme, backdrop grid and pointer spotlight. */
export function NeonBentoRoot({
  children,
  className,
  variant = "site",
}: {
  children: React.ReactNode
  className?: string
  variant?: "site" | "app"
}) {
  const dv = useDv()
  return (
    <div
      data-onu-theme
      className={cn("design-neon-bento", dv && "nb-dv", className)}
      onPointerMove={(e) => e.pointerType === "mouse" && spotlight(e)}
    >
      <div aria-hidden className="nb-backdrop" data-variant={variant} />
      {children}
    </div>
  )
}

export function NbLanguage({ variant = "menu" }: { variant?: "select" | "menu" }) {
  const { settings, update } = useSettings()
  return (
    <LanguageSwitcher
      variant={variant}
      value={settings.locale}
      onChange={(code) => update({ locale: code as "en" | "dv" })}
      size="sm"
    />
  )
}

/** Monospace micro-label, e.g. `// 01 — PLATFORM`. */
export function MicroLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("nb-mono text-muted-foreground", className)}>{children}</p>
}

/** The Onu Platform mark: a neon "O" made of two bento cells. */
export function NbMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7 shrink-0", className)}>
      <rect x="1" y="1" width="30" height="30" rx="9" className="fill-foreground" />
      <rect x="7" y="7" width="8" height="18" rx="3" className="fill-primary" />
      <rect x="17" y="7" width="8" height="8" rx="3" className="fill-background" />
      <rect x="17" y="17" width="8" height="8" rx="3" className="fill-primary opacity-60" />
    </svg>
  )
}
