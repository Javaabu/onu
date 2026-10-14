import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { messages as en } from "../locales/en/messages"
import { NAMESPACES, type Namespace } from "./types"

/**
 * Components bring the English text they use: a module with built-in strings calls
 * `registerEnglish({ form: en_form, … })` for every namespace it refers to, so
 * `t("form.required")` resolves in a bundle that holds only that module's namespaces.
 * This checks every module registers the namespaces of the keys it contains.
 */
const SRC = path.resolve(__dirname, "..")

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name)
    if (d.isDirectory()) return sourceFiles(full)
    return /\.tsx?$/.test(d.name) && !/\.test\.tsx?$/.test(d.name) ? [full] : []
  })
}

// `"form.required"` or `` `display.${network}` ``
const KEY = new RegExp(`["'\`](${NAMESPACES.join("|")})\\.(\\$\\{|[A-Za-z]\\w*["'\`])`, "g")

function usedNamespaces(code: string) {
  const used = new Set<Namespace>()
  for (const [, ns, rest] of code.matchAll(KEY)) {
    const namespace = ns as Namespace
    if (rest === "${" || rest!.slice(0, -1) in en[namespace]) used.add(namespace)
  }
  return used
}

function registeredNamespaces(code: string) {
  const call = /registerEnglish\(\{([^}]*)\}\)/.exec(code)?.[1] ?? ""
  const registered = new Set<string>()
  for (const [, ns, local] of call.matchAll(/(\w+):\s*(\w+)/g)) {
    // The registered object must be the namespace's English module.
    if (new RegExp(`import \\{ ${ns} as ${local} \\} from "[./]+locales/en/${ns}"`).test(code)) registered.add(ns!)
  }
  return registered
}

const modules = sourceFiles(SRC)
  .map((file) => path.relative(SRC, file).split(path.sep).join("/"))
  .filter((rel) => !rel.startsWith("locales/") && !rel.startsWith("i18n/"))

const withStrings = modules.filter((rel) => usedNamespaces(readFileSync(path.join(SRC, rel), "utf8")).size)

describe("English text registration", () => {
  it("finds modules with built-in strings (control)", () => {
    expect(withStrings.length).toBeGreaterThan(100)
  })

  it.each(withStrings)("%s registers the English namespaces it uses", (rel) => {
    const code = readFileSync(path.join(SRC, rel), "utf8")
    const used = [...usedNamespaces(code)].sort()
    const registered = registeredNamespaces(code)
    expect(
      used.filter((ns) => !registered.has(ns)),
      "missing registerEnglish namespaces",
    ).toEqual([])
  })

  it("no component imports the whole English locale", () => {
    const importers = modules.filter((rel) =>
      /from "[./]+locales(\/en(\/messages|\/index)?)?"/.test(readFileSync(path.join(SRC, rel), "utf8")),
    )
    // The root and the opt-in `export` entry re-export or resolve every built-in locale.
    expect(importers.sort()).toEqual(["export/columns.ts", "index.ts"])
  })
})
