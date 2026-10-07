import type { MessageDict } from "../../i18n/types"
import type { input as en } from "../en/input"

export const input = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
