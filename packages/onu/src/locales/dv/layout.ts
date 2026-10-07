import type { MessageDict } from "../../i18n/types"
import type { layout as en } from "../en/layout"

export const layout = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
