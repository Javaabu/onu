import type { Locale as DateFnsLocale } from "date-fns"

/** A message with plural forms, chosen with `Intl.PluralRules` from the `count` param. */
export interface PluralMessage {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

export type Message = string | PluralMessage
export type MessageDict = Record<string, Message>

export const NAMESPACES = [
  "common",
  "form",
  "input",
  "date",
  "choice",
  "file",
  "editor",
  "map",
  "chart",
  "listing",
  "overlay",
  "layout",
  "display",
  "thaana",
  "auth",
] as const

export type Namespace = (typeof NAMESPACES)[number]
export type Messages = Record<Namespace, MessageDict>
export type PartialMessages = Partial<Record<Namespace, MessageDict>>

export interface OnuLocale {
  /** BCP 47 code, e.g. `en` or `dv`. */
  code: string
  /** Native name for language switchers. */
  name: string
  dir: "ltr" | "rtl"
  messages: Messages
  dateFns: DateFnsLocale
  /** 0 = Sunday … 6 = Saturday. */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Locale used for `Intl.NumberFormat` (Western digits in Dhivehi, R12.6). */
  numberLocale: string
  /** Default hour cycle for time pickers. */
  hourCycle: 12 | 24
}

export type TranslateParams = Record<string, string | number | null | undefined>
export type Translate = (key: string, params?: TranslateParams) => string
