import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The build puts `"use client"` only on modules whose source starts with it (vite.config.ts),
 * so pure helpers stay callable from React Server Components. A module that uses state,
 * effects or context must therefore say so itself. `useId`, `useMemo` and `useCallback` also
 * work in Server Components, so they don't count.
 */
const SRC = path.resolve(__dirname)

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name)
    if (d.isDirectory()) return sourceFiles(full)
    return /\.tsx?$/.test(d.name) && !/\.(test|d)\.tsx?$/.test(d.name) ? [full] : []
  })
}

const CLIENT_ONLY = /\b(?:use(?!Id\b|Memo\b|Callback\b)[A-Z]\w*|createContext)\s*[(<]/
const USE_CLIENT = /^(?:\s|\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)*["']use client["']/

describe('"use client" directives', () => {
  it("are on every module that uses client-only React", () => {
    const missing = sourceFiles(SRC)
      .filter((file) => {
        const code = readFileSync(file, "utf8")
        return CLIENT_ONLY.test(code) && !USE_CLIENT.test(code)
      })
      .map((file) => path.relative(SRC, file))
    expect(missing).toEqual([])
  })

  it("are not on the pure helpers Server Components call", () => {
    const pure = [
      "lib/utils.ts",
      "providers/theme-script.ts",
      "i18n/translate.ts",
      "thaana/convert.ts",
      "export/csv.ts",
    ]
    const marked = pure.filter((file) => USE_CLIENT.test(readFileSync(path.join(SRC, file), "utf8")))
    expect(marked).toEqual([])
  })
})
