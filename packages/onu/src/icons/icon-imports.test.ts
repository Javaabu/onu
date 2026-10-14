import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Keeps the full Lucide map (~250 icons, ~9 kB brotli) out of single-component bundles
 * and out of `OnuProvider`. `<Icon>` gets the default set from `OnuProvider`, which loads
 * it on demand with a dynamic `import()`; components with fixed glyphs pass a `fallback`.
 * Only the modules below may import `lucide-map` statically (size-limit guards the rest).
 */
const SRC = path.resolve(__dirname, "..")
const MAP = path.join(SRC, "icons/lucide-map.ts")
const ALLOWED_IMPORTERS = ["icons/index.ts", "icons/standalone-icon.tsx"]

function resolveImport(from: string, spec: string) {
  const base = path.resolve(path.dirname(from), spec)
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return undefined
}

function relativeImports(file: string) {
  const code = readFileSync(file, "utf8")
  const specs = [...code.matchAll(/(?:from|import)\s+["'](\.{1,2}\/[^"']+)["']/g)].map((m) => m[1]!)
  return specs.map((s) => resolveImport(file, s)).filter((f): f is string => !!f)
}

/** Modules reachable from `entry` through static relative imports. */
function reachable(entry: string) {
  const seen = new Set<string>()
  const queue = [path.join(SRC, entry)]
  while (queue.length) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    queue.push(...relativeImports(file))
  }
  return seen
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name)
    if (d.isDirectory()) return sourceFiles(full)
    return /\.tsx?$/.test(d.name) && !/\.test\.tsx?$/.test(d.name) ? [full] : []
  })
}

describe("icon map boundary", () => {
  it("only the allowed modules import lucide-map", () => {
    const importers = sourceFiles(SRC)
      .filter((f) => relativeImports(f).includes(MAP))
      .map((f) => path.relative(SRC, f).split(path.sep).join("/"))
      .sort()
    expect(importers).toEqual(ALLOWED_IMPORTERS)
  })

  it("finds the map from the package-root icon exports (control)", () => {
    expect(reachable("icons/index.ts").has(MAP)).toBe(true)
  })

  it.each([
    "components/form/button.tsx",
    "providers/onu-provider.tsx",
    "icons/icon.tsx",
    "ui/spinner.tsx",
    ...readdirSync(path.join(SRC, "ui"))
      .filter((f) => f.endsWith(".tsx") && !f.endsWith(".test.tsx"))
      .map((f) => `ui/${f}`),
  ])("%s does not reach lucide-map", (entry) => {
    expect(reachable(entry).has(MAP)).toBe(false)
  })
})
