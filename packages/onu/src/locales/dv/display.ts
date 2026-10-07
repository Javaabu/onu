import type { MessageDict } from "../../i18n/types"
import type { display as en } from "../en/display"

export const display = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
