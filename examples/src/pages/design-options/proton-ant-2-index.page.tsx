import * as React from "react"
import {
  applyListingState,
  ActiveFilterChips,
  BulkActionBar,
  Button,
  Card,
  ColumnVisibility,
  ConditionalLink,
  DataTable,
  EmptyState,
  ExportMenu,
  FilterPanel,
  FilterTabs,
  GridView,
  Icon,
  Label,
  LinkButton,
  ListView,
  Pagination,
  Select,
  StatusBadge,
  Tag,
  SearchBox,
  TextInput,
  toast,
  useListingState,
  UserAvatar,
  ViewSwitcher,
  type BulkAction,
  type DataTableColumn,
  type FilterValues,
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
import { islandColor, LabelDot, PA2_PARAM, PA2_ROUTES, ProtonAnt2Shell } from "./_proton-ant-2"

export const meta = {
  title: "ProtonAnt 2 · Index",
  group: "Design options",
  layout: "bare",
  order: 62,
  description: "ProtonAnt with Ant Design's dark sidebar colours",
}

const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

/** An Ant `Tag` for the status: a bordered, tinted label (blue, gold, green, red, orange). */
function StatusTag({ status, labels }: { status: ApplicationStatus; labels: Labels }) {
  return <StatusBadge status={status} statusMap={labels.statusMap} size="sm" icon={false} className="pa2-tag" />
}

function columns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      sortable: true,
      cell: (a) => (
        <ConditionalLink href={showHref(a.id)} className="pa2-link whitespace-nowrap">
          {a.reference}
        </ConditionalLink>
      ),
    },
    {
      id: "name",
      header: tr("Applicant", "އެޕްލިކަންޓް"),
      sortable: true,
      primary: true,
      accessor: (a) => labels.name(a),
      cell: (a) => <span className="whitespace-nowrap">{labels.name(a)}</span>,
    },
    {
      id: "service",
      header: tr("Service", "ޚިދުމަތް"),
      sortable: true,
      accessor: (a) => labels.service(a.service),
      cell: (a) => <span className="whitespace-nowrap">{labels.service(a.service)}</span>,
    },
    {
      id: "island",
      header: tr("Island", "ރަށް"),
      sortable: true,
      accessor: (a) => labels.island(a.island),
      cell: (a) => (
        <span className="gap-2 inline-flex items-center whitespace-nowrap">
          <LabelDot color={islandColor(a.island)} className="size-2" />
          {labels.island(a.island)}
        </span>
      ),
    },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <StatusTag status={a.status} labels={labels} />,
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
      cell: (a) => <span className="whitespace-nowrap tabular-nums">{labels.date(a.submitted)}</span>,
    },
    {
      id: "assignee",
      header: tr("Assignee", "ޙަވާލުވި"),
      cell: (a) =>
        a.assignee ? (
          <span className="gap-2 inline-flex items-center whitespace-nowrap">
            <UserAvatar name={labels.staff(a.assignee)} size="xs" decorative classNames={{ fallback: "pa2-avatar" }} />
            {labels.staff(a.assignee)}
          </span>
        ) : (
          <span className="pa2-badge-status" data-tone="default">
            {tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}
          </span>
        ),
    },
  ]
}

const QUERY_KEYS = ["service", "island", "assignee", "email"] as const
type Draft = { q: string } & Partial<Record<(typeof QUERY_KEYS)[number], string>>

/**
 * ProTable's QueryFilter: labelled fields in a grid with Reset / Query and an
 * Expand toggle. It edits a draft and applies it to the listing on Query.
 */
function QueryFilter({
  labels,
  tr,
  search,
  filters,
  onQuery,
}: {
  labels: Labels
  tr: Tr
  search: string
  filters: FilterValues
  onQuery: (search: string, filters: FilterValues) => void
}) {
  const fromState = (): Draft => {
    const d: Draft = { q: search }
    for (const k of QUERY_KEYS) if (typeof filters[k] === "string") d[k] = filters[k] as string
    return d
  }
  const [draft, setDraft] = React.useState<Draft>(fromState)
  const [expanded, setExpanded] = React.useState(false)
  const id = React.useId()

  // Keep the form in step when chips, tabs or Reset change the listing (adjusting state while rendering).
  const signature = JSON.stringify([search, filters])
  const [seen, setSeen] = React.useState(signature)
  if (seen !== signature) {
    setSeen(signature)
    setDraft(fromState())
  }

  const apply = (d: Draft) => {
    const next: FilterValues = { ...filters }
    for (const k of QUERY_KEYS) {
      if (d[k]) next[k] = d[k]
      else delete next[k]
    }
    onQuery(d.q.trim(), next)
  }
  const set = (key: keyof Draft) => (value: string | undefined) => setDraft((d) => ({ ...d, [key]: value ?? "" }))

  const fields = [
    {
      key: "service",
      label: tr("Service", "ޚިދުމަތް"),
      control: (
        <Select
          id={`${id}-service`}
          options={labels.options.services}
          value={draft.service ?? ""}
          onValueChange={set("service")}
          placeholder={tr("Please select", "އިޚްތިޔާރުކުރައްވާ")}
          clearable
        />
      ),
    },
    {
      key: "island",
      label: tr("Island", "ރަށް"),
      control: (
        <Select
          id={`${id}-island`}
          options={labels.options.islands}
          value={draft.island ?? ""}
          onValueChange={set("island")}
          placeholder={tr("Please select", "އިޚްތިޔާރުކުރައްވާ")}
          clearable
        />
      ),
    },
    {
      key: "assignee",
      label: tr("Assignee", "ޙަވާލުވި"),
      control: (
        <Select
          id={`${id}-assignee`}
          options={[...labels.options.staff, { value: "none", label: tr("Unassigned", "ޙަވާލުނުކުރެވޭ") }]}
          value={draft.assignee ?? ""}
          onValueChange={set("assignee")}
          placeholder={tr("Please select", "އިޚްތިޔާރުކުރައްވާ")}
          clearable
        />
      ),
    },
    {
      key: "email",
      label: tr("Email", "އީމެއިލް"),
      control: (
        <TextInput
          id={`${id}-email`}
          value={draft.email ?? ""}
          onChange={(e) => set("email")(e.target.value)}
          placeholder="gmail.com"
          dir="ltr"
        />
      ),
    },
  ]
  const visible = expanded ? fields : fields.slice(0, 3)

  return (
    <Card className="pa2-card pa2-query" padded={false}>
      <form
        className="pa2-query__form"
        aria-label={tr("Query applications", "އެޕްލިކޭޝަން ހޯދާ")}
        onSubmit={(e) => {
          e.preventDefault()
          apply(draft)
        }}
      >
        {visible.map((f) => (
          <div key={f.key} className="pa2-form-item">
            <Label htmlFor={`${id}-${f.key}`} className="pa2-form-item__label">
              {f.label}
            </Label>
            <div className="pa2-form-item__control">{f.control}</div>
          </div>
        ))}
        <div className="pa2-query__actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // The header search keeps its own value; Reset clears the query fields.
              const empty: Draft = { q: search }
              setDraft(empty)
              apply(empty)
            }}
          >
            {tr("Reset", "ރީސެޓް")}
          </Button>
          <Button type="submit">{tr("Query", "ހޯދާ")}</Button>
          <Button
            type="button"
            variant="link"
            className="pa2-query__toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            endIcon={expanded ? "chevron-up" : "chevron-down"}
          >
            {expanded ? tr("Collapse", "ކުޑަކުރޭ") : tr("Expand", "ފުޅާކުރޭ")}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default function ProtonAnt2IndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<ListingView>("table")
  const state = useListingState({
    paramPrefix: PA2_PARAM,
    defaultState: { perPage: 10, sort: { id: "submitted", desc: true } },
    defaultColumnVisibility: { service: false, assignee: false },
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
  // The query form covers the everyday fields; the Filters panel keeps dates and deleted records.
  const panelFilters = filters.filter((f) => f.key === "date" || f.key === "trashed")

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
    title: (a: Application) => <span className="font-medium">{labels.name(a)}</span>,
    getHref: (a: Application) => showHref(a.id),
    itemActions: (a: Application) => itemActions(a, labels, tr),
    selection: state.selection,
    onSelectionChange: state.setSelection,
    empty,
  }

  const tabs = [
    { value: "all", label: tr("All", "ހުރިހާ"), count: active.length },
    { value: "submitted", label: labels.status("submitted"), count: count("submitted") },
    { value: "in_review", label: labels.status("in_review"), count: count("in_review") },
    { value: "approved", label: labels.status("approved"), count: count("approved") },
    { value: "rejected", label: labels.status("rejected"), count: count("rejected") },
  ]
  const tabValue = typeof state.filters.status === "string" ? state.filters.status : "all"
  const listId = React.useId()

  return (
    <ProtonAnt2Shell
      breadcrumbs={[
        { label: tr("Home", "ފުރަތަމަ ސަފްހާ"), href: PA2_ROUTES.dashboard },
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: PA2_ROUTES.index },
        { label: tr("Application list", "އެޕްލިކޭޝަން ލިސްޓު") },
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
      title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
      tags={
        <Tag size="sm" className="pa2-tag pa2-tag--brand">
          {tr(`${count("submitted") + count("in_review")} open`, `${count("submitted") + count("in_review")} ހުޅުވިފަ`)}
        </Tag>
      }
      extra={
        <>
          <LinkButton href={routes.adminRecords.trash} variant="outline" startIcon="trash">
            {tr("Trash", "ކުނިފޮށި")}
          </LinkButton>
          {newButton}
        </>
      }
      content={
        <div className="pa2-page-header__desc">
          <p>
            {tr(
              "Permit and licence applications from every island. Use the query form to narrow the list.",
              "ހުރިހާ ރަށްރަށުން ހުށަހަޅާފައިވާ ހުއްދައާއި ލައިސަންސްގެ އެޕްލިކޭޝަންތައް.",
            )}
          </p>
          <dl className="pa2-header-stats">
            <div>
              <dt>{tr("In review", "ރިވިއުކުރަނީ")}</dt>
              <dd className="tabular-nums">{count("in_review")}</dd>
            </div>
            <div>
              <dt>{tr("Approved", "ފާސްކުރެވިފަ")}</dt>
              <dd className="tabular-nums">{count("approved")}</dd>
            </div>
            <div>
              <dt>{tr("Fees approved", "ފާސްވި ފީ")}</dt>
              <dd className="tabular-nums" dir="ltr">
                {labels.mvr(fees)}
              </dd>
            </div>
          </dl>
        </div>
      }
      footer={
        <FilterTabs
          tabs={tabs}
          value={tabValue}
          controls={listId}
          className="pa2-tabs"
          onValueChange={(value) => state.setFilter("status", value === "all" ? undefined : value)}
        />
      }
    >
      <div className="gap-4 grid">
        <QueryFilter
          labels={labels}
          tr={tr}
          search={state.search}
          filters={state.filters}
          onQuery={(search, next) => {
            state.setSearch(search)
            state.setFilters(next)
          }}
        />

        <Card className="pa2-card pa2-table-card" padded={false}>
          <div className="pa2-table-card__toolbar">
            <h2 className="pa2-table-card__title">{tr("Application list", "އެޕްލިކޭޝަން ލިސްޓު")}</h2>
            <div className="pa2-table-card__tools">
              <FilterPanel
                filters={panelFilters}
                value={state.filters}
                onApply={(values) => state.setFilters({ ...state.filters, ...values })}
              />
              <ExportMenu
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
              />
              {view === "table" ? (
                <ColumnVisibility
                  columns={columns(labels, tr)}
                  value={state.columnVisibility}
                  onValueChange={state.setColumnVisibility}
                />
              ) : null}
              <span className="pa2-divider-v" aria-hidden />
              <ViewSwitcher
                views={["table", "list", "grid"]}
                value={view}
                onValueChange={(v) => {
                  setView(v)
                  state.clearSelection()
                }}
              />
            </div>
          </div>

          <ActiveFilterChips
            filters={filters}
            value={state.filters}
            onRemove={state.removeFilter}
            onClearAll={state.clearFilters}
            classNames={{ list: "pa2-chips" }}
          />

          <div id={listId} className="pa2-table-card__body @container">
            {view === "table" ? (
              <DataTable<Application>
                className="pa2-table"
                caption={tr("Applications", "އެޕްލިކޭޝަންތައް")}
                columns={columns(labels, tr)}
                data={rows}
                total={total}
                state={state}
                noun={labels.noun}
                filters={filters}
                trash={trashed === "only"}
                perPageOptions={[10, 20, 50]}
                bulkActions={bulkActions as BulkAction<unknown>[]}
                onBulkSuccess={(message) => toast.success(message)}
                getRowName={(a) => `${a.reference} (${labels.name(a)})`}
                getRowHref={(a) => showHref(a.id)}
                rowActions={(a) => itemActions(a, labels, tr)}
                emptyAction={newButton}
                empty={state.search || state.isFiltered ? empty : undefined}
                pagination={false}
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
                    {...shared}
                    description={(a) => (
                      <span className="gap-x-2 flex flex-wrap">
                        <span>{a.reference}</span>
                        <span>{labels.service(a.service)}</span>
                      </span>
                    )}
                    media={(a) => (
                      <UserAvatar name={labels.name(a)} decorative classNames={{ fallback: "pa2-avatar" }} />
                    )}
                    meta={(a) => (
                      <span className="gap-x-3 gap-y-1 flex flex-wrap items-center">
                        <StatusTag status={a.status} labels={labels} />
                        <span className="text-muted-foreground">{labels.island(a.island)}</span>
                        <span className="tabular-nums">{labels.mvr(a.amount)}</span>
                      </span>
                    )}
                  />
                ) : (
                  <GridView
                    {...shared}
                    minItemWidth="15rem"
                    description={(a) => <span>{a.reference}</span>}
                    media={(a) => (
                      <div className="pa2-grid-cover">
                        <Icon name={SERVICE_ICONS[a.service] ?? "file"} className="size-7" />
                        <span>{labels.service(a.service)}</span>
                      </div>
                    )}
                    meta={(a) => (
                      <span className="gap-2 flex w-full flex-wrap items-center justify-between">
                        <StatusTag status={a.status} labels={labels} />
                        <span className="tabular-nums">{labels.mvr(a.amount)}</span>
                      </span>
                    )}
                  />
                )}
              </div>
            )}
            {rows.length ? (
              <Pagination
                numbered
                page={state.page}
                perPage={state.perPage}
                total={total}
                onPageChange={state.setPage}
                onPerPageChange={state.setPerPage}
                perPageOptions={view === "grid" ? [12, 24, 48] : [10, 20, 50]}
                noun={labels.noun}
                className="pa2-pagination"
              />
            ) : null}
          </div>
        </Card>
      </div>
    </ProtonAnt2Shell>
  )
}
