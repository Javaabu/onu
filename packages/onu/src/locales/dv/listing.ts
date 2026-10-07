import type { MessageDict } from "../../i18n/types"
import type { listing as en } from "../en/listing"

export const listing = {} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
