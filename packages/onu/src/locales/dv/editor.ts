import type { MessageDict } from "../../i18n/types"
import type { editor as en } from "../en/editor"

export const editor = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
