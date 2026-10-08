import type { ComponentType } from "react"

export interface EntryMeta {
  title: string
  group: string
  description?: string
  /** Sample pages: `bare` renders without the showcase sidebar. */
  layout?: "bare" | "app"
  order?: number
}

export interface Entry {
  /** Path under `showcase/` or `pages/` without the suffix, e.g. `text-inputs/text-input`. */
  slug: string
  meta: EntryMeta
  Component: ComponentType
  source: string
}

type Module = { default: ComponentType; meta: EntryMeta }

const demoModules = import.meta.glob<Module>("./showcase/**/*.demo.tsx", { eager: true })
const demoSources = import.meta.glob<string>("./showcase/**/*.demo.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
})
const pageModules = import.meta.glob<Module>("./pages/**/*.page.tsx", { eager: true })
const pageSources = import.meta.glob<string>("./pages/**/*.page.tsx", { eager: true, query: "?raw", import: "default" })

function collect(modules: Record<string, Module>, sources: Record<string, string>, suffix: RegExp): Entry[] {
  return Object.entries(modules)
    .map(([path, mod]) => ({
      slug: path.replace(/^\.\/(showcase|pages)\//, "").replace(suffix, ""),
      meta: mod.meta,
      Component: mod.default,
      source: sources[path] ?? "",
    }))
    .sort((a, b) => (a.meta.order ?? 100) - (b.meta.order ?? 100) || a.meta.title.localeCompare(b.meta.title))
}

export const demos = collect(demoModules, demoSources, /\.demo\.tsx$/)
export const pages = collect(pageModules, pageSources, /\.page\.tsx$/)

/** Navigation order: foundations, then REQUIREMENTS §22 and §23 order. Unknown groups go last. */
const GROUP_ORDER = [
  "Foundations",
  "Form scaffolding",
  "Text inputs",
  "Date and time",
  "Choice inputs",
  "Files and media",
  "Rich content",
  "Maps",
  "Charts",
  "Listing pages",
  "Overlays",
  "Loading",
  "Layout and navigation",
  "Display and feedback",
  "Auth",
  "Admin: records",
  "Admin: content",
  "Admin: settings and access",
  "Applications and workflows",
  "Public portal",
  "Citizen portal",
  "Learning",
  "Maps and operations",
  "Kiosk",
  "System",
]

export function groupBy(entries: Entry[]) {
  const groups = new Map<string, Entry[]>()
  const rank = (g: string) => (GROUP_ORDER.indexOf(g) === -1 ? GROUP_ORDER.length : GROUP_ORDER.indexOf(g))
  const sorted = [...entries].sort((a, b) => rank(a.meta.group) - rank(b.meta.group))
  for (const entry of sorted) {
    const list = groups.get(entry.meta.group) ?? []
    list.push(entry)
    groups.set(entry.meta.group, list)
  }
  return groups
}

/* ------------------------------------------------------------------ */
/* Docs navigation model: sections → categories → items.               */
/* ------------------------------------------------------------------ */

export interface NavItem {
  title: string
  /** Router path, e.g. `/components/text-inputs/text-input`. */
  href: string
  /** Category label shown in breadcrumbs and search. */
  group: string
  description?: string
  entry?: Entry
}

export interface NavCategory {
  /** Folder name, e.g. `text-inputs`. */
  id: string
  label: string
  items: NavItem[]
}

export interface NavSection {
  id: "getting-started" | "components" | "pages"
  label: string
  /** Index route for the section (header links, breadcrumbs). */
  href: string
  categories: NavCategory[]
}

const FOUNDATIONS = "Foundations"

function toItem(base: string, entry: Entry): NavItem {
  return {
    title: entry.meta.title,
    href: `${base}/${entry.slug}`,
    group: entry.meta.group,
    description: entry.meta.description,
    entry,
  }
}

function categorise(base: string, entries: Entry[]): NavCategory[] {
  return [...groupBy(entries)].map(([label, list]) => ({
    id: list[0]!.slug.split("/")[0]!,
    label,
    items: list.map((e) => toItem(base, e)),
  }))
}

export const introduction: NavItem = {
  title: "Introduction",
  href: "/",
  group: "Getting started",
  description: "Javaabu's React UI library: shadcn/ui based, RTL and Dhivehi first.",
}

export const navSections: NavSection[] = [
  {
    id: "getting-started",
    label: "Getting started",
    href: "/",
    categories: [
      {
        id: "getting-started",
        label: "Getting started",
        items: [
          introduction,
          ...demos.filter((d) => d.meta.group === FOUNDATIONS).map((e) => toItem("/components", e)),
        ],
      },
    ],
  },
  {
    id: "components",
    label: "Components",
    href: "/components",
    categories: categorise(
      "/components",
      demos.filter((d) => d.meta.group !== FOUNDATIONS),
    ),
  },
  { id: "pages", label: "Sample pages", href: "/pages", categories: categorise("/pages", pages) },
]

/** Every nav item in sidebar order. */
export const navItems: NavItem[] = navSections.flatMap((s) => s.categories.flatMap((c) => c.items))

/** Finds the section, category and item for a router path. */
export function locate(pathname: string) {
  for (const section of navSections) {
    for (const category of section.categories) {
      const item = category.items.find((i) => i.href === pathname)
      if (item) return { section, category, item }
    }
  }
  return null
}

/** Previous and next items in the docs reading order (getting started, then components). */
export function neighbours(pathname: string) {
  const docs = navSections.filter((s) => s.id !== "pages").flatMap((s) => s.categories.flatMap((c) => c.items))
  const list = pathname.startsWith("/pages/") ? navSections[2]!.categories.flatMap((c) => c.items) : docs
  const index = list.findIndex((i) => i.href === pathname)
  if (index === -1) return { prev: undefined, next: undefined }
  return { prev: list[index - 1], next: list[index + 1] }
}
