import * as React from "react"
import {
  ConditionalLink,
  Icon,
  LinkButton,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  Timeline,
  UserAvatar,
} from "@javaabu/onu"
import { PieChart, StatTile, TimeSeriesChart } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import {
  SERVICES,
  showHref,
  ISLANDS,
  TODAY,
  useApplications,
  useLabels,
  type Application,
} from "../admin-records/_data"
import { FB_ROUTES, FbCard, FlowbiteShell, Pill, Trend, type PillTone } from "./_flowbite"

export const meta = {
  title: "Flowbite · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 41,
  description:
    "Inspired by the Flowbite Admin Dashboard: a sales area chart with a big number, latest customers, sparkline stats, top lists, a donut and a timeline.",
}

const DAY = 86_400_000
const dayString = (t: number) => new Date(t).toISOString().slice(0, 10)

const SERVICE_ICONS: Record<string, string> = {
  building: "building",
  business: "file-text",
  land: "map-pin",
  vessel: "navigation",
  event: "calendar",
  trade: "credit-card",
}

const TRANSACTION: Record<Application["status"], { tone: PillTone; en: string; dv: string }> = {
  approved: { tone: "green", en: "Completed", dv: "ނިމިއްޖެ" },
  in_review: { tone: "purple", en: "In progress", dv: "ކުރިއަށް ދަނީ" },
  submitted: { tone: "brand", en: "Pending", dv: "އިންތިޒާރުގައި" },
  rejected: { tone: "red", en: "Cancelled", dv: "ކެންސަލް" },
  suspended: { tone: "yellow", en: "On hold", dv: "ހިފަހައްޓާފައި" },
}

/** Flowbite's uppercase brand link with a chevron ("SALES REPORT ›"). */
function ReportLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <ConditionalLink href={href} className="fb-report-link">
      {children}
      <Icon name="chevron-right" className="size-4 rtl:rotate-180" />
    </ConditionalLink>
  )
}

export default function FlowbiteDashboardPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const [range, setRange] = React.useState("30")
  const today = Date.parse(`${TODAY}T00:00:00Z`)
  const time = (a: Application) => Date.parse(`${a.submitted}T00:00:00Z`)
  const between = (a: Application, from: number, to = 0) => time(a) > today - from * DAY && time(a) <= today - to * DAY
  const sum = (list: Application[]) => list.reduce((s, a) => s + a.amount, 0)
  const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : 0)

  const days = Number(range)
  const current = apps.filter((a) => between(a, days))
  const previous = apps.filter((a) => between(a, days * 2, days))
  const weekly = days > 30
  const step = weekly ? 7 : 1
  const points = Math.ceil(days / step)
  const salesSeries = Array.from({ length: points }, (_, i) => {
    const end = today - (points - 1 - i) * step * DAY
    // A trailing 7-day window keeps the line smooth, like Flowbite's sales chart.
    const bucket = apps.filter((a) => time(a) > end - Math.max(step, 7) * DAY && time(a) <= end)
    return { date: dayString(end), fees: sum(bucket), previous: Math.round(sum(bucket) * 0.82 + 400) }
  })

  const weeks = Array.from({ length: 12 }, (_, i) => {
    const end = today - (11 - i) * 7 * DAY
    return apps.filter((a) => time(a) > end - 7 * DAY && time(a) <= end)
  })
  const last30 = apps.filter((a) => between(a, 30))
  const prev30 = apps.filter((a) => between(a, 60, 30))
  const approvedRate = (list: Application[]) =>
    list.length ? list.filter((a) => a.status === "approved").length / list.length : 0

  const customers = [...apps].sort((a, b) => b.submitted.localeCompare(a.submitted)).slice(0, 5)
  const transactions = [...apps].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6)

  const byService = SERVICES.map((s) => {
    const mine = apps.filter((a) => a.service === s.value)
    return {
      value: s.value,
      name: labels.service(s.value),
      count: mine.length,
      delta: pct(mine.filter((a) => between(a, 30)).length, mine.filter((a) => between(a, 60, 30)).length),
    }
  }).sort((a, b) => b.count - a.count)
  const byIsland = ISLANDS.map((i) => {
    const mine = apps.filter((a) => a.island === i.value)
    return {
      value: i.value,
      name: labels.island(i.value),
      count: mine.length,
      delta: pct(mine.filter((a) => between(a, 30)).length, mine.filter((a) => between(a, 60, 30)).length),
    }
  })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const byStatus = [
    { name: tr("Approved", "ފާސްކުރެވިފަ"), value: apps.filter((a) => a.status === "approved").length },
    { name: tr("In review", "ރިވިއުކުރަނީ"), value: apps.filter((a) => a.status === "in_review").length },
    { name: tr("Submitted", "ހުށަހެޅި"), value: apps.filter((a) => a.status === "submitted").length },
    {
      name: tr("Closed", "ބަންދުކުރެވިފަ"),
      value: apps.filter((a) => a.status === "rejected" || a.status === "suspended").length,
    },
  ]

  const rangeSelect = (
    <div className="w-40">
      <Select
        aria-label={tr("Date range", "ތާރީޚު")}
        size="sm"
        className="fb-range w-full"
        value={range}
        onValueChange={setRange}
        options={[
          { value: "7", label: tr("Last 7 days", "ފަހު 7 ދުވަސް") },
          { value: "30", label: tr("Last 30 days", "ފަހު 30 ދުވަސް") },
          { value: "90", label: tr("Last 90 days", "ފަހު 90 ދުވަސް") },
        ]}
      />
    </div>
  )

  const topList = (rows: { value: string; name: string; count: number; delta: number }[], icon?: boolean) => (
    <ul className="fb-divided">
      {rows.map((r) => (
        <li key={r.value} className="gap-3 py-3 flex items-center">
          {icon ? (
            <span className="fb-icon-tile" aria-hidden>
              <Icon name={SERVICE_ICONS[r.value] ?? "file"} />
            </span>
          ) : (
            <UserAvatar name={r.name} size="sm" decorative />
          )}
          <span className="min-w-0 flex-1">
            <span className="font-semibold block truncate text-foreground">{r.name}</span>
            <span className="text-sm block text-muted-foreground">
              {tr(`${r.count} applications`, `${r.count} އެޕްލިކޭޝަން`)}
            </span>
          </span>
          <Trend value={r.delta} className="text-sm" />
        </li>
      ))}
    </ul>
  )

  return (
    <FlowbiteShell>
      <h1 className="sr-only">{tr("Dashboard", "ޑޭޝްބޯޑް")}</h1>
      <div className="gap-4 grid">
        {/* Sales chart + latest customers */}
        <div className="gap-4 xl:grid-cols-3 grid">
          <FbCard
            className="xl:col-span-2"
            footer={
              <>
                {rangeSelect}
                <ReportLink href={routes.adminRecords.export}>{tr("Fees report", "ފީގެ ރިޕޯޓް")}</ReportLink>
              </>
            }
          >
            <div className="gap-4 mb-4 flex flex-wrap items-start justify-between">
              <div className="gap-1 grid">
                <p className="fb-number text-2xl sm:text-3xl" dir="ltr">
                  {labels.mvr(sum(current))}
                </p>
                <h2 className="text-base text-muted-foreground">
                  {tr(`Fees collected, last ${days} days`, `ފަހު ${days} ދުވަހު ލިބުނު ފީ`)}
                </h2>
              </div>
              <Trend value={pct(sum(current), sum(previous))} className="text-base" />
            </div>
            <TimeSeriesChart
              title={tr("Fees collected", "ލިބުނު ފީ")}
              hideTitle
              data={salesSeries}
              config={{
                fees: { label: tr("This period", "މި މުއްދަތު"), color: "var(--chart-1)" },
                previous: { label: tr("Previous period", "ކުރީގެ މުއްދަތު"), color: "var(--chart-2)" },
              }}
              interval={weekly ? "week" : "day"}
              area
              valueFormat="currency"
              height={300}
            />
          </FbCard>

          <FbCard
            title={tr("Latest applicants", "އެންމެ ފަހުގެ އެޕްލިކަންޓުން")}
            actions={
              <LinkButton href={FB_ROUTES.index} variant="ghost" size="sm" className="fb-link-btn">
                {tr("View all", "ހުރިހާ")}
              </LinkButton>
            }
            footer={
              <>
                <span className="text-sm text-muted-foreground">{tr("Last 7 days", "ފަހު 7 ދުވަސް")}</span>
                <ReportLink href={FB_ROUTES.index}>{tr("Full report", "ފުރިހަމަ ރިޕޯޓް")}</ReportLink>
              </>
            }
          >
            <ul className="fb-divided">
              {customers.map((a) => (
                <li key={a.id} className="gap-3 py-3 sm:py-4 flex items-center">
                  <UserAvatar name={labels.name(a)} size="sm" decorative />
                  <span className="min-w-0 flex-1">
                    <ConditionalLink
                      href={showHref(a.id)}
                      className="font-medium block truncate text-foreground hover:underline"
                    >
                      {labels.name(a)}
                    </ConditionalLink>
                    <span className="text-sm block truncate text-muted-foreground">{a.email}</span>
                  </span>
                  <span className="font-semibold whitespace-nowrap text-foreground tabular-nums">
                    {labels.mvr(a.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </FbCard>
        </div>

        {/* Stat cards with sparklines */}
        <section
          aria-label={tr("Key figures", "މުހިންމު އަދަދުތައް")}
          className="gap-4 md:grid-cols-2 xl:grid-cols-3 grid"
        >
          <StatTile
            className="fb-stat"
            label={tr("New applications", "އައު އެޕްލިކޭޝަން")}
            value={last30.length}
            delta={pct(last30.length, prev30.length) / 100}
            deltaContext={tr("since last month", "ފާއިތުވި މަހުން")}
            sparkline={weeks.map((w) => w.length)}
          />
          <StatTile
            className="fb-stat"
            label={tr("Fees collected", "ލިބުނު ފީ")}
            value={sum(last30)}
            valueFormat="currency"
            delta={pct(sum(last30), sum(prev30)) / 100}
            deltaContext={tr("since last month", "ފާއިތުވި މަހުން")}
            sparkline={weeks.map((w) => sum(w))}
          />
          <StatTile
            className="fb-stat md:col-span-2 xl:col-span-1"
            label={tr("Approval rate", "ފާސްވާ މިންވަރު")}
            value={approvedRate(last30)}
            valueFormat="percent"
            delta={approvedRate(last30) - approvedRate(prev30)}
            deltaContext={tr("since last month", "ފާއިތުވި މަހުން")}
            sparkline={weeks.map((w) => Math.round(approvedRate(w) * 100))}
            sparklineVariant="line"
          />
        </section>

        {/* Top lists + donut */}
        <div className="gap-4 xl:grid-cols-2 grid">
          <FbCard
            title={tr("Top services", "އެންމެ ގިނައިން ބޭނުންކުރާ")}
            footer={
              <>
                <span className="text-sm text-muted-foreground">{tr("Last 30 days", "ފަހު 30 ދުވަސް")}</span>
                <ReportLink href={FB_ROUTES.index}>{tr("All services", "ހުރިހާ ޚިދުމަތެއް")}</ReportLink>
              </>
            }
          >
            <Tabs
              className="fb-tabs"
              listLabel={tr("Top lists", "ލިސްޓުތައް")}
              items={[
                { value: "services", label: tr("Services", "ޚިދުމަތްތައް"), content: topList(byService, true) },
                { value: "islands", label: tr("Islands", "ރަށްތައް"), content: topList(byIsland) },
              ]}
            />
          </FbCard>

          <FbCard
            title={tr("Applications by status", "ސްޓޭޓަސްއިން")}
            description={tr("All records this year", "މި އަހަރުގެ ހުރިހާ ރެކޯޑެއް")}
            footer={
              <>
                <span className="text-sm text-muted-foreground">{tr("Updated today", "މިއަދު އަޕްޑޭޓްކުރެވިފަ")}</span>
                <ReportLink href={FB_ROUTES.index}>{tr("Status report", "ސްޓޭޓަސް ރިޕޯޓް")}</ReportLink>
              </>
            }
          >
            <PieChart
              title={tr("Applications by status", "ސްޓޭޓަސްއިން އެޕްލިކޭޝަން")}
              hideTitle
              variant="donut"
              data={byStatus}
              centerLabel={{ value: String(apps.length), label: tr("Total", "ޖުމްލަ") }}
              height={300}
            />
          </FbCard>
        </div>

        {/* Transactions + timeline */}
        <div className="gap-4 xl:grid-cols-3 grid">
          <FbCard
            className="xl:col-span-2"
            title={tr("Transactions", "މުޢާމަލާތު")}
            description={tr("The latest fee payments and refunds.", "އެންމެ ފަހުގެ ފީ ދެއްކުންތަކާއި ރީފަންޑުތައް.")}
            actions={
              <LinkButton href={routes.adminRecords.export} variant="outline" size="sm" startIcon="download">
                {tr("Export", "އެކްސްޕޯޓް")}
              </LinkButton>
            }
            footer={
              <>
                <span className="text-sm text-muted-foreground">
                  {tr(`Showing ${transactions.length} of ${apps.length}`, `${apps.length} ން ${transactions.length}`)}
                </span>
                <ReportLink href={FB_ROUTES.index}>{tr("Transactions report", "މުޢާމަލާތުގެ ރިޕޯޓް")}</ReportLink>
              </>
            }
          >
            <div className="fb-table-wrap">
              <Table className="fb-table min-w-[40rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{tr("Transaction", "މުޢާމަލާތު")}</TableHead>
                    <TableHead>{tr("Date", "ތާރީޚު")}</TableHead>
                    <TableHead className="text-end">{tr("Amount", "އަދަދު")}</TableHead>
                    <TableHead>{tr("Reference", "ރެފަރެންސް")}</TableHead>
                    <TableHead>{tr("Status", "ސްޓޭޓަސް")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((a) => {
                    const t = TRANSACTION[a.status]
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {a.status === "rejected"
                              ? tr("Refund to ", "ރީފަންޑް: ")
                              : tr("Payment from ", "ފައިސާ ދެއްކީ: ")}
                          </span>
                          <ConditionalLink
                            href={showHref(a.id)}
                            className="font-semibold text-foreground hover:underline"
                          >
                            {labels.name(a)}
                          </ConditionalLink>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{labels.date(a.updated)}</TableCell>
                        <TableCell className="font-semibold text-end whitespace-nowrap text-foreground tabular-nums">
                          {a.status === "rejected" ? "−" : ""}
                          {labels.mvr(a.amount)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{a.reference}</TableCell>
                        <TableCell>
                          <Pill tone={t.tone}>{tr(t.en, t.dv)}</Pill>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </FbCard>

          <FbCard title={tr("Latest activity", "އެންމެ ފަހުގެ ހަރަކާތްތައް")}>
            <Timeline
              className="fb-timeline"
              aria-label={tr("Latest activity", "އެންމެ ފަހުގެ ހަރަކާތްތައް")}
              items={[
                {
                  id: "1",
                  title: tr("12 building permits approved", "12 ބިނާކުރުމުގެ ހުއްދަ ފާސްކުރެވިއްޖެ"),
                  description: tr(
                    "The weekly batch from Hulhumalé Phase 2 cleared review.",
                    "ހުޅުމާލެ ފޭސް 2 ގެ ހަފްތާގެ ބެޗް ރިވިއު ނިމިއްޖެ.",
                  ),
                  time: "2026-10-07T09:40:00",
                  status: "current",
                  content: (
                    <LinkButton
                      href={FB_ROUTES.index}
                      variant="outline"
                      size="sm"
                      className="fb-btn-alt mt-1"
                      endIcon="arrow-right"
                    >
                      {tr("Review queue", "ރިވިއު ކިއު")}
                    </LinkButton>
                  ),
                },
                {
                  id: "2",
                  title: tr("MVR 18,250 in fees reconciled", "ރ. 18,250 ފީ ބަލައިގަނެވިއްޖެ"),
                  description: tr(
                    "Finance matched 46 bank transfers.",
                    "ފައިނޭންސުން 46 ބޭންކް ޓްރާންސްފަރ ގުޅާލައިފި.",
                  ),
                  time: "2026-10-07T08:15:00",
                },
                {
                  id: "3",
                  title: tr("Hussain Waheed joined the review team", "ޙުސައިން ވަޙީދު ރިވިއު ޓީމާ ގުޅިއްޖެ"),
                  time: "2026-10-06T16:02:00",
                },
                {
                  id: "4",
                  title: tr("240 records imported from Addu City", "އައްޑޫ ސިޓީން 240 ރެކޯޑު އިމްޕޯޓްކުރެވިއްޖެ"),
                  time: "2026-10-06T11:30:00",
                },
              ]}
            />
          </FbCard>
        </div>
      </div>
    </FlowbiteShell>
  )
}
