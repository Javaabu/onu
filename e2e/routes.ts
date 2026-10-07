import { readdirSync, statSync } from "node:fs"
import path from "node:path"

const examples = path.resolve(import.meta.dirname, "../examples/src")

function walk(dir: string, suffix: string, base = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return walk(full, suffix, base)
    return name.endsWith(suffix) ? [path.relative(base, full).replace(suffix, "")] : []
  })
}

/** Every showcase demo and sample page in the examples app, as hash routes. */
export const demoRoutes = walk(path.join(examples, "showcase"), ".demo.tsx").map((slug) => `/#/components/${slug}`)
export const pageRoutes = walk(path.join(examples, "pages"), ".page.tsx").map((slug) => `/#/pages/${slug}`)

export interface Variant {
  name: string
  locale: "en" | "dv"
  dark: boolean
}

export const variants: Variant[] = [
  { name: "light-ltr", locale: "en", dark: false },
  { name: "dark-rtl", locale: "dv", dark: true },
]
