import * as React from "react"
import {
  applyListingState,
  Breadcrumbs,
  BulkActionBar,
  EmptyState,
  GridView,
  Icon,
  LinkButton,
  ListingPage,
  ListView,
  Select,
  toast,
  useListingState,
  ViewSwitcher,
  type BulkAction,
  type DataTableColumn,
  type ListingView,
} from "@javaabu/onu"
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
import { KUMO_PARAM, KUMO_ROUTES, KumoAvatar, KumoBadge, KumoShell, MonoId, STATUS_TONE } from "./_kumo"

export const meta = {
  title: "Kumo · Index",
  group: "Design options",
  layout: "bare",
  order: 70,
  description:
    "Inspired by Kumo UI, Cloudflare's design system: a dense, neutral resource table with monospace IDs, tinted dot badges and analytics-style status tabs.",
}

const SERVICE_ICON: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

/** A 28px neutral tile with the service glyph (Cloudflare's product icons in resource lists). */
function ServiceTile({ service, className }: { service: string; className?: string }) {
  return (
    <span aria-hidden className={`kumo-tile ${className ?? ""}`}>
      <Icon name={SERVICE_ICON[service] ?? "file"} />
    </span>
  )
}

function columns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "name",
      header: tr("Applicant", "އެޕްލިކަންޓް"),
      sortable: true,
      primary: true,
      accessor: (a) => labels.name(a),
      className: "kumo-name-cell",
    },
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      sortable: true,
      cell: (a) => (
        <MonoId value={a.reference} label={tr(`reference ${a.reference}`, `ރެފަރެންސް ${a.reference}`)} tr={tr} />
      ),
    },
    {
      id: "service",
      header: tr("Service", "ޚިދުމަތް"),
      sortable: true,
      cell: (a) => (
        <span className="gap-2 inline-flex items-center whitespace-nowrap">
          <ServiceTile service={a.service} />
          {labels.service(a.service)}
        </span>
      ),
    },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <KumoBadge tone={STATUS_TONE[a.status]}>{labels.status(a.status)}</KumoBadge>,
    },
    { id: "island", header: tr("Island", "ރަށް"), sortable: true, accessor: (a) => labels.island(a.island) },
    {
      id: "assignee",
      header: tr("Assignee", "ޙަވާލުވި"),
      sortable: true,
      cell: (a) =>
        a.assignee ? (
          <span className="gap-2 inline-flex items-center whitespace-nowrap">
            <KumoAvatar name={labels.staff(a.assignee)} size="xs" decorative />
            {labels.staff(a.assignee)}
          </span>
        ) : (
          <span className="kumo-subtle">—</span>
        ),
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
      cell: (a) => <span className="kumo-subtle whitespace-nowrap">{labels.date(a.submitted)}</span>,
    },
  ]
}

export default function KumoIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<ListingView>("table")
  const state = useListingState({
    paramPrefix: KUMO_PARAM,
    defaultState: { perPage: 25, sort: { id: "submitted", desc: true } },
    defaultColumnVisibility: { island: false },
  })

  const trashed = state.filters.trashed
  const source = all.filter((a) => (trashed === "only" ? a.deletedAt : trashed === "with" ? true : !a.deletedAt))
  const baseSort = sortValue(labels)
  const listingOptions = {
    searchFields,
    filterFns: { ...filterFns, email: emailFilter },
    sortValue: (a: Application, key: string): unknown =>
      key === "assignee" ? labels.staff(a.assignee) || "~" : baseSort(a, key),
    locale: labels.dv ? "dv" : "en",
  }
  const { rows, total } = applyListingState(source, state, listingOptions)
  const active = all.filter((a) => !a.deletedAt)
  const count = (s: ApplicationStatus) => active.filter((a) => a.status === s).length
  const filters = applicationFilters(labels, tr, { trashed: view === "table" })

  const exportRows = useExportRows()
  const exportColumns: ExportColumn<Application>[] = [
    { header: tr("Reference", "ރެފަރެންސް"), accessor: "reference" },
    { header: tr("Applicant", "އެޕްލިކަންޓް"), accessor: (a) => labels.name(a) },
    { header: tr("Service", "ޚިދުމަތް"), accessor: (a) => labels.service(a.service) },
    { header: tr("Status", "ސްޓޭޓަސް"), accessor: (a) => labels.status(a.status) },
    { header: tr("Island", "ރަށް"), accessor: (a) => labels.island(a.island) },
    { header: tr("Assignee", "ޙަވާލުވި"), accessor: (a) => labels.staff(a.assignee) },
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
    <LinkButton href={routes.adminRecords.create} startIcon="add">
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

  const itemMeta = (a: Application) => (
    <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
      <KumoBadge tone={STATUS_TONE[a.status]}>{labels.status(a.status)}</KumoBadge>
      <span className="tabular-nums">{labels.mvr(a.amount)}</span>
      <span className="kumo-subtle">{labels.date(a.submitted)}</span>
    </span>
  )

  const customView =
    view === "table" ? undefined : (
      <div className="gap-3 grid">
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
              <span className="gap-x-2 flex flex-wrap items-center">
                <code className="kumo-mono">{a.reference}</code>
                <span>{labels.service(a.service)}</span>
              </span>
            )}
            media={(a) => <ServiceTile service={a.service} className="kumo-tile--lg" />}
            meta={itemMeta}
          />
        ) : (
          <GridView
            {...shared}
            minItemWidth="16rem"
            description={(a) => (
              <span className="gap-2 flex items-center">
                <ServiceTile service={a.service} />
                <code className="kumo-mono">{a.reference}</code>
              </span>
            )}
            meta={itemMeta}
          />
        )}
      </div>
    )

  return (
    <KumoShell>
      <div className="gap-4 grid">
        <Breadcrumbs
          items={[
            { label: tr("Malé City Council", "މާލޭ ސިޓީ ކައުންސިލް"), href: KUMO_ROUTES.dashboard },
            { label: tr("Applications", "އެޕްލިކޭޝަންތައް") },
          ]}
          classNames={{ list: "kumo-crumbs" }}
        />
        <ListingPage<Application>
          className="kumo-listing"
          title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
          description={tr(
            "Review and manage permit and licence applications across every island.",
            "ހުރިހާ ރަށްރަށުން ހުށަހަޅާފައިވާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަންތައް.",
          )}
          state={state}
          columns={columns(labels, tr)}
          data={rows}
          total={total}
          noun={labels.noun}
          density="compact"
          filters={filters}
          searchPlaceholder={tr("Search by name, reference or ID card", "ނަން، ރެފަރެންސް ނުވަތަ އައިޑީ")}
          searchThaana={labels.dv}
          trash={trashed === "only"}
          primaryAction={newButton}
          trashHref={routes.adminRecords.trash}
          trashHasItems={all.length > active.length}
          tabs={[
            { value: "all", label: tr("All applications", "ހުރިހާ"), count: active.length },
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
              filename: `applications-${new Date().toISOString().slice(0, 10)}`,
              title: tr("Applications", "އެޕްލިކޭޝަންތައް"),
              scope: tr(`${total} applications, current filters`, `${total} އެޕްލިކޭޝަން، މިހާރުގެ ފިލްޓަރުތައް`),
            })
          }
          perPageOptions={view === "grid" ? [12, 24, 48] : [10, 25, 50]}
          bulkActions={bulkActions as BulkAction<unknown>[]}
          onBulkSuccess={(message) => toast.success(message)}
          getRowName={(a) => `${a.reference} (${labels.name(a)})`}
          getRowHref={(a) => showHref(a.id)}
          rowActions={(a) => itemActions(a, labels, tr)}
          toolbarEnd={
            <ViewSwitcher
              views={["table", "list", "grid"]}
              value={view}
              onValueChange={(v) => {
                setView(v)
                state.clearSelection()
              }}
            />
          }
        >
          {customView}
        </ListingPage>
      </div>
    </KumoShell>
  )
}
