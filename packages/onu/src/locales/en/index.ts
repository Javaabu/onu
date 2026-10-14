import { enUS } from "date-fns/locale/en-US"

import type { OnuLocale } from "../../i18n/types"
import { messages } from "./messages"

/**
 * English with every built-in string and the date-fns `en-US` locale. `OnuProvider`
 * does not need it (components bring their own English text); use it to read or
 * copy the full message set, e.g. as the starting point of a new locale.
 */
export const en: OnuLocale = {
  code: "en",
  name: "English",
  dir: "ltr",
  messages,
  dateFns: enUS,
  weekStartsOn: 0,
  numberLocale: "en",
  hourCycle: 12,
}

export { messages }
