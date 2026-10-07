import type { MessageDict } from "../../i18n/types"
import type { form as en } from "../en/form"

export const form = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
