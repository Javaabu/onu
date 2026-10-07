import type { MessageDict } from "../../i18n/types"
import type { overlay as en } from "../en/overlay"

export const overlay = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
