import * as React from "react"
import {
  applyListingState,
  BulkActionBar,
  Button,
  EmptyState,
  GridView,
  Icon,
  LinkButton,
  ListingPage,
  ListView,
  SearchBox,
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
import { islandColor, LabelDot, ProtonShell, PT_PARAM, PT_ROUTES } from "./_proton"

export const meta = {
  title: "Proton · Index",
  group: "Design options",
  layout: "bare",
  order: 30,
  description:
    "Inspired by the Proton design system (Proton Mail): signature purple, warm-grey layers, dense mail-style rows with hover actions and coloured labels.",
}

/** New, untouched applications read as "unread" rows: bold, on the brighter surface. */
const isUnread = (a: Application) => a.status === "submitted"

/** A Proton label pill: coloured dot and name. */
function IslandLabel({ value, labels }: { value: string; labels: Labels }) {
  return (
    <span className="pt-label">
      <LabelDot color={islandColor(value)} className="size-2" />
      {labels.island(value)}
    </span>
  )
}

/** Hover actions that replace the date on a hovered or focused row (Proton Mail's item actions). */
function HoverActions({ a, labels, tr }: { a: Application; labels: Labels; tr: Tr }) {
  const name = labels.name(a)
  return (
    <span className="pt-hover-actions">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={tr(`Approve ${a.reference}`, `${a.reference} ފާސްކުރޭ`)}
        disabled={a.status === "approved"}
        onClick={() => {
          updateApplication(a.id, { status: "approved" })
          toast.success(tr(`${name}: approved`, `${name}: ފާސްކުރެވިއްޖެ`))
        }}
      >
        <Icon name="check" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={tr(`Assign ${a.reference} to me`, `${a.reference} އަޅުގަނޑާ ޙަވާލުކުރޭ`)}
        onClick={() => {
          updateApplication(a.id, { assignee: "shifa" })
          toast.success(tr(`${name}: assigned to you`, `${name}: ތިބާއާ ޙަވާލުކުރެވިއްޖެ`))
        }}
      >
        <Icon name="user" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={tr(`Move ${a.reference} to trash`, `${a.reference} ކުނިފޮށިއަށް`)}
        onClick={() => {
          trashApplications([a.id])
          toast.success(tr(`${name}: moved to trash`, `${name}: ކުނިފޮށިއަށް ލެވިއްޖެ`))
        }}
      >
        <Icon name="trash" />
      </Button>
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
      cell: (a) => (
        <span className={isUnread(a) ? "pt-row pt-row--unread" : "pt-row"}>
          <UserAvatar name={labels.name(a)} size="sm" decorative className="pt-sq" />
          <span className="min-w-0">
            <span className="pt-row__name block truncate">
              {isUnread(a) ? (
                <span className="pt-unread-dot" aria-hidden>
                  •
                </span>
              ) : null}
              {labels.name(a)}
              {isUnread(a) ? <span className="sr-only"> ({tr("new", "އައު")})</span> : null}
            </span>
            <span className="pt-row__sub block truncate">
              {labels.service(a.service)}
              <span aria-hidden> · </span>
              <span className="font-mono" dir="ltr">
                {a.reference}
              </span>
            </span>
          </span>
        </span>
      ),
    },
    {
      id: "island",
      header: tr("Label", "ލޭބަލް"),
      sortable: true,
      accessor: (a) => labels.island(a.island),
      cell: (a) => <IslandLabel value={a.island} labels={labels} />,
    },
    {
      id: "service",
      header: tr("Service", "ޚިދުމަތް"),
      sortable: true,
      accessor: (a) => labels.service(a.service),
    },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />,
    },
    {
      id: "assignee",
      header: tr("Assignee", "ޙަވާލުވި"),
      cell: (a) =>
        a.assignee ? (
          <span className="gap-2 inline-flex items-center whitespace-nowrap">
            <UserAvatar name={labels.staff(a.assignee)} size="xs" decorative className="pt-sq" />
            {labels.staff(a.assignee)}
          </span>
        ) : (
          <span className="text-muted-foreground">{tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}</span>
        ),
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
      header: tr("Received", "ލިބުނީ"),
      sortable: true,
      align: "end",
      cell: (a) => (
        <span className="pt-when">
          <span className="pt-when__date whitespace-nowrap">{labels.date(a.submitted)}</span>
          <HoverActions a={a} labels={labels} tr={tr} />
        </span>
      ),
    },
  ]
}

/** Proton's toolbar pagination: "1–10 of 149" with previous / next arrows. */
function ToolbarPager({
  page,
  perPage,
  total,
  onPage,
}: {
  page: number
  perPage: number
  total: number
  onPage: (page: number) => void
}) {
  const tr = useTr()
  const from = total ? (page - 1) * perPage + 1 : 0
  const to = Math.min(total, page * perPage)
  const last = Math.max(1, Math.ceil(total / perPage))
  return (
    <div className="pt-pager gap-0.5 md:flex hidden items-center">
      <span className="text-sm px-2 whitespace-nowrap text-muted-foreground tabular-nums">
        {tr(`${from}–${to} of ${total}`, `${total} ގެ ތެރެއިން ${from}–${to}`)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="pt-icon-btn"
        aria-label={tr("Previous page", "ކުރީ ސަފްހާ")}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        <Icon name="chevron-left" className="rtl:-scale-x-100" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="pt-icon-btn"
        aria-label={tr("Next page", "ދެން އޮތް ސަފްހާ")}
        disabled={page >= last}
        onClick={() => onPage(page + 1)}
      >
        <Icon name="chevron-right" className="rtl:-scale-x-100" />
      </Button>
    </div>
  )
}

export default function ProtonIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<ListingView>("table")
  const state = useListingState({
    paramPrefix: PT_PARAM,
    defaultState: { perPage: 10, sort: { id: "submitted", desc: true } },
    defaultColumnVisibility: { service: false },
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
      label: tr("Move to trash", "ކުނިފޮށިއަށް"),
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
        noun={labels.noun}
        search={state.search || undefined}
        filters={filters.filter((f) => state.filters[f.key] !== undefined).map((f) => f.label)}
        onClearSearch={state.search ? state.clearSearch : undefined}
        onClearFilters={state.isFiltered ? state.clearFilters : undefined}
      />
    ) : (
      <EmptyState
        noun={labels.noun}
        action={
          <LinkButton href={routes.adminRecords.create} startIcon="add">
            {tr("New application", "އައު އެޕްލިކޭޝަން")}
          </LinkButton>
        }
      />
    )

  const shared = {
    "aria-label": tr("Applications", "އެޕްލިކޭޝަންތައް"),
    items: rows,
    getName: (a: Application) => `${a.reference} (${labels.name(a)})`,
    title: (a: Application) => <span className={isUnread(a) ? "font-semibold" : "font-medium"}>{labels.name(a)}</span>,
    getHref: (a: Application) => showHref(a.id),
    itemActions: (a: Application) => itemActions(a, labels, tr),
    selection: state.selection,
    onSelectionChange: state.setSelection,
    empty,
  }

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
            description={(a) => (
              <span className="gap-x-2 flex flex-wrap">
                <span>{labels.service(a.service)}</span>
                <span className="text-xs font-mono" dir="ltr">
                  {a.reference}
                </span>
              </span>
            )}
            media={(a) => <UserAvatar name={labels.name(a)} decorative className="pt-sq" />}
            meta={(a) => (
              <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
                <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                <IslandLabel value={a.island} labels={labels} />
                <span className="tabular-nums">{labels.mvr(a.amount)}</span>
                <span className="text-muted-foreground">{labels.date(a.submitted)}</span>
              </span>
            )}
          />
        ) : (
          <GridView
            {...shared}
            minItemWidth="15rem"
            description={(a) => (
              <span className="text-xs font-mono" dir="ltr">
                {a.reference}
              </span>
            )}
            media={(a) => (
              <div className="pt-grid-media gap-2 flex size-full flex-col items-center justify-center">
                <Icon name="file-text" className="size-8" />
                <span className="text-xs font-semibold">{labels.service(a.service)}</span>
              </div>
            )}
            meta={(a) => (
              <span className="gap-2 text-sm grid w-full">
                <span className="gap-2 flex flex-wrap items-center justify-between">
                  <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                  <span className="tabular-nums">{labels.mvr(a.amount)}</span>
                </span>
                <IslandLabel value={a.island} labels={labels} />
              </span>
            )}
          />
        )}
      </div>
    )

  return (
    <ProtonShell
      breadcrumbs={[
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: PT_ROUTES.dashboard },
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް") },
      ]}
      search={
        <SearchBox
          landmark
          value={state.search}
          onSearch={state.setSearch}
          placeholder={tr("Search reference, name, ID card…", "ރެފަރެންސް، ނަން، އައިޑީ ކާޑު ހޯދާ…")}
          thaana={labels.dv}
          className="sm:max-w-none"
        />
      }
    >
      <ListingPage<Application>
        className="pt-listing"
        title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
        description={tr(
          `${count("submitted")} new · permit and licence applications from every island`,
          `${count("submitted")} އައު · ހުރިހާ ރަށްރަށުން ހުށަހަޅާފައިވާ ހުއްދައާއި ލައިސަންސް`,
        )}
        state={state}
        columns={columns(labels, tr)}
        data={rows}
        total={total}
        noun={labels.noun}
        density="compact"
        searchable={false}
        filters={view === "table" ? filters : applicationFilters(labels, tr, { trashed: false })}
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
        empty={empty}
        toolbarEnd={
          <>
            <ViewSwitcher
              views={["table", "list", "grid"]}
              value={view}
              onValueChange={(v) => {
                setView(v)
                state.clearSelection()
              }}
            />
            <ToolbarPager page={state.page} perPage={state.perPage} total={total} onPage={state.setPage} />
          </>
        }
      >
        {customView}
      </ListingPage>
    </ProtonShell>
  )
}
