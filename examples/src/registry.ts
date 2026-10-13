import * as React from "react"

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
  /** Lazily loaded: each demo and sample page is its own chunk. Render inside `<Suspense>`. */
  Component: React.LazyExoticComponent<React.ComponentType>
  /** Starts loading the component's chunk (e.g. on hover) and resolves when it is ready. */
  preload: () => Promise<unknown>
  /** The file's source text, fetched on first call and cached. */
  source: () => Promise<string>
  /** `<DemoSection>` titles whose code `sectionSource` can extract from the source. */
  sections: string[]
}

type Loader<T> = () => Promise<T>
type MetaModule = { meta: EntryMeta; sections: string[] }

/*
 * Only the metadata is eager: `?meta` (see vite.config.ts) compiles each file to
 * its `meta` literal, so navigation and search are instant without pulling every
 * demo into the main chunk. Components and raw sources load on navigation.
 */
const demoMeta = import.meta.glob<MetaModule>("./showcase/**/*.demo.tsx", {
  eager: true,
  query: "?meta",
  import: "default",
})
const demoModules = import.meta.glob<React.ComponentType>("./showcase/**/*.demo.tsx", { import: "default" })
const demoSources = import.meta.glob<string>("./showcase/**/*.demo.tsx", { query: "?raw", import: "default" })
const pageMeta = import.meta.glob<MetaModule>("./pages/**/*.page.tsx", {
  eager: true,
  query: "?meta",
  import: "default",
})
const pageModules = import.meta.glob<React.ComponentType>("./pages/**/*.page.tsx", { import: "default" })
const pageSources = import.meta.glob<string>("./pages/**/*.page.tsx", { query: "?raw", import: "default" })

function once<T>(load: Loader<T>): Loader<T> {
  let promise: Promise<T> | undefined
  return () => {
    promise ??= load().catch((error: unknown) => {
      promise = undefined // let a later attempt retry, e.g. after a flaky network
      throw error
    })
    return promise
  }
}

function collect(
  metas: Record<string, MetaModule>,
  modules: Record<string, Loader<React.ComponentType>>,
  sources: Record<string, Loader<string>>,
  suffix: RegExp,
): Entry[] {
  return Object.entries(metas)
    .map(([path, { meta, sections }]) => {
      const load = once(modules[path]!)
      const source = sources[path]
      return {
        slug: path.replace(/^\.\/(showcase|pages)\//, "").replace(suffix, ""),
        meta,
        sections,
        Component: React.lazy(() => load().then((C) => ({ default: C }))),
        preload: load,
        source: source ? once(source) : () => Promise.resolve(""),
      }
    })
    .sort((a, b) => (a.meta.order ?? 100) - (b.meta.order ?? 100) || a.meta.title.localeCompare(b.meta.title))
}

export const demos = collect(demoMeta, demoModules, demoSources, /\.demo\.tsx$/)
export const pages = collect(pageMeta, pageModules, pageSources, /\.page\.tsx$/)

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
