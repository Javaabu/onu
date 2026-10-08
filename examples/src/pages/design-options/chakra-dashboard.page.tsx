import * as React from "react"
import {
  Button,
  Card,
  ConditionalLink,
  Icon,
  LinkButton,
  ProgressBar,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  Tag,
  toast,
} from "@javaabu/onu"
import { BarChart, PieChart, StatTile, TimeSeriesChart } from "@javaabu/onu/charts"

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
} from "../admin-records/_data"
import { CK_ROUTES, ChakraShell, StatHelp, ToneAvatar } from "./_chakra"

export const meta = {
  title: "Chakra · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 71,
  description:
    "A classic friendly admin: stat cards with icon tiles, tabbed chart cards, a progress table, team list and timeline.",
}

const DAY = 86_400_000
const dayString = (t: number) => new Date(t).toISOString().slice(0, 10)

const COMPLETION: Record<Application["status"], number> = {
  submitted: 20,
  in_review: 60,
  suspended: 45,
  rejected: 100,
  approved: 100,
}

/** A Chakra-style stat: label, big number, arrow help text, icon in a coloured rounded square. */
function Stat({
  label,
  value,
  valueFormat,
  delta,
  icon,
  tone,
  context,
  good,
}: {
  label: string
  value: number
  valueFormat?: React.ComponentProps<typeof StatTile>["valueFormat"]
  delta: number
  icon: string
  tone?: "alt" | "alt2" | "dark"
  context: string
  good?: boolean
}) {
  return (
    <StatTile
      className="ck-card-lift gap-1.5 relative"
      label={label}
      value={value}
      valueFormat={valueFormat}
      classNames={{ value: "text-2xl xl:text-xl 2xl:text-2xl", icon: "absolute top-1/2 -translate-y-1/2 end-4" }}
      icon={
        <span className={tone ? `ck-icon-tile ck-icon-tile--${tone}` : "ck-icon-tile"} aria-hidden>
          <Icon name={icon} />
        </span>
      }
      footer={<StatHelp value={delta} context={context} good={good} />}
    />
  )
}

function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card
      headingLevel={2}
      title={title}
      description={description}
      actions={actions}
      className={className}
      classNames={{ title: "ck-heading text-lg", header: "pt-1" }}
    >
      {children}
    </Card>
  )
}

export default function ChakraDashboardPage() {
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
  const pct = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : 0)
  const pending = apps.filter((a) => a.status === "submitted" || a.status === "in_review")
  const rate = (list: Application[]) =>
    list.length ? list.filter((a) => a.status === "approved").length / list.length : 0

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
    fees: sum(apps.filter((a) => a.service === s.value && a.status === "approved")),
  }))
  const byStatus = STATUSES.map((s) => ({
    name: labels.status(s.value),
    value: apps.filter((a) => a.status === s.value).length,
  }))
  const recent = [...apps].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6)

  const team = STAFF.map((s, i) => {
    const mine = apps.filter((a) => a.assignee === s.value)
    const open = mine.filter((a) => a.status === "submitted" || a.status === "in_review").length
    return {
      ...s,
      name: labels.staff(s.value),
      role: [
        tr("Senior officer", "ސީނިއަރ އޮފިސަރ"),
        tr("Reviewer", "ރިވިއުވަރ"),
        tr("Field inspector", "ފީލްޑް އިންސްޕެކްޓަރ"),
        tr("Finance", "ފައިނޭންސް"),
      ][i]!,
      open,
      done: mine.length ? Math.round(((mine.length - open) / mine.length) * 100) : 0,
      online: i !== 2,
    }
  })

  const [watched, setWatched] = React.useState(() => SERVICES.slice(0, 4).map((s) => s.value))

  const timeline = [
    {
      icon: "success",
      tone: "",
      title: tr("12 building permits approved", "12 ބިނާކުރުމުގެ ހުއްދަ ފާސްކުރެވިއްޖެ"),
      time: tr("Today, 09:40", "މިއަދު، 09:40"),
    },
    {
      icon: "credit-card",
      tone: "alt",
      title: tr("MVR 18,250 in fees reconciled", "ރ. 18,250 ފީ ބަލައިގަނެވިއްޖެ"),
      time: tr("Today, 08:15", "މިއަދު، 08:15"),
    },
    {
      icon: "user",
      tone: "alt2",
      title: tr("Hussain Waheed joined the review team", "ޙުސައިން ވަޙީދު ރިވިއު ޓީމާ ގުޅިއްޖެ"),
      time: tr("Yesterday, 16:02", "އިއްޔެ، 16:02"),
    },
    {
      icon: "upload",
      tone: "",
      title: tr("240 records imported from Addu City", "އައްޑޫ ސިޓީން 240 ރެކޯޑު އިމްޕޯޓްކުރެވިއްޖެ"),
      time: tr("6 Oct, 11:30", "6 އޮކްޓޫބަރު، 11:30"),
    },
    {
      icon: "warning",
      tone: "alt2",
      title: tr("3 vessel registrations suspended", "3 އުޅަނދު ރަޖިސްޓްރީ ހުއްޓާލެވިއްޖެ"),
      time: tr("5 Oct, 14:12", "5 އޮކްޓޫބަރު، 14:12"),
    },
  ]

  const quick = [
    { icon: "add", label: tr("New application", "އައު އެޕްލިކޭޝަން"), href: routes.adminRecords.create, tone: "" },
    { icon: "upload", label: tr("Import records", "ރެކޯޑު އިމްޕޯޓް"), href: routes.adminRecords.import, tone: "alt" },
    {
      icon: "download",
      label: tr("Export report", "ރިޕޯޓް އެކްސްޕޯޓް"),
      href: routes.adminRecords.export,
      tone: "alt2",
    },
    {
      icon: "users",
      label: tr("Invite staff", "މުވައްޒަފުން ދަޢުވަތު"),
      href: routes.adminSettings.users,
      tone: "dark",
    },
  ]

  return (
    <ChakraShell page={tr("Dashboard", "ޑޭޝްބޯޑް")}>
      <h1 className="sr-only">{tr("Dashboard", "ޑޭޝްބޯޑް")}</h1>
      <div className="gap-6 grid">
        {/* Stats */}
        <section
          aria-label={tr("Key figures", "މުހިންމު އަދަދުތައް")}
          className="gap-4 sm:grid-cols-2 xl:grid-cols-4 grid"
        >
          <Stat
            label={tr("New applications", "އައު އެޕްލިކޭޝަން")}
            value={last30.length}
            delta={pct(last30.length, prev30.length)}
            icon="file-text"
            context={tr("since last month", "ފާއިތުވި މަހުން")}
          />
          <Stat
            label={tr("Fees collected", "ލިބުނު ފީ")}
            value={sum(last30)}
            valueFormat="currency"
            delta={pct(sum(last30), sum(prev30))}
            icon="banknote"
            tone="alt"
            context={tr("since last month", "ފާއިތުވި މަހުން")}
          />
          <Stat
            label={tr("Awaiting review", "ރިވިއުއަށް")}
            value={pending.length}
            delta={-4.3}
            good={false}
            icon="clock"
            tone="alt2"
            context={tr("since last week", "ފާއިތުވި ހަފްތާއިން")}
          />
          <Stat
            label={tr("Approval rate", "ފާސްވާ މިންވަރު")}
            value={rate(last30)}
            valueFormat="percent"
            delta={(rate(last30) - rate(prev30)) * 100}
            icon="success"
            tone="dark"
            context={tr("since last month", "ފާއިތުވި މަހުން")}
          />
        </section>

        {/* Welcome banner + quick actions */}
        <div className="gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] grid">
          <section aria-labelledby="ck-welcome" className="ck-banner p-6 sm:p-8 gap-5 grid content-between">
            <div className="ck-banner__rings" aria-hidden />
            <div className="gap-2 max-w-xl grid">
              <p className="text-sm font-semibold ck-banner__muted">
                {tr("Wednesday, 7 October", "ބުދަ، 7 އޮކްޓޫބަރު")}
              </p>
              <h2 id="ck-welcome" className="text-2xl sm:text-3xl">
                {tr("Welcome back, Shifa", "މަރުޙަބާ، ޝިފާ")}
              </h2>
              <p className="ck-banner__muted">
                {tr(
                  `${pending.length} applications are waiting for review. Most are building permits from Hulhumalé.`,
                  `${pending.length} އެޕްލިކޭޝަން ރިވިއުއަށް އިންތިޒާރުގައި. ގިނައީ ހުޅުމާލޭގެ ބިނާކުރުމުގެ ހުއްދަ.`,
                )}
              </p>
            </div>
            <div className="gap-3 flex flex-wrap">
              <LinkButton href={CK_ROUTES.index} className="ck-banner__btn" endIcon="arrow-right" size="lg">
                {tr("Start reviewing", "ރިވިއު ފަށާ")}
              </LinkButton>
              <LinkButton
                href={routes.adminRecords.activityLog}
                variant="outline"
                className="ck-banner__ghost"
                size="lg"
              >
                {tr("View activity", "ހަރަކާތްތައް")}
              </LinkButton>
            </div>
          </section>

          <SectionCard title={tr("Quick actions", "އަވަސް ޢަމަލުތައް")}>
            <ul className="gap-3 grid grid-cols-2">
              {quick.map((q) => (
                <li key={q.icon}>
                  <ConditionalLink
                    href={q.href}
                    className="ck-card-lift gap-2 p-3 min-h-24 flex h-full flex-col items-start justify-between rounded-xl border bg-card"
                  >
                    <span
                      className={
                        q.tone
                          ? `ck-icon-tile ck-icon-tile--sm ck-icon-tile--${q.tone}`
                          : "ck-icon-tile ck-icon-tile--sm"
                      }
                      aria-hidden
                    >
                      <Icon name={q.icon} />
                    </span>
                    <span className="text-sm font-semibold">{q.label}</span>
                  </ConditionalLink>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* Charts */}
        <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
          <SectionCard
            title={tr("Application overview", "އެޕްލިކޭޝަންގެ ޚުލާޞާ")}
            description={
              <span>
                <span className="font-semibold text-success">{tr("+18% more", "18% އިތުރު")}</span>{" "}
                {tr("than the same period last year", "ވޭތުވި އަހަރުގެ މި މުއްދަތާ އަޅާބަލާއިރު")}
              </span>
            }
          >
            <Tabs
              className="ck-tabs"
              listLabel={tr("Chart", "ޗާޓް")}
              items={[
                {
                  value: "volume",
                  label: tr("Volume", "އަދަދު"),
                  content: (
                    <TimeSeriesChart
                      title={tr("Applications per week", "ހަފްތާއަކަށް އެޕްލިކޭޝަން")}
                      hideTitle
                      data={perWeek}
                      config={{
                        applications: { label: tr("Submitted", "ހުށަހެޅި"), color: "var(--c-accent)" },
                        approved: { label: tr("Approved", "ފާސްކުރެވިފަ"), color: "var(--c-alt)" },
                      }}
                      interval="week"
                      area
                      valueFormat="integer"
                      height={280}
                    />
                  ),
                },
                {
                  value: "fees",
                  label: tr("Fees", "ފީ"),
                  content: (
                    <BarChart
                      title={tr("Approved fees by service", "ޚިދުމަތުން ފާސްވި ފީ")}
                      hideTitle
                      data={byService}
                      categoryKey="service"
                      config={{ fees: { label: tr("Fees", "ފީ"), color: "var(--c-accent)" } }}
                      valueFormat="currency"
                      radius={8}
                      height={280}
                    />
                  ),
                },
              ]}
            />
          </SectionCard>

          <SectionCard title={tr("By status", "ސްޓޭޓަސްއިން")} description={tr("All open records", "ހުރިހާ ރެކޯޑެއް")}>
            <PieChart
              title={tr("Applications by status", "ސްޓޭޓަސްއިން އެޕްލިކޭޝަން")}
              hideTitle
              variant="donut"
              data={byStatus}
              centerLabel={{ value: String(apps.length), label: tr("Total", "ޖުމްލަ") }}
              height={260}
            />
          </SectionCard>
        </div>

        {/* Table + timeline */}
        <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
          <SectionCard
            title={tr("Applications", "އެޕްލިކޭޝަންތައް")}
            description={
              <span className="gap-1 inline-flex items-center">
                <Icon name="success" className="size-4 text-success" />
                <span>
                  <span className="font-semibold text-foreground">{tr("30 done", "30 ނިމިއްޖެ")}</span>{" "}
                  {tr("this month", "މި މަހު")}
                </span>
              </span>
            }
            actions={
              <LinkButton href={CK_ROUTES.index} variant="ghost" size="sm" className="ck-ghost" endIcon="arrow-right">
                {tr("View all", "ހުރިހާ")}
              </LinkButton>
            }
          >
            <div className="-mx-4 overflow-x-auto">
              <Table className="ck-table min-w-[40rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{tr("Applicant", "އެޕްލިކަންޓް")}</TableHead>
                    <TableHead>{tr("Service", "ޚިދުމަތް")}</TableHead>
                    <TableHead>{tr("Status", "ސްޓޭޓަސް")}</TableHead>
                    <TableHead>{tr("Completion", "ނިމުނު މިންވަރު")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="py-3">
                        <span className="gap-3 flex items-center">
                          <ToneAvatar name={labels.name(a)} size="sm" decorative />
                          <span className="min-w-0">
                            <ConditionalLink href={showHref(a.id)} className="font-semibold block hover:underline">
                              {labels.name(a)}
                            </ConditionalLink>
                            <span className="text-xs block font-mono text-muted-foreground">{a.reference}</span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{labels.service(a.service)}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                      </TableCell>
                      <TableCell>
                        <div className="gap-1 min-w-32 ck-progress--brand grid">
                          <span className="text-xs font-semibold tabular-nums" dir="ltr">
                            {COMPLETION[a.status]}%
                          </span>
                          <ProgressBar
                            value={COMPLETION[a.status]}
                            size="sm"
                            aria-label={tr(`${a.reference} progress`, `${a.reference} ކުރިއެރުން`)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          <SectionCard
            title={tr("Activity", "ހަރަކާތްތައް")}
            description={
              <span>
                <span className="font-semibold text-success">+30%</span> {tr("this month", "މި މަހު")}
              </span>
            }
          >
            <ol className="ck-timeline">
              {timeline.map((t) => (
                <li key={t.title}>
                  <span
                    className={t.tone ? `ck-timeline__dot ck-timeline__dot--${t.tone}` : "ck-timeline__dot"}
                    aria-hidden
                  >
                    <Icon name={t.icon} />
                  </span>
                  <p className="text-sm font-semibold">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.time}</p>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        {/* Team, watched services, notifications */}
        <div className="gap-6 lg:grid-cols-2 xl:grid-cols-3 grid">
          <SectionCard
            title={tr("Team members", "ޓީމު")}
            description={tr("Review workload this week", "މި ހަފްތާގެ ރިވިއު މަސައްކަތް")}
          >
            <ul className="gap-4 grid">
              {team.map((m) => (
                <li key={m.value} className="gap-3 flex items-center">
                  <ToneAvatar name={m.name} status={m.online ? "online" : "away"} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                  <span className="ck-badge">{tr(`${m.open} open`, `${m.open} ހުޅުވިފަ`)}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title={tr("Watched services", "ބަލަހައްޓާ ޚިދުމަތްތައް")}
            description={tr("Get notified when these change", "ބަދަލުވުމުން އެންގުން ލިބޭނެ")}
          >
            <div className="gap-5 grid">
              <div className="gap-2 flex flex-wrap">
                {watched.length ? (
                  watched.map((v, i) => (
                    <Tag
                      key={v}
                      size="lg"
                      className={["ck-tag", "ck-tag ck-tag--alt", "ck-tag ck-tag--alt2"][i % 3]}
                      removeLabel={tr(`Stop watching ${labels.service(v)}`, `${labels.service(v)} ބެލުން ހުއްޓާ`)}
                      onRemove={() => setWatched((w) => w.filter((x) => x !== v))}
                    >
                      {labels.service(v)}
                    </Tag>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {tr("Not watching anything.", "އެއްވެސް ޚިދުމަތެއް ނުބަލަހައްޓާ.")}
                  </p>
                )}
              </div>
              <div className="gap-3 grid">
                {SERVICES.slice(0, 3).map((s, i) => {
                  const n = apps.filter((a) => a.service === s.value).length
                  return (
                    <ProgressBar
                      key={s.value}
                      className={["ck-progress--brand", "ck-progress--alt", "ck-progress--alt2"][i]}
                      label={labels.service(s.value)}
                      value={n}
                      max={apps.length / 3}
                      formatValue={(v) => String(Math.round(v))}
                    />
                  )
                })}
              </div>
              <div className="gap-2 flex flex-wrap">
                <Button size="sm" onClick={() => toast.success(tr("Digest scheduled", "ޚުލާޞާ ފޮނުވާނެ"))}>
                  {tr("Send digest", "ޚުލާޞާ ފޮނުވާ")}
                </Button>
                <Button size="sm" variant="secondary" className="ck-subtle">
                  {tr("Subtle", "ސަބްޓަލް")}
                </Button>
                <Button size="sm" variant="outline" className="ck-outline">
                  {tr("Outline", "އައުޓްލައިން")}
                </Button>
                <Button size="sm" variant="ghost" className="ck-ghost">
                  {tr("Ghost", "ގޯސްޓް")}
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title={tr("Notifications", "ނޮޓިފިކޭޝަންތައް")}
            className="lg:col-span-2 xl:col-span-1"
            actions={<span className="ck-badge ck-badge--solid">{tr("3 new", "3 އައު")}</span>}
          >
            <ul className="gap-1 grid">
              {[
                {
                  icon: "file-text",
                  tone: "",
                  title: tr("New application from Hulhumalé", "ހުޅުމާލެއިން އައު އެޕްލިކޭޝަނެއް"),
                  meta: tr("12 minutes ago", "12 މިނެޓް ކުރިން"),
                },
                {
                  icon: "banknote",
                  tone: "alt",
                  title: tr("Payment received: MVR 2,500.00", "ފައިސާ ލިބިއްޖެ: ރ. 2,500.00"),
                  meta: tr("3 hours ago", "3 ގަޑިއިރު ކުރިން"),
                },
                {
                  icon: "warning",
                  tone: "alt2",
                  title: tr("Inspection overdue in Naifaru", "ނައިފަރުގައި އިންސްޕެކްޝަން ލަސްވެއްޖެ"),
                  meta: tr("Yesterday", "އިއްޔެ"),
                },
                {
                  icon: "calendar",
                  tone: "dark",
                  title: tr("Council meeting on Thursday", "ބުރާސްފަތި ދުވަހު ކައުންސިލް ބައްދަލުވުން"),
                  meta: tr("In 2 days", "2 ދުވަހުން"),
                },
              ].map((n) => (
                <li key={n.title} className="gap-3 p-2 -mx-2 flex items-center rounded-lg hover:bg-muted">
                  <span
                    className={
                      n.tone ? `ck-icon-tile ck-icon-tile--sm ck-icon-tile--${n.tone}` : "ck-icon-tile ck-icon-tile--sm"
                    }
                    aria-hidden
                  >
                    <Icon name={n.icon} />
                  </span>
                  <span className="min-w-0">
                    <span className="text-sm font-semibold block">{n.title}</span>
                    <span className="text-xs text-muted-foreground">{n.meta}</span>
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </ChakraShell>
  )
}
