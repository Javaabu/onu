"use client"

import { OnuProvider, ThemeProvider, TooltipProvider } from "@javaabu/onu"
import { dv } from "@javaabu/onu/locales/dv"
import Link from "next/link"

/**
 * `linkComponent` is a function, which a Server Component can't pass to a client component. `locale={dv}` bundles the
 * Dhivehi text so the server renders it; `locale="dv"` would load it on demand, after the first render.
 */
export function Providers({ locale, children }: { locale: "en" | "dv"; children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OnuProvider locale={locale === "dv" ? dv : "en"} linkComponent={Link}>
        <TooltipProvider>{children}</TooltipProvider>
      </OnuProvider>
    </ThemeProvider>
  )
}
