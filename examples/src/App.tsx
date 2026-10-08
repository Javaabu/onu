import * as React from "react"
import { HashRouter, Link, Navigate, Route, Routes, useLocation, useParams } from "react-router"
import {
  Badge,
  OnuProvider,
  ScrollArea,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeProvider,
  Toaster,
  TooltipProvider,
} from "@javaabu/onu"
import { googleMapsAdapter, MapProvider } from "@javaabu/onu/maps"

import { Toolbar } from "./components/toolbar"
import { demos, groupBy, pages, type Entry } from "./registry"
import { SettingsProvider, useSettings } from "./settings"

const RouterLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(function RouterLink({ href, ...props }, ref) {
  return <Link ref={ref} to={href} {...props} />
})

/**
 * `VITE_GOOGLE_MAPS_FORCE=1` runs every map on the real Google Maps adapter even
 * without `VITE_GOOGLE_MAPS_API_KEY`, for local verification. Google then loads in
 * development mode (watermarked, "NoApiKeys" console warnings); set
 * `VITE_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID` for advanced markers. Examples only: the
 * library still uses the placeholder when an app has no key.
 */
const forceGoogleMaps = import.meta.env.VITE_GOOGLE_MAPS_FORCE === "1"

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
      <TooltipProvider>
        {forceGoogleMaps ? <MapProvider adapter={googleMapsAdapter}>{children}</MapProvider> : children}
      </TooltipProvider>
      <Toaster />
    </OnuProvider>
  )
}

function Nav() {
  const { pathname } = useLocation()
  const sections: [string, string, Entry[]][] = [
    ["Components", "/components", demos],
    ["Sample pages", "/pages", pages],
  ]
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="gap-2 px-2 py-1.5 font-semibold flex items-center">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-6" />
          Onu <Badge variant="secondary">v1</Badge>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          {sections.map(([label, base, entries]) =>
            [...groupBy(entries)].map(([group, list]) => (
              <SidebarGroup key={`${label}-${group}`}>
                <SidebarGroupLabel>
                  {label === "Sample pages" ? "Pages · " : ""}
                  {group}
                </SidebarGroupLabel>
                <SidebarMenu>
                  {list.map((e) => {
                    const href = `${base}/${e.slug}`
                    return (
                      <SidebarMenuItem key={e.slug}>
                        <SidebarMenuButton asChild isActive={pathname === href}>
                          <Link to={href}>{e.meta.title}</Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroup>
            )),
          )}
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  )
}

function Shell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <SidebarProvider>
      <Nav />
      <SidebarInset>
        <header className="top-0 gap-2 px-4 py-2 backdrop-blur sticky z-10 flex flex-wrap items-center border-b bg-background/90">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="font-medium me-auto truncate">{title ?? "Onu"}</h1>
          <Toolbar />
        </header>
        <main className="max-w-6xl p-4 md:p-8 mx-auto w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function EntryView({ entries }: { entries: Entry[] }) {
  const { "*": slug } = useParams()
  const entry = entries.find((e) => e.slug === slug)
  if (!entry) return <Navigate to="/" replace />
  const { Component, meta, source } = entry

  if (meta.layout === "bare") {
    return (
      <>
        <div
          className="end-3 bottom-3 p-2 shadow-lg backdrop-blur fixed z-50 rounded-xl border bg-background/95"
          data-print="hide"
        >
          <Toolbar />
        </div>
        <Component />
      </>
    )
  }

  return (
    <Shell title={meta.title}>
      {meta.description ? <p className="mb-6 text-muted-foreground">{meta.description}</p> : null}
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="pt-4">
          <Component />
        </TabsContent>
        <TabsContent value="code" className="pt-4">
          <pre className="p-4 text-xs max-h-[70vh] overflow-auto rounded-lg border bg-muted font-mono" dir="ltr">
            <code>{source}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </Shell>
  )
}

function Home() {
  return (
    <Shell title="Onu">
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold tracking-tight">Onu</h2>
        <p className="max-w-prose text-muted-foreground">
          Javaabu's React UI library: shadcn/ui based, RTL and Dhivehi first, with Thaana keyboard input and
          one-variable theming. Pick a component or sample page from the sidebar, and use the toolbar to switch theme,
          language, direction, primary colour and density.
        </p>
        <p className="text-muted-foreground">
          {demos.length} component demos · {pages.length} sample pages
        </p>
      </div>
    </Shell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Providers>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/components/*" element={<EntryView entries={demos} />} />
              <Route path="/pages/*" element={<EntryView entries={pages} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </Providers>
      </SettingsProvider>
    </ThemeProvider>
  )
}
