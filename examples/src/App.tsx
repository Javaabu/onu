import * as React from "react"
import { HashRouter, Link, Navigate, Route, Routes } from "react-router"
import { OnuProvider, Spinner, ThemeProvider, Toaster, TooltipProvider } from "@javaabu/onu"
import { DEMO_MAP_ID, googleMapsAdapter, MapProvider } from "@javaabu/onu/maps"

import { SearchProvider } from "./components/search"
import { EntryView, PageReady, SectionIndex, componentsSection, pagesSection } from "./components/views"
import { demos, pages } from "./registry"
import { SettingsProvider, useSettings } from "./settings"

/** The landing page has charts and form demos; load it as its own chunk so deep links skip it. */
const Home = React.lazy(() => import("./components/home").then((m) => ({ default: m.Home })))

function HomeRoute() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner size="lg" label="Loading…" className="text-muted-foreground" />
        </div>
      }
    >
      <Home />
      <PageReady />
    </React.Suspense>
  )
}

const RouterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function RouterLink({ href, ...props }, ref) {
  return <Link ref={ref} to={href} {...props} />
})

/**
 * `VITE_GOOGLE_MAPS_FORCE=1` runs every map on the real Google Maps adapter even
 * without `VITE_GOOGLE_MAPS_API_KEY`, for local verification. Google then loads in
 * development mode (watermarked, "NoApiKeys" console warnings). Examples only: the
 * library still uses the placeholder when an app has no key.
 */
const forceGoogleMaps = import.meta.env.VITE_GOOGLE_MAPS_FORCE === "1"

/*
 * The demo build passes the GOOGLE_MAPS_API_KEY and GOOGLE_MAPS_MAP_ID secrets.
 * An unset secret arrives as an empty string: without a key the maps use the
 * placeholder adapter, and without a Map ID they use Google's DEMO_MAP_ID so
 * advanced markers still work.
 */
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || undefined
const googleMapsMapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || DEMO_MAP_ID

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
        googleMapsApiKey,
        mapId: googleMapsMapId,
      }}
    >
      <TooltipProvider>
        {forceGoogleMaps ? <MapProvider adapter={googleMapsAdapter}>{children}</MapProvider> : children}
      </TooltipProvider>
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
                <Route path="/" element={<HomeRoute />} />
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
