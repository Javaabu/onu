import * as React from "react"
import {
  applyListingState,
  BulkActionBar,
  EmptyState,
  GridView,
  Icon,
  LinkButton,
  ListingPage,
  ListView,
  Select,
  StatusBadge,
  toast,
  useListingState,
  UserAvatar,
  ViewSwitcher,
  type BulkAction,
  type DataTableColumn,
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
import { LagoonShell } from "./_lagoon"
import "./lagoon.css"

export const meta = {
  title: "Lagoon · Index",
  group: "Design options",
  layout: "bare",
  order: 30,
  description:
    "Applications records index in the Lagoon style: calm sand surfaces, a rounded table card and turquoise selection.",
}

const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "credit-card",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "file-text",
}

function columns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      sortable: true,
      primary: true,
      cell: (a) => <span className="lg-ref">{a.reference}</span>,
    },
    {
      id: "name",
      header: tr("Applicant", "އެޕްލިކަންޓް"),
      sortable: true,
      accessor: (a) => labels.name(a),
      cell: (a) => (
        <span className="gap-3 flex items-center">
          <UserAvatar name={labels.name(a)} size="sm" decorative />
          <span className="min-w-0">
            <span className="font-medium block truncate">{labels.name(a)}</span>
            <span className="text-xs block font-mono text-muted-foreground">{a.idCard}</span>
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
          <span aria-hidden className="lg-bubble size-7 rounded-lg">
            <Icon name={SERVICE_ICONS[a.service] ?? "file"} className="size-3.5" />
          </span>
          {labels.service(a.service)}
        </span>
      ),
    },
    { id: "island", header: tr("Island", "ރަށް"), sortable: true, accessor: (a) => labels.island(a.island) },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />,
    },
    {
      id: "amount",
      header: tr("Fee", "ފީ"),
      sortable: true,
      numeric: true,
      cell: (a) => <span className="whitespace-nowrap tabular-nums">{labels.mvr(a.amount)}</span>,
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
      cell: (a) =>
        a.assignee ? (
          <span className="gap-2 inline-flex items-center whitespace-nowrap">
            <UserAvatar name={labels.staff(a.assignee)} size="xs" decorative />
            {labels.staff(a.assignee)}
          </span>
        ) : (
          <span className="text-muted-foreground">{tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}</span>
        ),
    },
  ]
}

/** Gentle water lines in the corner of the records card. Decorative. */
function WaterLines() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 360 90"
      fill="none"
      strokeLinecap="round"
      className="lg-water-lines -top-9 end-0 pointer-events-none absolute w-[22rem] max-w-[60%]"
    >
      <path d="M10 30c25-12 50-12 75 0s50 12 75 0 50-12 75 0 50 12 75 0 50-12 40-6" strokeWidth="2" />
      <path d="M60 52c20-9 40-9 60 0s40 9 60 0 40-9 60 0 40 9 60 0 30-9 50-4" strokeWidth="1.6" strokeOpacity=".6" />
      <path d="M120 72c15-6 30-6 45 0s30 6 45 0 30-6 45 0 30 6 45 0 20-4 40-2" strokeWidth="1.3" strokeOpacity=".35" />
    </svg>
  )
}

export default function LagoonIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<ListingView>("table")
  const state = useListingState({
    paramPrefix: "lagoon_",
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
  const filters = applicationFilters(labels, tr)
  const fees = active.filter((a) => a.status === "approved").reduce((n, a) => n + a.amount, 0)

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

  const newButton = (
    <LinkButton href={routes.adminRecords.create} startIcon="add" size="lg" className="lg-pill h-10">
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

  const shared = {
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

  return (
    <LagoonShell>
      <div className="lg-records gap-6 grid">
        <h2 className="sr-only">{tr("Summary", "ޚުލާޞާ")}</h2>
        <StatTiles className="grid-cols-2">
          <StatTile
            size="sm"
            className="lg-tile"
            label={tr("Open applications", "ހުޅުވިފައިވާ")}
            value={count("submitted") + count("in_review")}
            icon="file-text"
          />
          <StatTile
            size="sm"
            className="lg-tile"
            label={tr("Waiting for review", "ރިވިއުއަށް")}
            value={count("in_review")}
            icon="clock"
          />
          <StatTile
            size="sm"
            className="lg-tile"
            label={tr("Approved", "ފާސްކުރެވިފަ")}
            value={count("approved")}
            icon="success"
          />
          <StatTile
            size="sm"
            className="lg-tile"
            label={tr("Fees from approvals", "ފާސްވި އެޕްލިކޭޝަނުގެ ފީ")}
            value={fees}
            valueFormat="currency"
            icon="credit-card"
          />
        </StatTiles>

        <div className="lg-card lg-records-card p-4 sm:p-6 relative overflow-hidden">
          <WaterLines />
          <ListingPage<Application>
            className="relative"
            title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
            description={tr(
              "Permit and licence applications from every island, newest first.",
              "ހުރިހާ ރަށްރަށުން ހުށަހަޅާފައިވާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަންތައް.",
            )}
            state={state}
            columns={columns(labels, tr)}
            data={rows}
            total={total}
            perPageOptions={view === "grid" ? [12, 24, 48] : [10, 25, 50]}
            noun={labels.noun}
            filters={filters}
            searchPlaceholder={tr("Reference, name, ID card…", "ރެފަރެންސް، ނަން، އައިޑީ ކާޑު…")}
            searchThaana={labels.dv}
            trash={trashed === "only"}
            primaryAction={newButton}
            links={[{ label: tr("Board", "ބޯޑް"), href: routes.adminRecords.indexKanban, icon: "kanban" }]}
            trashHref={routes.adminRecords.trash}
            trashHasItems={all.length > active.length}
            tabs={[
              { value: "all", label: tr("All", "ހުރިހާ"), count: active.length },
              { value: "submitted", label: labels.status("submitted"), count: count("submitted") },
              { value: "in_review", label: labels.status("in_review"), count: count("in_review") },
              { value: "approved", label: labels.status("approved"), count: count("approved") },
              { value: "rejected", label: labels.status("rejected"), count: count("rejected") },
            ]}
            columnToggle={view === "table"}
            onExport={(format) =>
              exportRows({
                format,
                rows: applyListingState(source, { ...state, page: 1, perPage: Infinity }, listingOptions).rows,
                columns: exportColumns,
                filename: "applications-2026-10-08",
                title: tr("Applications", "އެޕްލިކޭޝަންތައް"),
                scope: tr(`${total} applications, current filters`, `${total} އެޕްލިކޭޝަން، މިހާރުގެ ފިލްޓަރުތައް`),
              })
            }
            bulkActions={bulkActions as BulkAction<unknown>[]}
            onBulkSuccess={(message) => toast.success(message)}
            getRowName={(a) => `${a.reference} (${labels.name(a)})`}
            getRowHref={(a) => showHref(a.id)}
            rowActions={(a) => itemActions(a, labels, tr)}
            empty={empty}
            toolbarEnd={<ViewSwitcher views={["table", "list", "grid"]} value={view} onValueChange={setView} />}
          >
            {view === "table" ? undefined : (
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
                    {...shared}
                    variant="cards"
                    description={(a) => (
                      <span className="gap-x-2 flex flex-wrap">
                        <span className="text-xs font-mono">{a.reference}</span>
                        <span>{labels.service(a.service)}</span>
                      </span>
                    )}
                    media={(a) => <UserAvatar name={labels.name(a)} decorative />}
                    meta={(a) => (
                      <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
                        <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                        <span className="text-muted-foreground">{labels.island(a.island)}</span>
                        <span className="tabular-nums">{labels.mvr(a.amount)}</span>
                      </span>
                    )}
                  />
                ) : (
                  <GridView
                    {...shared}
                    minItemWidth="15rem"
                    description={(a) => <span className="text-xs font-mono">{a.reference}</span>}
                    media={(a) => (
                      <div className="lg-grid-media gap-2 flex size-full flex-col items-center justify-center">
                        <Icon name={SERVICE_ICONS[a.service] ?? "file"} className="size-8" />
                        <span className="text-xs">{labels.service(a.service)}</span>
                      </div>
                    )}
                    meta={(a) => (
                      <span className="gap-1 text-sm grid w-full">
                        <span className="gap-2 flex flex-wrap items-center justify-between">
                          <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                          <span className="tabular-nums">{labels.mvr(a.amount)}</span>
                        </span>
                        <span className="text-muted-foreground">{labels.island(a.island)}</span>
                      </span>
                    )}
                  />
                )}
              </div>
            )}
          </ListingPage>
        </div>
      </div>
    </LagoonShell>
  )
}
