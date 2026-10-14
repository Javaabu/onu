import type { OnuLocale } from "../../i18n/types"
import { dv as dvDateFns } from "../date-fns-dv"
import { messages } from "./messages"

/** Dhivehi: Thaana strings, right to left, and Onu's Dhivehi date-fns locale. */
export const dv: OnuLocale = {
  code: "dv",
  name: "ދިވެހި",
  dir: "rtl",
  messages,
  dateFns: dvDateFns,
  weekStartsOn: 0,
  // Western Arabic digits are standard in the Maldives (R12.6).
  numberLocale: "en",
  hourCycle: 12,
}
