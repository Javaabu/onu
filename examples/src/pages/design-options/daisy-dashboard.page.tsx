import * as React from "react"
import {
  ActivityFeed,
  Button,
  Card,
  Icon,
  LinkButton,
  SegmentedControl,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  UserAvatar,
  toast,
  useLinkComponent,
} from "@javaabu/onu"
import { BarChart, PieChart, StatTile, TimeSeriesChart } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { showHref, useApplications, useLabels, type ApplicationStatus } from "../admin-records/_data"
import { DaisyShell, DY_NOW, DY_ROUTES, minutesAgo, RadialProgress, Steps } from "./_daisy"

export const meta = {
  title: "Daisy · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 51,
  description:
    "A daisyUI-style admin dashboard: stats, charts in rounded boxes, radial targets, pipeline steps and an activity feed.",
}

// Fixed demo data (deterministic, so screenshots are stable).
const START = Date.parse("2026-09-09T00:00:00Z")
const DAY = 86_400_000
const DAILY = Array.from({ length: 30 }, (_, i) => {
  const weekly = [0.7, 1, 1.08, 1.04, 0.96, 0.5, 0.58][i % 7]!
  const base = (46 + i * 0.9 + Math.sin(i / 2.6) * 7) * weekly
  return {
    date: new Date(START + i * DAY).toISOString().slice(0, 10),
    received: Math.round(base),
    approved: Math.round(base * (0.72 + Math.sin(i / 4) * 0.06)),
  }
})
const SPARK = DAILY.slice(-14).map((d) => d.received)

export default function DaisyDashboardPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const [range, setRange] = React.useState("30d")
  const Link = useLinkComponent()

  const count = (s: ApplicationStatus) => apps.filter((a) => a.status === s).length
  const recent = [...apps].sort((a, b) => b.submitted.localeCompare(a.submitted)).slice(0, 6)

  const byService = [
    { service: tr("Building", "ބިނާ"), applications: 148 },
    { service: tr("Business", "ވިޔަފާރި"), applications: 112 },
    { service: tr("Trade", "ލައިސަންސް"), applications: 86 },
    { service: tr("Vessel", "އުޅަނދު"), applications: 64 },
    { service: tr("Land", "ބިން"), applications: 41 },
    { service: tr("Event", "ހަރަކާތް"), applications: 29 },
  ]

  const statusMix = [
    { status: "approved", value: 46 },
    { status: "in_review", value: 24 },
    { status: "submitted", value: 18 },
    { status: "rejected", value: 8 },
    { status: "suspended", value: 4 },
  ]

  const quickActions = [
    { icon: "add", tone: "primary", label: tr("New application", "އައު އެޕްލިކޭޝަން") },
    { icon: "calendar", tone: "secondary", label: tr("Book inspection", "ޗެކްކުރުން") },
    { icon: "megaphone", tone: "accent", label: tr("Notify applicants", "އެންގުން") },
    { icon: "download", tone: "neutral", label: tr("Daily report", "ދުވަހުގެ ރިޕޯޓް") },
  ]

  return (
    <DaisyShell current={DY_ROUTES.dashboard}>
      <div className="gap-6 grid">
        {/* Welcome hero */}
        <section
          aria-labelledby="dy-hello"
          className="dy-hero p-6 sm:p-8 gap-6 lg:flex-row lg:items-center flex flex-col"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold opacity-90">
              {tr("Thursday, 8 October · Case office", "ބުރާސްފަތި، 8 އޮކްޓޫބަރު · ކޭސް އޮފީސް")}
            </p>
            <h1 id="dy-hello" className="mt-2 font-extrabold tracking-tight text-[clamp(1.75rem,1.3rem+1.8vw,2.6rem)]">
              {tr("Good morning, Shifa!", "ސަލާމް، ޝިފާ!")}
            </h1>
            <p className="mt-2 max-w-xl opacity-90">
              {tr(
                "You have 14 applications to review today and 3 that are past their target. Let's clear them.",
                "މިއަދު ރިވިއުކުރަން 14 އެޕްލިކޭޝަން، އަދި 3 ވަނީ މުއްދަތު ހަމަވެފަ.",
              )}
            </p>
            <div className="mt-5 gap-2 flex flex-wrap">
              <LinkButton href={DY_ROUTES.index} endIcon="arrow-right" className="dy-btn-accent">
                {tr("Start reviewing", "ރިވިއު ފަށާ")}
              </LinkButton>
              <LinkButton href={routes.adminRecords.create} startIcon="add" className="dy-btn-secondary">
                {tr("New application", "އައު އެޕްލިކޭޝަން")}
              </LinkButton>
            </div>
          </div>
          <div className="gap-3 sm:grid-cols-3 grid shrink-0 grid-cols-3">
            {[
              { value: "14", label: tr("to review", "ރިވިއު") },
              { value: "3", label: tr("overdue", "ލަސްވެފަ") },
              { value: "9", label: tr("inspections", "ޗެކްކުރުން") },
            ].map((s) => (
              <div key={s.label} className="dy-hero__tile px-4 py-3 text-center">
                <p className="text-3xl font-extrabold tabular-nums" dir="ltr">
                  {s.value}
                </p>
                <p className="text-xs font-semibold opacity-90">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Toolbar */}
        <div className="gap-3 sm:flex-row sm:items-center flex flex-col justify-between">
          <h2 className="text-xl font-extrabold tracking-tight">{tr("Overview", "ޚުލާޞާ")}</h2>
          <div className="gap-2 flex flex-wrap items-center">
            <div className="dy-join">
              <SegmentedControl
                aria-label={tr("Date range", "ތާރީޚުގެ ދައުރު")}
                value={range}
                onValueChange={setRange}
                size="sm"
                options={[
                  { value: "7d", label: tr("7 days", "7 ދުވަސް") },
                  { value: "30d", label: tr("30 days", "30 ދުވަސް") },
                  { value: "90d", label: tr("90 days", "90 ދުވަސް") },
                ]}
              />
            </div>
            <Button variant="outline" size="sm" startIcon="download">
              {tr("Export", "އެކްސްޕޯޓް")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <section aria-label={tr("Key figures", "މުހިންމު ޢަދަދުތައް")} className="dy-stats">
          <StatTile
            data-tone="primary"
            className="dy-stat-figure"
            label={tr("Applications received", "ލިބުނު އެޕްލިކޭޝަން")}
            value={1284}
            previousValue={1102}
            icon="file-text"
            sparkline={SPARK}
            deltaContext={tr("vs last 30 days", "ކުރީގެ 30 ދުވަހާ")}
          />
          <StatTile
            data-tone="secondary"
            className="dy-stat-figure"
            label={tr("Approved", "ފާސްކުރެވުނު")}
            value={1080}
            previousValue={948}
            icon="success"
            deltaContext={tr("vs last 30 days", "ކުރީގެ 30 ދުވަހާ")}
          />
          <StatTile
            data-tone="accent"
            className="dy-stat-figure"
            label={tr("Avg. days to decision", "ނިންމަން ދުވަސް (އެވްރެޖް)")}
            value={3.4}
            previousValue={4.1}
            positiveIsGood={false}
            valueFormat={{ maximumFractionDigits: 1 }}
            icon="clock"
            deltaContext={tr("vs last 30 days", "ކުރީގެ 30 ދުވަހާ")}
          />
          <StatTile
            data-tone="neutral"
            className="dy-stat-figure"
            label={tr("Fees collected", "ލިބުނު ފީ")}
            value={412_880}
            previousValue={371_400}
            valueFormat="currency"
            icon="banknote"
            deltaContext={tr("vs last 30 days", "ކުރީގެ 30 ދުވަހާ")}
          />
        </section>

        {/* Trend and targets */}
        <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
          <Card className="min-w-0">
            <TimeSeriesChart
              title={tr("Applications per day", "ދުވާލަކު އެޕްލިކޭޝަން")}
              description={tr("Received and approved, last 30 days", "ލިބުނު އަދި ފާސްވި، ފަހުގެ 30 ދުވަސް")}
              data={DAILY}
              config={{
                received: { label: tr("Received", "ލިބުނު"), color: "var(--dy-primary)" },
                approved: { label: tr("Approved", "ފާސްވި"), color: "var(--dy-secondary-ink)" },
              }}
              interval="day"
              area
              valueFormat="integer"
              height={270}
              classNames={{ title: "font-bold" }}
            />
          </Card>
          <Card
            headingLevel={2}
            title={tr("Monthly targets", "މަހުގެ ލަނޑުދަނޑިތައް")}
            description={tr("October, 8 days in", "އޮކްޓޫބަރު، 8 ދުވަސް")}
            actions={
              <span className="dy-badge" data-tone="success">
                {tr("On track", "ރަނގަޅަށް")}
              </span>
            }
          >
            <ul className="gap-4 grid">
              {[
                {
                  value: 72,
                  tone: "primary" as const,
                  label: tr("Applications closed", "ނިމުނު އެޕްލިކޭޝަން"),
                  hint: tr("1,080 of 1,500", "1,500 އިން 1,080"),
                },
                {
                  value: 91,
                  tone: "secondary" as const,
                  label: tr("Decided within 5 days", "5 ދުވަހުގެ ތެރޭގައި"),
                  hint: tr("Target 85%", "ލަނޑުދަނޑި 85%"),
                },
                {
                  value: 58,
                  tone: "accent" as const,
                  label: tr("Inspections done", "ޗެކްކުރެވުނު"),
                  hint: tr("52 of 90 booked", "90 އިން 52"),
                },
              ].map((t) => (
                <li key={t.label} className="gap-4 flex items-center">
                  <RadialProgress value={t.value} tone={t.tone} label={t.label} size="4.5rem" />
                  <span className="min-w-0 grid">
                    <span className="font-semibold">{t.label}</span>
                    <span className="text-sm dy-muted">{t.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Pipeline */}
        <Card
          headingLevel={2}
          title={tr("Application pipeline", "އެޕްލިކޭޝަންގެ ދަތުރު")}
          description={tr("Where this month's applications are now", "މި މަހުގެ އެޕްލިކޭޝަންތައް މިހާރު އޮތް ތަން")}
          className="@container"
        >
          <Steps
            label={tr("Application pipeline", "އެޕްލިކޭޝަންގެ ދަތުރު")}
            steps={[
              { label: tr("Submitted", "ހުށަހެޅި"), count: 312, done: true },
              { label: tr("Documents checked", "ލިޔެކިޔުން ބެލުނު"), count: 268, done: true },
              { label: tr("In review", "ރިވިއުކުރަނީ"), count: 94, current: true },
              { label: tr("Inspection", "ޗެކްކުރުން"), count: 41 },
              { label: tr("Decision", "ނިންމުން"), count: 27 },
            ]}
          />
        </Card>

        {/* Services, status mix, quick actions */}
        <div className="gap-6 lg:grid-cols-2 xl:grid-cols-3 grid">
          <Card className="min-w-0">
            <BarChart
              title={tr("By service", "ޚިދުމަތުން")}
              description={tr("Applications this month", "މި މަހުގެ އެޕްލިކޭޝަން")}
              data={byService}
              categoryKey="service"
              config={{ applications: { label: tr("Applications", "އެޕްލިކޭޝަން"), color: "var(--dy-primary)" } }}
              valueFormat="integer"
              height={250}
              radius={8}
              classNames={{ title: "font-bold" }}
            />
          </Card>
          <Card className="min-w-0">
            <PieChart
              title={tr("Status mix", "ސްޓޭޓަސް")}
              description={tr("Share of open and closed cases", "ހުޅުވިފައި އަދި ނިމިފައި")}
              variant="donut"
              data={statusMix}
              nameKey="status"
              config={{
                approved: { label: labels.status("approved"), color: "var(--dy-success)" },
                in_review: { label: labels.status("in_review"), color: "var(--dy-secondary)" },
                submitted: { label: labels.status("submitted"), color: "var(--dy-info)" },
                rejected: { label: labels.status("rejected"), color: "var(--dy-error)" },
                suspended: { label: labels.status("suspended"), color: "var(--dy-warning)" },
              }}
              valueFormat={{ style: "unit", unit: "percent" }}
              centerLabel={{ value: "312", label: tr("cases", "ކޭސް") }}
              height={250}
              classNames={{ title: "font-bold" }}
            />
          </Card>
          <Card
            headingLevel={2}
            className="lg:col-span-2 xl:col-span-1"
            title={tr("Quick actions", "އަވަސް ކަންކަން")}
            description={tr("Shortcuts for today", "މިއަދަށް")}
          >
            <ul className="gap-3 grid grid-cols-2">
              {quickActions.map((a) => (
                <li key={a.label}>
                  <Button variant="outline" className="dy-quick w-full" onClick={() => toast(a.label)}>
                    <span className="dy-icon-chip" data-tone={a.tone}>
                      <Icon name={a.icon} className="size-5" />
                    </span>
                    <span className="text-sm whitespace-normal">{a.label}</span>
                  </Button>
                </li>
              ))}
            </ul>
            <p className="mt-4 gap-2 text-xs dy-muted flex flex-wrap items-center">
              {tr("Press", "ދަބާ")}
              <kbd>⌘</kbd>
              <kbd>K</kbd>
              {tr("to search anything", "ހޯދުމަށް")}
            </p>
          </Card>
        </div>

        {/* Recent applications and activity */}
        <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
          <Card
            headingLevel={2}
            className="min-w-0"
            padded={false}
            title={tr("Latest applications", "އެންމެ ފަހުގެ އެޕްލިކޭޝަން")}
            description={tr("Newest first", "އެންމެ އައު ފުރަތަމަ")}
            actions={
              <LinkButton href={DY_ROUTES.index} variant="ghost" size="sm" endIcon="arrow-right">
                {tr("View all", "ހުރިހާ")}
              </LinkButton>
            }
          >
            <div className="dy-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="ps-6">{tr("Applicant", "އެޕްލިކަންޓް")}</TableHead>
                    <TableHead>{tr("Service", "ޚިދުމަތް")}</TableHead>
                    <TableHead>{tr("Status", "ސްޓޭޓަސް")}</TableHead>
                    <TableHead className="pe-6 text-end">{tr("Fee", "ފީ")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="ps-6">
                        <Link href={showHref(a.id)} className="gap-3 flex items-center rounded-lg">
                          <UserAvatar name={labels.name(a)} size="sm" />
                          <span className="min-w-0 grid">
                            <span className="font-semibold truncate">{labels.name(a)}</span>
                            <span className="text-xs dy-muted font-mono" dir="ltr">
                              {a.reference}
                            </span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{labels.service(a.service)}</TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                      </TableCell>
                      <TableCell className="pe-6 font-semibold text-end whitespace-nowrap tabular-nums">
                        {labels.mvr(a.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card
            headingLevel={2}
            title={tr("Activity", "އެކްޓިވިޓީ")}
            description={tr("What the team did today", "މިއަދު ޓީމުން ކުރި ކަންކަން")}
            actions={
              <span className="dy-badge" data-tone="secondary">
                {tr(`${count("in_review")} in review`, `${count("in_review")} ރިވިއުގައި`)}
              </span>
            }
          >
            <ActivityFeed
              title={null}
              now={DY_NOW}
              groupByDay={false}
              items={[
                {
                  id: "1",
                  actor: { name: tr("Ibrahim Nazeer", "އިބްރާހީމް ނަޒީރު") },
                  action: tr("approved a building permit", "ބިނާކުރުމުގެ ހުއްދައެއް ފާސްކުރެއްވި"),
                  timestamp: minutesAgo(6),
                  detail: "APP-1042",
                },
                {
                  id: "2",
                  actor: { name: tr("Mariyam Rasheed", "މަރިޔަމް ރަޝީދު") },
                  action: tr("booked an inspection in Addu City", "އައްޑޫ ސިޓީގައި ޗެކްކުރުމެއް ބުކްކުރެއްވި"),
                  timestamp: minutesAgo(31),
                },
                {
                  id: "3",
                  actor: { name: tr("Hussain Waheed", "ޙުސައިން ވަޙީދު") },
                  action: tr("requested documents from an applicant", "ލިޔެކިޔުން ހުށަހަޅަން އެދިވަޑައިގެންނެވި"),
                  timestamp: minutesAgo(74),
                },
                {
                  id: "4",
                  actor: { name: tr("Aishath Shifa", "އައިޝަތު ޝިފާ") },
                  action: tr("exported this week's report", "މި ހަފްތާގެ ރިޕޯޓް އެކްސްޕޯޓްކުރެއްވި"),
                  timestamp: minutesAgo(160),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </DaisyShell>
  )
}
