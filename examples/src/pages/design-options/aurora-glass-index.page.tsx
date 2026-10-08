import * as React from "react"
import {
  ActiveFilterChips,
  applyListingState,
  BulkActionBar,
  ColumnVisibility,
  DataTable,
  EmptyState,
  ExportMenu,
  FilterPanel,
  FilterTabs,
  GridView,
  Icon,
  LinkButton,
  ListView,
  Pagination,
  SearchBox,
  Select,
  StatusBadge,
  toast,
  useListingState,
  UserAvatar,
  ViewSwitcher,
  type BulkAction,
  type DataTableColumn,
  type ExportFormat,
  type ListingView,
} from "@javaabu/onu"
import { StatTile, StatTiles } from "@javaabu/onu/charts"
import { useExportRows, type ExportColumn } from "@javaabu/onu/export"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import {
  filterFns,
  searchFields,
  showHref,
  TODAY,
  trashApplications,
  updateApplication,
  useAllApplications,
  useLabels,
  wait,
  type Application,
  type ApplicationStatus,
  type Labels,
} from "../admin-records/_data"
import { itemActions } from "../admin-records/_index"
import { applicationFilters, emailFilter, sortValue, type Tr } from "../admin-records/_ui"
import { AG_ROUTES, AuroraRoot, AuroraShell } from "./_aurora-glass"

export const meta = {
  title: "Aurora Glass · Index",
  group: "Design options",
  layout: "bare",
  order: 20,
  description: "Applications records index in frosted glass: luminous header row, glowing selection, live KPI strip.",
}

const DAY = 86_400_000
const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "bank",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

function columns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      sortable: true,
      primary: true,
      className: "ag-ref font-mono text-xs whitespace-nowrap",
    },
    {
      id: "name",
      header: tr("Applicant", "އެޕްލިކަންޓް"),
      sortable: true,
      accessor: (a) => labels.name(a),
      cell: (a) => (
        <span className="gap-2.5 inline-flex items-center whitespace-nowrap">
          <UserAvatar name={labels.name(a)} size="sm" className="ag-avatar-ring" />
          <span className="gap-0.5 grid">
            <span className="font-medium">{labels.name(a)}</span>
            <span className="text-xs text-muted-foreground" dir="ltr">
              {a.idCard}
            </span>
          </span>
        </span>
      ),
    },
    {
      id: "service",
      header: tr("Service", "ޚިދުމަތް"),
      sortable: true,
      accessor: (a) => labels.service(a.service),
      cell: (a) => (
        <span className="gap-2 inline-flex items-center whitespace-nowrap">
          <Icon name={SERVICE_ICONS[a.service] ?? "file-text"} className="size-4 text-primary" />
          {labels.service(a.service)}
        </span>
      ),
    },
    { id: "island", header: tr("Island", "ރަށް"), sortable: true, accessor: (a) => labels.island(a.island) },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      accessor: (a) => labels.status(a.status),
      cell: (a) => <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />,
    },
    {
      id: "amount",
      header: tr("Fee", "ފީ"),
      sortable: true,
      numeric: true,
      cell: (a) => <span className="whitespace-nowrap">{labels.mvr(a.amount)}</span>,
    },
    {
      id: "submitted",
      header: tr("Submitted", "ހުށަހެޅި"),
      sortable: true,
      cell: (a) => <span className="whitespace-nowrap">{labels.date(a.submitted)}</span>,
    },
    {
      id: "assignee",
      header: tr("Assignee", "ޙަވާލުވި"),
      accessor: (a) => (a.assignee ? labels.staff(a.assignee) : ""),
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
  ]
}

export default function AuroraGlassIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const listId = React.useId()
  const [view, setView] = React.useState<ListingView>("table")
  const state = useListingState({
    paramPrefix: "ag_",
    defaultState: { perPage: 10, sort: { id: "submitted", desc: true } },
    defaultColumnVisibility: { island: false },
  })

  const trashed = state.filters.trashed
  const source = all.filter((a) => (trashed === "only" ? a.deletedAt : trashed === "with" ? true : !a.deletedAt))
  const listingOptions = {
    searchFields,
    filterFns: { ...filterFns, email: emailFilter },
    sortValue: sortValue(labels),
    locale: labels.dv ? "dv" : "en",
  }
  const { rows, total } = applyListingState(source, state, listingOptions)
  const active = all.filter((a) => !a.deletedAt)
  const count = (s: ApplicationStatus) => active.filter((a) => a.status === s).length
  const trashCount = all.length - active.length
  const filters = applicationFilters(labels, tr)
  const cols = columns(labels, tr)

  // KPI strip: the last 30 days against the 30 before.
  const today = Date.parse(`${TODAY}T00:00:00Z`)
  const within = (a: Application, from: number, to = 0) => {
    const t = Date.parse(`${a.submitted}T00:00:00Z`)
    return t > today - from * DAY && t <= today - to * DAY
  }
  const last30 = active.filter((a) => within(a, 30))
  const prev30 = active.filter((a) => within(a, 60, 30))
  const open = count("submitted") + count("in_review")
  const fees = (list: Application[]) => list.reduce((s, a) => s + a.amount, 0)
  const approval = (list: Application[]) =>
    list.length ? list.filter((a) => a.status === "approved").length / list.length : 0
  const weekly = Array.from({ length: 12 }, (_, i) => {
    const end = today - (11 - i) * 7 * DAY
    return active.filter((a) => {
      const t = Date.parse(`${a.submitted}T00:00:00Z`)
      return t > end - 7 * DAY && t <= end
    }).length
  })

  const exportRows = useExportRows()
  const exportColumns: ExportColumn<Application>[] = [
    { header: tr("Reference", "ރެފަރެންސް"), accessor: "reference" },
    { header: tr("Name", "ނަން"), accessor: (a) => labels.name(a) },
    { header: tr("ID card", "އައިޑީ ކާޑު"), accessor: "idCard" },
    { header: tr("Island", "ރަށް"), accessor: (a) => labels.island(a.island) },
    { header: tr("Service", "ޚިދުމަތް"), accessor: (a) => labels.service(a.service) },
    { header: tr("Status", "ސްޓޭޓަސް"), accessor: (a) => labels.status(a.status) },
    { header: tr("Fee", "ފީ"), accessor: "amount", type: "currency" },
    { header: tr("Submitted", "ހުށަހެޅި"), accessor: "submitted", type: "date" },
  ]
  const onExport = (format: ExportFormat) =>
    exportRows({
      format,
      rows: applyListingState(source, { ...state, page: 1, perPage: Infinity }, listingOptions).rows,
      columns: exportColumns,
      filename: `applications-${TODAY}`,
      title: tr("Applications", "އެޕްލިކޭޝަންތައް"),
      scope: tr(`${total} applications, current filters`, `${total} އެޕްލިކޭޝަން، މިހާރުގެ ފިލްޓަރުތައް`),
    })

  const bulkActions: BulkAction<string>[] = [
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
          value={value}
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
      id: "assign",
      label: tr("Assign", "ޙަވާލުކުރޭ"),
      icon: "user",
      defaultValue: "shifa",
      form: ({ id, value, onChange }) => (
        <Select
          id={id}
          size="sm"
          className="w-44"
          options={labels.options.staff}
          value={value}
          onValueChange={onChange}
        />
      ),
      run: async (ids, value) => {
        await wait()
        ids.forEach((id) => updateApplication(id, { assignee: value }))
      },
      successMessage: (n) => tr(`${n} applications assigned`, `${n} އެޕްލިކޭޝަން ޙަވާލުކުރެވިއްޖެ`),
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

  const tabs = [
    { value: "all", label: tr("All", "ހުރިހާ"), count: active.length },
    { value: "submitted", label: labels.status("submitted"), count: count("submitted") },
    { value: "in_review", label: labels.status("in_review"), count: count("in_review") },
    { value: "approved", label: labels.status("approved"), count: count("approved") },
    { value: "rejected", label: labels.status("rejected"), count: count("rejected") },
  ]
  const tabValue = typeof state.filters.status === "string" ? state.filters.status : "all"

  const newButton = (
    <LinkButton href={routes.adminRecords.create} startIcon="add" className="ag-glow">
      {tr("New application", "އައު އެޕްލިކޭޝަން")}
    </LinkButton>
  )

  const empty =
    state.search || state.isFiltered ? (
      <EmptyState
        variant="no-results"
        bordered
        noun={labels.noun}
        search={state.search || undefined}
        filters={filters.filter((f) => state.filters[f.key] !== undefined).map((f) => f.label)}
        onClearSearch={state.search ? state.clearSearch : undefined}
        onClearFilters={state.isFiltered ? state.clearFilters : undefined}
      />
    ) : (
      <EmptyState bordered noun={labels.noun} action={newButton} />
    )

  const sortOptions = [
    { value: "submitted:desc", label: tr("Newest first", "އެންމެ އައު ފުރަތަމަ") },
    { value: "submitted:asc", label: tr("Oldest first", "އެންމެ ކުރީގެ ފުރަތަމަ") },
    { value: "amount:desc", label: tr("Highest fee", "އެންމެ ބޮޑު ފީ") },
    { value: "name:asc", label: tr("Applicant A–Z", "އެޕްލިކަންޓް (ހ-ޗ)") },
  ]
  const sortKey = state.sort ? `${state.sort.id}:${state.sort.desc ? "desc" : "asc"}` : "submitted:desc"

  const collection = {
    "aria-label": tr("Applications", "އެޕްލިކޭޝަންތައް"),
    items: rows,
    getName: (a: Application) => `${a.reference} (${labels.name(a)})`,
    title: (a: Application) => labels.name(a),
    getHref: (a: Application) => showHref(a.id),
    itemActions: (a: Application) => itemActions(a, labels, tr),
    selection: state.selection,
    onSelectionChange: state.setSelection,
    empty,
  }
  const itemMeta = (a: Application) => (
    <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
      <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
      <span className="tabular-nums">{labels.mvr(a.amount)}</span>
      <span className="text-muted-foreground">{labels.date(a.submitted)}</span>
    </span>
  )

  return (
    <AuroraRoot>
      <AuroraShell current={AG_ROUTES.index}>
        <section aria-labelledby="ag-records-title" className="ag-records gap-6 min-w-0 grid">
          {/* Header */}
          <header className="gap-4 lg:flex-row lg:items-end flex flex-col justify-between">
            <div className="min-w-0">
              <p className="ag-chip gap-2 px-3 py-1 text-xs font-medium inline-flex items-center rounded-full">
                <span className="ag-pulse ag-pulse--primary" aria-hidden />
                {tr("Records · synced 2 minutes ago", "ރެކޯޑު · 2 މިނެޓް ކުރިން ސިންކުވި")}
              </p>
              <h1 id="ag-records-title" className="ag-display mt-4 text-[clamp(2rem,1.5rem+2vw,3rem)]">
                <span className="ag-ink">{tr("Applications", "އެޕްލިކޭޝަންތައް")}</span>
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                {tr(
                  "Permit and licence applications from every island, in one queue.",
                  "ހުރިހާ ރަށްރަށުން ހުށަހަޅާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަން، އެއް ކިއުއެއްގައި.",
                )}
              </p>
            </div>
            <div className="gap-2 flex flex-wrap items-center">
              <LinkButton href={routes.adminRecords.import} variant="outline" startIcon="upload" className="ag-ghost">
                {tr("Import", "އިމްޕޯޓް")}
              </LinkButton>
              <LinkButton
                href={routes.adminRecords.trash}
                variant="outline"
                startIcon="trash"
                className="ag-ghost relative"
              >
                {tr("Trash", "ކުނިފޮށި")}
                {trashCount > 0 ? (
                  <span className="ag-chip ms-1 px-1.5 text-xs rounded-md tabular-nums">{trashCount}</span>
                ) : null}
              </LinkButton>
              {newButton}
            </div>
          </header>

          {/* KPI strip */}
          <StatTiles>
            <StatTile
              className="ag-glass ag-spot"
              label={tr("Open applications", "ހުޅުވިފައިވާ")}
              value={open}
              icon="file-text"
              sparkline={weekly}
            />
            <StatTile
              className="ag-glass ag-spot"
              label={tr("New, last 30 days", "އައު، ފަހުގެ 30 ދުވަސް")}
              value={last30.length}
              previousValue={prev30.length}
              icon="add"
              deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
            />
            <StatTile
              className="ag-glass ag-spot"
              label={tr("Approval rate", "ފާސްކުރެވޭ މިންވަރު")}
              value={approval(last30)}
              delta={approval(last30) - approval(prev30)}
              valueFormat="percent"
              icon="success"
              deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
            />
            <StatTile
              className="ag-glass ag-spot"
              label={tr("Fees, last 30 days", "ފީ، ފަހުގެ 30 ދުވަސް")}
              value={fees(last30)}
              previousValue={fees(prev30)}
              valueFormat="currency"
              icon="credit-card"
              deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
            />
          </StatTiles>

          {/* The listing, on one glass surface */}
          <div className="ag-glass ag-surface gap-4 p-3 sm:p-5 min-w-0 grid rounded-2xl">
            <FilterTabs
              tabs={tabs}
              value={tabValue}
              controls={listId}
              onValueChange={(value) => state.setFilter("status", value === "all" ? undefined : value)}
              classNames={{ list: "ag-tabs" }}
            />

            <div className="gap-2 flex flex-wrap items-center" data-slot="listing-toolbar">
              <SearchBox
                value={state.search}
                onSearch={state.setSearch}
                placeholder={tr("Reference, name, ID card…", "ރެފަރެންސް، ނަން، އައިޑީ ކާޑު…")}
                thaana={labels.dv}
                className="sm:flex-none sm:w-80 flex-1"
                classNames={{ root: "ag-field rounded-xl" }}
              />
              <FilterPanel filters={filters} value={state.filters} onApply={state.setFilters} />
              <div className="gap-2 sm:flex-nowrap ms-auto flex flex-wrap items-center justify-end">
                {view === "table" ? (
                  <ColumnVisibility
                    columns={cols}
                    value={state.columnVisibility}
                    onValueChange={state.setColumnVisibility}
                  />
                ) : (
                  <Select
                    aria-label={tr("Sort by", "ތަރުތީބުކުރާނީ")}
                    className="w-44"
                    options={sortOptions}
                    value={sortKey}
                    onValueChange={(v) => {
                      const [id, dir] = v.split(":")
                      state.setSort({ id: id!, desc: dir === "desc" })
                    }}
                  />
                )}
                <ExportMenu onExport={onExport} />
                <ViewSwitcher
                  views={["table", "list", "grid"]}
                  value={view}
                  onValueChange={setView}
                  className="ag-chip rounded-lg"
                />
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
                  className="ag-table"
                  caption={tr("Applications", "އެޕްލިކޭޝަންތައް")}
                  state={state}
                  columns={cols}
                  data={rows}
                  total={total}
                  perPageOptions={[10, 25, 50]}
                  noun={labels.noun}
                  filters={filters}
                  trash={trashed === "only"}
                  emptyAction={newButton}
                  bulkActions={bulkActions as BulkAction<unknown>[]}
                  onBulkSuccess={(message) => toast.success(message)}
                  getRowName={(a) => `${a.reference} (${labels.name(a)})`}
                  getRowHref={(a) => showHref(a.id)}
                  rowActions={(a) => itemActions(a, labels, tr)}
                />
              ) : (
                <div className="gap-4 grid">
                  <BulkActionBar
                    selected={state.selection}
                    actions={bulkActions as BulkAction<unknown>[]}
                    noun={labels.noun}
                    onClearSelection={state.clearSelection}
                    onSuccess={(message) => toast.success(message)}
                  />
                  {view === "list" ? (
                    <ListView
                      {...collection}
                      variant="cards"
                      classNames={{ item: "ag-glass ag-spot" }}
                      description={(a) => (
                        <span className="gap-x-2 flex flex-wrap">
                          <span className="text-xs font-mono">{a.reference}</span>
                          <span>{labels.service(a.service)}</span>
                        </span>
                      )}
                      media={(a) => <UserAvatar name={labels.name(a)} />}
                      meta={itemMeta}
                    />
                  ) : (
                    <GridView
                      {...collection}
                      minItemWidth="15rem"
                      classNames={{ item: "ag-glass ag-spot" }}
                      description={(a) => <span className="text-xs font-mono">{a.reference}</span>}
                      media={(a) => (
                        <div className="ag-tile-media gap-2 flex size-full flex-col items-center justify-center">
                          <Icon name={SERVICE_ICONS[a.service] ?? "file-text"} className="size-8 text-primary" />
                          <span className="text-xs text-muted-foreground">{labels.service(a.service)}</span>
                        </div>
                      )}
                      meta={itemMeta}
                    />
                  )}
                  <Pagination
                    page={state.page}
                    perPage={state.perPage}
                    total={total}
                    onPageChange={state.setPage}
                    onPerPageChange={state.setPerPage}
                    perPageOptions={[10, 25, 50]}
                    noun={labels.noun}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </AuroraShell>
    </AuroraRoot>
  )
}
