import type { OnuLocale } from "../i18n/types"

/**
 * English without bundled text or date-fns data: the default locale of `OnuProvider`.
 * Components bring the English strings they use (see `i18n/english.ts`) and date-fns
 * formats in English by default, so English-only apps carry no locale data they do not show.
 */
export const baseEn: OnuLocale = {
  code: "en",
  name: "English",
  dir: "ltr",
  messages: {},
  weekStartsOn: 0,
  numberLocale: "en",
  hourCycle: 12,
}

/** Code, native name and direction of the built-in locales, for language switchers. */
export const BUILT_IN_LOCALES = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "dv", name: "ދިވެހި", dir: "rtl" },
] as const

export type BuiltInLocaleCode = (typeof BUILT_IN_LOCALES)[number]["code"]
