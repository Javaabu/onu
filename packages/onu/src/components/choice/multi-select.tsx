"use client"

import type { MultipleSelectionProps } from "./_selection"
import { LocalCombobox, type SearchableSelectBaseProps } from "./searchable-select"

export type MultiSelectProps = Omit<MultipleSelectionProps, "multiple"> & SearchableSelectBaseProps

/**
 * Pick several options: chips in the field (each removable), a searchable list
 * with a "Select all" row, and an optional `max`. Backspace in the empty search
 * field removes the last chip. Submits `name[]` for Laravel.
 */
export function MultiSelect({ selectAll = true, clearable = true, ...props }: MultiSelectProps) {
  return <LocalCombobox {...props} multiple selectAll={selectAll} clearable={clearable} dataSlot="multi-select" />
}
