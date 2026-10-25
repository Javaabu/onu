import * as React from "react"
import {
  Card,
  ConditionalLink,
  Icon,
  LinkButton,
  Pagination,
  ProgressBar,
  SegmentedControl,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  Timeline,
  UserAvatar,
  cn,
} from "@javaabu/onu"
import { CategoryChart, PieChart, Sparkline, StatTile } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import {
  ISLANDS,
  SERVICES,
  showHref,
  TODAY,
  useApplications,
  useLabels,
  type Application,
} from "../admin-records/_data"
import { PA_ROUTES, ProtonAntShell, Trend } from "./_proton-ant"

export const meta = {
  title: "ProtonAnt · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 61,
  description: "Proton Mail sidebar with Ant Design content elements",
}

const DAY = 86_400_000
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS_DV = ["ޖެނ", "ފެބ", "މާޗ", "އޭޕް", "މެއި", "ޖޫން", "ޖުލަ", "އޮގަ", "ސެޕް", "އޮކް", "ނޮވެ", "ޑިސެ"]

/**
 * Ant Pro's ChartCard is Onu's `StatTile`: a muted label with an info tip, a
 * big figure, a 46px chart slot and a footer row under a line.
 */
function ChartCard({
  title,
  tip,
  total,
  footer,
  children,
}: {
  title: string
  tip: string
  total: string
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return <StatTile label={title} tip={tip} value={total} chart={children} footer={footer} />
}

/** A field in a ChartCard footer: label then value. */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span className="pa-field">
      <span className="pa-field__label">{label}</span>
      <span className="pa-field__value tabular-nums">{value}</span>
    </span>
  )
}

/** Ant Pro's MiniBar: decorative column bars; the numbers are in the card. */
function MiniBar({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 1)
  return (
    <div className="pa-mini-bar" role="img" aria-label={label}>
      {values.map((v, i) => (
        <span key={i} style={{ blockSize: `${Math.max(6, (v / max) * 100)}%` }} />
      ))}
    </div>
  )
}

export default function ProtonAntDashboardPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const today = Date.parse(`${TODAY}T00:00:00Z`)
  const ts = (a: Application) => Date.parse(`${a.submitted}T00:00:00Z`)
  const sum = (list: Application[]) => list.reduce((s, a) => s + a.amount, 0)
  const months = labels.dv ? MONTHS_DV : MONTHS_EN

  const [period, setPeriod] = React.useState("year")
  const [channel, setChannel] = React.useState("all")
  const [kwPage, setKwPage] = React.useState(1)

  const last = (days: number) => apps.filter((a) => ts(a) > today - days * DAY && ts(a) <= today)
  const daily = Array.from({ length: 14 }, (_, i) => {
    const end = today - (13 - i) * DAY
    return apps.filter((a) => ts(a) > end - DAY * 7 && ts(a) <= end).length
  })
  const weekly = Array.from({ length: 16 }, (_, i) => {
    const end = today - (15 - i) * 7 * DAY
    return apps.filter((a) => ts(a) > end - 7 * DAY && ts(a) <= end).length
  })

  const approved = apps.filter((a) => a.status === "approved")
  const reviewed = apps.filter((a) => a.status === "approved" || a.status === "rejected")
  const approvalRate = reviewed.length ? Math.round((approved.length / reviewed.length) * 100) : 0

  // Sixteen weeks to TODAY, for the big bar chart (labelled by the week's first day).
  const perWeek = Array.from({ length: 16 }, (_, i) => {
    const end = today - (15 - i) * 7 * DAY
    const week = apps.filter((a) => ts(a) > end - 7 * DAY && ts(a) <= end)
    const start = new Date(end - 6 * DAY)
    return {
      week: `${start.getUTCDate()} ${months[start.getUTCMonth()]!}`,
      applications: week.length,
      fees: sum(week.filter((a) => a.status === "approved")),
    }
  })

  const ranking = ISLANDS.map((isl) => {
    const list = apps.filter((a) => a.island === isl.value)
    return { name: labels.island(isl.value), count: list.length, fees: sum(list) }
  })
    .sort((a, b) => b.count - a.count)
    .slice(0, 7)

  const keywords = SERVICES.flatMap((s, i) =>
    ISLANDS.slice(0, 3).map((isl, j) => ({
      id: `${s.value}-${isl.value}`,
      keyword: `${labels.service(s.value)} ${labels.island(isl.value)}`,
      users: apps.filter((a) => a.service === s.value && a.island === isl.value).length * 37 + 12 * (i + j),
      range: (((i * 7 + j * 13) % 60) - 20) / 1,
    })),
  )
    .sort((a, b) => b.users - a.users)
    .map((k, i) => ({ ...k, rank: i + 1 }))
  const kwPageSize = 5
  const kwRows = keywords.slice((kwPage - 1) * kwPageSize, kwPage * kwPageSize)

  const channelFilter = (a: Application) =>
    channel === "all"
      ? true
      : channel === "online"
        ? a.idCard.charCodeAt(2) % 3 !== 0
        : a.idCard.charCodeAt(2) % 3 === 0
  const byService = SERVICES.map((s) => ({
    name: labels.service(s.value),
    value: apps.filter((a) => a.service === s.value && channelFilter(a)).length,
  }))
  const channelTotal = byService.reduce((s, x) => s + x.value, 0)

  const recent = [...apps].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6)

  const activity = [
    {
      id: "1",
      title: tr("Aishath Shifa approved 12 building permits", "އައިޝަތު ޝިފާ 12 ބިނާކުރުމުގެ ހުއްދަ ފާސްކުރި"),
      time: new Date(today + 9.6 * 3600_000),
      status: "success" as const,
    },
    {
      id: "2",
      title: tr("MVR 18,250 in fees reconciled", "ރ. 18,250 ފީ ބަލައިގަނެވިއްޖެ"),
      time: new Date(today + 8.2 * 3600_000),
      status: "info" as const,
    },
    {
      id: "3",
      title: tr("Hussain Waheed joined the review team", "ޙުސައިން ވަޙީދު ރިވިއު ޓީމާ ގުޅިއްޖެ"),
      time: new Date(today - 8 * 3600_000),
      status: "default" as const,
    },
    {
      id: "4",
      title: tr("3 vessel registrations suspended", "3 އުޅަނދު ރަޖިސްޓްރީ ހުއްޓާލެވިއްޖެ"),
      time: new Date(today - 2 * DAY + 14 * 3600_000),
      status: "warning" as const,
    },
    {
      id: "5",
      title: tr("240 records imported from Addu City", "އައްޑޫ ސިޓީން 240 ރެކޯޑު އިމްޕޯޓްކުރެވިއްޖެ"),
      time: new Date(today - 3 * DAY + 11 * 3600_000),
      status: "pending" as const,
    },
  ]

  const periodLinks = (
    <div className="pa-extra">
      <div className="pa-extra__links" role="group" aria-label={tr("Period", "މުއްދަތު")}>
        {[
          { v: "today", l: tr("Today", "މިއަދު") },
          { v: "week", l: tr("This week", "މި ހަފްތާ") },
          { v: "month", l: tr("This month", "މި މަސް") },
          { v: "year", l: tr("This year", "މި އަހަރު") },
        ].map((p) => (
          <button
            key={p.v}
            type="button"
            aria-pressed={period === p.v}
            className={cn("pa-extra__link", period === p.v && "is-active")}
            onClick={() => setPeriod(p.v)}
          >
            {p.l}
          </button>
        ))}
      </div>
    </div>
  )

  const rankingList = (title: string, valueOf: (r: (typeof ranking)[number]) => string) => (
    <div className="pa-rank">
      <h3 className="pa-rank__title">{title}</h3>
      <ol className="pa-rank__list">
        {ranking.map((r, i) => (
          <li key={r.name}>
            <span className={cn("pa-rank__num", i < 3 && "is-top")}>{i + 1}</span>
            <span className="pa-rank__name">{r.name}</span>
            <span className="pa-rank__value tabular-nums">{valueOf(r)}</span>
          </li>
        ))}
      </ol>
    </div>
  )

  return (
    <ProtonAntShell
      layout="grey"
      breadcrumbs={[
        { label: tr("Home", "ފުރަތަމަ ސަފްހާ"), href: PA_ROUTES.dashboard },
        { label: tr("Dashboard", "ޑޭޝްބޯޑް") },
        { label: tr("Analysis", "އެނަލިސިސް") },
      ]}
      title={tr("Analysis", "އެނަލިސިސް")}
      subTitle={tr("Applications across every island", "ހުރިހާ ރަށެއްގެ އެޕްލިކޭޝަންތައް")}
      extra={
        <>
          <LinkButton href={routes.adminRecords.export} variant="outline" startIcon="download">
            {tr("Export", "އެކްސްޕޯޓް")}
          </LinkButton>
          <LinkButton href={PA_ROUTES.index} startIcon="file-text">
            {tr("Review queue", "ރިވިއު ކިއު")}
          </LinkButton>
        </>
      }
    >
      <div className="gap-4 lg:gap-6 grid">
        {/* Four chart cards */}
        <section
          aria-label={tr("Key figures", "މުހިންމު އަދަދުތައް")}
          className="pa-row gap-4 lg:gap-6 sm:grid-cols-2 xl:grid-cols-4 grid"
        >
          <ChartCard
            title={tr("Total fees", "ޖުމްލަ ފީ")}
            tip={tr("Approved fees this year", "މި އަހަރު ފާސްވި ފީ")}
            total={`${labels.dv ? "ރ." : "MVR"} ${sum(approved).toLocaleString("en")}`}
            footer={
              <Field label={tr("Daily fees", "ދުވާލެއްގެ ފީ")} value={labels.mvr(Math.round(sum(last(30)) / 30))} />
            }
          >
            <div className="pa-trends">
              <Trend label={tr("WoW", "ހަފްތާ")} value={12} />
              <Trend label={tr("DoD", "ދުވަސް")} value={-11} />
            </div>
          </ChartCard>
          <ChartCard
            title={tr("Applications", "އެޕްލިކޭޝަން")}
            tip={tr("Submitted in the last 30 days", "ފާއިތުވި 30 ދުވަހު ހުށަހެޅި")}
            total={last(30).length.toLocaleString("en")}
            footer={
              <Field label={tr("Daily average", "ދުވާލެއްގެ އެވްރެޖް")} value={(last(30).length / 30).toFixed(1)} />
            }
          >
            <Sparkline
              data={daily}
              label={tr("Applications per day, last two weeks", "ދުވާލަކަށް އެޕްލިކޭޝަން")}
              variant="area"
              color="var(--pa-cyan)"
              height={46}
            />
          </ChartCard>
          <ChartCard
            title={tr("Payments", "ފައިސާ")}
            tip={tr("Paid applications this year", "މި އަހަރު ފައިސާ ދެއްކި")}
            total={approved.length.toLocaleString("en")}
            footer={<Field label={tr("Conversion rate", "ކޮންވާޝަން ރޭޓް")} value={`${approvalRate}%`} />}
          >
            <MiniBar values={weekly} label={tr("Payments per week, last 16 weeks", "ހަފްތާއަކަށް ފައިސާ")} />
          </ChartCard>
          <ChartCard
            title={tr("Service target", "ޚިދުމަތުގެ ލަނޑުދަނޑި")}
            tip={tr("Applications closed within 14 days", "14 ދުވަސް ތެރޭ ނިމުނު")}
            total="78%"
            footer={
              <div className="pa-trends">
                <Trend label={tr("WoW", "ހަފްތާ")} value={12} flip />
                <Trend label={tr("DoD", "ދުވަސް")} value={-11} flip />
              </div>
            }
          >
            <ProgressBar
              value={78}
              size="sm"
              className="pa-progress"
              aria-label={tr("Service target: 78%", "ޚިދުމަތުގެ ލަނޑުދަނޑި: 78%")}
            />
          </ChartCard>
        </section>

        {/* Sales card: tabs + bar chart + ranking */}
        <Card className="pa-sales-card" padded={false}>
          <Tabs
            variant="line"
            className="pa-card-tabs"
            listLabel={tr("Chart", "ޗާޓް")}
            items={[
              {
                value: "applications",
                label: tr("Applications", "އެޕްލިކޭޝަން"),
                content: (
                  <div className="pa-sales">
                    <CategoryChart
                      variant="bar"
                      title={tr("Applications per week", "ހަފްތާއަކަށް އެޕްލިކޭޝަން")}
                      data={perWeek}
                      categoryKey="week"
                      series={["applications"]}
                      config={{ applications: { label: tr("Applications", "އެޕްލިކޭޝަން"), color: "var(--pa-6)" } }}
                      valueFormat="integer"
                      gradient={false}
                      radius={0}
                      height={280}
                      classNames={{ title: "pa-chart-title" }}
                    />
                    {rankingList(tr("Islands by applications", "އެޕްލިކޭޝަނުގެ ތަރުތީބު"), (r) =>
                      r.count.toLocaleString("en"),
                    )}
                  </div>
                ),
              },
              {
                value: "fees",
                label: tr("Fees", "ފީ"),
                content: (
                  <div className="pa-sales">
                    <CategoryChart
                      variant="bar"
                      title={tr("Approved fees per week", "ހަފްތާއަކަށް ފާސްވި ފީ")}
                      data={perWeek}
                      categoryKey="week"
                      series={["fees"]}
                      config={{ fees: { label: tr("Fees", "ފީ"), color: "var(--pa-6)" } }}
                      valueFormat="currency"
                      gradient={false}
                      radius={0}
                      height={280}
                      classNames={{ title: "pa-chart-title" }}
                    />
                    {rankingList(tr("Islands by fees", "ފީގެ ތަރުތީބު"), (r) => labels.mvr(r.fees))}
                  </div>
                ),
              },
            ]}
          />
          <div className="pa-sales-card__extra">{periodLinks}</div>
        </Card>

        {/* Keywords + category pie */}
        <div className="gap-4 lg:gap-6 xl:grid-cols-2 grid">
          <Card
            headingLevel={2}
            title={tr("Top searches", "ގިނައިން ހޯދާ")}
            actions={
              <LinkButton href={PA_ROUTES.index} variant="ghost" size="icon-sm" aria-label={tr("More", "އިތުރަށް")}>
                <Icon name="more" />
              </LinkButton>
            }
          >
            <div className="gap-6 sm:grid-cols-2 grid">
              <StatTile
                label={tr("Search users", "ހޯދި މީހުން")}
                value={12321}
                delta={0.171}
                deltaContext={tr("vs last week", "ފާއިތުވި ހަފްތާއާ")}
                sparkline={daily}
                sparklineVariant="area"
                className="pa-stat"
              />
              <StatTile
                label={tr("Searches per user", "މީހަކު ހޯދި ފަހަރު")}
                value={2.7}
                valueFormat="number"
                delta={-0.262}
                deltaContext={tr("vs last week", "ފާއިތުވި ހަފްތާއާ")}
                sparkline={weekly}
                sparklineVariant="area"
                className="pa-stat"
              />
            </div>
            <div className="pa-table-wrap">
              <Table className="pa-simple-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{tr("Rank", "ތަރުތީބު")}</TableHead>
                    <TableHead>{tr("Keyword", "ކީވޯޑް")}</TableHead>
                    <TableHead className="text-end">{tr("Users", "މީހުން")}</TableHead>
                    <TableHead className="text-end">{tr("Weekly range", "ހަފްތާގެ ބަދަލު")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kwRows.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="tabular-nums">{k.rank}</TableCell>
                      <TableCell>
                        <ConditionalLink href={`${PA_ROUTES.index}`} className="pa-link">
                          {k.keyword}
                        </ConditionalLink>
                      </TableCell>
                      <TableCell className="text-end tabular-nums">{k.users.toLocaleString("en")}</TableCell>
                      <TableCell className="text-end">
                        <Trend value={Math.round(k.range)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="@container">
              <Pagination
                numbered
                page={kwPage}
                perPage={kwPageSize}
                total={keywords.length}
                onPageChange={setKwPage}
                size="sm"
                showSummary={false}
                className="pa-pagination pa-pagination--mini"
              />
            </div>
          </Card>

          <Card
            headingLevel={2}
            title={tr("Applications by service", "ޚިދުމަތުން އެޕްލިކޭޝަން")}
            actions={
              <SegmentedControl
                aria-label={tr("Channel", "ޗެނަލް")}
                value={channel}
                onValueChange={setChannel}
                options={[
                  { value: "all", label: tr("All", "ހުރިހާ") },
                  { value: "online", label: tr("Online", "އޮންލައިން") },
                  { value: "counter", label: tr("Counter", "ކައުންޓަރ") },
                ]}
                className="pa-segmented"
              />
            }
          >
            <h3 className="pa-subtitle">{tr("Share by service", "ޚިދުމަތުގެ ބައި")}</h3>
            <PieChart
              title={tr("Applications by service", "ޚިދުމަތުން އެޕްލިކޭޝަން")}
              hideTitle
              variant="donut"
              data={byService}
              centerLabel={{ value: String(channelTotal), label: tr("Applications", "އެޕްލިކޭޝަން") }}
              height={300}
            />
          </Card>
        </div>

        {/* Recent applications + activity */}
        <div className="gap-4 lg:gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,3fr)] grid">
          <Card
            headingLevel={2}
            title={tr("Recent applications", "ފަހުގެ އެޕްލިކޭޝަންތައް")}
            actions={
              <ConditionalLink href={PA_ROUTES.index} className="pa-link text-sm">
                {tr("View all", "ހުރިހާ")}
              </ConditionalLink>
            }
          >
            <div className="pa-table-wrap">
              <Table className="pa-simple-table min-w-[36rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{tr("Reference", "ރެފަރެންސް")}</TableHead>
                    <TableHead>{tr("Applicant", "އެޕްލިކަންޓް")}</TableHead>
                    <TableHead>{tr("Status", "ސްޓޭޓަސް")}</TableHead>
                    <TableHead className="text-end">{tr("Fee", "ފީ")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <ConditionalLink href={showHref(a.id)} className="pa-link">
                          {a.reference}
                        </ConditionalLink>
                      </TableCell>
                      <TableCell>
                        <span className="gap-2 inline-flex items-center whitespace-nowrap">
                          <UserAvatar
                            name={labels.name(a)}
                            size="xs"
                            decorative
                            classNames={{ fallback: "pa-avatar" }}
                          />
                          <span className="grid">
                            <span>{labels.name(a)}</span>
                            <span className="text-xs text-muted-foreground">{labels.service(a.service)}</span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={a.status}
                          statusMap={labels.statusMap}
                          icon={false}
                          className="pa-badge-status"
                        />
                      </TableCell>
                      <TableCell className="text-end whitespace-nowrap tabular-nums">{labels.mvr(a.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card headingLevel={2} title={tr("Activity", "ހަރަކާތްތައް")}>
            <Timeline items={activity} now={new Date(today + 12 * 3600_000)} className="pa-timeline" size="sm" />
          </Card>
        </div>
      </div>
    </ProtonAntShell>
  )
}
