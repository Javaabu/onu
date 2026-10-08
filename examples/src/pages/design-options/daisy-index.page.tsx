import * as React from "react"
import {
  applyListingState,
  Breadcrumbs,
  BulkActionBar,
  Button,
  Callout,
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
} from "@javaabu/onu"
import { StatTile } from "@javaabu/onu/charts"
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
} from "../admin-records/_data"
import { itemActions } from "../admin-records/_index"
import { applicationColumns, applicationFilters, emailFilter, sortValue } from "../admin-records/_ui"
import { DaisyShell, DY_ROUTES } from "./_daisy"

export const meta = {
  title: "Daisy · Index",
  group: "Design options",
  layout: "bare",
  order: 50,
  description:
    "Playful and chunky, after daisyUI: rounded boxes, solid pill badges, boxed tabs, joined buttons and pastel role colours.",
}

type View = "table" | "list" | "grid"

const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}
const SERVICE_TONES: Record<string, string> = {
  building: "primary",
  business: "secondary",
  land: "accent",
  vessel: "info",
  event: "success",
  trade: "neutral",
}

function NewApplication() {
  const tr = useTr()
  return (
    <LinkButton href={routes.adminRecords.create} startIcon="add">
      {tr("New application", "އައު އެޕްލިކޭޝަން")}
    </LinkButton>
  )
}

export default function DaisyIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<View>("table")
  const [alertOpen, setAlertOpen] = React.useState(true)
  const state = useListingState({
    paramPrefix: "dy_",
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
  const fees = active.filter((a) => a.status === "approved").reduce((sum, a) => sum + a.amount, 0)
  const filters = applicationFilters(labels, tr)

  // Columns: the shared ones, with the applicant shown daisy-style (avatar, name, island).
  const columns: DataTableColumn<Application>[] = applicationColumns(labels, tr).map((c) =>
    c.id === "name"
      ? {
          ...c,
          cell: (a: Application) => (
            <span className="gap-3 flex items-center">
              <UserAvatar name={labels.name(a)} size="sm" className="dy-avatar" />
              <span className="min-w-0 grid">
                <span className="font-semibold truncate">{labels.name(a)}</span>
                <span className="text-xs dy-muted truncate">{labels.island(a.island)}</span>
              </span>
            </span>
          ),
        }
      : c.id === "service"
        ? {
            ...c,
            cell: (a: Application) => (
              <span className="dy-badge" data-tone="ghost">
                <Icon name={SERVICE_ICONS[a.service] ?? "file"} className="size-3.5" />
                {labels.service(a.service)}
              </span>
            ),
          }
        : c,
  )

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
      <EmptyState bordered noun={labels.noun} action={<NewApplication />} />
    )

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
            {...collection}
            variant="cards"
            classNames={{ item: "dy-box" }}
            description={(a) => (
              <span className="gap-x-2 flex flex-wrap">
                <span className="text-xs font-mono" dir="ltr">
                  {a.reference}
                </span>
                <span>{labels.service(a.service)}</span>
              </span>
            )}
            media={(a) => <UserAvatar name={labels.name(a)} />}
            meta={(a) => (
              <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
                <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                <span className="dy-muted">{labels.island(a.island)}</span>
                <span className="font-semibold tabular-nums">{labels.mvr(a.amount)}</span>
                <span className="dy-muted">{labels.date(a.submitted)}</span>
              </span>
            )}
          />
        ) : (
          <GridView
            {...collection}
            minItemWidth="15rem"
            classNames={{ item: "dy-box overflow-hidden", media: "p-3 pb-0" }}
            description={(a) => (
              <span className="text-xs font-mono" dir="ltr">
                {a.reference}
              </span>
            )}
            media={(a) => (
              <div className="gap-2 flex size-full flex-col items-center justify-center rounded-xl bg-muted">
                <span className="dy-icon-chip" data-tone={SERVICE_TONES[a.service] ?? "neutral"}>
                  <Icon name={SERVICE_ICONS[a.service] ?? "file"} className="size-5" />
                </span>
                <span className="text-xs font-semibold">{labels.service(a.service)}</span>
              </div>
            )}
            meta={(a) => (
              <span className="gap-1 text-sm grid w-full">
                <span className="gap-2 flex flex-wrap items-center justify-between">
                  <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                  <span className="font-semibold tabular-nums">{labels.mvr(a.amount)}</span>
                </span>
                <span className="dy-muted">{labels.island(a.island)}</span>
              </span>
            )}
          />
        )}
      </div>
    )

  return (
    <DaisyShell current={DY_ROUTES.index}>
      <div className="gap-5 grid">
        {/* Breadcrumbs and the attention alert */}
        <Breadcrumbs
          items={[
            { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: DY_ROUTES.dashboard },
            { label: tr("Applications", "އެޕްލިކޭޝަންތައް") },
          ]}
        />

        {alertOpen ? (
          <div className="dy-alert-wrap">
            <Callout
              variant="warning"
              className="dy-alert"
              title={tr("3 building permits are waiting over 7 days", "3 ބިނާކުރުމުގެ ހުއްދަ 7 ދުވަހަށްވުރެ ގިނައިރު")}
              description={tr(
                "They're past the service target. Assign them so applicants hear back this week.",
                "ޚިދުމަތުގެ މުއްދަތު ހަމަވެއްޖެ. މި ހަފްތާގައި ޖަވާބު ދެވޭތޯ ޙަވާލުކުރައްވާ.",
              )}
              actions={
                <>
                  <Button size="sm" variant="ghost" onClick={() => setAlertOpen(false)}>
                    {tr("Dismiss", "ފޮރުވާ")}
                  </Button>
                  <Button
                    size="sm"
                    className="dy-btn-neutral"
                    onClick={() => {
                      state.setFilters({ status: "submitted", service: "building" })
                      setAlertOpen(false)
                    }}
                  >
                    {tr("Show them", "ދައްކާ")}
                  </Button>
                </>
              }
            />
          </div>
        ) : null}

        {/* KPI strip: daisyUI "stats" */}
        <section aria-label={tr("Summary", "ޚުލާޞާ")} className="dy-stats">
          <StatTile
            data-tone="primary"
            className="dy-stat-figure"
            label={tr("Open applications", "ހުޅުވިފައިވާ އެޕްލިކޭޝަން")}
            value={count("submitted") + count("in_review")}
            icon="file-text"
            footer={tr("↗︎ 12 more than last week", "↗︎ ފާއިތުވި ހަފްތާއަށްވުރެ 12 ގިނަ")}
          />
          <StatTile
            data-tone="secondary"
            className="dy-stat-figure"
            label={tr("In review", "ރިވިއުކުރަނީ")}
            value={count("in_review")}
            icon="eye"
            footer={tr("Median 2.4 days in review", "މެދު 2.4 ދުވަސް")}
          />
          <StatTile
            data-tone="accent"
            className="dy-stat-figure"
            label={tr("Approved", "ފާސްކުރެވިފަ")}
            value={count("approved")}
            icon="success"
            footer={tr("86% approval rate", "86% ފާސްވުން")}
          />
          <StatTile
            data-tone="neutral"
            className="dy-stat-figure"
            label={tr("Fees collected", "ލިބުނު ފީ")}
            value={labels.mvr(fees)}
            icon="banknote"
            footer={tr("From approved applications", "ފާސްވި އެޕްލިކޭޝަންތަކުން")}
          />
        </section>

        <ListingPage<Application>
          title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
          description={tr(
            "Permit and licence applications from every island.",
            "ހުރިހާ ރަށްރަށުން ހުށަހަޅާފައިވާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަންތައް.",
          )}
          state={state}
          columns={columns}
          data={rows}
          total={total}
          perPageOptions={view === "grid" ? [12, 24, 48] : [10, 25, 50]}
          noun={labels.noun}
          filters={view === "table" ? filters : applicationFilters(labels, tr, { trashed: false })}
          searchPlaceholder={tr("Reference, name, ID card…", "ރެފަރެންސް، ނަން، އައިޑީ ކާޑު…")}
          searchThaana={labels.dv}
          trash={trashed === "only"}
          primaryAction={<NewApplication />}
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
                setView(v as View)
                state.clearSelection()
              }}
            />
          }
        >
          {customView}
        </ListingPage>
      </div>
    </DaisyShell>
  )
}
