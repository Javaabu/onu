"use client"

import { OnuProvider, ThemeProvider, TooltipProvider } from "@javaabu/onu"
import Link from "next/link"

import type { Locale } from "@/lib/locale"

/**
 * Client boundary for Onu's providers. `linkComponent` is a function, which a
 * Server Component cannot pass to a client component, so the providers live here.
 */
export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OnuProvider locale={locale} linkComponent={Link}>
        {/* Tooltips (e.g. a collapsed AppSidebar's labels) need one provider at the root. */}
        <TooltipProvider>{children}</TooltipProvider>
      </OnuProvider>
    </ThemeProvider>
  )
}
