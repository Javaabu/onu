import type { MessageDict } from "../../i18n/types"
import type { chart as en } from "../en/chart"

export const chart = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
