import { enUS } from "date-fns/locale/en-US"

import type { OnuLocale } from "../i18n/types"
import { dv as dvDateFns } from "./date-fns-dv"
import { messages as dvMessages } from "./dv"
import { messages as enMessages } from "./en"

export const en: OnuLocale = {
  code: "en",
  name: "English",
  dir: "ltr",
  messages: enMessages,
  dateFns: enUS,
  weekStartsOn: 0,
  numberLocale: "en",
  hourCycle: 12,
}

export const dv: OnuLocale = {
  code: "dv",
  name: "ދިވެހި",
  dir: "rtl",
  messages: dvMessages,
  dateFns: dvDateFns,
  weekStartsOn: 0,
  // Western Arabic digits are standard in the Maldives (R12.6).
  numberLocale: "en",
  hourCycle: 12,
}

export const locales = { en, dv } as const

export { dvDateFns }
