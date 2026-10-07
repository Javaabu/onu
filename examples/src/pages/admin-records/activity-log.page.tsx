import * as React from "react"
import {
  ActivityFeed,
  applyListingState,
  Card,
  ConditionalLink,
  ListingPage,
  Pagination,
  RelativeDate,
  SegmentedControl,
  StatusBadge,
  useListingState,
  UserAvatar,
  type DataTableColumn,
  type FilterDefinition,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { showHref, useAllApplications, useLabels, type Application, type Labels } from "./_data"
import type { Tr } from "./_ui"

export const meta = {
  title: "Activity log",
  group: "Admin: records",
  layout: "bare",
  order: 11,
}

type EventType = "created" | "payment" | "status" | "deleted" | "assigned"

interface LogEntry {
  id: string
  at: string
  date: string
  event: EventType
  causer: string | null
  record: Application
  detail: string
}

function buildLog(apps: Application[], labels: Labels, tr: Tr): LogEntry[] {
  const out: LogEntry[] = []
  for (const a of apps) {
    out.push({
      id: `${a.id}-c`,
      at: `${a.submitted}T08:${String(Number(a.id) % 60).padStart(2, "0")}:00`,
      date: a.submitted,
      event: "created",
      causer: null,
      record: a,
      detail: tr(`Submitted by ${a.name}`, `ހުށަހެޅީ ${a.nameDv}`),
    })
    out.push({
      id: `${a.id}-p`,
      at: `${a.submitted}T09:${String(Number(a.id) % 60).padStart(2, "0")}:00`,
      date: a.submitted,
      event: "payment",
      causer: null,
      record: a,
      detail: labels.mvr(a.amount),
    })
    if (a.assignee)
      out.push({
        id: `${a.id}-a`,
        at: `${a.updated}T10:05:00`,
        date: a.updated,
        event: "assigned",
        causer: "shifa",
        record: a,
        detail: tr(`Assigned to ${labels.staff(a.assignee)}`, `ޙަވާލުކުރީ ${labels.staff(a.assignee)}`),
      })
    if (a.status !== "submitted")
      out.push({
        id: `${a.id}-s`,
        at: `${a.updated}T14:${String(Number(a.id) % 60).padStart(2, "0")}:00`,
        date: a.updated,
        event: "status",
        causer: a.assignee ?? "nazeer",
        record: a,
        detail: tr(`Status changed to ${labels.status(a.status)}`, `ސްޓޭޓަސް: ${labels.status(a.status)}`),
      })
    if (a.deletedAt)
      out.push({
        id: `${a.id}-d`,
        at: `${a.deletedAt}T16:00:00`,
        date: a.deletedAt,
        event: "deleted",
        causer: "shifa",
        record: a,
        detail: tr("Moved to trash", "ކުނިފޮށިއަށް ލެވުނު"),
      })
  }
  return out
}

export default function ActivityLogPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useAllApplications()
  const [view, setView] = React.useState("table")
  const log = React.useMemo(() => buildLog(apps, labels, tr), [apps, labels, tr])
  const state = useListingState({ paramPrefix: "log_", defaultState: { perPage: 25, sort: { id: "at", desc: true } } })

  const eventLabels: Record<EventType, string> = {
    created: tr("Created", "އުފެއްދި"),
    payment: tr("Payment", "ފައިސާ"),
    status: tr("Status change", "ސްޓޭޓަސް ބަދަލު"),
    assigned: tr("Assigned", "ޙަވާލުކުރި"),
    deleted: tr("Deleted", "ފޮހެލި"),
  }
  const eventTone: Record<EventType, "info" | "success" | "warning" | "danger" | "neutral"> = {
    created: "info",
    payment: "success",
    status: "warning",
    assigned: "neutral",
    deleted: "danger",
  }
  const causerName = (c: string | null) => (c ? labels.staff(c) : tr("System", "ސިސްޓަމް"))

  const filters: FilterDefinition[] = [
    {
      type: "select",
      key: "event",
      label: tr("Event", "ހާދިސާ"),
      options: (Object.keys(eventLabels) as EventType[]).map((v) => ({ value: v, label: eventLabels[v] })),
    },
    {
      type: "select",
      key: "causer",
      label: tr("User", "ބޭނުންކުރި މީހާ"),
      options: [...labels.options.staff, { value: "system", label: tr("System", "ސިސްޓަމް") }],
    },
    { type: "date-range", key: "date", label: tr("Date", "ތާރީޚް") },
  ]
  const { rows, total } = applyListingState(log, state, {
    searchFields: (e) => [e.record.reference, e.record.name, e.record.nameDv, e.detail],
    filterFns: {
      event: (e, v) => (Array.isArray(v) ? v.includes(e.event) : e.event === v),
      causer: (e, v) => (Array.isArray(v) ? v.includes(e.causer ?? "system") : (e.causer ?? "system") === v),
      date: (e, v) => {
        const r = v as { from?: string; to?: string }
        return (!r.from || e.date >= r.from) && (!r.to || e.date <= r.to)
      },
    },
    locale: labels.dv ? "dv" : "en",
  })

  const columns: DataTableColumn<LogEntry>[] = [
    {
      id: "at",
      header: tr("When", "ވަގުތު"),
      sortable: true,
      cell: (e) => <RelativeDate value={e.at} />,
    },
    {
      id: "causer",
      header: tr("User", "ބޭނުންކުރި މީހާ"),
      cell: (e) => (
        <span className="gap-2 inline-flex items-center whitespace-nowrap">
          <UserAvatar name={causerName(e.causer)} size="xs" />
          {causerName(e.causer)}
        </span>
      ),
    },
    {
      id: "event",
      header: tr("Event", "ހާދިސާ"),
      cell: (e) => (
        <StatusBadge status={eventTone[e.event]} size="sm">
          {eventLabels[e.event]}
        </StatusBadge>
      ),
    },
    {
      id: "record",
      header: tr("Record", "ރެކޯޑު"),
      primary: true,
      accessor: (e) => e.record.reference,
      className: "font-mono text-xs whitespace-nowrap",
    },
    { id: "detail", header: tr("Details", "ތަފްޞީލު"), accessor: (e) => e.detail },
  ]

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
        { label: tr("Activity log", "އެކްޓިވިޓީ ލޮގް") },
      ]}
    >
      <ListingPage<LogEntry>
        title={tr("Activity log", "އެކްޓިވިޓީ ލޮގް")}
        description={tr("Every change to applications, newest first.", "އެޕްލިކޭޝަންތަކަށް ގެނެވުނު ހުރިހާ ބަދަލެއް.")}
        state={state}
        columns={columns}
        data={rows}
        total={total}
        noun={labels.dv ? { one: "ހާދިސާ", other: "ހާދިސާ" } : { one: "event", other: "events" }}
        filters={filters}
        searchPlaceholder={tr("Reference or name…", "ރެފަރެންސް ނުވަތަ ނަން…")}
        searchThaana={labels.dv}
        getRowName={(e) => `${e.record.reference} ${eventLabels[e.event]}`}
        getRowHref={(e) => showHref(e.record.id)}
        onExport={() => new Promise((r) => setTimeout(r, 1000))}
        exportOptions={["csv", "excel"]}
        toolbarEnd={
          <SegmentedControl
            aria-label={tr("Show as", "ދައްކާނީ")}
            value={view}
            onValueChange={setView}
            options={[
              { value: "table", label: tr("Table", "ޓޭބަލް") },
              { value: "feed", label: tr("Feed", "ފީޑް") },
            ]}
          />
        }
      >
        {view === "feed" ? (
          <div className="gap-4 grid">
            <Card>
              <ActivityFeed
                title={null}
                emptyText={tr("No events match your filters.", "ފިލްޓަރަށް ދިމާވާ އެއްވެސް ހާދިސާއެއް ނެތް.")}
                items={rows.map((e) => ({
                  id: e.id,
                  actor: e.causer ? { name: causerName(e.causer) } : null,
                  icon: e.causer ? undefined : e.event === "payment" ? "credit-card" : "file-text",
                  action: (
                    <>
                      {e.detail} ·{" "}
                      <ConditionalLink href={showHref(e.record.id)} className="text-xs font-mono underline">
                        {e.record.reference}
                      </ConditionalLink>
                    </>
                  ),
                  timestamp: e.at,
                }))}
              />
            </Card>
            <Pagination
              page={state.page}
              perPage={state.perPage}
              total={total}
              noun={labels.dv ? { one: "ހާދިސާ", other: "ހާދިސާ" } : { one: "event", other: "events" }}
              onPageChange={state.setPage}
              onPerPageChange={state.setPerPage}
            />
          </div>
        ) : undefined}
      </ListingPage>
    </AdminShell>
  )
}
