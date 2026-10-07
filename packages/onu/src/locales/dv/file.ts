import type { MessageDict } from "../../i18n/types"
import type { file as en } from "../en/file"

export const file = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
