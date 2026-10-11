import * as React from "react"
import {
  Breadcrumbs,
  ConditionalLink,
  DataTable,
  Icon,
  LinkButton,
  ProgressBar,
  SegmentedControl,
  Timeline,
  type DataTableColumn,
  type TimelineItem,
} from "@javaabu/onu"
import { BarChart, StatTile, StatTiles, TimeSeriesChart } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { SERVICES, showHref, TODAY, useApplications, useLabels, type Application } from "../admin-records/_data"
import { KUMO_NOW, KUMO_ROUTES, KumoAvatar, KumoBadge, KumoShell, LayerCard, MonoId, STATUS_TONE } from "./_kumo"

export const meta = {
  title: "Kumo · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 71,
  description:
    "Inspired by Kumo UI, Cloudflare's design system: an account home with an analytics strip, layered cards, usage meters, system status and a recent-applications table.",
}

const DAY = 86_400_000
const dayString = (t: number) => new Date(t).toISOString().slice(0, 10)

export default function KumoDashboardPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const [range, setRange] = React.useState("30d")
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30

  const today = Date.parse(`${TODAY}T00:00:00Z`)
  const at = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)
  const within = (iso: string, from: number, to = 0) => at(iso) > today - from * DAY && at(iso) <= today - to * DAY
  const closed = (a: Application) => a.status === "approved" || a.status === "rejected"

  const received = apps.filter((a) => within(a.submitted, days))
  const receivedPrev = apps.filter((a) => within(a.submitted, days * 2, days))
  const approved = apps.filter((a) => a.status === "approved" && within(a.updated, days))
  const approvedPrev = apps.filter((a) => a.status === "approved" && within(a.updated, days * 2, days))
  const fees = received.reduce((sum, a) => sum + a.amount, 0)
  const feesPrev = receivedPrev.reduce((sum, a) => sum + a.amount, 0)
  const open = apps.filter((a) => !closed(a))

  // Buckets for the selected range: daily for 7 days, 3-day for 30, weekly for 90.
  const step = days > 30 ? 7 : days > 7 ? 3 : 1
  const buckets = Math.ceil(days / step)
  const series = Array.from({ length: buckets }, (_, i) => {
    const end = today - (buckets - 1 - i) * step * DAY
    const inBucket = (iso: string) => at(iso) > end - step * DAY && at(iso) <= end
    return {
      date: dayString(end - (step - 1) * DAY),
      received: apps.filter((a) => inBucket(a.submitted)).length,
      approved: apps.filter((a) => a.status === "approved" && inBucket(a.updated)).length,
    }
  })
  const spark = (key: "received" | "approved") => series.slice(-14).map((d) => ({ value: d[key] }))

  const byService = SERVICES.map((s) => ({
    service: labels.dv ? s.dv : s.en,
    open: open.filter((a) => a.service === s.value).length,
    closed: apps.filter((a) => a.service === s.value && closed(a)).length,
  })).sort((a, b) => b.open + b.closed - (a.open + a.closed))

  const recent = [...apps].sort((a, b) => b.submitted.localeCompare(a.submitted)).slice(0, 6)

  const recentColumns: DataTableColumn<Application>[] = [
    {
      id: "name",
      header: tr("Applicant", "އެޕްލިކަންޓް"),
      primary: true,
      accessor: (a) => labels.name(a),
      className: "kumo-name-cell",
    },
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      cell: (a) => (
        <MonoId value={a.reference} label={tr(`reference ${a.reference}`, `ރެފަރެންސް ${a.reference}`)} tr={tr} />
      ),
    },
    {
      id: "service",
      header: tr("Service", "ޚިދުމަތް"),
      cell: (a) => <span className="whitespace-nowrap">{labels.service(a.service)}</span>,
    },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      cell: (a) => <KumoBadge tone={STATUS_TONE[a.status]}>{labels.status(a.status)}</KumoBadge>,
    },
    {
      id: "submitted",
      header: tr("Submitted", "ހުށަހެޅި"),
      cell: (a) => <span className="kumo-subtle whitespace-nowrap">{labels.date(a.submitted)}</span>,
    },
  ]

  const activity: TimelineItem[] = [...apps]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .slice(0, 5)
    .map((a, i) => ({
      id: a.id,
      title: (
        <span>
          {a.assignee ? labels.staff(a.assignee) : labels.name(a)}{" "}
          <span className="kumo-subtle">
            {a.status === "approved"
              ? tr("approved", "ފާސްކުރެއްވި")
              : a.status === "rejected"
                ? tr("rejected", "ރިޖެކްޓްކުރެއްވި")
                : tr("updated", "އަޕްޑޭޓްކުރެއްވި")}
          </span>{" "}
          <ConditionalLink href={showHref(a.id)} className="kumo-link kumo-link--inline">
            {a.reference}
          </ConditionalLink>
        </span>
      ),
      time: `${a.updated}T${String(16 - (i % 7)).padStart(2, "0")}:${i % 2 ? "15" : "40"}:00Z`,
      status: a.status === "approved" ? "success" : a.status === "rejected" ? "error" : "default",
    }))

  const usage = [
    { id: "quota", label: tr("Monthly processing quota", "މަހުގެ ކޯޓާ"), value: 7420, max: 10000, unit: "" },
    { id: "storage", label: tr("Document storage", "ޑޮކިއުމެންޓް ސްޓޯރޭޖް"), value: 38.6, max: 50, unit: " GB" },
    { id: "sms", label: tr("SMS notifications", "އެސްއެމްއެސް"), value: 4100, max: 5000, unit: "" },
  ]

  const services = [
    { id: "portal", name: tr("Public portal", "ޕަބްލިކް ޕޯޓަލް"), ok: true },
    { id: "payments", name: tr("Payments gateway", "ފައިސާ ދެއްކުން"), ok: true },
    { id: "sms", name: tr("SMS delivery", "އެސްއެމްއެސް"), ok: false },
    { id: "id", name: tr("eFaas sign-in", "އީފާސް ލޮގިން"), ok: true },
  ]

  const rangeLabel = tr(`Previous ${days} days`, `ކުރީގެ ${days} ދުވަސް`)

  return (
    <KumoShell>
      <div className="gap-5 grid">
        <div className="gap-3 grid">
          <Breadcrumbs
            items={[
              { label: tr("Malé City Council", "މާލޭ ސިޓީ ކައުންސިލް"), href: KUMO_ROUTES.dashboard },
              { label: tr("Account home", "އެކައުންޓް ހޯމް") },
            ]}
            classNames={{ list: "kumo-crumbs" }}
          />
          <div className="gap-3 flex flex-wrap items-end justify-between">
            <div className="gap-1 min-w-0 grid">
              <h1 className="kumo-h1">{tr("Account home", "އެކައުންޓް ހޯމް")}</h1>
              <p className="text-sm kumo-subtle">
                {tr(
                  "Applications, usage and service health for Malé City Council.",
                  "މާލޭ ސިޓީ ކައުންސިލްގެ އެޕްލިކޭޝަންތަކާއި ބޭނުންކުރުމާއި ޚިދުމަތުގެ ޙާލަތު.",
                )}
              </p>
            </div>
            <div className="gap-2 flex flex-wrap items-center">
              <SegmentedControl
                aria-label={tr("Time range", "މުއްދަތު")}
                className="kumo-segmented"
                size="sm"
                value={range}
                onValueChange={setRange}
                options={[
                  { value: "7d", label: tr("7 days", "7 ދުވަސް") },
                  { value: "30d", label: tr("30 days", "30 ދުވަސް") },
                  { value: "90d", label: tr("90 days", "90 ދުވަސް") },
                ]}
              />
              <LinkButton href={routes.adminRecords.create} startIcon="add">
                {tr("New application", "އައު އެޕްލިކޭޝަން")}
              </LinkButton>
            </div>
          </div>
        </div>

        <StatTiles className="kumo-metrics">
          <StatTile
            label={tr("Applications received", "ލިބުނު އެޕްލިކޭޝަން")}
            value={received.length}
            previousValue={receivedPrev.length}
            deltaContext={rangeLabel}
            sparkline={spark("received")}
            sparklineVariant="area"
          />
          <StatTile
            label={tr("Approved", "ފާސްކުރެވުނު")}
            value={approved.length}
            previousValue={approvedPrev.length}
            deltaContext={rangeLabel}
            sparkline={spark("approved")}
            sparklineVariant="area"
          />
          <StatTile
            label={tr("Fees invoiced", "ފީ")}
            value={fees}
            previousValue={feesPrev}
            valueFormat="compact"
            deltaContext={rangeLabel}
          />
          <StatTile
            label={tr("Open in queue", "ކިއުގައި")}
            value={open.length}
            positiveIsGood={false}
            footer={tr(
              `${open.filter((a) => !a.assignee).length} unassigned`,
              `${open.filter((a) => !a.assignee).length} ޙަވާލުނުކުރެވޭ`,
            )}
          />
        </StatTiles>

        <div className="kumo-dash-grid">
          <div className="kumo-dash-col">
            <LayerCard
              title={tr("Applications over time", "ދުވަހުން ދުވަހަށް")}
              actions={
                <LinkButton href={routes.adminRecords.activityLog} variant="ghost" size="sm" endIcon="arrow-right">
                  {tr("Analytics", "އެނަލިޓިކްސް")}
                </LinkButton>
              }
            >
              <TimeSeriesChart
                title={tr("Applications over time", "ދުވަހުން ދުވަހަށް")}
                hideTitle
                description={tr(`Received and approved, last ${days} days`, `ފަހުގެ ${days} ދުވަސް`)}
                data={series}
                config={{
                  received: { label: tr("Received", "ލިބުނު"), color: "var(--chart-1)" },
                  approved: { label: tr("Approved", "ފާސްކުރެވުނު"), color: "var(--chart-5)" },
                }}
                interval={step === 7 ? "week" : step === 1 ? "day" : undefined}
                area
                valueFormat="integer"
                height={260}
              />
            </LayerCard>

            <LayerCard
              title={tr("Recent applications", "ފަހުގެ އެޕްލިކޭޝަންތައް")}
              actions={
                <LinkButton href={KUMO_ROUTES.index} variant="ghost" size="sm" endIcon="arrow-right">
                  {tr("View all", "ހުރިހާ")}
                </LinkButton>
              }
              flush
            >
              <DataTable<Application>
                caption={tr("Recent applications", "ފަހުގެ އެޕްލިކޭޝަންތައް")}
                columns={recentColumns}
                data={recent}
                density="compact"
                getRowHref={(a) => showHref(a.id)}
                getRowName={(a) => `${a.reference} (${labels.name(a)})`}
              />
            </LayerCard>

            <LayerCard title={tr("Applications by service", "ޚިދުމަތުން")}>
              <BarChart
                title={tr("Applications by service", "ޚިދުމަތުން")}
                hideTitle
                description={tr("Open and closed, all time", "ހުޅުވިފައި އަދި ނިމިފައި")}
                data={byService}
                categoryKey="service"
                orientation="horizontal"
                stacked
                config={{
                  open: { label: tr("Open", "ހުޅުވިފައި"), color: "var(--chart-1)" },
                  closed: { label: tr("Closed", "ނިމިފައި"), color: "var(--chart-2)" },
                }}
                valueFormat="integer"
                height={240}
              />
            </LayerCard>
          </div>

          <div className="kumo-dash-col">
            <LayerCard
              title={tr("Usage this month", "މި މަހުގެ ބޭނުން")}
              actions={
                <KumoBadge tone="brand" dot={false}>
                  {tr("Enterprise", "އެންޓަޕްރައިޒް")}
                </KumoBadge>
              }
              bodyClassName="gap-4 grid"
            >
              {usage.map((u) => (
                <ProgressBar
                  key={u.id}
                  value={u.value}
                  max={u.max}
                  label={u.label}
                  showValue
                  className={u.value / u.max > 0.8 ? "kumo-meter--warn" : undefined}
                  formatValue={(v, m) =>
                    `${new Intl.NumberFormat("en").format(v)}${u.unit} / ${new Intl.NumberFormat("en").format(m)}${u.unit}`
                  }
                  classNames={{ label: "text-sm font-medium", value: "text-xs tabular-nums kumo-subtle" }}
                />
              ))}
              <ConditionalLink href={routes.adminSettings.settings} className="kumo-link text-sm">
                {tr("Manage plan", "ޕްލޭން ބަދަލުކުރޭ")}
              </ConditionalLink>
            </LayerCard>

            <LayerCard
              title={tr("System status", "ސިސްޓަމްގެ ޙާލަތު")}
              actions={<KumoBadge tone="warning">{tr("Degraded", "ދަށް")}</KumoBadge>}
              flush
            >
              <ul className="kumo-rows">
                {services.map((s) => (
                  <li key={s.id}>
                    <span aria-hidden className={s.ok ? "kumo-dot" : "kumo-dot kumo-dot--warn"} />
                    <span className="min-w-0 font-medium flex-1 truncate">{s.name}</span>
                    <span className="text-xs kumo-subtle">
                      {s.ok ? tr("Operational", "ރަނގަޅު") : tr("Delayed delivery", "ލަސްވެފައި")}
                    </span>
                  </li>
                ))}
              </ul>
            </LayerCard>

            <LayerCard title={tr("Team workload", "ޓީމުގެ މަސައްކަތް")} flush>
              <ul className="kumo-rows">
                {["shifa", "nazeer", "rasheed", "waheed"].map((id) => {
                  const n = open.filter((a) => a.assignee === id).length
                  return (
                    <li key={id}>
                      <KumoAvatar name={labels.staff(id)} size="xs" decorative />
                      <span className="min-w-0 flex-1 truncate">{labels.staff(id)}</span>
                      <span className="text-xs kumo-subtle tabular-nums">{tr(`${n} open`, `${n} ހުޅުވިފައި`)}</span>
                    </li>
                  )
                })}
              </ul>
            </LayerCard>

            <LayerCard title={tr("Recent activity", "ފަހުގެ ހަރަކާތްތައް")}>
              <Timeline
                aria-label={tr("Recent activity", "ފަހުގެ ހަރަކާތްތައް")}
                items={activity}
                size="sm"
                now={KUMO_NOW}
                timeFormat="relative"
              />
            </LayerCard>

            <p className="gap-1.5 text-xs kumo-subtle flex items-center">
              <Icon name="info" className="size-3.5" />
              {tr("Data refreshes every 5 minutes.", "ކޮންމެ 5 މިނިޓަކުން އަޕްޑޭޓްވޭ.")}
            </p>
          </div>
        </div>
      </div>
    </KumoShell>
  )
}
