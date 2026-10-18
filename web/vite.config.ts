import { readFileSync } from "node:fs"
import path, { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

import { buildLlms, collectDocs } from "../scripts/llms.mjs"
import { sectionTitles } from "./src/components/section-source"

const onuSrc = resolve(import.meta.dirname, "../packages/onu/src")

/** Index just past the `}` that closes the object literal opening at `start`. */
function objectEnd(code: string, start: number) {
  let depth = 0
  let quote = ""
  for (let i = start; i < code.length; i++) {
    const ch = code[i]
    if (quote) {
      if (ch === "\\") i++
      else if (ch === quote) quote = ""
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch
    else if (ch === "{") depth++
    else if (ch === "}" && --depth === 0) return i + 1
  }
  return -1
}

/**
 * `*.demo.tsx?meta` / `*.page.tsx?meta`: only the file's `export const meta = {…}`
 * literal plus the DemoSection titles that have code, without importing the
 * component. The registry loads these eagerly for navigation and search, and
 * the components and their source text lazily, one chunk per entry.
 */
function registryMeta(): Plugin {
  return {
    name: "onu-web:registry-meta",
    enforce: "pre",
    load(id) {
      const [file, query] = id.split("?")
      if (query !== "meta" || !/\.(demo|page)\.tsx$/.test(file!)) return null
      this.addWatchFile(file!)
      const source = readFileSync(file!, "utf8")
      const at = source.search(/export const meta\s*=\s*\{/)
      if (at === -1) this.error(`${file} has no \`export const meta = {…}\``)
      const open = source.indexOf("{", at)
      const literal = source.slice(open, objectEnd(source, open))
      let meta: unknown
      try {
        meta = new Function(`return (${literal})`)()
      } catch (error) {
        this.error(`${file}: \`meta\` must be a plain object literal (${String(error)})`)
      }
      return `export default ${JSON.stringify({ meta, sections: sectionTitles(source) })}`
    },
  }
}

/**
 * The docs for AI assistants (scripts/llms.mjs): `llms.txt`, `llms-full.txt` and
 * `docs/<path>.md` at the site root, served in dev and emitted on build.
 * `virtual:onu-docs` lists the pages, so a demo can link to its Markdown.
 */
function llmsDocs(): Plugin {
  const siteUrl = process.env.ONU_SITE_URL ?? "https://onu.on-forge.com"
  const virtual = "\0virtual:onu-docs"
  return {
    name: "onu-web:llms",
    resolveId: (id) => (id === "virtual:onu-docs" ? virtual : null),
    load(id) {
      if (id !== virtual) return null
      const paths = collectDocs().flatMap((s) => s.pages.map((p) => p.path))
      return `export const docPaths = ${JSON.stringify(paths)}`
    },
    configureServer(server) {
      const docs = path.resolve(import.meta.dirname, "../docs")
      server.watcher.add(docs)
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split(/[?#]/)[0]!.slice(server.config.base.length)
        if (!/^(llms(-full)?\.txt|docs\/.+\.(md|json))$/.test(url)) return next()
        const content = buildLlms({ siteUrl: `http://localhost:${server.config.server.port}${server.config.base}` })[
          url
        ]
        if (content === undefined) return next()
        res.setHeader("Content-Type", `${url.endsWith(".json") ? "application/json" : "text/markdown"}; charset=utf-8`)
        res.end(content)
      })
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(buildLlms({ siteUrl }))) {
        this.emitFile({ type: "asset", fileName, source })
      }
    },
  }
}

export default defineConfig({
  base: process.env.EXAMPLES_BASE ?? "/",
  plugins: [registryMeta(), llmsDocs(), react(), tailwindcss()],
  build: {
    // Skip the gzip size report and source maps: faster builds that fit on small servers.
    reportCompressedSize: false,
    sourcemap: false,
    // Only load the modules of side-effect-free barrels (react-aria, @base-ui, …) that are
    // actually imported: ~2,300 fewer modules, ~15% less memory and a faster build.
    rolldownOptions: { experimental: { lazyBarrel: true } },
  },
  resolve: {
    // Use the package source directly so edits show up without a rebuild.
    alias: [
      { find: /^@javaabu\/onu\/(tailwind|styles|fonts|fonts-optional)\.css$/, replacement: `${onuSrc}/styles/$1.css` },
      { find: /^@javaabu\/onu\/icons\/(iconify|fontawesome)$/, replacement: `${onuSrc}/icons/$1/index.tsx` },
      {
        find: /^@javaabu\/onu\/(thaana|charts|maps|editor|calendar|media|query-builder|export|locales\/dv)$/,
        replacement: `${onuSrc}/$1/index.ts`,
      },
      { find: /^@javaabu\/onu$/, replacement: `${onuSrc}/index.ts` },
      { find: /^@\//, replacement: `${resolve(import.meta.dirname, "src")}/` },
    ],
  },
})
