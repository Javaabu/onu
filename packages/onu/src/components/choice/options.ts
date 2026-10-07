import type * as React from "react"

/**
 * One option of a choice input. Values are strings so they round-trip through
 * native form fields and Laravel requests unchanged.
 */
export interface ChoiceOption<TData = unknown> {
  value: string
  /** Text shown in the list and used for searching. */
  label: string
  /** Secondary text under the label. */
  description?: React.ReactNode
  /** Icon, avatar or flag before the label. */
  icon?: React.ReactNode
  disabled?: boolean
  /** Options with the same `group` are listed under that heading. */
  group?: string
  /** Extra words that should match a search (e.g. an island's atoll). */
  keywords?: string[]
  /** The raw item the option was made from (API select, `mapOption`). */
  data?: TData
}

/** Options may be given as full objects or as plain strings (value = label). */
export type ChoiceOptionInput = ChoiceOption | string

export function normalizeOptions(options: ReadonlyArray<ChoiceOptionInput> | undefined): ChoiceOption[] {
  if (!options) return []
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o))
}

const collators = new Map<string, Intl.Collator>()

function collator(locale: string) {
  let c = collators.get(locale)
  if (!c) {
    c = new Intl.Collator(locale, { usage: "search", sensitivity: "base", ignorePunctuation: true })
    collators.set(locale, c)
  }
  return c
}

/**
 * True when `query` appears anywhere in `text`, compared with `Intl.Collator`
 * (R12.8): case- and accent-insensitive for Latin ("male" finds "Malé"), while
 * Thaana vowel signs (fili) still count, so "ބާ" does not match "ބި".
 */
export function matchesQuery(text: string, query: string, locale = "en"): boolean {
  const q = query.trim().normalize("NFC")
  if (!q) return true
  const t = text.normalize("NFC")
  if (t.toLocaleLowerCase().includes(q.toLocaleLowerCase())) return true
  const c = collator(locale)
  const chars = Array.from(t)
  const len = Array.from(q).length
  for (let i = 0; i + len <= chars.length; i++) {
    if (c.compare(chars.slice(i, i + len).join(""), q) === 0) return true
  }
  return false
}

/** Options whose label or keywords match the query. */
export function filterOptions<T extends ChoiceOption>(options: T[], query: string, locale = "en"): T[] {
  if (!query.trim()) return options
  return options.filter(
    (o) => matchesQuery(o.label, query, locale) || (o.keywords ?? []).some((k) => matchesQuery(k, query, locale)),
  )
}

/** Splits options into consecutive groups, keeping their order. */
export function groupOptions<T extends ChoiceOption>(options: T[]): { group?: string; options: T[] }[] {
  const groups: { group?: string; options: T[] }[] = []
  const index = new Map<string | undefined, number>()
  for (const o of options) {
    let i = index.get(o.group)
    if (i === undefined) {
      i = groups.length
      index.set(o.group, i)
      groups.push({ group: o.group, options: [] })
    }
    groups[i]!.options.push(o)
  }
  return groups
}

/** True when an option's label equals the query (ignoring case and accents). */
export function hasExactMatch(options: ChoiceOption[], query: string, locale = "en") {
  const q = query.trim()
  if (!q) return false
  const c = collator(locale)
  return options.some((o) => c.compare(o.label.trim(), q) === 0)
}
