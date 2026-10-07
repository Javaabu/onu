import type { MessageDict } from "../../i18n/types"
import type { thaana as en } from "../en/thaana"

export const thaana = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
