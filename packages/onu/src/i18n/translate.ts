import { englishNamespace } from "./english"
import type { Message, MessageDict, Namespace, OnuLocale, PartialMessages, Translate, TranslateParams } from "./types"

const pluralRulesCache = new Map<string, Intl.PluralRules>()

function pluralRules(code: string) {
  let rules = pluralRulesCache.get(code)
  if (!rules) {
    rules = new Intl.PluralRules(code)
    pluralRulesCache.set(code, rules)
  }
  return rules
}

function interpolate(template: string, params: TranslateParams | undefined, numberLocale: string) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name]
    if (value === undefined || value === null) return match
    return typeof value === "number" ? new Intl.NumberFormat(numberLocale).format(value) : String(value)
  })
}

function pick(message: Message, params: TranslateParams | undefined, code: string): string {
  if (typeof message === "string") return message
  const count = typeof params?.count === "number" ? params.count : 0
  if (count === 0 && message.zero) return message.zero
  const category = pluralRules(code).select(count) as keyof typeof message
  return message[category] ?? message.other
}

/** Deep-merges message overrides into a locale's messages (consumer overrides, R12.2). */
export function mergeMessages<T extends PartialMessages>(base: T, overrides?: PartialMessages): T {
  if (!overrides) return base
  const merged: PartialMessages = { ...base }
  for (const ns of Object.keys(overrides) as Namespace[]) {
    merged[ns] = { ...base[ns], ...(overrides[ns] as MessageDict) }
  }
  return merged as T
}

/**
 * Creates `t("namespace.key", params)`. Missing keys fall back to `fallback`, then
 * to the English text of the loaded components (each component brings the English
 * namespaces it uses), and then to the key itself, so a missing translation never crashes.
 */
export function createTranslator(locale: OnuLocale, fallback?: OnuLocale): Translate {
  return (key, params) => {
    const dot = key.indexOf(".")
    const ns = key.slice(0, dot) as Namespace
    const name = key.slice(dot + 1)
    const message = locale.messages[ns]?.[name] ?? fallback?.messages[ns]?.[name] ?? englishNamespace(ns)?.[name]
    if (message === undefined) return key
    return interpolate(pick(message, params, locale.code), params, locale.numberLocale)
  }
}
