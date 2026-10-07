"use client"

import { Icon } from "../../icons/icon"
import { useTranslation } from "../../providers/onu-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select"
import type { ListingSort } from "./listing-types"

export interface SortMenuProps {
  /** Sortable columns: `id` and the header text. */
  columns: { id: string; header: string }[]
  sort: ListingSort | null
  onSortChange: (sort: ListingSort) => void
  className?: string
}

/**
 * The "Sort by" menu shown where there are no sortable column headers: on
 * phone cards and above list or grid views (§25.6).
 */
export function SortMenu({ columns, sort, onSortChange, className }: SortMenuProps) {
  const { t } = useTranslation()
  if (!columns.length) return null
  const value = sort ? `${sort.id}:${sort.desc ? "desc" : "asc"}` : ""
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const [id, dir] = v.split(":") as [string, string]
        onSortChange({ id, desc: dir === "desc" })
      }}
    >
      <SelectTrigger size="sm" aria-label={t("listing.sortBy")} className={className ?? "touch:min-h-11"}>
        <Icon name="sort" />
        <SelectValue placeholder={t("listing.sortBy")} />
      </SelectTrigger>
      <SelectContent align="end">
        {columns.flatMap((c) =>
          (["asc", "desc"] as const).map((dir) => (
            <SelectItem key={`${c.id}:${dir}`} value={`${c.id}:${dir}`}>
              {c.header}, {t(dir === "asc" ? "listing.sortAscending" : "listing.sortDescending")}
            </SelectItem>
          )),
        )}
      </SelectContent>
    </Select>
  )
}
