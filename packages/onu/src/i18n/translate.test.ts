import { describe, expect, it } from "vitest"

import { en } from "../locales"
import { createTranslator, mergeMessages } from "./translate"
import type { Messages, OnuLocale } from "./types"

/** A locale with only the given messages, so the tests do not depend on the shipped strings. */
function locale(code: string, messages: Partial<Messages>, numberLocale = code): OnuLocale {
  const empty = Object.fromEntries(Object.keys(en.messages).map((ns) => [ns, {}])) as unknown as Messages
  return { ...en, code, numberLocale, messages: { ...empty, ...messages } }
}

describe("createTranslator", () => {
  const t = createTranslator(
    locale("en", {
      common: {
        hello: "Hello, {name}",
        total: "Total: {amount}",
        files: { one: "{count} file", other: "{count} files" },
        results: { zero: "No results", one: "{count} result", other: "{count} results" },
      },
    }),
  )

  it("looks up namespace.key and fills in parameters", () => {
    expect(t("common.hello", { name: "Aishath" })).toBe("Hello, Aishath")
  })

  it("formats number parameters for the locale and leaves missing ones as placeholders", () => {
    expect(t("common.total", { amount: 1250000 })).toBe("Total: 1,250,000")
    expect(t("common.hello")).toBe("Hello, {name}")
    expect(t("common.hello", { name: null })).toBe("Hello, {name}")
    expect(t("common.hello", { name: undefined })).toBe("Hello, {name}")
  })

  it("picks the plural form from count with Intl.PluralRules", () => {
    expect(t("common.files", { count: 1 })).toBe("1 file")
    expect(t("common.files", { count: 3 })).toBe("3 files")
    expect(t("common.files", { count: 1200 })).toBe("1,200 files")
    // `zero` is used for 0 when the message has it, otherwise the plural rule's form.
    expect(t("common.results", { count: 0 })).toBe("No results")
    expect(t("common.files", { count: 0 })).toBe("0 files")
    // Without a numeric count the message is treated as 0.
    expect(t("common.results")).toBe("No results")
    expect(t("common.files", { count: "2" })).toBe("2 files")
  })

  it("falls back to the other form when the locale's category is missing", () => {
    const ar = createTranslator(locale("ar", { common: { items: { one: "one item", other: "{count} items" } } }, "en"))
    // Arabic has "few" for 3; the message only has one/other.
    expect(ar("common.items", { count: 3 })).toBe("3 items")
  })

  it("falls back to the fallback locale, then to the key itself", () => {
    const dv = locale("dv", { common: { yes: "އާން" } }, "en")
    const fallback = locale("en", { common: { yes: "Yes", no: "No" } })
    const tdv = createTranslator(dv, fallback)
    expect(tdv("common.yes")).toBe("އާން")
    expect(tdv("common.no")).toBe("No")
    expect(tdv("common.missing")).toBe("common.missing")
    expect(tdv("unknown.key")).toBe("unknown.key")
    expect(createTranslator(dv)("common.no")).toBe("common.no")
  })

  it("uses Western digits for Dhivehi through numberLocale", () => {
    const tdv = createTranslator(locale("dv", { common: { n: "{count} ފައިލް" } }, "en"))
    expect(tdv("common.n", { count: 1234 })).toBe("1,234 ފައިލް")
  })

  it("translates the shipped English strings", () => {
    const ten = createTranslator(en)
    expect(ten("common.required")).toBe("Required")
    expect(ten("date.previousYears", { count: 12 })).toBe("Previous 12 years")
  })
})

describe("mergeMessages", () => {
  const base = locale("en", { common: { yes: "Yes", no: "No" }, form: { optional: "(optional)" } }).messages

  it("returns the base messages when there are no overrides", () => {
    expect(mergeMessages(base)).toBe(base)
  })

  it("overrides and adds keys per namespace without touching the base", () => {
    const merged = mergeMessages(base, { common: { yes: "Yep", maybe: "Maybe" } })
    expect(merged.common).toEqual({ yes: "Yep", no: "No", maybe: "Maybe" })
    expect(merged.form).toBe(base.form)
    expect(base.common).toEqual({ yes: "Yes", no: "No" })
  })
})
