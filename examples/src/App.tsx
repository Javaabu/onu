import * as React from "react"
import { HashRouter, Link, Navigate, Route, Routes } from "react-router"
import { OnuProvider, ThemeProvider, Toaster, TooltipProvider } from "@javaabu/onu"

import { Home } from "./components/home"
import { SearchProvider } from "./components/search"
import { EntryView, SectionIndex, componentsSection, pagesSection } from "./components/views"
import { demos, pages } from "./registry"
import { SettingsProvider, useSettings } from "./settings"

const RouterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function RouterLink({ href, ...props }, ref) {
  return <Link ref={ref} to={href} {...props} />
})

function Providers({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  return (
    <OnuProvider
      locale={settings.locale}
      dir={settings.dir === "auto" ? undefined : settings.dir}
      density={settings.density}
      labelLayout={settings.labelLayout}
      linkComponent={RouterLink}
      maps={{
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
      }}
    >
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </OnuProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Providers>
          <HashRouter>
            <SearchProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/components" element={<SectionIndex section={componentsSection} />} />
                <Route path="/pages" element={<SectionIndex section={pagesSection} />} />
                <Route path="/components/*" element={<EntryView entries={demos} />} />
                <Route path="/pages/*" element={<EntryView entries={pages} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </SearchProvider>
          </HashRouter>
        </Providers>
      </SettingsProvider>
    </ThemeProvider>
  )
}
