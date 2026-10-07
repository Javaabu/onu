"use client"

import type { QuickCreateProps } from "./_create"
import { LocalCombobox, type SearchableSelectProps } from "./searchable-select"

export type { CreateDialogRenderProps, QuickCreateProps } from "./_create"

export type QuickCreateSelectProps = SearchableSelectProps & QuickCreateProps

/**
 * A searchable select that can create the option the user is looking for.
 * When nothing matches the search exactly, a "Create “x”" row appears: either
 * `onCreate(label)` creates it inline, or `renderCreateDialog` opens your own
 * dialog. The new option is added to the list, selected and announced.
 */
export function QuickCreateSelect(props: QuickCreateSelectProps) {
  return <LocalCombobox {...props} dataSlot="quick-create-select" />
}
