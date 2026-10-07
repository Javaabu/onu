import type { MessageDict } from "../../i18n/types"
import type { choice as en } from "../en/choice"

export const choice = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
