import * as React from "react"
import {
  Button,
  Card,
  DataTable,
  Icon,
  ProgressBar,
  StatusBadge,
  Timeline,
  UserAvatar,
  toast,
  type DataTableColumn,
} from "@javaabu/onu"
import { BarChart, PieChart, StatTile, StatTiles, TimeSeriesChart } from "@javaabu/onu/charts"

import { useDv, useTr } from "../_shared/i18n"
import { AG_NOW, AG_ROUTES, AuroraRoot, AuroraShell } from "./_aurora-glass"

export const meta = {
  title: "Aurora Glass · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 21,
  description: "An operations command centre in frosted glass: glass sidebar, glowing charts and live status.",
}

// Fixed demo data and times, so the page (and its screenshots) are stable.
const NOW = AG_NOW
const START = Date.parse("2026-09-09T00:00:00Z")
const DAY = 86_400_000
const requests = Array.from({ length: 30 }, (_, i) => {
  const weekly = [0.82, 1, 1.05, 1.02, 0.98, 0.55, 0.62][i % 7]!
  const base = (2400 + i * 38 + Math.sin(i / 2.7) * 260) * weekly
  return {
    date: new Date(START + i * DAY).toISOString().slice(0, 10),
    requests: Math.round(base),
    resolved: Math.round(base * (0.86 + Math.sin(i / 4) * 0.05)),
  }
})
const sessions = requests.slice(-14).map((d) => d.requests * 4)

interface Transaction {
  id: string
  reference: string
  citizen: string
  service: string
  island: string
  amount: number
  status: "success" | "pending" | "warning" | "danger"
  minutesAgo: number
}

export default function AuroraGlassDashboardPage() {
  const tr = useTr()
  const dv = useDv()

  const services = [
    { id: "permits", label: tr("Building permits", "ބިނާކުރުމުގެ ހުއްދަ") },
    { id: "licences", label: tr("Fishing licences", "މަސްވެރިކަމުގެ ލައިސަންސް") },
    { id: "land", label: tr("Land leases", "ބިން ލީސް") },
    { id: "ids", label: tr("ID cards", "އައިޑީ ކާޑު") },
    { id: "utility", label: tr("Utility connections", "ޔުޓިލިޓީ ކަނެކްޝަން") },
  ]
  const service = (id: string) => services.find((s) => s.id === id)!.label

  const transactions: Transaction[] = [
    {
      id: "1",
      reference: "RC-24-0912",
      citizen: tr("Aminath Rasheed", "އާމިނަތު ރަޝީދު"),
      service: "permits",
      island: tr("Fuvahmulah", "ފުވައްމުލައް"),
      amount: 1500,
      status: "success",
      minutesAgo: 3,
    },
    {
      id: "2",
      reference: "RC-24-0911",
      citizen: tr("Ibrahim Nasheed", "އިބްރާހީމް ނަޝީދު"),
      service: "licences",
      island: tr("Addu City", "އައްޑޫ ސިޓީ"),
      amount: 250,
      status: "pending",
      minutesAgo: 9,
    },
    {
      id: "3",
      reference: "RC-24-0910",
      citizen: tr("Hassan Rasheed", "ހަސަން ރަޝީދު"),
      service: "land",
      island: tr("Kulhudhuffushi", "ކުޅުދުއްފުށި"),
      amount: 12_000,
      status: "success",
      minutesAgo: 16,
    },
    {
      id: "4",
      reference: "RC-24-0909",
      citizen: tr("Mariyam Hana", "މަރިޔަމް ހަނާ"),
      service: "ids",
      island: tr("Thinadhoo", "ތިނަދޫ"),
      amount: 100,
      status: "warning",
      minutesAgo: 24,
    },
    {
      id: "5",
      reference: "RC-24-0908",
      citizen: tr("Ali Waheed", "ޢަލީ ވަޙީދު"),
      service: "utility",
      island: tr("Hulhumalé", "ހުޅުމާލެ"),
      amount: 850,
      status: "danger",
      minutesAgo: 41,
    },
  ]
  const statusMap = {
    success: { tone: "success" as const, label: tr("Paid", "ދައްކާފަ") },
    pending: { tone: "pending" as const, label: tr("Processing", "ޕްރޮސެސްވަނީ") },
    warning: { tone: "warning" as const, label: tr("Needs review", "ރިވިއު ބޭނުން") },
    danger: { tone: "danger" as const, label: tr("Failed", "ނާކާމިޔާބު") },
  }
  const mvr = (n: number) => (dv ? `ރ. ${n.toLocaleString("en")}` : `MVR ${n.toLocaleString("en")}`)

  const columns: DataTableColumn<Transaction>[] = [
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      primary: true,
      cell: (t) => (
        <span className="gap-3 flex items-center">
          <UserAvatar name={t.citizen} size="sm" />
          <span className="gap-0.5 min-w-0 grid">
            <span className="font-medium truncate">{t.citizen}</span>
            <span className="text-xs font-mono text-muted-foreground" dir="ltr">
              {t.reference}
            </span>
          </span>
        </span>
      ),
    },
    { id: "service", header: tr("Service", "ޚިދުމަތް"), accessor: (t) => service(t.service) },
    { id: "island", header: tr("Island", "ރަށް"), accessor: "island" },
    {
      id: "amount",
      header: tr("Amount", "އަދަދު"),
      numeric: true,
      accessor: (t) => mvr(t.amount),
    },
    {
      id: "status",
      header: tr("Status", "ހާލަތު"),
      accessor: (t) => statusMap[t.status].label,
      cell: (t) => <StatusBadge status={t.status} statusMap={statusMap} size="sm" />,
    },
  ]

  const channels = [
    { channel: "web", value: 46 },
    { channel: "app", value: 31 },
    { channel: "kiosk", value: 14 },
    { channel: "counter", value: 9 },
  ]
  const atolls = [
    { atoll: tr("Malé", "މާލެ"), load: 3820 },
    { atoll: tr("Addu", "އައްޑޫ"), load: 1940 },
    { atoll: tr("Haa Dhaalu", "ހދ"), load: 1210 },
    { atoll: tr("Gnaviyani", "ޏ"), load: 980 },
    { atoll: tr("Gaafu Dhaalu", "ގދ"), load: 760 },
  ]

  const health = [
    { name: tr("Payments gateway", "ޕޭމަންޓް ގޭޓްވޭ"), uptime: 99.99, status: "success" as const },
    { name: tr("Identity & sign-in", "އައިޑެންޓިޓީ އަދި ލޮގިން"), uptime: 99.97, status: "success" as const },
    { name: tr("SMS notifications", "އެސްއެމްއެސް"), uptime: 97.4, status: "warning" as const },
    { name: tr("Offline sync", "އޮފްލައިން ސިންކް"), uptime: 99.9, status: "success" as const },
  ]

  const quickActions = [
    { icon: "add", label: tr("Issue permit", "ހުއްދަ ދޫކުރޭ") },
    { icon: "megaphone", label: tr("Broadcast alert", "އެލާޓް ފޮނުވާ") },
    { icon: "bank", label: tr("Reconcile", "ރިކަންސައިލް") },
    { icon: "users", label: tr("Invite staff", "މުވައްޒަފުން") },
    { icon: "download", label: tr("Daily report", "ދުވަހުގެ ރިޕޯޓް") },
    { icon: "qr-code", label: tr("Kiosk codes", "ކިއޮސްކް ކޯޑު") },
  ]

  const minutesAgo = (m: number) => new Date(NOW.getTime() - m * 60_000)

  return (
    <AuroraRoot>
      <AuroraShell current={AG_ROUTES.dashboard}>
        <div className="gap-6 grid">
          {/* Title */}
          <div className="gap-4 lg:flex-row lg:items-end flex flex-col justify-between">
            <div className="min-w-0">
              <p className="ag-chip gap-2 px-3 py-1 text-xs font-medium inline-flex items-center rounded-full">
                <span className="ag-pulse" aria-hidden />
                {tr("Live · Thursday 8 October, 10:42", "ލައިވް · ބުރާސްފަތި 8 އޮކްޓޫބަރު، 10:42")}
              </p>
              <h1 className="ag-display mt-4 text-[clamp(2rem,1.5rem+2vw,3rem)]">
                {tr("Good morning, ", "ސަލާމް، ")}
                <span className="ag-ink">{tr("Shifa", "ޝިފާ")}</span>
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                {tr(
                  "8,412 requests across 187 islands today. Two incidents need your attention.",
                  "މިއަދު 187 ރަށުން 8,412 ރިކުއެސްޓް. ދެ ހާދިސާއަކަށް ތިބާގެ ސަމާލުކަން ބޭނުން.",
                )}
              </p>
            </div>
            <div className="gap-2 flex flex-wrap">
              <Button variant="outline" startIcon="download" className="ag-ghost">
                {tr("Export", "އެކްސްޕޯޓް")}
              </Button>
              <Button
                startIcon="add"
                className="ag-glow"
                onClick={() => toast.success(tr("Draft service created", "ޚިދުމަތުގެ ޑްރާފްޓް ހެދިއްޖެ"))}
              >
                {tr("New service", "އައު ޚިދުމަތެއް")}
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <StatTiles>
            <StatTile
              className="ag-glass ag-spot"
              label={tr("Active sessions", "އެކްޓިވް ސެޝަން")}
              value={12_480}
              previousValue={10_960}
              icon="users"
              deltaContext={tr("vs this time last week", "ފާއިތުވި ހަފްތާއާ އަޅާބަލާއިރު")}
              sparkline={sessions}
            />
            <StatTile
              className="ag-glass ag-spot"
              label={tr("Fees collected today", "މިއަދު ލިބުނު ފީ")}
              value={412_880}
              previousValue={371_400}
              valueFormat="currency"
              icon="credit-card"
              deltaContext={tr("vs this time last week", "ފާއިތުވި ހަފްތާއާ އަޅާބަލާއިރު")}
              sparkline={sessions.map((v, i) => v * (0.8 + (i % 3) * 0.1))}
            />
            <StatTile
              className="ag-glass ag-spot"
              label={tr("Median response (min)", "މެދު ޖަވާބު (މިނެޓް)")}
              value={3.2}
              previousValue={4.1}
              positiveIsGood={false}
              valueFormat={{ maximumFractionDigits: 1 }}
              icon="clock"
              deltaContext={tr("vs last week", "ފާއިތުވި ހަފްތާއާ")}
            />
            <StatTile
              className="ag-glass ag-spot"
              label={tr("SLA met", "އެސްއެލްއޭ ހަމަވި")}
              value={0.986}
              delta={0.012}
              valueFormat="percent"
              icon="success"
              deltaContext={tr("vs last week", "ފާއިތުވި ހަފްތާއާ")}
            />
          </StatTiles>

          {/* Charts */}
          <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
            <div className="ag-glass ag-chart p-5 min-w-0 rounded-2xl">
              <TimeSeriesChart
                title={tr("Service requests", "ޚިދުމަތުގެ ރިކުއެސްޓް")}
                description={tr("Received and resolved, last 30 days", "ލިބުނު އަދި ނިމުނު، ފަހުގެ 30 ދުވަސް")}
                data={requests}
                config={{
                  requests: { label: tr("Received", "ލިބުނު"), color: "var(--ag-a)" },
                  resolved: { label: tr("Resolved", "ނިމުނު"), color: "var(--ag-b)" },
                }}
                interval="day"
                area
                valueFormat="integer"
                height={280}
              />
            </div>
            <div className="ag-glass ag-chart p-5 min-w-0 rounded-2xl">
              <PieChart
                title={tr("Channel mix", "ޗެނަލްތައް")}
                description={tr("Where requests came from today", "މިއަދު ރިކުއެސްޓް އައި ގޮތް")}
                variant="donut"
                data={channels}
                nameKey="channel"
                config={{
                  web: { label: tr("Web", "ވެބް"), color: "var(--ag-a)" },
                  app: { label: tr("App", "އެޕް"), color: "var(--ag-b)" },
                  kiosk: { label: tr("Kiosk", "ކިއޮސްކް"), color: "var(--ag-c)" },
                  counter: { label: tr("Counter", "ކައުންޓަރ"), color: "var(--muted-foreground)" },
                }}
                valueFormat={{ style: "unit", unit: "percent" }}
                centerLabel={{ value: "8.4k", label: tr("requests", "ރިކުއެސްޓް") }}
                height={280}
              />
            </div>
          </div>

          {/* Operations row */}
          <div className="gap-6 lg:grid-cols-2 xl:grid-cols-3 grid">
            <Card
              headingLevel={2}
              className="ag-glass ag-spot rounded-2xl"
              title={tr("Live operations", "ލައިވް އޮޕަރޭޝަންސް")}
              description={tr("Today, newest first", "މިއަދު، އެންމެ ފަހުން އައިސް")}
              actions={
                <StatusBadge status="warning" size="sm">
                  {tr("2 open", "2 ހުޅުވިފަ")}
                </StatusBadge>
              }
            >
              <Timeline
                size="sm"
                now={NOW}
                timeFormat="relative"
                items={[
                  {
                    id: "a",
                    title: tr("SMS delivery degraded", "އެސްއެމްއެސް ލަސްވެއްޖެ"),
                    description: tr("Haa Dhaalu · failover active", "ހދ · ބެކަޕް ހިންގަނީ"),
                    time: minutesAgo(6),
                    status: "warning",
                  },
                  {
                    id: "b",
                    title: tr("Peak load handled", "އެންމެ ބުރަ ވަގުތު ހަމަޖެހުނު"),
                    description: tr("1,240 requests in 5 minutes", "5 މިނެޓުގައި 1,240 ރިކުއެސްޓް"),
                    time: minutesAgo(34),
                    status: "success",
                  },
                  {
                    id: "c",
                    title: tr("Reconciliation complete", "ރިކަންސިލިއޭޝަން ނިމުނީ"),
                    description: tr("MVR 1.9M matched", "ރ. 1.9 މިލިއަން"),
                    time: minutesAgo(58),
                    status: "success",
                  },
                  {
                    id: "d",
                    title: tr("Kiosk offline in Thinadhoo", "ތިނަދޫ ކިއޮސްކް އޮފްލައިން"),
                    description: tr("Engineer dispatched", "އިންޖިނިއަރު ފޮނުވައިފި"),
                    time: minutesAgo(95),
                    status: "pending",
                  },
                ]}
              />
            </Card>

            <div className="ag-glass ag-chart p-5 min-w-0 rounded-2xl">
              <BarChart
                title={tr("Load by atoll", "އަތޮޅުން ލޯޑް")}
                description={tr("Requests in the last 24 hours", "ފަހުގެ 24 ގަޑިއިރު")}
                data={atolls}
                categoryKey="atoll"
                config={{ load: { label: tr("Requests", "ރިކުއެސްޓް"), color: "var(--ag-a)" } }}
                orientation="horizontal"
                valueFormat="integer"
                height={260}
                radius={8}
              />
            </div>

            <Card
              headingLevel={2}
              className="ag-glass ag-spot lg:col-span-2 xl:col-span-1 rounded-2xl"
              title={tr("Quick actions", "އަވަސް ކަންކަން")}
              description={tr("Common duty-officer tasks", "ޑިއުޓީ އޮފިސަރުގެ މަސައްކަތް")}
            >
              <ul className="gap-3 sm:grid-cols-3 xl:grid-cols-2 grid grid-cols-2">
                {quickActions.map((a) => (
                  <li key={a.icon}>
                    <Button
                      variant="outline"
                      className="ag-ghost py-4 gap-2 h-auto w-full flex-col rounded-xl"
                      onClick={() => toast(a.label)}
                    >
                      <span className="ag-chip size-9 grid place-items-center rounded-lg text-primary">
                        <Icon name={a.icon} className="size-4" />
                      </span>
                      <span className="text-sm">{a.label}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Transactions and health */}
          <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
            <Card
              headingLevel={2}
              className="ag-glass min-w-0 rounded-2xl"
              title={tr("Recent transactions", "ފަހުގެ ޓްރާންޒެކްޝަން")}
              description={tr("Payments across every service", "ހުރިހާ ޚިދުމަތެއްގެ ފައިސާ")}
              actions={
                <Button variant="ghost" size="sm" endIcon="arrow-right">
                  {tr("View all", "ހުރިހާ")}
                </Button>
              }
            >
              <DataTable
                className="ag-table"
                caption={tr("Recent transactions", "ފަހުގެ ޓްރާންޒެކްޝަން")}
                columns={columns}
                data={transactions}
                selectable={false}
                pagination={false}
                noun={
                  dv
                    ? { one: "ޓްރާންޒެކްޝަން", other: "ޓްރާންޒެކްޝަން" }
                    : { one: "transaction", other: "transactions" }
                }
              />
            </Card>

            <Card
              headingLevel={2}
              className="ag-glass ag-spot rounded-2xl"
              title={tr("Service health", "ސަރވިސްގެ ހާލަތު")}
              description={tr("Uptime, last 30 days", "އަޕްޓައިމް، ފަހުގެ 30 ދުވަސް")}
            >
              <ul className="gap-5 grid">
                {health.map((h) => (
                  <li key={h.name} className="gap-2 grid">
                    <div className="gap-2 text-sm flex items-center justify-between">
                      <span className="gap-2 font-medium flex items-center">
                        <span
                          aria-hidden
                          className={h.status === "success" ? "ag-pulse" : "size-2 rounded-full bg-warning"}
                        />
                        {h.name}
                      </span>
                      <span className="font-mono text-muted-foreground tabular-nums" dir="ltr">
                        {h.uptime.toFixed(2)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={h.uptime}
                      label={h.name}
                      classNames={{
                        header: "sr-only",
                        indicator:
                          h.status === "success"
                            ? "bg-linear-to-r rtl:bg-linear-to-l from-primary/60 to-primary"
                            : "bg-warning",
                      }}
                    />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </AuroraShell>
    </AuroraRoot>
  )
}
