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
  ProgressBar,
  Select,
  StatusBadge,
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
import { ChakraShell, StatHelp, ToneAvatar } from "./_chakra"

export const meta = {
  title: "Chakra · Index",
  group: "Design options",
  layout: "bare",
  order: 70,
  description:
    "Friendly and accessible: white cards on gray.50, a saturated brand scale, subtle badges, icon tiles and soft focus glows.",
}

/** How far an application has travelled through review, for the Chakra progress column. */
const COMPLETION: Record<ApplicationStatus, number> = {
  submitted: 20,
  in_review: 60,
  suspended: 45,
  rejected: 100,
  approved: 100,
}

const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

function Completion({ a, tr }: { a: Application; tr: Tr }) {
  const value = COMPLETION[a.status]
  const tone = a.status === "rejected" ? "ck-progress--alt2" : a.status === "approved" ? "ck-progress--brand" : ""
  return (
    <div className={`gap-1 min-w-28 grid ${tone || "ck-progress--alt"}`}>
      <span className="text-xs font-semibold tabular-nums" dir="ltr">
        {value}%
      </span>
      <ProgressBar value={value} size="sm" aria-label={tr("Review progress", "ރިވިއުގެ ކުރިއެރުން")} />
    </div>
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
      cell: (a) => (
        <span className="gap-3 flex items-center">
          <ToneAvatar name={labels.name(a)} size="sm" decorative />
          <span className="min-w-0">
            <span className="font-semibold block truncate">{labels.name(a)}</span>
            <span className="text-xs block truncate font-mono text-muted-foreground">{a.reference}</span>
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
        <span className="grid">
          <span className="font-medium whitespace-nowrap">{labels.service(a.service)}</span>
          <span className="text-xs text-muted-foreground">{labels.island(a.island)}</span>
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
      id: "progress",
      header: tr("Completion", "ނިމުނު މިންވަރު"),
      cell: (a) => <Completion a={a} tr={tr} />,
    },
    {
      id: "amount",
      header: tr("Fee", "ފީ"),
      sortable: true,
      numeric: true,
      cell: (a) => <span className="font-semibold whitespace-nowrap">{labels.mvr(a.amount)}</span>,
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
            <ToneAvatar name={labels.staff(a.assignee)} size="xs" decorative />
            {labels.staff(a.assignee)}
          </span>
        ) : (
          <span className="ck-badge ck-badge--alt2">{tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}</span>
        ),
    },
  ]
}

/** Chakra stat card: label, number, help text, and an icon in a coloured rounded square. */
function KpiCard({
  label,
  value,
  delta,
  icon,
  tone,
  context,
}: {
  label: string
  value: string
  delta: number
  icon: string
  tone?: "alt" | "alt2" | "dark"
  context: string
}) {
  return (
    <div role="group" aria-label={label} className="ck-card ck-card-lift p-4 gap-3 flex items-center justify-between">
      <dl className="min-w-0 gap-0.5 grid">
        <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
        <dd className="gap-x-2 flex flex-wrap items-baseline">
          <span className="ck-heading text-xl tabular-nums" dir="ltr">
            {value}
          </span>
          <StatHelp value={delta} />
        </dd>
        <dd className="sr-only">{context}</dd>
      </dl>
      <span className={tone ? `ck-icon-tile ck-icon-tile--${tone}` : "ck-icon-tile"} aria-hidden>
        <Icon name={icon} />
      </span>
    </div>
  )
}

export default function ChakraIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<ListingView>("table")
  const state = useListingState({
    paramPrefix: "ck_",
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
  const fees = active.filter((a) => a.status === "approved").reduce((s, a) => s + a.amount, 0)
  const filters = applicationFilters(labels, tr)

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
    <LinkButton href={routes.adminRecords.create} startIcon="add">
      {tr("New application", "އައު އެޕްލިކޭޝަން")}
    </LinkButton>
  )

  const empty =
    state.search || state.isFiltered ? (
      <EmptyState
        variant="no-results"
        bordered
        className="ck-card"
        noun={labels.noun}
        search={state.search || undefined}
        filters={filters.filter((f) => state.filters[f.key] !== undefined).map((f) => f.label)}
        onClearSearch={state.search ? state.clearSearch : undefined}
        onClearFilters={state.isFiltered ? state.clearFilters : undefined}
      />
    ) : (
      <EmptyState bordered className="ck-card" noun={labels.noun} action={newButton} />
    )

  const shared = {
    "aria-label": tr("Applications", "އެޕްލިކޭޝަންތައް"),
    items: rows,
    getName: (a: Application) => `${a.reference} (${labels.name(a)})`,
    title: (a: Application) => <span className="font-semibold">{labels.name(a)}</span>,
    getHref: (a: Application) => showHref(a.id),
    itemActions: (a: Application) => itemActions(a, labels, tr),
    selection: state.selection,
    onSelectionChange: state.setSelection,
    empty,
  }

  const customView =
    view === "table" ? undefined : (
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
            media={(a) => <ToneAvatar name={labels.name(a)} decorative />}
            meta={(a) => (
              <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
                <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                <span className="text-muted-foreground">{labels.island(a.island)}</span>
                <span className="font-semibold tabular-nums">{labels.mvr(a.amount)}</span>
                <span className="text-muted-foreground">{labels.date(a.submitted)}</span>
              </span>
            )}
          />
        ) : (
          <GridView
            {...shared}
            minItemWidth="15rem"
            description={(a) => <span className="text-xs font-mono">{a.reference}</span>}
            media={(a) => (
              <div className="gap-2 flex size-full flex-col items-center justify-center bg-[var(--c-subtle-bg)] text-[var(--c-subtle-fg)]">
                <Icon name={SERVICE_ICONS[a.service] ?? "file"} className="size-8" />
                <span className="text-xs font-semibold">{labels.service(a.service)}</span>
              </div>
            )}
            meta={(a) => (
              <span className="gap-2 text-sm grid w-full">
                <span className="gap-2 flex flex-wrap items-center justify-between">
                  <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                  <span className="font-semibold tabular-nums">{labels.mvr(a.amount)}</span>
                </span>
                <Completion a={a} tr={tr} />
              </span>
            )}
          />
        )}
      </div>
    )

  return (
    <ChakraShell page={tr("Applications", "އެޕްލިކޭޝަންތައް")}>
      <div className="gap-6 grid">
        {/* KPI strip */}
        <section aria-label={tr("Summary", "ޚުލާޞާ")} className="gap-4 sm:grid-cols-2 xl:grid-cols-4 grid">
          <KpiCard
            label={tr("Open applications", "ހުޅުވިފައިވާ")}
            value={String(count("submitted") + count("in_review"))}
            delta={8.2}
            icon="file-text"
            context={tr("vs last month", "ފާއިތުވި މަހާ އަޅާބަލާއިރު")}
          />
          <KpiCard
            label={tr("In review", "ރިވިއުކުރަނީ")}
            value={String(count("in_review"))}
            delta={-3.4}
            icon="clock"
            tone="alt"
            context={tr("vs last month", "ފާއިތުވި މަހާ އަޅާބަލާއިރު")}
          />
          <KpiCard
            label={tr("Approved", "ފާސްކުރެވިފަ")}
            value={String(count("approved"))}
            delta={12.6}
            icon="success"
            tone="dark"
            context={tr("vs last month", "ފާއިތުވި މަހާ އަޅާބަލާއިރު")}
          />
          <KpiCard
            label={tr("Fees approved", "ފާސްވި ފީ")}
            value={labels.mvr(fees)}
            delta={5.1}
            icon="banknote"
            tone="alt2"
            context={tr("vs last month", "ފާއިތުވި މަހާ އަޅާބަލާއިރު")}
          />
        </section>

        <ListingPage<Application>
          className="ck-tabs"
          title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
          description={tr(
            "Permit and licence applications from every island.",
            "ހުރިހާ ރަށްރަށުން ހުށަހަޅާފައިވާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަންތައް.",
          )}
          state={state}
          columns={columns(labels, tr)}
          data={rows}
          total={total}
          noun={labels.noun}
          filters={view === "table" ? filters : applicationFilters(labels, tr, { trashed: false })}
          searchPlaceholder={tr("Reference, name, ID card…", "ރެފަރެންސް، ނަން، އައިޑީ ކާޑު…")}
          searchThaana={labels.dv}
          trash={trashed === "only"}
          primaryAction={newButton}
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
    </ChakraShell>
  )
}
