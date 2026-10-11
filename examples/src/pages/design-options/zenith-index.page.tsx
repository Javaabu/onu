import * as React from "react"
import {
  ActiveFilterChips,
  applyListingState,
  Badge,
  BulkActionBar,
  Button,
  ColumnVisibility,
  ConditionalLink,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  DataTable,
  EmptyState,
  ExportMenu,
  FilterPanel,
  FilterTabs,
  GridView,
  LinkButton,
  ListView,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SearchBox,
  Select,
  StatusBadge,
  toast,
  useListingState,
  UserAvatar,
  ViewSwitcher,
  cn,
  type BulkAction,
  type DataTableColumn,
  type FilterDefinition,
} from "@javaabu/onu"
import { useExportRows, type ExportColumn } from "@javaabu/onu/export"

import { routes } from "../_shared/routes"
import { useTr } from "../_shared/i18n"
import {
  filterFns,
  searchFields,
  showHref,
  STATUSES,
  trashApplications,
  updateApplication,
  useApplications,
  useLabels,
  useTrashedApplications,
  wait,
  type Application,
  type ApplicationStatus,
  type Labels,
} from "../admin-records/_data"
import { itemActions } from "../admin-records/_index"
import { applicationFilters, emailFilter, sortValue } from "../admin-records/_ui"
import { Glyph, ZenithShell, ZN_ROUTES, type Tr } from "./_zenith"

export const meta = {
  title: "Zenith · Index",
  group: "Design options",
  layout: "bare",
  order: 10,
  description:
    "Inspired by DashboardPack's Zenith shadcn/ui admin template: a Tasks-style data table with faceted filters.",
}

// ---------------------------------------------------------------------------
// Priority (derived from the record, so it is stable across pages)

type Priority = "low" | "medium" | "high"
const PRIORITIES: { value: Priority; en: string; dv: string; icon: string }[] = [
  { value: "low", en: "Low", dv: "ދަށް", icon: "arrow-down" },
  { value: "medium", en: "Medium", dv: "މެދު", icon: "arrow-right" },
  { value: "high", en: "High", dv: "މަތި", icon: "arrow-up" },
]
const priorityOf = (a: Application): Priority =>
  a.amount >= 2500 ? "high" : (Number(a.id) * 7) % 3 === 0 ? "low" : "medium"

/** shadcn "Tasks" status glyphs. */
const STATUS_GLYPHS: Record<ApplicationStatus, string> = {
  submitted: "circle",
  in_review: "timer",
  approved: "circle-check",
  rejected: "circle-x",
  suspended: "circle-pause",
}

function PriorityCell({ a, tr }: { a: Application; tr: Tr }) {
  const p = PRIORITIES.find((x) => x.value === priorityOf(a))!
  return (
    <span className="zn-priority gap-2 inline-flex items-center whitespace-nowrap" data-priority={p.value}>
      <Glyph id={p.icon} className="size-4 text-muted-foreground" />
      {tr(p.en, p.dv)}
    </span>
  )
}

function columns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "reference",
      header: tr("Application", "އެޕްލިކޭޝަން"),
      sortable: true,
      className: "font-mono text-xs whitespace-nowrap text-muted-foreground",
    },
    {
      id: "name",
      header: tr("Applicant", "އެޕްލިކަންޓް"),
      sortable: true,
      primary: true,
      accessor: (a) => labels.name(a),
      cell: (a) => (
        <span className="gap-2 min-w-0 flex items-center">
          <Badge variant="outline" className="zn-label">
            {labels.service(a.service)}
          </Badge>
          <span className="font-medium max-w-[16rem] truncate">{labels.name(a)}</span>
        </span>
      ),
    },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />,
    },
    {
      id: "priority",
      header: tr("Priority", "އިސްކަން"),
      cell: (a) => <PriorityCell a={a} tr={tr} />,
    },
    { id: "island", header: tr("Island", "ރަށް"), sortable: true, accessor: (a) => labels.island(a.island) },
    {
      id: "assignee",
      header: tr("Assignee", "ޙަވާލުވި"),
      cell: (a) =>
        a.assignee ? (
          <span className="gap-2 inline-flex items-center whitespace-nowrap">
            <UserAvatar name={labels.staff(a.assignee)} size="xs" />
            {labels.staff(a.assignee)}
          </span>
        ) : (
          <span className="text-muted-foreground">{tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}</span>
        ),
    },
    {
      id: "amount",
      header: tr("Amount", "އަދަދު"),
      sortable: true,
      numeric: true,
      cell: (a) => <span className="whitespace-nowrap">{labels.mvr(a.amount)}</span>,
    },
    {
      id: "submitted",
      header: tr("Submitted", "ހުށަހެޅި"),
      sortable: true,
      cell: (a) => <span className="whitespace-nowrap text-muted-foreground">{labels.date(a.submitted)}</span>,
    },
  ]
}

// ---------------------------------------------------------------------------
// Faceted filter (shadcn "Tasks": a dashed button that opens a searchable checklist with counts)

interface Facet {
  value: string
  label: string
  icon: string
  count: number
}

function FacetedFilter({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: Facet[]
  value: string[]
  onChange: (next: string[]) => void
}) {
  const tr = useTr()
  const selected = new Set(value)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="zn-facet" data-active={selected.size > 0 || undefined}>
          <Glyph id="circle-plus" className="size-4" />
          {title}
          {selected.size > 0 ? (
            <>
              <span aria-hidden className="zn-facet__sep" />
              <Badge variant="secondary" className="zn-facet__count lg:hidden">
                {selected.size}
              </Badge>
              <span className="gap-1 lg:flex hidden">
                {selected.size > 2 ? (
                  <Badge variant="secondary" className="zn-facet__count">
                    {tr(`${selected.size} selected`, `${selected.size} ހޮވިފަ`)}
                  </Badge>
                ) : (
                  options
                    .filter((o) => selected.has(o.value))
                    .map((o) => (
                      <Badge key={o.value} variant="secondary" className="zn-facet__count">
                        {o.label}
                      </Badge>
                    ))
                )}
              </span>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="zn-facet-menu w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={title} aria-label={title} />
          <CommandList>
            <CommandEmpty>{tr("No results.", "އެއްވެސް ނަތީޖާއެއް ނެތް.")}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const on = selected.has(o.value)
                return (
                  <CommandItem
                    key={o.value}
                    value={o.label}
                    data-checked={on}
                    onSelect={() => {
                      const next = new Set(selected)
                      if (on) next.delete(o.value)
                      else next.add(o.value)
                      onChange([...next])
                    }}
                  >
                    <span aria-hidden className="zn-check" data-on={on || undefined}>
                      {on ? <Glyph id="check" className="size-3" /> : null}
                    </span>
                    <Glyph id={o.icon} className="size-4 text-muted-foreground" />
                    <span>{o.label}</span>
                    {on ? <span className="sr-only">{tr("(selected)", "(ހޮވިފަ)")}</span> : null}
                    <CommandShortcut className="font-mono tabular-nums">{o.count}</CommandShortcut>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.size > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onChange([])} className="justify-center text-center">
                    {tr("Clear filters", "ފިލްޓަރުތައް ފޮހެލާ")}
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const asList = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : typeof v === "string" ? [v] : [])

// ---------------------------------------------------------------------------

export default function ZenithIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const active = useApplications()
  const trashed = useTrashedApplications()
  const state = useListingState({
    paramPrefix: "zn_",
    defaultState: { perPage: 10, sort: { id: "submitted", desc: true }, view: "table" },
    defaultColumnVisibility: { island: false },
  })
  const view = (state.view || "table") as "table" | "list" | "grid"

  const priorityFilter: FilterDefinition = {
    type: "select",
    key: "priority",
    label: tr("Priority", "އިސްކަން"),
    options: PRIORITIES.map((p) => ({ value: p.value, label: tr(p.en, p.dv) })),
  }
  const filters = [...applicationFilters(labels, tr, { trashed: false }), priorityFilter]
  const listingOptions = {
    searchFields,
    filterFns: {
      ...filterFns,
      email: emailFilter,
      priority: (a: Application, v: unknown) => asList(v).includes(priorityOf(a)),
    },
    sortValue: sortValue(labels),
    locale: labels.dv ? "dv" : "en",
  }
  const { rows, total } = applyListingState(active, state, listingOptions)

  // Facet counts follow the search and the other filters, like shadcn's faceted unique values.
  const without = (key: string) => {
    const rest = Object.fromEntries(Object.entries(state.filters).filter(([k]) => k !== key))
    return applyListingState(active, { ...state, filters: rest, page: 1, perPage: active.length || 1 }, listingOptions)
      .rows
  }
  const statusBase = without("status")
  const priorityBase = without("priority")
  const statusFacets: Facet[] = STATUSES.map((s) => ({
    value: s.value,
    label: labels.status(s.value),
    icon: STATUS_GLYPHS[s.value],
    count: statusBase.filter((a) => a.status === s.value).length,
  }))
  const priorityFacets: Facet[] = PRIORITIES.map((p) => ({
    value: p.value,
    label: tr(p.en, p.dv),
    icon: p.icon,
    count: priorityBase.filter((a) => priorityOf(a) === p.value).length,
  }))

  const statusValue = state.filters.status
  const count = (s: ApplicationStatus) => active.filter((a) => a.status === s).length
  const tabs = [
    { value: "all", label: tr("All", "ހުރިހާ"), count: active.length },
    ...(["submitted", "in_review", "approved", "rejected"] as const).map((s) => ({
      value: s,
      label: labels.status(s),
      count: count(s),
    })),
  ]
  const tabValue = typeof statusValue === "string" ? statusValue : "all"

  const exportRows = useExportRows()
  const exportColumns: ExportColumn<Application>[] = [
    { header: tr("Reference", "ރެފަރެންސް"), accessor: "reference" },
    { header: tr("Name", "ނަން"), accessor: (a) => labels.name(a) },
    { header: tr("Service", "ޚިދުމަތް"), accessor: (a) => labels.service(a.service) },
    { header: tr("Status", "ސްޓޭޓަސް"), accessor: (a) => labels.status(a.status) },
    { header: tr("Priority", "އިސްކަން"), accessor: (a) => priorityOf(a) },
    { header: tr("Fee", "ފީ"), accessor: "amount", type: "currency" },
    { header: tr("Submitted", "ހުށަހެޅި"), accessor: "submitted", type: "date" },
  ]

  const bulkActions: BulkAction<unknown>[] = [
    {
      id: "status",
      label: tr("Change status", "ސްޓޭޓަސް ބަދަލުކުރޭ"),
      icon: "edit",
      defaultValue: "in_review",
      form: ({ id, value, onChange }) => (
        <Select
          id={id}
          size="sm"
          className="w-40"
          options={labels.options.statuses}
          value={value as string}
          onValueChange={onChange}
        />
      ),
      run: async (ids, value) => {
        await wait()
        ids.forEach((id) => updateApplication(id, { status: value as ApplicationStatus }))
      },
      successMessage: (n) => tr(`${n} applications updated`, `${n} އެޕްލިކޭޝަން އަޕްޑޭޓްކުރެވިއްޖެ`),
    },
    {
      id: "delete",
      label: tr("Delete", "ފޮހެލާ"),
      icon: "trash",
      destructive: true,
      run: async (ids) => {
        await wait()
        trashApplications(ids)
      },
    },
  ]

  const tableColumns = columns(labels, tr)
  const isFiltered = state.isFiltered || !!state.search
  const newButton = (
    <LinkButton href={routes.adminRecords.create} startIcon="add">
      {tr("New application", "އައު އެޕްލިކޭޝަން")}
    </LinkButton>
  )
  const empty = isFiltered ? (
    <EmptyState
      variant="no-results"
      bordered
      noun={labels.noun}
      search={state.search || undefined}
      onClearSearch={state.search ? state.clearSearch : undefined}
      onClearFilters={state.isFiltered ? state.clearFilters : undefined}
    />
  ) : (
    <EmptyState bordered noun={labels.noun} action={newButton} />
  )
  const listId = React.useId()

  return (
    <ZenithShell
      crumbs={[
        { label: tr("Records", "ރެކޯޑުތައް"), href: ZN_ROUTES.dashboard },
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް") },
      ]}
    >
      <div className="zn-page gap-6 min-w-0 grid">
        <header className="gap-4 flex flex-wrap items-end justify-between">
          <div className="gap-1 min-w-0 grid">
            <h1 className="zn-h1">{tr("Applications", "އެޕްލިކޭޝަންތައް")}</h1>
            <p className="text-sm text-muted-foreground">
              {tr(
                "Here's every permit and licence application this season.",
                "މި މޫސުމުގައި ހުށަހެޅުނު ހުރިހާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަންތައް.",
              )}
            </p>
          </div>
          <div className="gap-2 flex flex-wrap items-center">
            <ExportMenu
              onExport={(format) =>
                exportRows({
                  format,
                  rows: applyListingState(active, { ...state, page: 1, perPage: active.length || 1 }, listingOptions)
                    .rows,
                  columns: exportColumns,
                  filename: `applications-${new Date().toISOString().slice(0, 10)}`,
                  title: tr("Applications", "އެޕްލިކޭޝަންތައް"),
                  scope: tr(`${total} applications, current filters`, `${total} އެޕްލިކޭޝަން، މިހާރުގެ ފިލްޓަރުތައް`),
                })
              }
            />
            {newButton}
          </div>
        </header>

        <section className="gap-4 min-w-0 grid" aria-label={tr("Applications table", "އެޕްލިކޭޝަން ޓޭބަލް")}>
          <FilterTabs
            className="zn-tabs"
            tabs={tabs}
            value={tabValue}
            controls={listId}
            onValueChange={(v) => state.setFilter("status", v === "all" ? undefined : v)}
          />

          <div className="zn-toolbar" data-slot="listing-toolbar">
            <div className="gap-2 min-w-0 flex flex-1 flex-wrap items-center">
              <SearchBox
                value={state.search}
                onSearch={state.setSearch}
                placeholder={tr("Filter applications…", "އެޕްލިކޭޝަން ފިލްޓަރުކުރޭ…")}
                thaana={labels.dv}
                className="zn-toolbar__search"
              />
              <FacetedFilter
                title={tr("Status", "ސްޓޭޓަސް")}
                options={statusFacets}
                value={asList(statusValue)}
                onChange={(v) => state.setFilter("status", v.length ? v : undefined)}
              />
              <FacetedFilter
                title={tr("Priority", "އިސްކަން")}
                options={priorityFacets}
                value={asList(state.filters.priority)}
                onChange={(v) => state.setFilter("priority", v.length ? v : undefined)}
              />
              <FilterPanel
                filters={filters.filter((f) => f.key !== "status" && f.key !== "priority")}
                value={state.filters}
                onApply={state.setFilters}
              />
              {isFiltered ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    state.clearFilters()
                    state.clearSearch()
                  }}
                  endIcon="close"
                >
                  {tr("Reset", "ރީސެޓް")}
                </Button>
              ) : null}
            </div>
            <div className="gap-2 flex items-center">
              <ViewSwitcher views={["table", "list", "grid"]} value={view} onValueChange={(v) => state.setView(v)} />
              {view === "table" ? (
                <ColumnVisibility
                  columns={tableColumns}
                  value={state.columnVisibility}
                  onValueChange={state.setColumnVisibility}
                  showLabel
                />
              ) : null}
            </div>
          </div>

          <ActiveFilterChips
            filters={filters}
            value={state.filters}
            onRemove={state.removeFilter}
            onClearAll={state.clearFilters}
          />

          <div id={listId} className="min-w-0">
            {view === "table" ? (
              <DataTable<Application>
                className="zn-table"
                state={state}
                columns={tableColumns}
                data={rows}
                total={total}
                perPageOptions={[10, 20, 30, 50]}
                noun={labels.noun}
                filters={filters}
                caption={tr("Applications", "އެޕްލިކޭޝަންތައް")}
                bulkActions={bulkActions}
                onBulkSuccess={(message) => toast.success(message)}
                getRowName={(a) => `${a.reference} (${labels.name(a)})`}
                getRowHref={(a) => showHref(a.id)}
                rowActions={(a) => itemActions(a, labels, tr)}
                emptyAction={newButton}
              />
            ) : (
              <CollectionView
                view={view}
                rows={rows}
                labels={labels}
                tr={tr}
                selection={state.selection}
                onSelectionChange={state.setSelection}
                bulkActions={bulkActions}
                onClearSelection={state.clearSelection}
                empty={empty}
              />
            )}
          </div>
          {view !== "table" && total > 0 ? (
            <Pagination
              page={state.page}
              perPage={state.perPage}
              total={total}
              onPageChange={state.setPage}
              onPerPageChange={state.setPerPage}
              perPageOptions={[10, 20, 30, 50]}
              noun={labels.noun}
            />
          ) : null}
        </section>
        {trashed.length ? (
          <p className="text-xs text-muted-foreground">
            {tr(`${trashed.length} applications in the trash.`, `ކުނިފޮށީގައި ${trashed.length} އެޕްލިކޭޝަން.`)}{" "}
            <ConditionalLink href={routes.adminRecords.trash} className="zn-link">
              {tr("Open trash", "ކުނިފޮށި ހުޅުވާ")}
            </ConditionalLink>
          </p>
        ) : null}
      </div>
    </ZenithShell>
  )
}

function CollectionView({
  view,
  rows,
  labels,
  tr,
  selection,
  onSelectionChange,
  bulkActions,
  onClearSelection,
  empty,
}: {
  view: "list" | "grid"
  rows: Application[]
  labels: Labels
  tr: Tr
  selection: string[]
  onSelectionChange: (ids: string[]) => void
  bulkActions: BulkAction<unknown>[]
  onClearSelection: () => void
  empty: React.ReactNode
}) {
  const shared = {
    "aria-label": tr("Applications", "އެޕްލިކޭޝަންތައް"),
    items: rows,
    getName: (a: Application) => `${a.reference} (${labels.name(a)})`,
    title: (a: Application) => labels.name(a),
    getHref: (a: Application) => showHref(a.id),
    itemActions: (a: Application) => itemActions(a, labels, tr),
    selection,
    onSelectionChange,
    empty,
  }
  return (
    <div className="gap-4 grid">
      <BulkActionBar
        selected={selection}
        actions={bulkActions}
        noun={labels.noun}
        onClearSelection={onClearSelection}
        onSuccess={(message) => toast.success(message)}
      />
      {view === "list" ? (
        <ListView
          {...shared}
          className="zn-list"
          description={(a) => (
            <span className="gap-x-2 flex flex-wrap">
              <span className="text-xs font-mono">{a.reference}</span>
              <span>{labels.service(a.service)}</span>
            </span>
          )}
          media={(a) => <UserAvatar name={labels.name(a)} />}
          meta={(a) => (
            <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
              <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
              <PriorityCell a={a} tr={tr} />
              <span className="tabular-nums">{labels.mvr(a.amount)}</span>
            </span>
          )}
        />
      ) : (
        <GridView
          {...shared}
          className="zn-grid"
          minItemWidth="15rem"
          description={(a) => <span className="text-xs font-mono">{a.reference}</span>}
          media={(a) => (
            <div className={cn("zn-grid-media gap-3 flex size-full items-center justify-center")}>
              <UserAvatar name={labels.name(a)} size="lg" />
            </div>
          )}
          meta={(a) => (
            <span className="gap-1 text-sm grid w-full">
              <span className="gap-2 flex flex-wrap items-center justify-between">
                <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                <span className="tabular-nums">{labels.mvr(a.amount)}</span>
              </span>
              <span className="text-muted-foreground">{labels.service(a.service)}</span>
            </span>
          )}
        />
      )}
    </div>
  )
}
