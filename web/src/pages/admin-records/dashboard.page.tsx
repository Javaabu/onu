import * as React from "react"
import { Card, Checkbox, ConditionalLink, LinkButton, PageTitle, StatusBadge, Timeline, toast } from "@javaabu/onu"
import { CategoryChart, PieChart, StatTile, StatTiles, TimeSeriesChart } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { SERVICES, showHref, STATUSES, TODAY, useApplications, useLabels, type Application } from "./_data"
import { NewApplicationButton } from "./_index"

export const meta = {
  title: "Dashboard",
  group: "Admin: records",
  layout: "bare",
  order: 1,
}

const DAY = 86_400_000
const dayString = (t: number) => new Date(t).toISOString().slice(0, 10)

export default function DashboardPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const today = Date.parse(`${TODAY}T00:00:00Z`)
  const inLast = (a: Application, from: number, to = 0) => {
    const t = Date.parse(`${a.submitted}T00:00:00Z`)
    return t > today - from * DAY && t <= today - to * DAY
  }
  const last30 = apps.filter((a) => inLast(a, 30))
  const prev30 = apps.filter((a) => inLast(a, 60, 30))
  const sum = (list: Application[]) => list.reduce((s, a) => s + a.amount, 0)
  const pending = apps.filter((a) => a.status === "submitted" || a.status === "in_review")
  const approvedRate = (list: Application[]) =>
    list.length ? list.filter((a) => a.status === "approved").length / list.length : 0

  // Applications per week for the last 16 weeks.
  const perWeek = Array.from({ length: 16 }, (_, i) => {
    const end = today - (15 - i) * 7 * DAY
    const week = apps.filter((a) => {
      const t = Date.parse(`${a.submitted}T00:00:00Z`)
      return t > end - 7 * DAY && t <= end
    })
    return {
      date: dayString(end - 6 * DAY),
      applications: week.length,
      approved: week.filter((a) => a.status === "approved").length,
    }
  })
  const byService = SERVICES.map((s) => ({
    service: labels.service(s.value),
    revenue: sum(last30.filter((a) => a.service === s.value)),
  }))
  const byStatus = STATUSES.map((s) => ({
    name: labels.status(s.value),
    value: apps.filter((a) => a.status === s.value).length,
  }))

  const mine = pending.filter((a) => a.assignee === "shifa").slice(0, 6)
  const [done, setDone] = React.useState<string[]>([])
  const recent = [...apps].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6)

  return (
    <AdminShell contentWidth="wide" breadcrumbs={[{ label: tr("Dashboard", "ޑޭޝްބޯޑް") }]}>
      <div className="gap-6 grid">
        <PageTitle
          title={tr("Good morning, Shifa", "ސަލާމް، ޝިފާ")}
          description={tr(
            "Applications across all islands, last 30 days.",
            "ހުރިހާ ރަށްރަށުގެ އެޕްލިކޭޝަންތައް، ފަހުގެ 30 ދުވަސް.",
          )}
          action={<NewApplicationButton />}
          actions={
            <LinkButton href={routes.adminRecords.export} variant="outline" startIcon="download">
              {tr("Export", "އެކްސްޕޯޓް")}
            </LinkButton>
          }
        />

        <StatTiles>
          <StatTile
            label={tr("New applications", "އައު އެޕްލިކޭޝަން")}
            value={last30.length}
            previousValue={prev30.length}
            icon="file-text"
            deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ އަޅާބަލާއިރު")}
            sparkline={perWeek.map((d) => d.applications)}
          />
          <StatTile
            label={tr("Fees collected", "ލިބުނު ފީ")}
            value={sum(last30)}
            previousValue={sum(prev30)}
            valueFormat="currency"
            icon="credit-card"
            deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ އަޅާބަލާއިރު")}
          />
          <StatTile
            asChild
            label={tr("Awaiting review", "ރިވިއުއަށް އިންތިޒާރުގައި")}
            value={pending.length}
            icon="clock"
          >
            <ConditionalLink href={`${routes.adminRecords.indexTable}`}>
              {tr("Awaiting review", "ރިވިއުއަށް އިންތިޒާރުގައި")}
            </ConditionalLink>
          </StatTile>
          <StatTile
            label={tr("Approval rate", "ފާސްކުރެވޭ މިންވަރު")}
            value={approvedRate(last30)}
            delta={approvedRate(last30) - approvedRate(prev30)}
            valueFormat="percent"
            icon="success"
            deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ އަޅާބަލާއިރު")}
          />
        </StatTiles>

        <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
          <div className="min-w-0 p-4 rounded-xl border bg-card">
            <TimeSeriesChart
              title={tr("Applications per week", "ހަފްތާއަކަށް އެޕްލިކޭޝަން")}
              description={tr(
                "Submitted and approved, last 16 weeks",
                "ހުށަހެޅުނު އަދި ފާސްކުރެވުނު، ފަހުގެ 16 ހަފްތާ",
              )}
              data={perWeek}
              config={{
                applications: { label: tr("Submitted", "ހުށަހެޅި") },
                approved: { label: tr("Approved", "ފާސްކުރެވިފަ") },
              }}
              interval="week"
              area
              valueFormat="integer"
              height={260}
            />
          </div>
          <div className="min-w-0 p-4 rounded-xl border bg-card">
            <PieChart
              title={tr("By status", "ސްޓޭޓަސްއިން")}
              description={tr("All open records", "ހުރިހާ ރެކޯޑެއް")}
              variant="donut"
              data={byStatus}
              centerLabel={{ value: String(apps.length), label: tr("Total", "ޖުމްލަ") }}
              height={260}
            />
          </div>
        </div>

        <div className="gap-6 xl:grid-cols-3 grid">
          <div className="min-w-0 p-4 rounded-xl border bg-card">
            <CategoryChart
              variant="bar"
              title={tr("Fees by service", "ޚިދުމަތުން ލިބުނު ފީ")}
              description={tr("Last 30 days", "ފަހުގެ 30 ދުވަސް")}
              data={byService}
              categoryKey="service"
              config={{ revenue: { label: tr("Fees", "ފީ") } }}
              orientation="horizontal"
              valueFormat="currency"
              height={280}
            />
          </div>

          <Card
            headingLevel={2}
            title={tr("My tasks", "އަޅުގަނޑުގެ މަސައްކަތް")}
            description={tr("Applications assigned to you", "ތިބާއާ ޙަވާލުކުރެވިފައިވާ އެޕްލިކޭޝަން")}
            footer={
              <LinkButton href={routes.adminRecords.indexKanban} variant="link" endIcon="arrow-right" className="px-0">
                {tr("Open the board", "ބޯޑް ހުޅުވާ")}
              </LinkButton>
            }
          >
            <ul className="gap-3 grid">
              {mine.map((a) => (
                <li key={a.id} className="gap-3 flex items-start">
                  <Checkbox
                    aria-label={tr(`Mark ${a.reference} as done`, `${a.reference} ނިމިއްޖެ`)}
                    checked={done.includes(a.id)}
                    onCheckedChange={(on) => {
                      setDone((d) => (on ? [...d, a.id] : d.filter((x) => x !== a.id)))
                      if (on) toast(tr("Task done", "މަސައްކަތް ނިމިއްޖެ"), { description: a.reference })
                    }}
                    className="mt-0.5"
                  />
                  <div className={done.includes(a.id) ? "min-w-0 flex-1 line-through opacity-60" : "min-w-0 flex-1"}>
                    <ConditionalLink href={showHref(a.id)} className="text-sm font-medium font-mono hover:underline">
                      {a.reference}
                    </ConditionalLink>
                    <p className="text-xs text-muted-foreground">
                      {labels.name(a)} · {labels.service(a.service)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                </li>
              ))}
            </ul>
          </Card>

          <Card
            headingLevel={2}
            title={tr("Recent activity", "ފަހުގެ ހަރަކާތްތައް")}
            footer={
              <LinkButton href={routes.adminRecords.activityLog} variant="link" endIcon="arrow-right" className="px-0">
                {tr("View all", "ހުރިހާ ހަރަކާތެއް")}
              </LinkButton>
            }
          >
            <Timeline
              aria-label={tr("Recent activity", "ފަހުގެ ހަރަކާތްތައް")}
              timeFormat="relative"
              items={recent.map((a) => ({
                id: a.id,
                actor: a.assignee ? { name: labels.staff(a.assignee) } : null,
                icon: a.assignee ? undefined : "file-text",
                title: (
                  <>
                    {tr("set ", "")}
                    <ConditionalLink href={showHref(a.id)} className="text-xs font-mono underline">
                      {a.reference}
                    </ConditionalLink>
                    {tr(` to ${labels.status(a.status)}`, ` ގެ ސްޓޭޓަސް: ${labels.status(a.status)}`)}
                  </>
                ),
                time: `${a.updated}T09:30:00`,
              }))}
            />
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
