"use client"

import * as React from "react"
import type { RowData } from "@tanstack/react-table"

import { Icon } from "../../icons/icon"
import { cn } from "../../lib/utils"
import { useLinkComponent, useTranslation } from "../../providers/onu-provider"
import { buttonVariants } from "../../ui/button"
import type { ThaanaProp } from "../../thaana/use-thaana-field"
import { useAppLayout } from "../layout/app-layout"
import type { BreadcrumbsItem } from "../layout/breadcrumbs"
import { Card } from "../layout/card"
import { PageTitle, type PageTitleFigure } from "../layout/page-title"
import { ActiveFilterChips } from "./active-filter-chips"
import { ColumnVisibility } from "./column-visibility"
import { DataTable, type DataTableProps } from "./data-table"
import { ExportMenu, type ExportFormat, type ExportOption } from "./export-menu"
import { FilterPanel } from "./filter-panel"
import { FilterTabs, type FilterTab } from "./filter-tabs"
import type { FilterDefinition } from "./listing-types"
import { Pagination } from "./pagination"
import { SearchBox } from "./search-box"
import { SortMenu } from "./_sort-menu"
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
  /**
   * `card` (Ant ProTable, the default inside a panel `AppLayout`): a page
   * header band (title, actions, tabs with an ink bar), an optional inline
   * query form, and the list in a card with a title and tools row.
   * `default` (elsewhere): the header, toolbar and table stacked on the page.
   */
  variant?: "default" | "card"
  /** Card variant: the title at the start of the card's toolbar, e.g. "Application list". */
  tableTitle?: React.ReactNode
  /**
   * Filters shown as an inline query form above the card (labelled fields,
   * Reset, Filter, Expand). The Filters button keeps the rest of `filters`.
   * Pass definitions from `filters` so the chips can name them.
   */
  queryFilters?: FilterDefinition[]
  /** A custom query form above the card (instead of `queryFilters`). */
  queryForm?: React.ReactNode
  /** Breadcrumbs for the header band (defaults to the `AppLayout`'s). */
  breadcrumbs?: BreadcrumbsItem[]
  /** Tags after the title, e.g. `<Tag>12 open</Tag>`. */
  tags?: React.ReactNode
  /** Key figures in the header band. */
  figures?: PageTitleFigure[]
  /**
   * Replace the table (e.g. a `ListView` or `GridView` for other views). The
   * page keeps the "Sort by" menu (from the sortable `columns`) and the
   * pagination footer (from `total` / `pagination`) around it.
   */
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
  variant: variantProp,
  tableTitle,
  queryFilters,
  queryForm,
  breadcrumbs,
  tags,
  figures,
  children,
  className,
  emptyAction,
  ...tableProps
}: ListingPageProps<T>) {
  const { t } = useTranslation()
  const Link = useLinkComponent()
  const layout = useAppLayout()
  const variant = variantProp ?? (layout?.variant === "panel" ? "card" : "default")
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
  // With a custom view (children) there are no sortable headers or table footer, so the page adds them.
  const customView = children !== undefined && children !== null && children !== false
  const sortColumns = customView ? tableProps.columns.filter((c) => c.sortable) : []
  const showPagination =
    customView &&
    (tableProps.pagination ?? tableProps.total !== undefined) &&
    !(!tableProps.loading && tableProps.data.length === 0 && !state.isFiltered && state.page === 1)

  const tabValue =
    typeof state.filters[tabsFilterKey] === "string"
      ? (state.filters[tabsFilterKey] as string)
      : (tabs?.[0]?.value ?? "")

  const linkNodes = (look: "ghost" | "outline") =>
    allLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className={cn(buttonVariants({ variant: look }), "touch:min-h-11 relative")}
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
    ))

  const filterTabs = tabs?.length ? (
    <FilterTabs
      tabs={tabs}
      value={tabValue}
      controls={listId}
      onValueChange={(value) => state.setFilter(tabsFilterKey, value === tabs[0]?.value ? undefined : value)}
    />
  ) : null

  const sortMenu = sortColumns.length ? (
    <SortMenu columns={sortColumns} sort={state.sort} onSortChange={state.setSort} />
  ) : null
  const columnMenu = columnToggle ? (
    <ColumnVisibility
      columns={tableProps.columns}
      value={state.columnVisibility}
      onValueChange={state.setColumnVisibility}
    />
  ) : null
  const exportMenu = onExport ? <ExportMenu onExport={onExport} options={exportOptions} /> : null

  const list = customView ? (
    children
  ) : (
    <DataTable
      {...tableProps}
      state={state}
      filters={filters}
      emptyAction={emptyAction ?? primaryAction}
      caption={tableProps.caption ?? (typeof title === "string" ? title : undefined)}
    />
  )
  const pagination = showPagination ? (
    <Pagination
      page={state.page}
      perPage={state.perPage}
      total={tableProps.total}
      hasNextPage={tableProps.total === undefined ? tableProps.data.length >= state.perPage : undefined}
      onPageChange={state.setPage}
      onPerPageChange={state.setPerPage}
      perPageOptions={tableProps.perPageOptions}
      noun={tableProps.noun}
      className={tableProps.classNames?.footer}
    />
  ) : null

  if (variant === "card") {
    const queryKeys = new Set((queryFilters ?? []).map((f) => f.key))
    const panelFilters = filters.filter((f) => !queryKeys.has(f.key))
    const chipFilters = [...filters, ...(queryFilters ?? []).filter((f) => !filters.some((x) => x.key === f.key))]
    const search = searchable ? (
      <SearchBox
        value={state.search}
        onSearch={state.setSearch}
        placeholder={searchPlaceholder}
        thaana={searchThaana}
        className="sm:w-64 sm:flex-none flex-1"
      />
    ) : null
    const tools = [
      panelFilters.length ? (
        <FilterPanel key="filters" filters={panelFilters} value={state.filters} onApply={state.setFilters} />
      ) : null,
      columnMenu ? <React.Fragment key="columns">{columnMenu}</React.Fragment> : null,
      sortMenu ? <React.Fragment key="sort">{sortMenu}</React.Fragment> : null,
      exportMenu ? <React.Fragment key="export">{exportMenu}</React.Fragment> : null,
    ].filter(Boolean)

    return (
      <section
        aria-labelledby={headingId}
        data-slot="listing-page"
        data-variant="card"
        className={cn("gap-4 min-w-0 @container grid", className)}
      >
        <PageTitle
          variant="band"
          title={<span id={headingId}>{title}</span>}
          description={description}
          breadcrumbs={breadcrumbs}
          tags={tags}
          figures={figures}
          actions={allLinks.length ? linkNodes("outline") : undefined}
          action={primaryAction}
          tabs={filterTabs}
        />

        {queryForm ??
          (queryFilters?.length ? (
            <Card padded={false} data-slot="listing-query">
              <FilterPanel
                variant="form"
                filters={queryFilters}
                value={state.filters}
                onApply={state.setFilters}
                className="p-4 sm:p-6"
              />
            </Card>
          ) : null)}

        <Card padded={false} data-slot="listing-card" className="gap-0 py-0">
          <div
            data-slot="listing-toolbar"
            className="gap-x-4 gap-y-3 px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between"
          >
            <div className="gap-3 min-w-0 flex flex-1 flex-wrap items-center">
              {tableTitle ? (
                <h2 data-slot="listing-card-title" className="text-base font-semibold m-0 text-foreground">
                  {tableTitle}
                </h2>
              ) : null}
              {search}
            </div>
            <div className="gap-2 flex flex-wrap items-center">
              {tools}
              {tools.length && toolbarEnd ? (
                <span aria-hidden="true" className="h-4 mx-1 w-px bg-border" data-slot="listing-toolbar-divider" />
              ) : null}
              {toolbarEnd}
            </div>
          </div>

          <ActiveFilterChips
            filters={chipFilters}
            value={state.filters}
            onRemove={state.removeFilter}
            onClearAll={state.clearFilters}
            classNames={{ list: "px-4 pb-3 sm:px-6" }}
          />

          <div
            id={listId}
            data-slot="listing-card-body"
            className={cn(
              "min-w-0 px-4 pb-4 sm:px-6 gap-4 @container grid",
              // The table sits flush in the card: no frame of its own, the grey header carries the top corners.
              "[&_[data-slot=data-table]>div:has([data-slot=data-table-table])]:rounded-b-none [&_[data-slot=data-table]>div:has([data-slot=data-table-table])]:border-0",
            )}
          >
            {list}
            {pagination}
          </div>
        </Card>
      </section>
    )
  }

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
          {linkNodes("ghost")}
          {primaryAction}
        </div>
      </header>

      {filterTabs}

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
          {columnMenu}
          {sortMenu}
          {exportMenu}
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
        {list}
      </div>
      {pagination}
    </section>
  )
}
