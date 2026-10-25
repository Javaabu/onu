import * as React from "react"
import { useNavigate } from "react-router"
import {
  applyListingState,
  BulkActionBar,
  EmptyState,
  Icon,
  LinkButton,
  ListingPage,
  ListView,
  SegmentedControl,
  Select,
  StatusBadge,
  toast,
  useListingState,
  useListingViewOptions,
  UserAvatar,
  useTranslation,
  type BulkAction,
  type ListingView,
  type RecordAction,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import {
  editHref,
  filterFns,
  searchFields,
  showHref,
  trashApplications,
  updateApplication,
  useApplications,
  useLabels,
  useTrashedApplications,
  wait,
  type Application,
  type Labels,
} from "./_data"
import { applicationFilters, emailFilter, sortValue, type Tr } from "./_ui"

const VIEW_ROUTES: Record<string, string> = {
  table: routes.adminRecords.indexTable,
  list: routes.adminRecords.indexList,
  grid: routes.adminRecords.indexGrid,
  kanban: routes.adminRecords.indexKanban,
}

/** Switches between the four index pages. */
export function ViewNav({ value }: { value: ListingView }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const views = useListingViewOptions()
  return (
    <SegmentedControl
      iconOnly
      size="sm"
      aria-label={t("listing.view")}
      options={views}
      value={value}
      onValueChange={(view) => {
        const to = VIEW_ROUTES[view]
        if (to) void navigate(to)
      }}
    />
  )
}

export function NewApplicationButton() {
  const tr = useTr()
  return (
    <LinkButton href={routes.adminRecords.create} startIcon="add">
      {tr("New application", "އައު އެޕްލިކޭޝަން")}
    </LinkButton>
  )
}

/** ⋯ menu items for an application. */
export function itemActions(a: Application, labels: Labels, tr: Tr): RecordAction[] {
  return [
    { id: "view", label: tr("View", "ބައްލަވާ"), icon: "eye", href: showHref(a.id) },
    { id: "edit", label: tr("Edit", "އެޑިޓް"), icon: "edit", href: editHref(a.id) },
    {
      id: "approve",
      label: tr("Approve", "ފާސްކުރޭ"),
      icon: "success",
      permitted: a.status === "submitted" || a.status === "in_review",
      onSelect: async () => {
        await wait(400)
        updateApplication(a.id, { status: "approved" })
        toast.success(tr(`${a.reference} approved`, `${a.reference} ފާސްކުރެވިއްޖެ`))
      },
    },
    {
      id: "delete",
      label: tr("Delete", "ފޮހެލާ"),
      icon: "trash",
      destructive: true,
      separator: true,
      onSelect: async () => {
        await wait(400)
        trashApplications([a.id])
        toast(tr("Moved to trash", "ކުނިފޮށިއަށް ލެވިއްޖެ"), { description: a.reference })
      },
    },
  ]
}

const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

/** The list and grid index pages: same toolbar, filters and pagination as the table page. */
export function CollectionIndex({ view }: { view: "list" | "grid" }) {
  const tr = useTr()
  const labels = useLabels()
  const active = useApplications()
  const trashed = useTrashedApplications()
  const state = useListingState({
    paramPrefix: `${view}_`,
    defaultState: { perPage: view === "grid" ? 12 : 10, sort: { id: "submitted", desc: true } },
  })
  const filters = applicationFilters(labels, tr, { trashed: false })
  const { rows, total } = applyListingState(active, state, {
    searchFields,
    filterFns: { ...filterFns, email: emailFilter },
    sortValue: sortValue(labels),
    locale: labels.dv ? "dv" : "en",
  })

  const bulkActions: BulkAction<unknown>[] = [
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

  const sortOptions = [
    { value: "submitted:desc", label: tr("Newest first", "އެންމެ އައު ފުރަތަމަ") },
    { value: "submitted:asc", label: tr("Oldest first", "އެންމެ ކުރީގެ ފުރަތަމަ") },
    { value: "amount:desc", label: tr("Highest amount", "އެންމެ ބޮޑު އަދަދު") },
    { value: "name:asc", label: tr("Applicant A–Z", "އެޕްލިކަންޓް (ހ-ޗ)") },
  ]
  const sortKey = state.sort ? `${state.sort.id}:${state.sort.desc ? "desc" : "asc"}` : "submitted:desc"

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
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
        { label: view === "list" ? tr("List view", "ލިސްޓް") : tr("Grid view", "ގްރިޑް") },
      ]}
    >
      <ListingPage<Application>
        title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
        description={
          view === "list"
            ? tr("Newest applications first, as a list.", "އެންމެ އައު އެޕްލިކޭޝަންތައް ފުރަތަމަ، ލިސްޓެއްގެ ގޮތުގައި.")
            : tr("Applications as cards.", "އެޕްލިކޭޝަންތައް ކާޑުތަކެއްގެ ގޮތުގައި.")
        }
        state={state}
        columns={[]}
        data={rows}
        total={total}
        perPageOptions={view === "grid" ? [12, 24, 48] : [10, 25, 50, 100]}
        noun={labels.noun}
        filters={filters}
        searchPlaceholder={tr("Reference, name, ID card…", "ރެފަރެންސް، ނަން، އައިޑީ ކާޑު…")}
        searchThaana={labels.dv}
        primaryAction={<NewApplicationButton />}
        trashHref={routes.adminRecords.trash}
        trashHasItems={trashed.length > 0}
        toolbarEnd={
          <>
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
            <ViewNav value={view} />
          </>
        }
      >
        <div className="gap-4 grid">
          <BulkActionBar
            selected={state.selection}
            actions={bulkActions}
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
              media={(a) => <UserAvatar name={labels.name(a)} />}
              meta={(a) => (
                <span className="gap-x-3 gap-y-1 text-sm flex flex-wrap items-center">
                  <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                  <span className="text-muted-foreground">{labels.island(a.island)}</span>
                  <span className="tabular-nums">{labels.mvr(a.amount)}</span>
                  <span className="text-muted-foreground">{labels.date(a.submitted)}</span>
                </span>
              )}
            />
          ) : (
            <ListView
              layout="grid"
              {...shared}
              minItemWidth="15rem"
              description={(a) => <span className="text-xs font-mono">{a.reference}</span>}
              media={(a) => (
                <div className="gap-2 flex size-full flex-col items-center justify-center bg-muted/60 text-muted-foreground">
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
      </ListingPage>
    </AdminShell>
  )
}
