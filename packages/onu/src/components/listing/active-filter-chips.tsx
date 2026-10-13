"use client"

import * as React from "react"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useTranslation } from "../../providers/onu-provider"
import { Button } from "../../ui/button"
import { formatFilter, type FormattedFilter } from "./_filter-format"
import type { FilterDefinition, FilterValue, FilterValues } from "./listing-types"

export { formatFilter, formatFilterDate, type FormattedFilter } from "./_filter-format"

/** One applied filter as a single label, e.g. "Status: Active" (as the "no results" state lists them). */
export function formatFilterLabel(filter: FormattedFilter) {
  return `${filter.label}: ${filter.text}`
}

/**
 * Formats one applied filter in the active locale: `(definition, value)` →
 * "Status: Active", "Created: 1 Mar → 31 Mar", or `null` when the value is empty.
 * For custom empty states and summaries; dates and Yes/No use the active locale.
 */
export function useFormatFilter() {
  const { t, locale } = useTranslation()
  return React.useCallback(
    (definition: FilterDefinition, value: FilterValue | undefined): string | null => {
      const formatted = formatFilter(definition, value, t, locale.dateFns)
      return formatted ? formatFilterLabel(formatted) : null
    },
    [t, locale.dateFns],
  )
}

/**
 * Labels for every applied filter, in the order of `filters`
 * (`["Status: Active", "Island: Malé"]`). Pass them to `EmptyState`'s
 * `filters` for a custom "no results" state.
 */
export function useActiveFilterLabels(filters: FilterDefinition[], value: FilterValues): string[] {
  const chips = useActiveFilterChips(filters, value)
  return React.useMemo(() => chips.map(formatFilterLabel), [chips])
}

export interface ActiveFilterChip extends FormattedFilter {
  key: string
}

/** Pills for the applied filters, in the order of `filters`. */
export function useActiveFilterChips(filters: FilterDefinition[], value: FilterValues): ActiveFilterChip[] {
  const { t, locale } = useTranslation()
  return React.useMemo(
    () =>
      filters.flatMap((definition) => {
        const formatted = formatFilter(definition, value[definition.key], t, locale.dateFns)
        return formatted ? [{ key: definition.key, ...formatted }] : []
      }),
    [filters, value, t, locale.dateFns],
  )
}

export interface ActiveFilterChipsProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  filters: FilterDefinition[]
  /** The applied filters. */
  value: FilterValues
  /** ✕ on a pill. */
  onRemove: (key: string) => void
  /** "Clear all", shown when two or more pills are visible. */
  onClearAll?: () => void
  classNames?: { list?: string; chip?: string; remove?: string; clearAll?: string }
}

/**
 * One pill per applied filter, e.g. "Status: Active ✕", "Created: 1 Mar → 31 Mar"
 * (§25.7). ✕ removes that filter; "Clear all" appears with two or more pills.
 * Renders nothing when no filters are applied.
 */
export function ActiveFilterChips({
  filters,
  value,
  onRemove,
  onClearAll,
  className,
  classNames,
  ...props
}: ActiveFilterChipsProps) {
  const { t } = useTranslation()
  const chips = useActiveFilterChips(filters, value)
  const listRef = React.useRef<HTMLUListElement>(null)
  if (chips.length === 0) return null

  const remove = (key: string, index: number) => {
    onRemove(key)
    // Keep focus in the list: move to the next pill's ✕ (or the previous one).
    window.setTimeout(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("[data-slot=filter-chip-remove]")
      if (!buttons?.length) return
      buttons[Math.min(index, buttons.length - 1)]?.focus()
    })
  }

  return (
    <div
      data-slot="active-filter-chips"
      role="region"
      aria-label={t("listing.activeFilters")}
      className={cn("gap-2 flex flex-wrap items-center", className)}
      {...props}
    >
      <ul ref={listRef} className={cn("gap-2 flex flex-wrap items-center", classNames?.list)}>
        {chips.map((chip, index) => {
          const full = `${chip.label}: ${chip.text}`
          return (
            <li
              key={chip.key}
              data-slot="filter-chip"
              className={cn(
                "gap-1 ps-2 pe-0.5 h-6 touch:h-11 text-sm inline-flex max-w-full items-center rounded-sm border border-primary-3 bg-primary-1",
                classNames?.chip,
              )}
            >
              <span className="truncate">
                <span className="text-muted-foreground">{chip.label}:</span> {chip.text}
              </span>
              <button
                type="button"
                data-slot="filter-chip-remove"
                aria-label={t("listing.removeFilter", { filter: full })}
                onClick={() => remove(chip.key, index)}
                className={cn(
                  "size-5 touch:size-9 inline-flex shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-primary-2 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  classNames?.remove,
                )}
              >
                <Icon name="close" size="xs" />
              </button>
            </li>
          )
        })}
      </ul>
      {onClearAll && chips.length >= 2 ? (
        <Button
          variant="link"
          size="sm"
          className={cn("px-1 touch:min-h-11", classNames?.clearAll)}
          onClick={onClearAll}
        >
          {t("listing.clearAllFilters")}
        </Button>
      ) : null}
    </div>
  )
}
