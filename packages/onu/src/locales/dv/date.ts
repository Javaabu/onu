import type { MessageDict } from "../../i18n/types"
import type { date as en } from "../en/date"

export const date = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
