import * as React from "react"
import type { Density, LabelLayout } from "@javaabu/onu"

export interface ShowcaseSettings {
  locale: "en" | "dv"
  dir: "ltr" | "rtl" | "auto"
  density: Density
  labelLayout: LabelLayout
  primary: string
  radius: number
}

const DEFAULTS: ShowcaseSettings = {
  locale: "en",
  dir: "auto",
  density: "default",
  labelLayout: "stacked",
  primary: "",
  radius: 0.625,
}

const KEY = "onu-showcase-settings"

function read(): ShowcaseSettings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") }
  } catch {
    return DEFAULTS
  }
}

const SettingsContext = React.createContext<{
  settings: ShowcaseSettings
  update: (patch: Partial<ShowcaseSettings>) => void
} | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState(read)
  const update = React.useCallback((patch: Partial<ShowcaseSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  React.useEffect(() => {
    const root = document.documentElement.style
    if (settings.primary) root.setProperty("--onu-primary", settings.primary)
    else root.removeProperty("--onu-primary")
    root.setProperty("--onu-radius", `${settings.radius}rem`)
  }, [settings.primary, settings.radius])

  const value = React.useMemo(() => ({ settings, update }), [settings, update])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings outside SettingsProvider")
  return ctx
}
