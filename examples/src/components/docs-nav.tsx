import * as React from "react"
import { useLocation } from "react-router"
import { AppSidebar, Icon, Logo, TextInput, type NavGroup, type NavItem as SidebarItem } from "@javaabu/onu"

import { navSections, type NavCategory, type NavItem } from "../registry"
import { BrandMark } from "./brand-mark"

/** A Lucide icon drawn inline, for the few menu entries with no semantic icon name. */
function Lucide({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

const palette = (
  <Lucide>
    <path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
  </Lucide>
)

const paintbrush = (
  <Lucide>
    <path d="m14.622 17.897-10.68-2.913" />
    <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
    <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 .517.316c.596.1 2.02-.042 3.41-2.258" />
  </Lucide>
)

const chart = (
  <Lucide>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </Lucide>
)

const layers = (
  <Lucide>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </Lucide>
)

/**
 * Icons for the categories (folder names) and the Getting started pages, all
 * different so the menu still reads when collapsed to icons.
 */
const ICONS: Record<string, SidebarItem["icon"]> = {
  "/": "home",
  "/components/foundations/design-foundations": palette,
  "/components/foundations/theme-builder": paintbrush,
  // Components
  charts: chart,
  "choice-inputs": "check",
  "date-and-time": "calendar",
  "display-and-feedback": "info",
  "files-and-media": "image",
  "form-scaffolding": "list",
  "layout-and-navigation": "sidebar",
  "listing-pages": "table",
  loading: "refresh",
  maps: "map-pin",
  overlays: layers,
  "rich-content": "code",
  "text-inputs": "text",
  // Sample pages
  "admin-content": "edit",
  "admin-records": "file-text",
  "admin-settings": "settings",
  applications: "route",
  auth: "lock",
  "citizen-portal": "user",
  "design-options": "star",
  kiosk: "monitor",
  learning: "play",
  "maps-operations": "navigation",
  "public-portal": "globe",
  system: "wrench",
}

/** Shorter names for the categories too long for the sidebar (the pages keep the full name). */
const SHORT: Record<string, string> = {
  "layout-and-navigation": "Layout & navigation",
  "display-and-feedback": "Display & feedback",
  "admin-settings": "Admin: settings",
  applications: "Applications",
}

function matches(item: NavItem, query: string) {
  if (!query) return true
  const q = query.toLowerCase()
  return item.title.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
}

function leaf(item: NavItem, icon?: SidebarItem["icon"]): SidebarItem {
  return { label: item.title, href: item.href, icon: icon ?? ICONS[item.href] }
}

function category(c: NavCategory): SidebarItem {
  return {
    id: c.id,
    label: SHORT[c.id] ?? c.label,
    icon: ICONS[c.id],
    badge: c.items.length,
    badgeTone: "neutral",
    items: c.items.map((i) => ({ label: i.title, href: i.href })),
  }
}

/**
 * The full menu: Getting started pages, then each section's index and its
 * categories, which expand to their pages (a flyout when collapsed to icons).
 */
function menu(): NavGroup[] {
  return navSections.map((section) => {
    if (section.id === "getting-started") {
      return { id: section.id, label: section.label, items: section.categories[0]!.items.map((i) => leaf(i)) }
    }
    const all: SidebarItem = {
      label: section.id === "pages" ? "All sample pages" : "All components",
      href: section.href,
      icon: section.id === "pages" ? "columns" : "grid",
    }
    return { id: section.id, label: section.label, items: [all, ...section.categories.map(category)] }
  })
}

/** While filtering: every category with a match as its own group, its pages listed flat. */
function filtered(query: string): NavGroup[] {
  return navSections.flatMap((section) =>
    section.categories.flatMap((c) => {
      const items = c.items.filter((i) => matches(i, query))
      if (!items.length) return []
      const flat = section.id === "getting-started"
      return [
        {
          id: `${section.id}/${c.id}`,
          label: flat ? section.label : c.label,
          items: items.map((i) => leaf(i, flat ? undefined : ICONS[c.id])),
        },
      ]
    }),
  )
}

const FULL_MENU = menu()

/**
 * The docs menu, on the library's admin sidebar (`AppSidebar`, Proton style):
 * the logo, a live filter, then Getting started, Components and Sample pages
 * with a count per category. Collapses to icons on desktop and is a drawer on
 * phones.
 */
export function DocsSidebar() {
  const { pathname } = useLocation()
  const [query, setQuery] = React.useState("")
  const q = query.trim()
  const groups = React.useMemo(() => (q ? filtered(q) : FULL_MENU), [q])

  // Bring the current page's link into view when the sidebar first renders.
  React.useEffect(() => {
    const box = document.querySelector<HTMLElement>("[data-docs-sidebar] [data-slot=sidebar-content]")
    const el = box?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!box || !el) return
    const boxRect = box.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    if (elRect.top < boxRect.top || elRect.bottom > boxRect.bottom) {
      box.scrollTop += elRect.top - boxRect.top - box.clientHeight / 3
    }
  }, [])

  return (
    <AppSidebar
      data-docs-sidebar
      collapsible="icon"
      match="exact"
      navLabel="Docs"
      groups={groups}
      currentHref={pathname}
      header={
        <div className="gap-4 grid">
          <Logo
            alt="Onu"
            text="Onu"
            href="/"
            classNames={{ text: "group-data-[collapsible=icon]:hidden" }}
            className="h-8"
          >
            <BrandMark className="size-7" />
          </Logo>
          <TextInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter"
            aria-label="Filter the menu"
            startAddon={<Icon name="filter" />}
            className="bg-[color:var(--shell-field,#ffffff)] group-data-[collapsible=icon]:hidden dark:bg-[color:var(--shell-field,#292733)]"
          />
        </div>
      }
    >
      {q && !groups.length ? (
        <p className="px-4 py-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
          No matches for “{q}”.
        </p>
      ) : null}
    </AppSidebar>
  )
}
