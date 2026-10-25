import type * as React from "react"

/** Sort state: the column id and direction. */
export interface ListingSort {
  id: string
  desc: boolean
}

/** Value of a date range filter. Dates are `yyyy-MM-dd` strings so they survive the URL. */
export interface DateRangeFilterValue {
  /** Which date to filter on (e.g. `created_at`), when the filter offers a choice. */
  field?: string
  from?: string
  to?: string
}

/** A filter value: text, one option, several options or a date range. */
export type FilterValue = string | string[] | DateRangeFilterValue

/** Applied filters keyed by filter key. Empty values are dropped. */
export type FilterValues = Record<string, FilterValue | undefined>

/** A noun with singular and plural forms, e.g. `{ one: "user", other: "users" }`. */
export interface ListingNoun {
  one: string
  other: string
}

/** A listing's view: the built-in table, list, grid and kanban, or one of your own. */
export type ListingView = "table" | "list" | "grid" | "kanban" | (string & {})

export interface FilterOption {
  value: string
  label: React.ReactNode
  /** Plain-text label for pills and search. Defaults to `label` when it is a string. */
  textLabel?: string
}

export interface FilterRenderProps<V extends FilterValue = FilterValue> {
  value: V | undefined
  onChange: (value: V | undefined) => void
  /** Id for the control, already wired to the filter's label. */
  id: string
  definition: FilterDefinition
}

interface FilterBase {
  /** Key in the filter values and URL (`filter[key]`). */
  key: string
  /** Label shown in the panel and on the pill. */
  label: string
  /** Replace the built-in control. */
  render?: (props: FilterRenderProps) => React.ReactNode
  /** Format the value for the pill. Return `null` to hide the pill. */
  format?: (value: FilterValue) => string | null
}

export interface SelectFilterDefinition extends FilterBase {
  type: "select"
  options: FilterOption[]
  /** Allow several options. Default `true`. */
  multiple?: boolean
  /** Show a search box. Defaults to on for more than 7 options. */
  searchable?: boolean
}

export interface DateRangeFilterDefinition extends FilterBase {
  type: "date-range"
  /** Dates the user can choose between (the "Date" dropdown), e.g. Created, Updated. */
  fields?: FilterOption[]
}

export interface BooleanFilterDefinition extends FilterBase {
  type: "boolean"
  trueLabel?: string
  falseLabel?: string
}

export interface TextFilterDefinition extends FilterBase {
  type: "text"
  placeholder?: string
  /** Type Thaana in the text box (R13.3). */
  thaana?: boolean
}

export interface TrashedFilterDefinition extends FilterBase {
  type: "trashed"
}

export interface CustomFilterDefinition extends FilterBase {
  type: "custom"
  render: (props: FilterRenderProps) => React.ReactNode
}

/** One filter in the filters panel (§25.7). */
export type FilterDefinition =
  | SelectFilterDefinition
  | DateRangeFilterDefinition
  | BooleanFilterDefinition
  | TextFilterDefinition
  | TrashedFilterDefinition
  | CustomFilterDefinition
