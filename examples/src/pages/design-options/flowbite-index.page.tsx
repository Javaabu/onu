import * as React from "react"
import {
  ActionMenu,
  applyListingState,
  Breadcrumbs,
  BulkActionBar,
  Button,
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
import { Dot, FB_ROUTES, FlowbiteShell, Pill, Trend } from "./_flowbite"

export const meta = {
  title: "Flowbite · Index",
  group: "Design options",
  layout: "bare",
  order: 40,
  description:
    "Inspired by Flowbite and the Flowbite Admin Dashboard: a clean Tailwind admin with a fixed navbar, a CRUD table card, pill badges and ring-4 focus.",
}

const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

/** Payment state shown as a Flowbite status dot. */
function Payment({ a, tr }: { a: Application; tr: Tr }) {
  if (a.status === "approved") return <Dot tone="green">{tr("Paid", "ދައްކާފައި")}</Dot>
  if (a.status === "rejected") return <Dot tone="gray">{tr("Refunded", "ރީފަންޑް")}</Dot>
  if (a.status === "suspended") return <Dot tone="red">{tr("On hold", "ހިފަހައްޓާފައި")}</Dot>
  return <Dot tone="yellow">{tr("Pending", "ނުދައްކާ")}</Dot>
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
          <UserAvatar name={labels.name(a)} size="sm" decorative />
          <span className="min-w-0">
            <span className="font-semibold block truncate text-foreground">{labels.name(a)}</span>
            <span className="text-sm block truncate text-muted-foreground">{a.email}</span>
          </span>
        </span>
      ),
    },
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      sortable: true,
      accessor: (a) => a.reference,
      cell: (a) => <span className="font-medium whitespace-nowrap text-foreground">{a.reference}</span>,
    },
    {
      id: "service",
      header: tr("Service", "ޚިދުމަތް"),
      sortable: true,
      accessor: (a) => labels.service(a.service),
      cell: (a) => <Pill>{labels.service(a.service)}</Pill>,
    },
    { id: "island", header: tr("Island", "ރަށް"), sortable: true, accessor: (a) => labels.island(a.island) },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />,
    },
    {
      id: "payment",
      header: tr("Payment", "ފައިސާ"),
      cell: (a) => <Payment a={a} tr={tr} />,
    },
    {
      id: "amount",
      header: tr("Fee", "ފީ"),
      sortable: true,
      numeric: true,
      cell: (a) => <span className="font-medium whitespace-nowrap text-foreground">{labels.mvr(a.amount)}</span>,
    },
    {
      id: "submitted",
      header: tr("Submitted", "ހުށަހެޅި"),
      sortable: true,
      cell: (a) => <span className="whitespace-nowrap">{labels.date(a.submitted)}</span>,
    },
  ]
}

/** A Flowbite stats card: gray label, bold number, trend and context. */
function StatCard({ label, value, delta, context }: { label: string; value: string; delta: number; context: string }) {
  return (
    <div role="group" aria-label={label} className="fb-card fb-card--compact">
      <dl className="gap-1 grid">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="gap-x-3 gap-y-1 flex flex-wrap items-center">
          <span className="fb-number text-2xl" dir="ltr">
            {value}
          </span>
          <Trend value={delta} className="text-sm" />
        </dd>
        <dd className="text-xs text-muted-foreground">{context}</dd>
      </dl>
    </div>
  )
}

export default function FlowbiteIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<ListingView>("table")
  const state = useListingState({
    paramPrefix: "fb_",
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
  const vsLastMonth = tr("vs last month", "ފާއިތުވި މަހާ އަޅާބަލާއިރު")

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

  const selected = state.selection.length
  const actionsMenu = (
    <ActionMenu
      label={tr("Actions", "ޢަމަލުތައް")}
      trigger={
        <Button variant="outline" className="fb-btn-alt" aria-label={tr("Actions", "ޢަމަލުތައް")}>
          {tr("Actions", "ޢަމަލުތައް")}
          <Icon name="chevron-down" />
        </Button>
      }
      items={[
        {
          id: "approve",
          label: tr("Approve selected", "ހޮވާފައިވާ ފާސްކުރޭ"),
          icon: "success",
          disabled: !selected,
          onSelect: () => {
            state.selection.forEach((id) => updateApplication(String(id), { status: "approved" }))
            toast.success(tr(`${selected} applications approved`, `${selected} އެޕްލިކޭޝަން ފާސްކުރެވިއްޖެ`))
            state.clearSelection()
          },
        },
        {
          id: "export",
          label: tr("Export selected", "ހޮވާފައިވާ އެކްސްޕޯޓް"),
          icon: "download",
          disabled: !selected,
          onSelect: () =>
            exportRows({
              format: "csv",
              rows: active.filter((a) => state.selection.includes(a.id)),
              columns: exportColumns,
              filename: "applications-selected",
              title: tr("Applications", "އެޕްލިކޭޝަންތައް"),
            }),
        },
        { type: "separator" },
        {
          id: "delete",
          label: tr("Delete selected", "ހޮވާފައިވާ ފޮހެލާ"),
          icon: "trash",
          variant: "destructive",
          disabled: !selected,
          confirm: tr(`Delete ${selected} applications?`, `${selected} އެޕްލިކޭޝަން ފޮހެލަންތޯ؟`),
          onSelect: () => {
            trashApplications(state.selection.map(String))
            state.clearSelection()
          },
        },
      ]}
    />
  )

  const newButton = (
    <LinkButton href={routes.adminRecords.create} startIcon="add" className="fb-btn">
      {tr("New application", "އައު އެޕްލިކޭޝަން")}
    </LinkButton>
  )

  const empty =
    state.search || state.isFiltered ? (
      <EmptyState
        variant="no-results"
        noun={labels.noun}
        search={state.search || undefined}
        filters={filters.filter((f) => state.filters[f.key] !== undefined).map((f) => f.label)}
        onClearSearch={state.search ? state.clearSearch : undefined}
        onClearFilters={state.isFiltered ? state.clearFilters : undefined}
      />
    ) : (
      <EmptyState noun={labels.noun} action={newButton} />
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
                <span className="font-medium">{a.reference}</span>
                <span>{a.email}</span>
              </span>
            )}
            media={(a) => <UserAvatar name={labels.name(a)} decorative />}
            meta={(a) => (
              <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
                <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                <Pill>{labels.service(a.service)}</Pill>
                <Payment a={a} tr={tr} />
                <span className="font-medium tabular-nums">{labels.mvr(a.amount)}</span>
              </span>
            )}
          />
        ) : (
          <GridView
            {...shared}
            minItemWidth="15rem"
            description={(a) => <span className="text-sm">{a.reference}</span>}
            media={(a) => (
              <div className="fb-grid-media">
                <Icon name={SERVICE_ICONS[a.service] ?? "file"} className="size-8" />
                <span className="text-sm font-medium">{labels.service(a.service)}</span>
              </div>
            )}
            meta={(a) => (
              <span className="gap-2 text-sm grid w-full">
                <span className="gap-2 flex flex-wrap items-center justify-between">
                  <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                  <span className="font-semibold tabular-nums">{labels.mvr(a.amount)}</span>
                </span>
                <Payment a={a} tr={tr} />
              </span>
            )}
          />
        )}
      </div>
    )

  return (
    <FlowbiteShell>
      <div className="gap-4 grid">
        <Breadcrumbs
          items={[
            { label: tr("Home", "ހޯމް"), href: FB_ROUTES.dashboard, icon: "home" },
            { label: tr("Records", "ރެކޯޑުތައް"), href: routes.adminRecords.indexTable },
            { label: tr("Applications", "އެޕްލިކޭޝަންތައް") },
          ]}
          className="fb-crumbs"
        />

        <section aria-label={tr("Summary", "ޚުލާޞާ")} className="gap-4 sm:grid-cols-2 xl:grid-cols-4 grid">
          <StatCard
            label={tr("Open applications", "ހުޅުވިފައިވާ")}
            value={String(count("submitted") + count("in_review"))}
            delta={8.2}
            context={vsLastMonth}
          />
          <StatCard
            label={tr("In review", "ރިވިއުކުރަނީ")}
            value={String(count("in_review"))}
            delta={-3.4}
            context={vsLastMonth}
          />
          <StatCard
            label={tr("Approved", "ފާސްކުރެވިފަ")}
            value={String(count("approved"))}
            delta={12.6}
            context={vsLastMonth}
          />
          <StatCard
            label={tr("Fees approved", "ފާސްވި ފީ")}
            value={labels.mvr(fees)}
            delta={5.1}
            context={vsLastMonth}
          />
        </section>

        <ListingPage<Application>
          className="fb-listing"
          title={tr("All applications", "ހުރިހާ އެޕްލިކޭޝަނެއް")}
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
          searchPlaceholder={tr("Search", "ހޯދާ")}
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
            <>
              {view === "table" ? actionsMenu : null}
              <ViewSwitcher
                views={["table", "list", "grid"]}
                value={view}
                onValueChange={(v) => {
                  setView(v)
                  state.clearSelection()
                }}
              />
            </>
          }
        >
          {customView}
        </ListingPage>
      </div>
    </FlowbiteShell>
  )
}
