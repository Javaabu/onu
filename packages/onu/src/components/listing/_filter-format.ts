import { format, isValid, parseISO } from "date-fns"
import type { Locale as DateFnsLocale } from "date-fns"

import type { Translate } from "../../i18n/types"
import type { DateRangeValue, FilterDefinition, FilterOption, FilterValue } from "./listing-types"
import { isFilterValueEmpty } from "./use-listing-state"

export function optionText(option: FilterOption | undefined, fallback: string) {
  if (!option) return fallback
  if (option.textLabel) return option.textLabel
  return typeof option.label === "string" || typeof option.label === "number" ? String(option.label) : option.value
}

/** Formats a `yyyy-MM-dd` date as "1 Mar" (adding the year when it is not this year). */
export function formatFilterDate(value: string, dateLocale: DateFnsLocale, now = new Date()) {
  const date = parseISO(value)
  if (!isValid(date)) return value
  return format(date, date.getFullYear() === now.getFullYear() ? "d MMM" : "d MMM yyyy", { locale: dateLocale })
}

export interface FormattedFilter {
  /** Pill label, e.g. "Status" or "Created" (the chosen date field). */
  label: string
  /** Pill value, e.g. "Active" or "1 Mar → 31 Mar". */
  text: string
}

/**
 * Pill text for an applied filter (§25.7): "Status: Active",
 * "Created: 1 Mar → 31 Mar", "Created: from 1 Mar". `null` when empty.
 */
export function formatFilter(
  definition: FilterDefinition,
  value: FilterValue | undefined,
  t: Translate,
  dateLocale: DateFnsLocale,
): FormattedFilter | null {
  if (value === undefined || isFilterValueEmpty(value)) return null
  if (definition.format) {
    const text = definition.format(value)
    return text === null ? null : { label: definition.label, text }
  }
  switch (definition.type) {
    case "select": {
      const values = Array.isArray(value) ? value : [String(value)]
      const text = values
        .map((v) =>
          optionText(
            definition.options.find((o) => o.value === v),
            v,
          ),
        )
        .join(", ")
      return { label: definition.label, text }
    }
    case "date-range": {
      const range = (typeof value === "object" && !Array.isArray(value) ? value : {}) as DateRangeValue
      const field = definition.fields?.find((f) => f.value === range.field) ?? definition.fields?.[0]
      const label = field ? optionText(field, definition.label) : definition.label
      const from = range.from ? formatFilterDate(range.from, dateLocale) : undefined
      const to = range.to ? formatFilterDate(range.to, dateLocale) : undefined
      const text =
        from && to
          ? t("listing.dateRangeBoth", { from, to })
          : from
            ? t("listing.dateRangeFrom", { from })
            : t("listing.dateRangeTo", { to })
      return { label, text }
    }
    case "boolean":
      return {
        label: definition.label,
        text: value === "1" ? (definition.trueLabel ?? t("listing.yes")) : (definition.falseLabel ?? t("listing.no")),
      }
    case "trashed":
      return {
        label: definition.label,
        text: value === "only" ? t("listing.trashedOnly") : t("listing.trashedInclude"),
      }
    default:
      return { label: definition.label, text: Array.isArray(value) ? value.join(", ") : String(value) }
  }
}
