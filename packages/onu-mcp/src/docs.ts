import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export interface DocPage {
  /** `text-inputs/password-input` */
  path: string
  title: string
  description: string
  /** Building blocks documented on this page, by file name (`help-text`), from its `covers` front matter. */
  covers?: string[]
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
 * (`dir`, then `ONU_DOCS_DIR`, then `node_modules/@javaabu/onu/docs` from `cwd`
 * up). If there are none, or they don't load (a missing folder, a malformed
 * `index.json`, a missing page), it uses the copy bundled with this package,
 * with a warning on stderr.
 */
export function loadDocs({
  cwd = process.cwd(),
  dir,
  bundled = bundledDir,
}: { cwd?: string; dir?: string; bundled?: string } = {}): Docs {
  const projectDir = dir || process.env.ONU_DOCS_DIR || findProjectDocs(cwd)
  if (projectDir) {
    try {
      return openDocs(projectDir, "project")
    } catch (error) {
      // stdout carries the MCP protocol, so warn on stderr.
      console.error(
        `onu-mcp: can't load the docs in ${projectDir} (${error instanceof Error ? error.message : String(error)}); using the bundled docs instead`,
      )
    }
  }
  return openDocs(bundled, "bundled")
}

/** Reads `index.json` in `docsDir` and checks that every page it lists is there. */
function openDocs(docsDir: string, source: Docs["source"]): Docs {
  const indexPath = path.join(docsDir, "index.json")
  let index: DocsIndex
  try {
    index = JSON.parse(readFileSync(indexPath, "utf8")) as DocsIndex
  } catch (error) {
    throw new Error(`${indexPath}: ${error instanceof Error ? error.message : String(error)}`, { cause: error })
  }
  if (!Array.isArray(index?.sections)) throw new Error(`${indexPath} has no sections`)
  const pages = index.sections.flatMap((s) => s.pages ?? [])
  const missing = pages.map((p) => path.join(docsDir, `${p.path}.md`)).find((file) => !existsSync(file))
  if (missing) throw new Error(`${missing} is missing`)
  const cache = new Map<string, string>()
  return {
    index,
    source,
    dir: docsDir,
    pages,
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
    docs.pages.find((p) => p.title.split(/\s*(?:\/|,|\band\b)\s*/).some((t) => key(t) === wanted)) ??
    docs.pages.find((p) => p.covers?.some((c) => key(c) === wanted))
  )
}

export interface SearchHit {
  page: DocPage
  score: number
  snippet: string
}

/** The words of a title or path: `DateRangePicker`, `date-range-picker` and `Date range picker` give `date`, `range`, `picker`. */
const words = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)

/**
 * Pages matching every word of `query`, best first: title and path, then
 * description, then body. A whole title word counts more than part of one, and
 * a page whose title words all appear in the query ranks above the rest.
 */
export function searchDocs(docs: Docs, query: string, limit = 8): SearchHit[] {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1)
  if (!queryWords.length) return []
  const queryTokens = new Set(words(query))
  const hits: SearchHit[] = []
  for (const page of docs.pages) {
    const titleWords = words(page.title)
    const nameWords = new Set([...titleWords, ...words(page.path.split("/").pop()!)])
    const names = `${page.title.toLowerCase()} ${titleWords.join(" ")} ${page.path}`
    const description = page.description.toLowerCase()
    const body = docs.read(page).toLowerCase()
    let score = 0
    let all = true
    for (const word of queryWords) {
      const inBody = body.split(word).length - 1
      const inNames = names.includes(word)
      if (!inBody && !inNames && !description.includes(word)) {
        all = false
        break
      }
      score +=
        (nameWords.has(word) ? 30 : inNames ? 20 : 0) + (description.includes(word) ? 5 : 0) + Math.min(inBody, 10)
    }
    if (!all) continue
    if (titleWords.every((w) => queryTokens.has(w))) score += 50
    if (key(page.title) === key(query) || key(page.path.split("/").pop()!) === key(query)) score += 100
    hits.push({ page, score, snippet: snippet(docs.read(page), queryWords[0]!) })
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
