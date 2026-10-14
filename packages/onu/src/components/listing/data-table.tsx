"use client"

import * as React from "react"
import {
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table"
import { cva, type VariantProps } from "class-variance-authority"

import { useIsMobile } from "../../hooks/use-mobile"
import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { Skeleton } from "../../ui/skeleton"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table"
import { isInteractiveTarget, useAnnouncer } from "./_shared"
import { SelectionCheckbox } from "./_selection-checkbox"
import { SortMenu } from "./_sort-menu"
import { formatFilterLabel, useActiveFilterChips } from "./active-filter-chips"
import { BulkActionBar, type BulkAction } from "./bulk-actions"
import { EmptyState } from "./empty-state"
import type { FilterDefinition, ListingNoun } from "./listing-types"
import { Pagination } from "./pagination"
import { RowActions, type RecordAction } from "./row-actions"
import { useListingState, type ListingController } from "./use-listing-state"
import { registerEnglish } from "../../i18n/english"
import { common as en_common } from "../../locales/en/common"
import { listing as en_listing } from "../../locales/en/listing"

registerEnglish({ common: en_common, listing: en_listing })

/** A column of a `DataTable`. */
export interface DataTableColumn<T extends RowData> {
  /** Stable id. Used for sorting (`sort=id`) and column visibility. */
  id: string
  /** Header text. Also labels the value on phone cards and in the column and sort menus. */
  header: string
  /** Custom header content (the text above stays the accessible label). */
  headerContent?: React.ReactNode
  /** Property name or function giving the cell's value. Defaults to `row[id]`. */
  accessor?: keyof T | ((row: T) => unknown)
  /** Custom cell content. */
  cell?: (row: T) => React.ReactNode
  /** Clicking the header sorts by this column. */
  sortable?: boolean
  /** Whether the column menu may hide this column. Default `true` (the primary column can't be hidden). */
  hideable?: boolean
  /** The record's name: links to the record and titles the phone card. */
  primary?: boolean
  align?: "start" | "center" | "end"
  /** Numbers: tabular figures, aligned to the end. */
  numeric?: boolean
  /** Leave this column off the phone cards. */
  hideOnCards?: boolean
  className?: string
  headerClassName?: string
}

export const dataTableVariants = cva("", {
  variants: {
    striped: { true: "[&_tbody_tr:nth-child(even)]:bg-muted/30", false: "" },
    stickyHeader: { true: "[&_thead]:top-0 [&_thead]:sticky [&_thead]:z-10 [&_thead]:bg-background", false: "" },
    density: {
      compact: "[&_td]:py-2 [&_th]:py-2 [&_td]:px-2 [&_th]:px-2",
      default: "",
      comfortable: "[&_td]:py-4 [&_th]:py-4",
    },
  },
  defaultVariants: { striped: false, stickyHeader: false, density: "default" },
})

export interface DataTableProps<T extends RowData> extends VariantProps<typeof dataTableVariants> {
  columns: DataTableColumn<T>[]
  /** Rows of the current page. */
  data: T[]
  /** Stable row id. Defaults to `row.id`. */
  getRowId?: (row: T) => string
  /** Display name of a row ("Select Jane Doe", "Delete Jane Doe?"). Defaults to the primary column. */
  getRowName?: (row: T) => string
  /** Listing state from `useListingState()`. Without it the table keeps its own (not in the URL). */
  state?: ListingController
  /** Total rows across all pages. Shows the pagination footer. */
  total?: number
  /** Show the pagination footer. Default: when `total` is known. */
  pagination?: boolean
  perPageOptions?: number[]
  /** What is listed, e.g. `{ one: "user", other: "users" }`. */
  noun?: ListingNoun
  /** Show row checkboxes. Default: when there are bulk actions (never in trash). */
  selectable?: boolean
  bulkActions?: BulkAction<unknown>[]
  onBulkSuccess?: (message: string) => void
  /** Actions in each row's ⋯ menu. Only permitted ones are listed. */
  rowActions?: (row: T) => RecordAction[]
  /** Clicking the row or its name opens the record. */
  getRowHref?: (row: T) => string | undefined
  onRowClick?: (row: T) => void
  loading?: boolean
  /** Trash view: no checkboxes and no bulk bar (§25.6). */
  trash?: boolean
  /** The main action for the "no records" empty state (e.g. a "New user" button). */
  emptyAction?: React.ReactNode
  /** Replace the empty state. */
  empty?: React.ReactNode
  /** Filter definitions, to name the active filters in the "no results" state. */
  filters?: FilterDefinition[]
  /** `auto` shows labelled cards below 768px (§25.6). */
  layout?: "auto" | "table" | "cards"
  /** Accessible name of the table. */
  caption?: string
  className?: string
  classNames?: {
    table?: string
    header?: string
    row?: string
    cell?: string
    cards?: string
    card?: string
    footer?: string
    toolbar?: string
  }
}

const features = tableFeatures({ rowSelectionFeature, rowSortingFeature, columnVisibilityFeature })
type Features = typeof features

function valueOf<T extends RowData>(column: DataTableColumn<T>, row: T): unknown {
  if (typeof column.accessor === "function") return column.accessor(row)
  const key = (column.accessor ?? column.id) as keyof T
  return row[key]
}

function display(value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === "") return null
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === "string" || typeof value === "number") return value
  return String(value)
}

const defaultGetRowId = (row: unknown) => String((row as { id?: unknown }).id)

/**
 * The listing table (§25.6), on TanStack Table v9 and shadcn's `Table`:
 * sortable headers with `aria-sort`, row checkboxes with a select-all-on-this-page
 * box, a bulk action bar, ⋯ row menus, empty states, the trash view, labelled
 * cards with a Sort by menu on phones, and the pagination footer. Pair it with
 * `useListingState` for the URL and paging rules.
 */
export function DataTable<T extends RowData>({
  columns,
  data,
  getRowId = defaultGetRowId,
  getRowName,
  state: stateProp,
  total,
  pagination,
  perPageOptions,
  noun,
  selectable: selectableProp,
  bulkActions,
  onBulkSuccess,
  rowActions,
  getRowHref,
  onRowClick,
  loading,
  trash,
  emptyAction,
  empty,
  filters = [],
  layout = "auto",
  caption,
  striped,
  stickyHeader,
  density,
  className,
  classNames,
}: DataTableProps<T>) {
  const { t } = useTranslation()
  const Link = useLinkComponent()
  const internal = useListingState({ url: false })
  const state = stateProp ?? internal
  const isMobile = useIsMobile()
  const cards = layout === "cards" || (layout === "auto" && isMobile)
  const { announce, region } = useAnnouncer()
  const chips = useActiveFilterChips(filters, state.filters)

  const selectable = !trash && (selectableProp ?? !!bulkActions?.length)
  const primary = columns.find((c) => c.primary) ?? columns[0]
  const nameOf = React.useCallback(
    (row: T) => getRowName?.(row) ?? String(primary ? (valueOf(primary, row) ?? "") : ""),
    [getRowName, primary],
  )

  // TanStack Table owns column models, visibility and selection state; the listing controller is the source of truth.
  const tanColumns = React.useMemo<ColumnDef<Features, T>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        header: column.header,
        accessorFn: (row: T) => valueOf(column, row) as never,
        enableSorting: !!column.sortable,
        enableHiding: column.hideable ?? !column.primary,
      })),
    [columns],
  )
  const rowSelection = React.useMemo<RowSelectionState>(
    () => Object.fromEntries(state.selection.map((id) => [id, true])),
    [state.selection],
  )
  const sorting = React.useMemo<SortingState>(() => (state.sort ? [state.sort] : []), [state.sort])

  const table = useTable({
    features,
    columns: tanColumns,
    data,
    getRowId: (row: T) => getRowId(row),
    manualSorting: true,
    enableSortingRemoval: false,
    enableRowSelection: selectable,
    state: { rowSelection, sorting, columnVisibility: state.columnVisibility },
    onRowSelectionChange: (updater: Updater<RowSelectionState>) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater
      state.setSelection(Object.keys(next).filter((id) => next[id]))
    },
    onSortingChange: (updater: Updater<SortingState>) => {
      const next = typeof updater === "function" ? updater(sorting) : updater
      state.setSort(next[0] ?? null)
    },
    onColumnVisibilityChange: (updater: Updater<ColumnVisibilityState>) => {
      const next = typeof updater === "function" ? updater(state.columnVisibility) : updater
      state.setColumnVisibility(next)
    },
  })

  const byId = React.useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns])
  const visibleColumns = table
    .getVisibleLeafColumns()
    .map((c) => byId.get(c.id))
    .filter((c): c is DataTableColumn<T> => !!c)
  const rows = table.getRowModel().rows

  // Announce sort changes (§25.10).
  const sortKey = state.sort ? `${state.sort.id}:${state.sort.desc}` : ""
  const lastSort = React.useRef(sortKey)
  React.useEffect(() => {
    if (lastSort.current === sortKey) return
    lastSort.current = sortKey
    const column = state.sort ? byId.get(state.sort.id) : undefined
    if (!state.sort || !column) return
    announce(
      t("listing.sortedBy", {
        column: column.header,
        direction: t(state.sort.desc ? "listing.sortDescending" : "listing.sortAscending"),
      }),
    )
  }, [sortKey, state.sort, byId, announce, t])

  const allSelected = rows.length > 0 && table.getIsAllPageRowsSelected()
  const someSelected = table.getIsSomePageRowsSelected()
  const headerChecked: boolean | "indeterminate" = allSelected ? true : someSelected ? "indeterminate" : false

  const openRow = (row: T, event: React.MouseEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target, event.currentTarget)) return
    if (window.getSelection?.()?.toString()) return
    if (onRowClick) onRowClick(row)
    else if (getRowHref?.(row)) event.currentTarget.querySelector<HTMLAnchorElement>("a[data-row-link]")?.click()
  }
  const clickable = !!onRowClick || !!getRowHref

  const renderValue = (column: DataTableColumn<T>, row: T) => {
    const content = column.cell ? column.cell(row) : display(valueOf(column, row))
    const shown = content ?? <span className="text-muted-foreground">{t("common.emptyValue")}</span>
    if (column !== primary) return shown
    const href = getRowHref?.(row)
    if (href)
      return (
        <Link
          href={href}
          data-row-link=""
          className="font-medium rounded-sm text-foreground underline-offset-4 outline-none hover:underline focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {shown}
        </Link>
      )
    return <span className="font-medium">{shown}</span>
  }

  const rowCheckbox = (rowId: string, row: T) => (
    <SelectionCheckbox
      checked={state.selection.includes(rowId)}
      onCheckedChange={(checked) => state.toggleSelected(rowId, checked)}
      aria-label={t("listing.selectRow", { name: nameOf(row) })}
    />
  )

  const actionsFor = (row: T) => {
    const actions = rowActions?.(row)
    return actions?.length ? <RowActions name={nameOf(row)} actions={actions} /> : null
  }

  const empty_ = !loading && data.length === 0
  const emptyEl = empty_
    ? (empty ??
      (state.isFiltered ? (
        <EmptyState
          variant="no-results"
          noun={noun}
          search={state.search || undefined}
          filters={chips.map(formatFilterLabel)}
          onClearSearch={state.search ? state.clearSearch : undefined}
          onClearFilters={chips.length ? state.clearFilters : undefined}
        />
      ) : trash ? (
        <EmptyState variant="trash" noun={noun} />
      ) : (
        <EmptyState variant="no-records" noun={noun} action={emptyAction} />
      )))
    : null

  const sortable = columns.filter((c) => c.sortable)
  const showPagination = pagination ?? total !== undefined
  const hasActions = !!rowActions

  const alignClass = (column: DataTableColumn<T>) =>
    column.numeric || column.align === "end"
      ? "text-end tabular-nums"
      : column.align === "center"
        ? "text-center"
        : "text-start"

  const ariaSort = (id: string) =>
    state.sort?.id === id
      ? state.sort.desc
        ? "descending"
        : "ascending"
      : sortable.some((c) => c.id === id)
        ? "none"
        : undefined

  const header = (
    <TableHeader className={classNames?.header}>
      {table.getHeaderGroups().map((group) => (
        <TableRow key={group.id} className="hover:bg-transparent">
          {selectable ? (
            <TableHead className="w-10">
              <SelectionCheckbox
                checked={headerChecked}
                disabled={rows.length === 0}
                onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
                aria-label={t("listing.selectAllOnPage")}
              />
            </TableHead>
          ) : null}
          {group.headers.map((h) => {
            const column = byId.get(h.column.id)
            if (!column) return null
            const sorted = state.sort?.id === column.id ? (state.sort.desc ? "desc" : "asc") : false
            return (
              <TableHead
                key={h.id}
                aria-sort={ariaSort(column.id)}
                className={cn(alignClass(column), column.headerClassName)}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => state.toggleSort(column.id)}
                    className={cn(
                      "-mx-1.5 px-1.5 gap-1.5 h-7 touch:min-h-11 font-semibold inline-flex items-center rounded-md transition-colors outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50",
                      (column.numeric || column.align === "end") && "flex-row-reverse",
                    )}
                  >
                    {column.headerContent ?? column.header}
                    <Icon
                      name={sorted === "asc" ? "sort-asc" : sorted === "desc" ? "sort-desc" : "sort"}
                      className={cn("size-3.5", sorted ? "text-primary" : "text-muted-foreground opacity-60")}
                      data-sorted={sorted || undefined}
                    />
                  </button>
                ) : (
                  (column.headerContent ?? column.header)
                )}
              </TableHead>
            )
          })}
          {hasActions ? (
            <TableHead className="w-12 text-end">
              <span className="sr-only">{t("listing.actions")}</span>
            </TableHead>
          ) : null}
        </TableRow>
      ))}
    </TableHeader>
  )

  const colSpan = visibleColumns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)

  const tableEl = (
    <Table
      aria-busy={loading || undefined}
      className={cn(dataTableVariants({ striped, stickyHeader, density }), classNames?.table)}
      data-slot="data-table-table"
    >
      {caption ? <TableCaption className="sr-only">{caption}</TableCaption> : null}
      {header}
      <TableBody>
        {loading
          ? Array.from({ length: Math.min(state.perPage, 5) }, (_, i) => (
              <TableRow key={`skeleton-${i}`} data-slot="data-table-skeleton">
                {Array.from({ length: colSpan }, (__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 max-w-40 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((r) => {
              const row = r.original
              const selected = state.selection.includes(r.id)
              return (
                <TableRow
                  key={r.id}
                  data-state={selected ? "selected" : undefined}
                  aria-selected={selectable ? selected : undefined}
                  className={cn(clickable && "cursor-pointer", classNames?.row)}
                  onClick={clickable ? (e) => openRow(row, e) : undefined}
                >
                  {selectable ? <TableCell className="w-10">{rowCheckbox(r.id, row)}</TableCell> : null}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id} className={cn(alignClass(column), column.className, classNames?.cell)}>
                      {renderValue(column, row)}
                    </TableCell>
                  ))}
                  {hasActions ? <TableCell className="w-12 text-end">{actionsFor(row)}</TableCell> : null}
                </TableRow>
              )
            })}
      </TableBody>
    </Table>
  )

  const cardColumns = visibleColumns.filter((c) => c !== primary && !c.hideOnCards)

  const cardsToolbar =
    selectable || sortable.length ? (
      <div
        className={cn("gap-3 flex flex-wrap items-center justify-between", classNames?.toolbar)}
        data-slot="data-table-card-toolbar"
      >
        {selectable ? (
          <label className="gap-2 text-sm touch:min-h-11 flex items-center">
            <SelectionCheckbox
              checked={headerChecked}
              disabled={rows.length === 0}
              onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
            />
            {t("listing.selectAll")}
          </label>
        ) : (
          <span />
        )}
        <SortMenu columns={sortable} sort={state.sort} onSortChange={state.setSort} />
      </div>
    ) : null

  const cardsEl = (
    <ul
      className={cn("gap-3 grid", classNames?.cards)}
      aria-busy={loading || undefined}
      aria-label={caption}
      data-slot="data-table-cards"
    >
      {loading
        ? Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="p-4 gap-2 grid rounded-xl border">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </li>
          ))
        : rows.map((r) => {
            const row = r.original
            const selected = state.selection.includes(r.id)
            return (
              // Clicking anywhere on the item is a mouse shortcut for its link, which keyboard users reach directly.
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
              <li
                key={r.id}
                data-state={selected ? "selected" : undefined}
                className={cn(
                  "p-4 gap-3 grid rounded-xl border bg-card text-card-foreground data-[state=selected]:border-primary-3 data-[state=selected]:bg-primary-1",
                  clickable && "cursor-pointer",
                  classNames?.card,
                )}
                onClick={clickable ? (e) => openRow(row, e) : undefined}
              >
                <div className="gap-3 flex items-start">
                  {selectable ? <div className="pt-0.5">{rowCheckbox(r.id, row)}</div> : null}
                  <div className="min-w-0 flex-1">{primary ? renderValue(primary, row) : null}</div>
                  {actionsFor(row)}
                </div>
                {cardColumns.length ? (
                  <dl className="gap-x-4 gap-y-1.5 text-sm grid grid-cols-[auto_1fr]">
                    {cardColumns.map((column) => (
                      <React.Fragment key={column.id}>
                        <dt className="text-muted-foreground">{column.header}</dt>
                        <dd className={cn("min-w-0 break-words", column.numeric && "tabular-nums")}>
                          {renderValue(column, row)}
                        </dd>
                      </React.Fragment>
                    ))}
                  </dl>
                ) : null}
              </li>
            )
          })}
    </ul>
  )

  return (
    <div data-slot="data-table" className={cn("gap-3 min-w-0 grid", className)}>
      {region}
      {selectable ? (
        <BulkActionBar
          selected={state.selection}
          actions={bulkActions ?? []}
          onClearSelection={state.clearSelection}
          noun={noun}
          onSuccess={(message) => onBulkSuccess?.(message)}
        />
      ) : null}
      {cards ? cardsToolbar : null}
      {emptyEl ? (
        <div className={cn(!cards && "rounded-xl border")}>{emptyEl}</div>
      ) : cards ? (
        cardsEl
      ) : (
        // Ant table: no outer frame, the grey header's top corners rounded, a line under the last row.
        <div className="overflow-hidden rounded-t-xl border-b">{tableEl}</div>
      )}
      {showPagination && !(empty_ && !state.isFiltered && state.page === 1) ? (
        <Pagination
          page={state.page}
          perPage={state.perPage}
          total={total}
          hasNextPage={total === undefined ? data.length >= state.perPage : undefined}
          onPageChange={state.setPage}
          onPerPageChange={state.setPerPage}
          perPageOptions={perPageOptions}
          noun={noun}
          className={classNames?.footer}
        />
      ) : null}
    </div>
  )
}
