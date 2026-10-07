"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { buttonVariants } from "../../ui/button"
import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { ActiveFilterChips } from "./active-filter-chips"
import { ColumnVisibility } from "./column-visibility"
import { DataTable, type DataTableProps } from "./data-table"
import { ExportMenu, type ExportFormat, type ExportOption } from "./export-menu"
import { FilterPanel } from "./filter-panel"
import { FilterTabs, type FilterTab } from "./filter-tabs"
import type { FilterDefinition } from "./listing-types"
import { SearchBox } from "./search-box"
import { useListingState, type ListingController } from "./use-listing-state"

export interface ListingPageLink {
  label: string
  href: string
  /** Semantic icon name. */
  icon?: string
  /** A small dot, e.g. Trash when it isn't empty. */
  dot?: boolean
  /** Screen reader text for the dot. */
  dotLabel?: string
}

export interface ListingPageProps<T extends RowData> extends Omit<DataTableProps<T>, "state" | "filters"> {
  /** Page title, e.g. "Users". */
  title: React.ReactNode
  description?: React.ReactNode
  /** The main action, e.g. a "New user" button. Also used in the "no records" empty state. */
  primaryAction?: React.ReactNode
  /** Secondary links next to the title, e.g. Trash. */
  links?: ListingPageLink[]
  /** Shortcut for a Trash link; `trashHasItems` shows the dot. */
  trashHref?: string
  trashHasItems?: boolean
  /** Listing state. Defaults to `useListingState()` (kept in the URL). */
  state?: ListingController
  /** Filters for the Filters panel and the pills. */
  filters?: FilterDefinition[]
  /** Show the search box. Default `true`. */
  searchable?: boolean
  searchPlaceholder?: string
  /** Type Thaana in the search box. */
  searchThaana?: ThaanaProp
  /** Show the Export button. */
  onExport?: (format: ExportFormat) => void | Promise<unknown>
  exportOptions?: (ExportFormat | ExportOption)[]
  /** Show the Columns menu. Default `false`. */
  columnToggle?: boolean
  /** Status tabs; choosing one sets the filter named by `tabsFilterKey` (default `status`). */
  tabs?: FilterTab[]
  tabsFilterKey?: string
  /** Extra toolbar content at the end (e.g. a `ViewSwitcher`). */
  toolbarEnd?: React.ReactNode
  /** Replace the table (e.g. a `ListView` or `GridView` for other views). */
  children?: React.ReactNode
}

/**
 * A complete index page (§25.6): header with the title, main action and
 * secondary links (Trash with a dot), a toolbar with search, Filters and
 * Export, filter pills, the table with bulk actions and row menus, and
 * pagination. The view lives in the URL.
 */
export function ListingPage<T extends RowData>({
  title,
  description,
  primaryAction,
  links = [],
  trashHref,
  trashHasItems,
  state: stateProp,
  filters = [],
  searchable = true,
  searchPlaceholder,
  searchThaana,
  onExport,
  exportOptions,
  columnToggle,
  tabs,
  tabsFilterKey = "status",
  toolbarEnd,
  children,
  className,
  emptyAction,
  ...tableProps
}: ListingPageProps<T>) {
  const { t } = useTranslation()
  const Link = useLinkComponent()
  const internal = useListingState({ url: !stateProp })
  const state = stateProp ?? internal
  const headingId = React.useId()
  const listId = React.useId()

  const allLinks: ListingPageLink[] = [
    ...links,
    ...(trashHref
      ? [
          {
            label: t("listing.trash"),
            href: trashHref,
            icon: "trash",
            dot: trashHasItems,
            dotLabel: t("listing.trashNotEmpty"),
          },
        ]
      : []),
  ]
  const tabValue =
    typeof state.filters[tabsFilterKey] === "string"
      ? (state.filters[tabsFilterKey] as string)
      : (tabs?.[0]?.value ?? "")

  return (
    <section
      aria-labelledby={headingId}
      data-slot="listing-page"
      className={cn("gap-4 min-w-0 @container grid", className)}
    >
      <header className="gap-3 flex flex-wrap items-start justify-between">
        <div className="gap-1 min-w-0 grid">
          <h1 id={headingId} className="text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="gap-2 flex flex-wrap items-center">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(buttonVariants({ variant: "ghost" }), "touch:min-h-11 relative")}
            >
              {link.icon ? <Icon name={link.icon} /> : null}
              {link.label}
              {link.dot ? (
                <>
                  <span
                    aria-hidden="true"
                    className="top-1 end-1 size-2 absolute rounded-full bg-primary"
                    data-slot="link-dot"
                  />
                  <span className="sr-only">({link.dotLabel ?? t("listing.trashNotEmpty")})</span>
                </>
              ) : null}
            </Link>
          ))}
          {primaryAction}
        </div>
      </header>

      {tabs?.length ? (
        <FilterTabs
          tabs={tabs}
          value={tabValue}
          controls={listId}
          onValueChange={(value) => state.setFilter(tabsFilterKey, value === tabs[0]?.value ? undefined : value)}
        />
      ) : null}

      <div className="gap-2 flex flex-wrap items-center" data-slot="listing-toolbar">
        {searchable ? (
          <SearchBox
            value={state.search}
            onSearch={state.setSearch}
            placeholder={searchPlaceholder}
            thaana={searchThaana}
            className="sm:flex-none sm:w-72 flex-1"
          />
        ) : null}
        {filters.length ? <FilterPanel filters={filters} value={state.filters} onApply={state.setFilters} /> : null}
        <div className="gap-2 ms-auto flex items-center">
          {columnToggle ? (
            <ColumnVisibility
              columns={tableProps.columns}
              value={state.columnVisibility}
              onValueChange={state.setColumnVisibility}
            />
          ) : null}
          {onExport ? <ExportMenu onExport={onExport} options={exportOptions} /> : null}
          {toolbarEnd}
        </div>
      </div>

      <ActiveFilterChips
        filters={filters}
        value={state.filters}
        onRemove={state.removeFilter}
        onClearAll={state.clearFilters}
      />

      <div id={listId} className="min-w-0">
        {children ?? (
          <DataTable
            {...tableProps}
            state={state}
            filters={filters}
            emptyAction={emptyAction ?? primaryAction}
            caption={tableProps.caption ?? (typeof title === "string" ? title : undefined)}
          />
        )}
      </div>
    </section>
  )
}
