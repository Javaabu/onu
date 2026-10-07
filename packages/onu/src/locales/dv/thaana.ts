import type { MessageDict } from "../../i18n/types"
import type { thaana as en } from "../en/thaana"

export const thaana = {
  toggle: "ތާނައާއި ލަތީނުގެ ދެމެދު ބަދަލުކުރޭ",
  on: "ތާނައިން ލިޔެވޭ",
  off: "ލަތީނުން ލިޔެވޭ",
} satisfies Record<keyof typeof en, MessageDict[string]> & MessageDict
