import * as React from "react"
import {
  ActionMenu,
  applyListingState,
  Button,
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
  type ListingController,
  type ListingView,
} from "@javaabu/onu"
import { useExportRows, type ExportColumn } from "@javaabu/onu/export"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import {
  filterFns,
  searchFields,
  showHref,
  STAFF,
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
import {
  ATL_ROUTES,
  AtlassianShell,
  AtlAvatar,
  issueKey,
  Lozenge,
  PRIORITY_RANK,
  PriorityIcon,
  priorityLabel,
  priorityOf,
  STATUS_APPEARANCE,
  TypeIcon,
} from "./_atlassian"

export const meta = {
  title: "Atlassian · Index",
  group: "Design options",
  layout: "bare",
  order: 50,
  description:
    "Inspired by the Atlassian Design System (Jira, Confluence): a dense issue-list view with lozenges, issue keys, priority icons and quick filters.",
}

function columns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "service",
      header: tr("Type", "ބާވަތް"),
      sortable: true,
      className: "w-10",
      accessor: (a) => labels.service(a.service),
      cell: (a) => <TypeIcon service={a.service} label={labels.service(a.service)} />,
    },
    {
      id: "key",
      header: tr("Key", "ކީ"),
      sortable: true,
      primary: true,
      accessor: (a) => issueKey(a),
      className: "atl-key-cell whitespace-nowrap",
    },
    {
      id: "summary",
      header: tr("Summary", "ޚުލާސާ"),
      sortable: true,
      cell: (a) => (
        <span className="atl-summary">
          {labels.service(a.service)}
          <span className="text-muted-foreground"> · {labels.name(a)}</span>
        </span>
      ),
    },
    {
      id: "assignee",
      header: tr("Assignee", "ޙަވާލުވި"),
      sortable: true,
      cell: (a) =>
        a.assignee ? (
          <span className="gap-2 inline-flex items-center whitespace-nowrap">
            <AtlAvatar name={labels.staff(a.assignee)} size="xs" decorative />
            {labels.staff(a.assignee)}
          </span>
        ) : (
          <span className="gap-2 inline-flex items-center whitespace-nowrap text-muted-foreground">
            <span aria-hidden className="atl-avatar-empty">
              <Icon name="user" />
            </span>
            {tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}
          </span>
        ),
    },
    {
      id: "priority",
      header: tr("Priority", "ޕްރަޔޮރިޓީ"),
      sortable: true,
      cell: (a) => {
        const p = priorityOf(a)
        return (
          <span className="gap-1.5 inline-flex items-center whitespace-nowrap">
            <PriorityIcon priority={p} />
            {priorityLabel(p, tr)}
          </span>
        )
      },
    },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <Lozenge appearance={STATUS_APPEARANCE[a.status]}>{labels.status(a.status)}</Lozenge>,
    },
    { id: "island", header: tr("Island", "ރަށް"), sortable: true, accessor: (a) => labels.island(a.island) },
    {
      id: "amount",
      header: tr("Fee", "ފީ"),
      sortable: true,
      numeric: true,
      cell: (a) => <span className="whitespace-nowrap">{labels.mvr(a.amount)}</span>,
    },
    {
      id: "submitted",
      header: tr("Created", "ހެދި"),
      sortable: true,
      cell: (a) => <span className="whitespace-nowrap">{labels.date(a.submitted)}</span>,
    },
  ]
}

/** One Jira "basic search" filter button (Status ▾, Assignee ▾, Type ▾): checkboxes that apply at once. */
function QuickFilter({
  filterKey,
  label,
  options,
  state,
  tr,
}: {
  filterKey: string
  label: string
  options: { value: string; label: string }[]
  state: ListingController
  tr: Tr
}) {
  const value = state.filters[filterKey]
  const selected = Array.isArray(value) ? (value as string[]) : typeof value === "string" ? [value] : []
  const set = (v: string, on: boolean) => {
    const next = on ? [...selected, v] : selected.filter((x) => x !== v)
    state.setFilter(filterKey, next.length ? next : undefined)
  }
  return (
    <ActionMenu
      align="start"
      trigger={
        <Button variant="outline" className={selected.length ? "atl-quick atl-quick--on" : "atl-quick"}>
          {label}
          {selected.length ? (
            <span className="atl-quick__count">
              {selected.length}
              <span className="sr-only">{tr(" selected", " ހޮވިފަ")}</span>
            </span>
          ) : null}
          <Icon name="chevron-down" className="size-3.5" />
        </Button>
      }
      items={options.map((o) => ({
        type: "checkbox" as const,
        id: o.value,
        label: o.label,
        checked: selected.includes(o.value),
        onCheckedChange: (on: boolean) => set(o.value, on),
      }))}
    />
  )
}

/** Jira's avatar quick filter: toggle assignees by their faces. */
function AssigneeFaces({ state, labels, tr }: { state: ListingController; labels: Labels; tr: Tr }) {
  const value = state.filters.assignee
  const selected = Array.isArray(value) ? (value as string[]) : typeof value === "string" ? [value] : []
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    state.setFilter("assignee", next.length ? next : undefined)
  }
  return (
    <div role="group" aria-label={tr("Filter by assignee", "ޙަވާލުވި ފަރާތުން ފިލްޓަރ")} className="atl-faces">
      {STAFF.map((s) => {
        const name = labels.staff(s.value)
        const on = selected.includes(s.value)
        return (
          <button
            key={s.value}
            type="button"
            className="atl-face"
            aria-pressed={on}
            aria-label={name}
            title={name}
            onClick={() => toggle(s.value)}
          >
            <AtlAvatar name={name} size="sm" decorative />
          </button>
        )
      })}
    </div>
  )
}

export default function AtlassianIndexPage() {
  const tr = useTr()
  const labels = useLabels()
  const all = useAllApplications()
  const [view, setView] = React.useState<ListingView>("table")
  const state = useListingState({
    paramPrefix: "atl_",
    defaultState: { perPage: 25, sort: { id: "submitted", desc: true } },
    defaultColumnVisibility: { island: false },
  })

  const trashed = state.filters.trashed
  const source = all.filter((a) => (trashed === "only" ? a.deletedAt : trashed === "with" ? true : !a.deletedAt))
  const baseSort = sortValue(labels)
  const listingOptions = {
    searchFields: (a: Application) => [...searchFields(a), issueKey(a)],
    filterFns: { ...filterFns, email: emailFilter },
    sortValue: (a: Application, key: string): unknown =>
      key === "key"
        ? Number(a.id)
        : key === "summary"
          ? `${labels.service(a.service)} ${labels.name(a)}`
          : key === "priority"
            ? PRIORITY_RANK[priorityOf(a)]
            : key === "assignee"
              ? labels.staff(a.assignee) || "~"
              : baseSort(a, key),
    locale: labels.dv ? "dv" : "en",
  }
  const { rows, total } = applyListingState(source, state, listingOptions)
  const active = all.filter((a) => !a.deletedAt)
  const count = (s: ApplicationStatus) => active.filter((a) => a.status === s).length
  const filters = applicationFilters(labels, tr, { trashed: view === "table" })

  const exportRows = useExportRows()
  const exportColumns: ExportColumn<Application>[] = [
    { header: tr("Key", "ކީ"), accessor: (a) => issueKey(a) },
    { header: tr("Reference", "ރެފަރެންސް"), accessor: "reference" },
    { header: tr("Name", "ނަން"), accessor: (a) => labels.name(a) },
    { header: tr("Type", "ބާވަތް"), accessor: (a) => labels.service(a.service) },
    { header: tr("Priority", "ޕްރަޔޮރިޓީ"), accessor: (a) => priorityLabel(priorityOf(a), tr) },
    { header: tr("Status", "ސްޓޭޓަސް"), accessor: (a) => labels.status(a.status) },
    { header: tr("Assignee", "ޙަވާލުވި"), accessor: (a) => labels.staff(a.assignee) },
    { header: tr("Island", "ރަށް"), accessor: (a) => labels.island(a.island) },
    { header: tr("Fee", "ފީ"), accessor: "amount", type: "currency" },
    { header: tr("Created", "ހެދި"), accessor: "submitted", type: "date" },
  ]

  const bulkActions: BulkAction<string>[] = [
    {
      id: "status",
      label: tr("Transition", "ސްޓޭޓަސް ބަދަލުކުރޭ"),
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
    getName: (a: Application) => `${issueKey(a)} (${labels.name(a)})`,
    title: (a: Application) => labels.service(a.service),
    getHref: (a: Application) => showHref(a.id),
    itemActions: (a: Application) => itemActions(a, labels, tr),
    selection: state.selection,
    onSelectionChange: state.setSelection,
    empty,
  }

  const itemMeta = (a: Application) => {
    const p = priorityOf(a)
    return (
      <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
        <Lozenge appearance={STATUS_APPEARANCE[a.status]}>{labels.status(a.status)}</Lozenge>
        <span className="gap-1 inline-flex items-center">
          <PriorityIcon priority={p} />
          {priorityLabel(p, tr)}
        </span>
        {a.assignee ? (
          <span className="gap-1.5 inline-flex items-center">
            <AtlAvatar name={labels.staff(a.assignee)} size="xs" decorative />
            {labels.staff(a.assignee)}
          </span>
        ) : null}
      </span>
    )
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
            variant="cards"
            description={(a) => (
              <span className="gap-x-2 flex flex-wrap items-center">
                <span className="atl-key">{issueKey(a)}</span>
                <span>{labels.name(a)}</span>
              </span>
            )}
            media={(a) => <TypeIcon service={a.service} className="atl-type--lg" />}
            meta={itemMeta}
          />
        ) : (
          <GridView
            {...shared}
            minItemWidth="16rem"
            description={(a) => (
              <span className="gap-2 flex items-center">
                <TypeIcon service={a.service} />
                <span className="atl-key">{issueKey(a)}</span>
              </span>
            )}
            meta={itemMeta}
          />
        )}
      </div>
    )

  return (
    <AtlassianShell active="index">
      <div className="gap-3 grid">
        <Breadcrumbs
          items={[
            { label: tr("Projects", "ޕްރޮޖެކްޓްތައް"), href: ATL_ROUTES.dashboard },
            { label: tr("Permits Service Desk", "ހުއްދަތަކުގެ ޑެސްކު"), href: ATL_ROUTES.dashboard },
            { label: tr("Applications", "އެޕްލިކޭޝަންތައް") },
          ]}
          classNames={{ list: "atl-crumbs" }}
        />
        <ListingPage<Application>
          className="atl-listing"
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
          density="compact"
          filters={filters}
          searchPlaceholder={tr("Search applications", "އެޕްލިކޭޝަން ހޯދާ")}
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
          getRowName={(a) => `${issueKey(a)} (${labels.name(a)})`}
          getRowHref={(a) => showHref(a.id)}
          rowActions={(a) => itemActions(a, labels, tr)}
          toolbarEnd={
            <>
              <div className="atl-quickbar">
                <AssigneeFaces state={state} labels={labels} tr={tr} />
                <QuickFilter
                  filterKey="status"
                  label={tr("Status", "ސްޓޭޓަސް")}
                  options={labels.options.statuses}
                  state={state}
                  tr={tr}
                />
                <QuickFilter
                  filterKey="assignee"
                  label={tr("Assignee", "ޙަވާލުވި")}
                  options={[...labels.options.staff, { value: "none", label: tr("Unassigned", "ޙަވާލުނުކުރެވޭ") }]}
                  state={state}
                  tr={tr}
                />
                <QuickFilter
                  filterKey="service"
                  label={tr("Type", "ބާވަތް")}
                  options={labels.options.services}
                  state={state}
                  tr={tr}
                />
              </div>
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
    </AtlassianShell>
  )
}
