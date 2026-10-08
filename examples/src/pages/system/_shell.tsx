import * as React from "react"
import { LanguageSwitcher, Logo, ThemeToggle } from "@javaabu/onu"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { BrandMark } from "../../components/layout"

/**
 * Bare frame for full-page system states (500, 503) shown when the app shell
 * itself may be unavailable: just the logo, language and theme.
 */
export function SystemShell({ children }: { children: React.ReactNode }) {
  const tr = useTr()
  const { settings, update } = useSettings()
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="gap-2 px-4 py-3 flex items-center justify-between border-b">
        <Logo
          children={<BrandMark className="size-7" />}
          alt="Onu"
          text={tr("eServices", "އީ ސަރވިސަސް")}
          href={routes.public.home}
        />
        <div className="gap-1 flex items-center">
          <LanguageSwitcher
            value={settings.locale}
            onChange={(code) => update({ locale: code as "en" | "dv" })}
            size="sm"
          />
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="px-4 pb-16 flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
