import * as React from "react"
import {
  Badge,
  Button,
  Calendar,
  ConditionalLink,
  DataTable,
  LinkButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ProgressBar,
  SegmentedControl,
  StatusBadge,
  Tabs,
  Timeline,
  toast,
  UserAvatar,
  type DataTableColumn,
} from "@javaabu/onu"
import { BarChart, DeltaIndicator, PieChart, StatTile, TimeSeriesChart, type ValueFormat } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import {
  SERVICES,
  showHref,
  STAFF,
  STATUSES,
  TODAY,
  useApplications,
  useLabels,
  type Application,
  type Labels,
} from "../admin-records/_data"
import { Glyph, ZenithShell, ZnCard, ZN_ROUTES, type Tr } from "./_zenith"

export const meta = {
  title: "Zenith · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 10,
  description:
    "Inspired by DashboardPack's Zenith shadcn/ui admin template: zinc neutrals, bordered cards and one confident accent.",
}

const DAY = 86_400_000
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
const today = Date.parse(`${TODAY}T00:00:00Z`)

/** A deterministic daily series that looks like real traffic (weekly rhythm plus a gentle trend). */
function dailySeries(apps: Application[]) {
  return Array.from({ length: 90 }, (_, i) => {
    const t = today - (89 - i) * DAY
    const day = new Date(t).getUTCDay()
    const base = 38 + i * 0.35 + Math.sin(i / 4.3) * 9 + ((i * 37) % 11)
    const weekend = day === 5 || day === 6 ? 0.55 : 1
    const submitted = Math.round(base * weekend + apps.filter((a) => a.submitted === iso(t)).length * 3)
    return { date: iso(t), submitted, approved: Math.round(submitted * (0.58 + ((i * 13) % 7) / 40)) }
  })
}

// ---------------------------------------------------------------------------
// Date range button (shadcn dashboard: a calendar popover with two months)

interface Range {
  from: Date | undefined
  to?: Date
}

function DateRangeButton({ labels, tr }: { labels: Labels; tr: Tr }) {
  const [range, setRange] = React.useState<Range | undefined>({
    from: new Date(today - 29 * DAY),
    to: new Date(today),
  })
  const label =
    range?.from && range.to
      ? `${labels.date(iso(range.from.getTime()))} – ${labels.date(iso(range.to.getTime()))}`
      : range?.from
        ? labels.date(iso(range.from.getTime()))
        : tr("Pick a date range", "ތާރީޚުތައް ހޮވާ")
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="zn-date" startIcon="calendar">
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="end">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={range?.from}
          selected={range}
          onSelect={(r: Range | undefined) => setRange(r)}
        />
      </PopoverContent>
    </Popover>
  )
}

/** A Zenith KPI: label, small icon top-right, big number, a change badge and "from last month". */
function Kpi({
  label,
  value,
  valueFormat,
  current,
  previous,
  icon,
  positiveIsGood,
  context,
}: {
  label: string
  value: number
  valueFormat?: ValueFormat
  current: number
  previous: number
  icon: string
  positiveIsGood?: boolean
  context: string
}) {
  return (
    <StatTile
      className="zn-kpi"
      label={label}
      value={value}
      valueFormat={valueFormat}
      icon={<Glyph id={icon} />}
      footer={
        <span className="gap-1.5 flex flex-wrap items-center">
          <DeltaIndicator variant="badge" current={current} previous={previous} positiveIsGood={positiveIsGood} />
          <span>{context}</span>
        </span>
      }
    />
  )
}

export default function ZenithDashboardPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const [range, setRange] = React.useState("90")

  const inLast = (a: Application, from: number, to = 0) => {
    const t = Date.parse(`${a.submitted}T00:00:00Z`)
    return t > today - from * DAY && t <= today - to * DAY
  }
  const last30 = apps.filter((a) => inLast(a, 30))
  const prev30 = apps.filter((a) => inLast(a, 60, 30))
  const sum = (list: Application[]) => list.reduce((s, a) => s + a.amount, 0)
  const rate = (list: Application[]) =>
    list.length ? list.filter((a) => a.status === "approved").length / list.length : 0
  const pending = apps.filter((a) => a.status === "submitted" || a.status === "in_review")

  const daily = dailySeries(apps)
  const series = daily.slice(-Number(range))
  const byStatus = STATUSES.map((s) => ({
    name: labels.status(s.value),
    value: apps.filter((a) => a.status === s.value).length,
  }))
  const byService = SERVICES.map((s) => ({
    service: labels.service(s.value),
    thisMonth: sum(last30.filter((a) => a.service === s.value)),
    lastMonth: sum(prev30.filter((a) => a.service === s.value)),
  }))
  const recent = [...apps].sort((a, b) => b.submitted.localeCompare(a.submitted) || b.id.localeCompare(a.id))
  const ctx = tr("from last month", "ކުރީ މަހާ އަޅާބަލާއިރު")

  const overview = (
    <div className="gap-4 grid">
      <div className="zn-kpis">
        <Kpi
          label={tr("Fees collected", "ލިބުނު ފީ")}
          value={sum(last30) * 4.2}
          valueFormat={(v) =>
            `${labels.dv ? "ރ." : "MVR"} ${(v / 1000).toLocaleString("en", { maximumFractionDigits: 1 })}K`
          }
          current={sum(last30)}
          previous={sum(prev30)}
          icon="dollar-sign"
          context={ctx}
        />
        <Kpi
          label={tr("New applications", "އައު އެޕްލިކޭޝަން")}
          value={last30.length * 21 + 7}
          current={last30.length}
          previous={prev30.length}
          icon="file-text"
          context={ctx}
        />
        <Kpi
          label={tr("Approval rate", "ފާސްކުރެވޭ މިންވަރު")}
          value={rate(last30)}
          valueFormat="percent"
          current={rate(last30)}
          previous={rate(prev30)}
          icon="circle-check"
          context={ctx}
        />
        <Kpi
          label={tr("Awaiting review", "ރިވިއުއަށް އިންތިޒާރުގައި")}
          value={pending.length}
          current={pending.length}
          previous={pending.length + 9}
          positiveIsGood={false}
          icon="hourglass"
          context={ctx}
        />
      </div>

      <div className="gap-4 xl:grid-cols-7 grid">
        <ZnCard
          className="xl:col-span-4"
          title={tr("Overview", "ޚުލާޞާ")}
          description={tr("Applications submitted and approved per day", "ދުވާލަކަށް ހުށަހެޅުނު އަދި ފާސްކުރެވުނު")}
          action={
            <SegmentedControl
              aria-label={tr("Time range", "މުއްދަތު")}
              className="zn-seg"
              value={range}
              onValueChange={setRange}
              options={[
                { value: "90", label: tr("3 months", "3 މަސް") },
                { value: "30", label: tr("30 days", "30 ދުވަސް") },
                { value: "7", label: tr("7 days", "7 ދުވަސް") },
              ]}
            />
          }
        >
          <TimeSeriesChart
            title={tr("Applications per day", "ދުވާލަކަށް އެޕްލިކޭޝަން")}
            hideTitle
            showTableToggle={false}
            data={series}
            config={{
              submitted: { label: tr("Submitted", "ހުށަހެޅި") },
              approved: { label: tr("Approved", "ފާސްކުރެވިފަ") },
            }}
            interval="day"
            area
            valueFormat="integer"
            height={280}
          />
        </ZnCard>

        <ZnCard
          className="xl:col-span-3"
          title={tr("Recent applications", "ފަހުގެ އެޕްލިކޭޝަންތައް")}
          description={tr(
            `${last30.length} applications received this month.`,
            `މި މަހު ${last30.length} އެޕްލިކޭޝަން ލިބިއްޖެ.`,
          )}
        >
          <ul className="zn-sales">
            {recent.slice(0, 6).map((a) => (
              <li key={a.id}>
                <UserAvatar name={labels.name(a)} size="sm" decorative />
                <div className="min-w-0 flex-1">
                  <ConditionalLink href={showHref(a.id)} className="zn-sales__name text-foreground">
                    {labels.name(a)}
                  </ConditionalLink>
                  <p className="text-xs truncate text-muted-foreground" dir="ltr">
                    {a.email}
                  </p>
                </div>
                <span className="text-sm font-medium whitespace-nowrap tabular-nums">+{labels.mvr(a.amount)}</span>
              </li>
            ))}
          </ul>
        </ZnCard>
      </div>

      <div className="gap-4 lg:grid-cols-2 xl:grid-cols-3 grid">
        <ZnCard
          title={tr("Applications by status", "ސްޓޭޓަސްއިން")}
          description={tr("All open records", "ހުރިހާ ރެކޯޑެއް")}
        >
          <PieChart
            title={tr("Applications by status", "ސްޓޭޓަސްއިން")}
            hideTitle
            showTableToggle={false}
            variant="donut"
            data={byStatus}
            centerLabel={{ value: String(apps.length), label: tr("Total", "ޖުމްލަ") }}
            height={240}
          />
        </ZnCard>

        <ZnCard
          title={tr("Team", "ޓީމު")}
          description={tr("Reviewers working on applications", "އެޕްލިކޭޝަންތަކުގެ މަސައްކަތްކުރާ ރިވިއުވަރުން")}
          action={
            <LinkButton href={routes.adminSettings.users} variant="outline" size="sm" startIcon="add">
              {tr("Invite", "ދަޢުވަތު")}
            </LinkButton>
          }
        >
          <ul className="zn-team">
            {STAFF.map((s, i) => {
              const open = pending.filter((a) => a.assignee === s.value).length
              const role = [
                tr("Owner", "އޯނަރ"),
                tr("Reviewer", "ރިވިއުވަރ"),
                tr("Reviewer", "ރިވިއުވަރ"),
                tr("Viewer", "ވިއުވަރ"),
              ][i]
              return (
                <li key={s.value}>
                  <UserAvatar name={tr(s.en, s.dv)} size="sm" status={i < 2 ? "online" : "away"} decorative />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{tr(s.en, s.dv)}</p>
                    <p className="text-xs text-muted-foreground">
                      {tr(`${open} open applications`, `${open} ހުޅުވިފައިވާ އެޕްލިކޭޝަން`)}
                    </p>
                  </div>
                  <Badge variant="outline" className="zn-label">
                    {role}
                  </Badge>
                </li>
              )
            })}
          </ul>
          <div className="zn-goals">
            <ProgressBar
              label={tr("Monthly review target", "މަހުގެ ރިވިއު ޓާގެޓް")}
              value={72}
              showValue
              className="zn-progress"
            />
            <ProgressBar
              label={tr("Fees collection target", "ފީ ހޯދުމުގެ ޓާގެޓް")}
              value={58}
              showValue
              className="zn-progress"
            />
          </div>
        </ZnCard>

        <ZnCard
          className="lg:col-span-2 xl:col-span-1"
          title={tr("Activity", "ހަރަކާތްތައް")}
          description={tr("Latest workspace updates", "ވޯކްސްޕޭހުގެ އެންމެ ފަހުގެ ހަރަކާތްތައް")}
          action={
            <LinkButton href={routes.adminRecords.activityLog} variant="ghost" size="sm" endIcon="arrow-right">
              {tr("View all", "ހުރިހާ")}
            </LinkButton>
          }
        >
          <Timeline
            size="sm"
            className="zn-timeline"
            items={[
              {
                id: "t1",
                title: tr("Aishath Shifa approved APP-2026-001042", "އައިޝަތު ޝިފާ APP-2026-001042 ފާސްކުރި"),
                time: `${TODAY}T10:24:00`,
                status: "success",
              },
              {
                id: "t2",
                title: tr("Payment received: MVR 2,750.00", "ފައިސާ ލިބިއްޖެ: ރ. 2,750.00"),
                description: tr("Building permit · Hulhumalé", "ބިނާކުރުމުގެ ހުއްދަ · ހުޅުމާލެ"),
                time: `${TODAY}T09:02:00`,
                status: "success",
              },
              {
                id: "t3",
                title: tr("Site visit scheduled", "ސައިޓް ވިޒިޓެއް ރާވައިފި"),
                description: tr("Ibrahim Nazeer · Thursday 10:00", "އިބްރާހީމް ނަޒީރު · ބުރާސްފަތި 10:00"),
                time: `${TODAY}T08:40:00`,
                status: "current",
              },
              {
                id: "t4",
                title: tr("Weekly report generated", "ހަފްތާގެ ރިޕޯޓް ތައްޔާރުކުރެވިއްޖެ"),
                time: "2026-10-06T17:00:00",
                status: "pending",
              },
            ]}
          />
        </ZnCard>
      </div>

      <ZnCard
        title={tr("Latest applications", "އެންމެ ފަހުގެ އެޕްލިކޭޝަންތައް")}
        description={tr("The newest submissions waiting in the queue", "ފަހުން ހުށަހެޅުނު އެޕްލިކޭޝަންތައް")}
        action={
          <LinkButton href={ZN_ROUTES.index} variant="outline" size="sm" endIcon="arrow-right">
            {tr("View all", "ހުރިހާ")}
          </LinkButton>
        }
        bodyClassName="zn-card__body--flush"
      >
        <DataTable<Application>
          className="zn-table zn-table--plain"
          caption={tr("Latest applications", "އެންމެ ފަހުގެ އެޕްލިކޭޝަންތައް")}
          columns={recentColumns(labels, tr)}
          data={recent.slice(0, 5)}
          getRowName={(a) => `${a.reference} (${labels.name(a)})`}
          getRowHref={(a) => showHref(a.id)}
        />
      </ZnCard>
    </div>
  )

  const analytics = (
    <div className="gap-4 lg:grid-cols-2 grid">
      <ZnCard
        title={tr("Fees by service", "ޚިދުމަތުން ލިބުނު ފީ")}
        description={tr("This month and last month", "މި މަހާއި ކުރީ މަސް")}
      >
        <BarChart
          title={tr("Fees by service", "ޚިދުމަތުން ލިބުނު ފީ")}
          hideTitle
          showTableToggle={false}
          data={byService}
          categoryKey="service"
          config={{
            thisMonth: { label: tr("This month", "މި މަސް") },
            lastMonth: { label: tr("Last month", "ކުރީ މަސް") },
          }}
          valueFormat="currency"
          height={300}
        />
      </ZnCard>
      <ZnCard
        title={tr("Approvals per day", "ދުވާލަކަށް ފާސްކުރެވުނު")}
        description={tr("Last 30 days", "ފަހުގެ 30 ދުވަސް")}
      >
        <TimeSeriesChart
          title={tr("Approvals per day", "ދުވާލަކަށް ފާސްކުރެވުނު")}
          hideTitle
          showTableToggle={false}
          data={daily.slice(-30)}
          series={["approved"]}
          config={{ approved: { label: tr("Approved", "ފާސްކުރެވިފަ") } }}
          interval="day"
          variant="bar"
          valueFormat="integer"
          height={300}
        />
      </ZnCard>
    </div>
  )

  return (
    <ZenithShell
      crumbs={[{ label: tr("Overview", "ޚުލާޞާ"), href: ZN_ROUTES.dashboard }, { label: tr("Dashboard", "ޑޭޝްބޯޑް") }]}
    >
      <div className="zn-page gap-6 min-w-0 grid">
        <header className="gap-4 flex flex-wrap items-end justify-between">
          <div className="gap-1 min-w-0 grid">
            <h1 className="zn-h1">{tr("Dashboard", "ޑޭޝްބޯޑް")}</h1>
            <p className="text-sm text-muted-foreground">
              {tr("Welcome back, Shifa. Here's what's happening today.", "މަރުޙަބާ ޝިފާ. މިއަދުގެ ޚުލާޞާ.")}
            </p>
          </div>
          <div className="gap-2 flex flex-wrap items-center">
            <DateRangeButton labels={labels} tr={tr} />
            <Button
              startIcon="download"
              onClick={() => toast.success(tr("Report downloaded", "ރިޕޯޓް ޑައުންލޯޑްކުރެވިއްޖެ"))}
            >
              {tr("Download", "ޑައުންލޯޑް")}
            </Button>
          </div>
        </header>

        <Tabs
          className="zn-dash-tabs gap-4"
          defaultValue="overview"
          items={[
            { value: "overview", label: tr("Overview", "ޚުލާޞާ"), content: overview },
            { value: "analytics", label: tr("Analytics", "އެނަލިޓިކްސް"), content: analytics },
            { value: "reports", label: tr("Reports", "ރިޕޯޓްތައް"), disabled: true },
            { value: "notifications", label: tr("Notifications", "ނޮޓިފިކޭޝަން"), disabled: true },
          ]}
        />
      </div>
    </ZenithShell>
  )
}

function recentColumns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "name",
      header: tr("Applicant", "އެޕްލިކަންޓް"),
      primary: true,
      accessor: (a) => labels.name(a),
      cell: (a) => (
        <span className="gap-3 min-w-0 flex items-center">
          <UserAvatar name={labels.name(a)} size="sm" decorative />
          <span className="min-w-0 grid">
            <span className="font-medium truncate">{labels.name(a)}</span>
            <span className="text-xs font-mono text-muted-foreground">{a.reference}</span>
          </span>
        </span>
      ),
    },
    { id: "service", header: tr("Service", "ޚިދުމަތް"), accessor: (a) => labels.service(a.service) },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      cell: (a) => <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />,
    },
    {
      id: "submitted",
      header: tr("Date", "ތާރީޚް"),
      cell: (a) => <span className="whitespace-nowrap text-muted-foreground">{labels.date(a.submitted)}</span>,
    },
    {
      id: "amount",
      header: tr("Amount", "އަދަދު"),
      numeric: true,
      cell: (a) => <span className="font-medium whitespace-nowrap">{labels.mvr(a.amount)}</span>,
    },
  ]
}
