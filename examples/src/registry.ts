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
