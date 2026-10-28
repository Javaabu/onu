#!/usr/bin/env node
/**
 * Builds the docs for AI assistants from docs/ (https://llmstxt.org):
 *
 *   llms.txt        index: what Onu is, the rules for writing Onu code, and every
 *                   page with a one-line description
 *   llms-full.txt   every page in one file
 *   docs/<path>.md  each page as plain Markdown (front matter removed, links to
 *                   other pages rewritten to their .md files)
 *   docs/index.json the same index, machine-readable (used by @javaabu/onu-mcp)
 *
 * The web app serves these at its root (see web/vite.config.ts), and the npm
 * package ships them so assistants read the docs of the installed version:
 *
 *   node scripts/llms.mjs --out packages/onu                         # package
 *   node scripts/llms.mjs --out web/dist --site https://onu.on-forge.com
 */
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"

const root = path.resolve(import.meta.dirname, "..")
const docsDir = path.join(root, "docs")

/** Top-level pages, in this order. Everything else at the top level is about the project, not the library. */
const GETTING_STARTED = ["intro", "installation-and-setup"]
const REPO = "https://github.com/Javaabu/onu"

/** Flat `key: value` front matter, as Docusaurus writes it. */
function splitFrontMatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!match) return { meta: {}, body: source }
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line)
    if (kv) meta[kv[1]] = kv[2].replace(/^(["'])(.*)\1$/, "$2")
  }
  return { meta, body: source.slice(match[0].length) }
}

/** The first prose paragraph as one plain line: what the page is about. */
function describe(body) {
  const paragraph = body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|```|\||<|import |:::|[-*] )/.test(p))
  if (!paragraph) return ""
  const text = paragraph
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<\/?kbd>/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\s+/g, " ")
  const sentence = (/^(.{40,}?[.!?])(\s|$)/.exec(text)?.[1] ?? text).replace(/:$/, "")
  return sentence.length > 220 ? `${sentence.slice(0, 217).trimEnd()}…` : sentence
}

/** Links to other docs pages (`./text-input`, `../guides/rtl#x`) become links to their `.md` files. */
function rewriteLinks(body, pagePath) {
  return body.replace(/\]\((?!https?:|mailto:|#|\/)([^)\s]+)\)/g, (all, target) => {
    const [file, hash] = target.split("#")
    if (!file || /\.(png|jpe?g|svg|gif|webp)$/i.test(file)) return all
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(pagePath), file.replace(/\.mdx?$/, "")))
    const relative = path.posix.relative(path.posix.dirname(pagePath), resolved) || path.posix.basename(resolved)
    return `](${relative.startsWith(".") ? relative : `./${relative}`}.md${hash ? `#${hash}` : ""})`
  })
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"))
  } catch {
    return {}
  }
}

function readPage(pagePath) {
  const { meta, body } = splitFrontMatter(readFileSync(path.join(docsDir, `${pagePath}.md`), "utf8"))
  const title = meta.title ?? path.basename(pagePath)
  let content = rewriteLinks(body.trim(), pagePath)
  if (!/^#\s/.test(content)) content = `# ${title}\n\n${content}`
  return {
    path: pagePath,
    title,
    description: describe(body),
    covers: meta.covers
      ?.split(",")
      .map((name) => name.trim())
      .filter(Boolean),
    position: Number(meta.sidebar_position ?? 100),
    content: `${content}\n`,
  }
}

const byPosition = (a, b) => a.position - b.position || a.title.localeCompare(b.title)

/**
 * Every library docs page, in sections: Getting started, Guides, then the
 * component groups in sidebar order.
 */
export function collectDocs() {
  const sections = [{ id: "getting-started", title: "Getting started", pages: GETTING_STARTED.map(readPage) }]
  const folders = readdirSync(docsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({ id: d.name, ...readJson(path.join(docsDir, d.name, "_category_.json")) }))
    .sort((a, b) => (a.position ?? 100) - (b.position ?? 100))
  for (const folder of folders) {
    const pages = readdirSync(path.join(docsDir, folder.id))
      .filter((f) => f.endsWith(".md"))
      .map((f) => readPage(`${folder.id}/${f.replace(/\.md$/, "")}`))
      .sort(byPosition)
    sections.push({ id: folder.id, title: folder.label ?? folder.id, description: folder.link?.description, pages })
  }
  return sections
}

/** Sample pages from the web app, linked to their source on GitHub. */
function collectSamplePages() {
  const dir = path.join(root, "web/src/pages")
  const pages = []
  for (const group of readdirSync(dir, { withFileTypes: true })) {
    if (!group.isDirectory() || group.name.startsWith("_") || group.name === "design-options") continue
    for (const file of readdirSync(path.join(dir, group.name))) {
      if (!file.endsWith(".page.tsx")) continue
      const source = readFileSync(path.join(dir, group.name, file), "utf8")
      const field = (key) => new RegExp(`\\b${key}:\\s*(["'\`])(.*?)\\1`).exec(source)?.[2]
      pages.push({
        group: field("group") ?? group.name,
        title: field("title") ?? file,
        description: field("description") ?? "",
        source: `web/src/pages/${group.name}/${file}`,
      })
    }
  }
  return pages.sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title))
}

function version() {
  return readJson(path.join(root, "packages/onu/package.json")).version ?? "0.0.0"
}

function rules() {
  const { body } = splitFrontMatter(readFileSync(path.join(docsDir, "guides/rules-for-ai.md"), "utf8"))
  // Without the intro (it describes where the rules appear), and with level-3
  // headings so they sit under "## Rules" in llms.txt.
  return rewriteLinks(body.slice(body.search(/^# /m)).trim(), "guides/rules-for-ai")
    .replace(/^# /gm, "### ")
    .replace(/\]\(\.\//g, "](docs/guides/")
    .replace(/\]\(\.\.\//g, "](docs/")
}

/**
 * The llms.txt index. `link(pagePath)` turns a page into the URL to list, so the
 * site can give absolute URLs and the package paths relative to itself.
 */
function index(sections, { link, samplePages = [] }) {
  const lines = [
    "# Onu",
    "",
    "> Javaabu's React UI component library (`@javaabu/onu`): shadcn/ui (Radix) and Tailwind CSS v4, right-to-left and Dhivehi first, Thaana typing from a Latin keyboard, one-variable theming (`--onu-primary`), dark mode, density modes and WCAG 2.2 AA. Built for Laravel apps (Inertia or plain forms) and Next.js.",
    "",
    `Version ${version()}. Every page below is plain Markdown with a Props table and an Accessibility section. Read a component's page before using it, and use only the props it lists. Source: ${REPO}.`,
    "",
    "## Rules",
    "",
    rules(),
    "",
  ]
  for (const section of sections) {
    lines.push(`## ${section.title}`, "")
    if (section.description) lines.push(`${section.description}.`, "")
    for (const page of section.pages) {
      lines.push(`- [${page.title}](${link(page.path)})${page.description ? `: ${page.description}` : ""}`)
    }
    lines.push("")
  }
  if (samplePages.length) {
    lines.push(
      "## Optional",
      "",
      "Sample pages: whole screens built only from Onu components. They use small helpers from `web/src/pages/_shared` (routes, demo data, translations) that a real app replaces with its own.",
      "",
    )
    for (const page of samplePages) {
      const url = `https://raw.githubusercontent.com/Javaabu/onu/main/${page.source}`
      lines.push(`- [${page.group}: ${page.title}](${url})${page.description ? `: ${page.description}` : ""}`)
    }
    lines.push("")
  }
  return lines.join("\n")
}

function full(sections) {
  const parts = [`# Onu ${version()}: full documentation\n`, `## Rules\n\n${rules()}\n`]
  for (const section of sections) {
    for (const page of section.pages) parts.push(`<!-- docs/${page.path}.md -->\n\n${page.content}`)
  }
  return parts.join("\n---\n\n")
}

/**
 * Every generated file, as `{ "llms.txt": "…", "docs/intro.md": "…", … }`.
 * With `siteUrl`, llms.txt links to the site and lists the sample pages;
 * without it, links are relative (for the npm package).
 */
export function buildLlms({ siteUrl } = {}) {
  const sections = collectDocs()
  const base = siteUrl?.replace(/\/?$/, "/")
  const link = (pagePath) => (base ? `${base}docs/${pagePath}.md` : `docs/${pagePath}.md`)
  const files = {
    "llms.txt": index(sections, { link, samplePages: base ? collectSamplePages() : [] }),
    "llms-full.txt": full(sections),
    "docs/index.json": `${JSON.stringify(
      {
        name: "@javaabu/onu",
        version: version(),
        rules: rules(),
        sections: sections.map(({ pages, ...section }) => ({
          ...section,
          pages: pages.map(({ path, title, description, covers }) => ({ path, title, description, covers })),
        })),
      },
      null,
      2,
    )}\n`,
  }
  for (const section of sections) {
    for (const page of section.pages) files[`docs/${page.path}.md`] = page.content
  }
  return files
}

/** Writes the files under `outDir`, replacing any docs/ folder from an earlier run. */
export function writeLlms(outDir, options) {
  rmSync(path.join(outDir, "docs"), { recursive: true, force: true })
  const files = buildLlms(options)
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(outDir, name)
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, content)
  }
  return Object.keys(files).length
}

if (import.meta.filename === path.resolve(process.argv[1] ?? "")) {
  const { values } = parseArgs({ options: { out: { type: "string" }, site: { type: "string" } } })
  if (!values.out) {
    console.error("Usage: node scripts/llms.mjs --out <dir> [--site <url>]")
    process.exit(1)
  }
  const count = writeLlms(path.resolve(values.out), { siteUrl: values.site })
  console.log(`llms: wrote ${count} files to ${path.relative(root, path.resolve(values.out)) || "."}`)
}
