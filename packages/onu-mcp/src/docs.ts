import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export interface DocPage {
  /** `text-inputs/password-input` */
  path: string
  title: string
  description: string
}

export interface DocSection {
  id: string
  title: string
  description?: string
  pages: DocPage[]
}

/** `docs/index.json`, written by scripts/llms.mjs. */
export interface DocsIndex {
  name: string
  version: string
  rules: string
  sections: DocSection[]
}

export interface Docs {
  index: DocsIndex
  /** Where the docs came from: the project's installed `@javaabu/onu`, or the copy in this package. */
  source: "project" | "bundled"
  dir: string
  pages: DocPage[]
  read(page: DocPage): string
}

const bundledDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/docs")

/** The `docs/` folder of `@javaabu/onu` installed in `from` or a parent folder. */
export function findProjectDocs(from: string): string | undefined {
  let dir = path.resolve(from)
  for (;;) {
    const candidate = path.join(dir, "node_modules/@javaabu/onu/docs")
    if (existsSync(path.join(candidate, "index.json"))) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
}

/**
 * Loads the docs, preferring those of the version the project has installed
 * (`ONU_DOCS_DIR`, then `node_modules/@javaabu/onu/docs` from `cwd` up), and
 * falling back to the copy bundled with this package.
 */
export function loadDocs({ cwd = process.cwd(), dir }: { cwd?: string; dir?: string } = {}): Docs {
  const projectDir = dir ?? process.env.ONU_DOCS_DIR ?? findProjectDocs(cwd)
  const docsDir = projectDir ?? bundledDir
  const index = JSON.parse(readFileSync(path.join(docsDir, "index.json"), "utf8")) as DocsIndex
  const cache = new Map<string, string>()
  return {
    index,
    source: projectDir ? "project" : "bundled",
    dir: docsDir,
    pages: index.sections.flatMap((s) => s.pages),
    read(page) {
      let content = cache.get(page.path)
      if (content === undefined) {
        content = readFileSync(path.join(docsDir, `${page.path}.md`), "utf8")
        cache.set(page.path, content)
      }
      return content
    },
  }
}

/** Lowercase letters and digits only, so `PasswordInput`, `password-input` and `Password input` match. */
const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

/**
 * The page for a component, hook or guide, by title (`PasswordInput`), file name
 * (`password-input`) or path (`text-inputs/password-input`), in any casing.
 */
export function findDoc(docs: Docs, name: string): DocPage | undefined {
  const wanted = key(name.replace(/\.md$/, "").split("/").pop() ?? name)
  const exact = docs.pages.find((p) => p.path === name.replace(/\.md$/, ""))
  if (exact) return exact
  return (
    docs.pages.find((p) => key(p.path.split("/").pop()!) === wanted) ??
    docs.pages.find((p) => key(p.title) === wanted) ??
    // Pages that document several exports: "Fieldset / FormSection", "useAnnouncer and announce".
    docs.pages.find((p) => p.title.split(/\s*(?:\/|,|\band\b)\s*/).some((t) => key(t) === wanted))
  )
}

export interface SearchHit {
  page: DocPage
  score: number
  snippet: string
}

/** Pages matching every word of `query`, best first: title, then description, then body. */
export function searchDocs(docs: Docs, query: string, limit = 8): SearchHit[] {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1)
  if (!words.length) return []
  const hits: SearchHit[] = []
  for (const page of docs.pages) {
    const title = page.title.toLowerCase()
    const description = page.description.toLowerCase()
    const body = docs.read(page).toLowerCase()
    let score = 0
    let all = true
    for (const word of words) {
      const inBody = body.split(word).length - 1
      if (!inBody && !title.includes(word) && !description.includes(word)) {
        all = false
        break
      }
      score += (title.includes(word) ? 20 : 0) + (description.includes(word) ? 5 : 0) + Math.min(inBody, 10)
    }
    if (!all) continue
    if (key(page.title) === key(query)) score += 100
    hits.push({ page, score, snippet: snippet(docs.read(page), words[0]!) })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

/** About 200 characters of prose around the first match. */
function snippet(content: string, word: string) {
  const text = content.replace(/```[\s\S]*?```/g, " ").replace(/\s+/g, " ")
  const at = text.toLowerCase().indexOf(word)
  const start = Math.max(0, at - 80)
  return `${start > 0 ? "…" : ""}${text.slice(start, start + 200).trim()}…`
}
