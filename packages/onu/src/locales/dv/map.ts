import type { MessageDict } from "../../i18n/types"
import type { map as en } from "../en/map"

export const map = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
