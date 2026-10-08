import * as React from "react"
import {
  applyListingState,
  BulkActionBar,
  EmptyState,
  GridView,
  Icon,
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
} from "@javaabu/onu"
import { StatTile } from "@javaabu/onu/charts"
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
import { itemActions, NewApplicationButton } from "../admin-records/_index"
import { applicationFilters, emailFilter, sortValue, type Tr } from "../admin-records/_ui"
import { MicroLabel, NB_ROUTES, NbAppShell } from "./_neon-bento"

export const meta = {
  title: "Neon Bento · Index",
  group: "Design options",
  layout: "bare",
  order: 40,
  description: "Applications records index: the listing as a neon bento tile with KPI tiles above.",
}

type View = "table" | "list" | "grid"

const DAY = 86_400_000
const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

/** Table columns in the Neon Bento look: mono neon references, avatars, tabular amounts. */
function columns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      sortable: true,
      primary: true,
      className: "nb-ref nb-code text-xs whitespace-nowrap",
    },
    {
      id: "name",
      header: tr("Applicant", "އެޕްލިކަންޓް"),
      sortable: true,
      accessor: (a) => labels.name(a),
      cell: (a) => (
        <span className="gap-2.5 flex items-center whitespace-nowrap">
          <UserAvatar name={labels.name(a)} size="sm" decorative />
          <span className="min-w-0">
            <span className="font-medium block">{labels.name(a)}</span>
            <span className="nb-code block text-[0.6875rem] text-muted-foreground">{a.idCard}</span>
          </span>
        </span>
      ),
    },
    { id: "service", header: tr("Service", "ޚިދުމަތް"), sortable: true, accessor: (a) => labels.service(a.service) },
    { id: "island", header: tr("Island", "ރަށް"), sortable: true, accessor: (a) => labels.island(a.island) },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />,
    },
    {
      id: "amount",
      header: tr("Amount", "އަދަދު"),
      sortable: true,
      numeric: true,
      cell: (a) => <span className="nb-code text-xs whitespace-nowrap tabular-nums">{labels.mvr(a.amount)}</span>,
    },
    {
      id: "submitted",
      header: tr("Submitted", "ހުށަހެޅި"),
      sortable: true,
      cell: (a) => <span className="whitespace-nowrap text-muted-foreground">{labels.date(a.submitted)}</span>,
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
          <span className="nb-mono text-muted-foreground">{tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}</span>
        ),
    },
  ]
}

export default function NeonBentoIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<View>("table")
  const state = useListingState({
    paramPrefix: "nb_",
    defaultState: { perPage: 10, sort: { id: "submitted", desc: true } },
    defaultColumnVisibility: { island: false },
  })

  // The "Deleted records" filter picks the source rows (withTrashed / onlyTrashed).
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

  // KPI strip: last 30 days against the 30 before.
  const today = Date.parse(`${TODAY}T00:00:00Z`)
  const inWindow = (a: Application, from: number, to = 0) => {
    const t = Date.parse(`${a.submitted}T00:00:00Z`)
    return t > today - from * DAY && t <= today - to * DAY
  }
  const last30 = active.filter((a) => inWindow(a, 30))
  const prev30 = active.filter((a) => inWindow(a, 60, 30))
  const weekly = (pick: (a: Application) => boolean) =>
    Array.from(
      { length: 12 },
      (_, i) => active.filter((a) => inWindow(a, (12 - i) * 7, (11 - i) * 7) && pick(a)).length,
    )
  const open = active.filter((a) => a.status === "submitted" || a.status === "in_review")
  const fees = (list: Application[]) => list.reduce((s, a) => s + a.amount, 0)

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
      <EmptyState bordered noun={labels.noun} action={<NewApplicationButton />} />
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
    <NbAppShell current={NB_ROUTES.index}>
      <div className="gap-5 grid">
        <MicroLabel className="gap-2 flex items-center">
          <span className="nb-dot" aria-hidden />
          <span className="nb-ink">{tr("Records", "ރެކޯޑު")}</span>
          <span aria-hidden>/</span>
          <span>{tr("Applications · Addu City Council", "އެޕްލިކޭޝަން · އައްޑޫ ސިޓީ ކައުންސިލް")}</span>
        </MicroLabel>

        <div className="nb-kpis gap-3 xl:grid-cols-4 grid grid-cols-2">
          <StatTile
            className="nb-tile nb-featured p-4 sm:p-5"
            label={tr("Open applications", "ހުޅުވިފައިވާ")}
            value={open.length}
            icon="file-text"
            delta={(last30.length - prev30.length) / Math.max(prev30.length, 1)}
            deltaContext={tr("new vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
            sparkline={weekly(() => true)}
            classNames={kpiClasses}
          />
          <StatTile
            className="nb-tile p-4 sm:p-5"
            label={tr("Awaiting review", "ރިވިއުއަށް")}
            value={count("in_review")}
            icon="clock"
            positiveIsGood={false}
            delta={0.06}
            deltaContext={tr("vs last week", "ކުރީ ހަފްތާއާ")}
            sparkline={weekly((a) => a.status === "in_review")}
            classNames={kpiClasses}
          />
          <StatTile
            className="nb-tile p-4 sm:p-5"
            label={tr("Approved", "ފާސްކުރެވިފައި")}
            value={count("approved")}
            icon="success"
            delta={0.12}
            deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
            sparkline={weekly((a) => a.status === "approved")}
            classNames={kpiClasses}
          />
          <StatTile
            className="nb-tile p-4 sm:p-5"
            label={tr("Fees, 30 days", "ފީ، 30 ދުވަސް")}
            value={fees(last30)}
            previousValue={fees(prev30)}
            valueFormat={{ style: "currency", currency: "MVR", notation: "compact", maximumFractionDigits: 1 }}
            icon="banknote"
            deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
            sparkline={weekly(() => true).map((n, i) => n * (180 + i * 6))}
            classNames={kpiClasses}
          />
        </div>

        <div className="nb-listing">
          <ListingPage<Application>
            title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
            description={tr(
              "Permit and licence applications from every island.",
              "ހުރިހާ ރަށްރަށުން ހުށަހަޅާފައިވާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަންތައް.",
            )}
            state={state}
            columns={columns(labels, tr)}
            data={rows}
            total={total}
            perPageOptions={[10, 25, 50]}
            noun={labels.noun}
            filters={filters}
            searchPlaceholder={tr("Reference, name, ID card…", "ރެފަރެންސް، ނަން، އައިޑީ ކާޑު…")}
            searchThaana={labels.dv}
            trash={trashed === "only"}
            primaryAction={<NewApplicationButton />}
            links={[{ label: tr("Insights", "އިންސައިޓްސް"), href: NB_ROUTES.dashboard, icon: "home" }]}
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
                filename: `applications-${TODAY}`,
                title: tr("Applications", "އެޕްލިކޭޝަންތައް"),
                scope: tr(`${total} applications, current filters`, `${total} އެޕްލިކޭޝަން، މިހާރުގެ ފިލްޓަރުތައް`),
              })
            }
            bulkActions={bulkActions as BulkAction<unknown>[]}
            onBulkSuccess={(message) => toast.success(message)}
            getRowName={(a) => `${a.reference} (${labels.name(a)})`}
            getRowHref={(a) => showHref(a.id)}
            rowActions={(a) => itemActions(a, labels, tr)}
            classNames={{ card: "nb-tile" }}
            toolbarEnd={
              <ViewSwitcher views={["table", "list", "grid"]} value={view} onValueChange={(v) => setView(v as View)} />
            }
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
                    className="nb-collection"
                    description={(a) => (
                      <span className="gap-x-2 flex flex-wrap">
                        <span className="nb-ink nb-code text-xs">{a.reference}</span>
                        <span>{labels.service(a.service)}</span>
                      </span>
                    )}
                    media={(a) => <UserAvatar name={labels.name(a)} />}
                    meta={(a) => (
                      <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
                        <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                        <span className="text-muted-foreground">{labels.island(a.island)}</span>
                        <span className="nb-code text-xs tabular-nums">{labels.mvr(a.amount)}</span>
                      </span>
                    )}
                  />
                ) : (
                  <GridView
                    {...shared}
                    className="nb-collection"
                    minItemWidth="15rem"
                    description={(a) => <span className="nb-ink nb-code text-xs">{a.reference}</span>}
                    media={(a) => (
                      <div className="nb-grid-media gap-2 flex size-full flex-col items-center justify-center">
                        <span className="nb-chip size-11">
                          <Icon name={SERVICE_ICONS[a.service] ?? "file"} className="size-5" />
                        </span>
                        <span className="nb-mono text-muted-foreground">{labels.service(a.service)}</span>
                      </div>
                    )}
                    meta={(a) => (
                      <span className="gap-2 text-sm flex w-full flex-wrap items-center justify-between">
                        <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                        <span className="nb-code text-xs tabular-nums">{labels.mvr(a.amount)}</span>
                      </span>
                    )}
                  />
                )}
              </div>
            )}
          </ListingPage>
        </div>
      </div>
    </NbAppShell>
  )
}

const kpiClasses = {
  label: "nb-mono",
  value: "text-2xl sm:text-4xl font-semibold tracking-tighter",
  delta: "text-xs sm:text-sm",
  icon: "nb-chip size-8 [&_svg]:size-4",
}
