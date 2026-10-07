import type { MessageDict } from "../../i18n/types"
import type { auth as en } from "../en/auth"

export const auth = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
