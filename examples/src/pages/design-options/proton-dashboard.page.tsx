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
  Timeline,
  toast,
  UserAvatar,
  type TimelineItem,
} from "@javaabu/onu"
import { ChartStyleProvider, PieChart, StatTile, TimeSeriesChart } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { showHref, STATUSES, TODAY, useApplications, useLabels, type Application } from "../admin-records/_data"
import { ProtonShell, PT_ROUTES } from "./_proton"

export const meta = {
  title: "Proton · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 31,
  description:
    "Inspired by the Proton design system's account dashboard: plan and usage panels, a security checklist, flat charts and recent activity on warm-grey layers.",
}

const DAY = 86_400_000
const dayString = (t: number) => new Date(t).toISOString().slice(0, 10)

/** A Proton dashboard panel: a white card with a light border, 12px corners and no shadow. */
function Panel({
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
      classNames={{ title: "pt-panel-title" }}
    >
      {children}
    </Card>
  )
}

/** A checklist row: a round check (done) or an empty ring (to do), title, hint and an action. */
function CheckRow({
  done,
  title,
  hint,
  action,
}: {
  done: boolean
  title: string
  hint: string
  action?: React.ReactNode
}) {
  const tr = useTr()
  return (
    <li className="pt-check gap-3 py-2.5 flex items-center">
      <span className={done ? "pt-check__mark pt-check__mark--done" : "pt-check__mark"} aria-hidden>
        {done ? <Icon name="check" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-sm font-medium block">
          {title}
          <span className="sr-only"> ({done ? tr("done", "ނިމިއްޖެ") : tr("to do", "ކުރަންޖެހޭ")})</span>
        </span>
        <span className="text-xs block text-muted-foreground">{hint}</span>
      </span>
      {action}
    </li>
  )
}

export default function ProtonDashboardPage() {
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
  const rate = (list: Application[]) =>
    list.length ? list.filter((a) => a.status === "approved").length / list.length : 0

  const perWeek = Array.from({ length: 12 }, (_, i) => {
    const end = today - (11 - i) * 7 * DAY
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
  const byStatus = STATUSES.map((s) => ({
    name: labels.status(s.value),
    value: apps.filter((a) => a.status === s.value).length,
  }))
  const recent = [...apps].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6)

  const [backupCodes, setBackupCodes] = React.useState(false)
  const checks = [
    {
      done: true,
      title: tr("Two-factor authentication", "ޓޫ-ފެކްޓަރ އޮތެންޓިކޭޝަން"),
      hint: tr("Authenticator app on 2 devices", "2 ޑިވައިސްގައި އޮތެންޓިކޭޓަރ"),
    },
    {
      done: true,
      title: tr("Recovery email", "ރިކަވަރީ އީމެއިލް"),
      hint: "s•••a@atoll.mv",
    },
    {
      done: true,
      title: tr("Staff roles reviewed", "މުވައްޒަފުންގެ ރޯލް ބަލައިފި"),
      hint: tr("Last review 2 Oct 2026", "ފަހުން ބެލީ 2 އޮކްޓޫބަރު 2026"),
    },
    {
      done: backupCodes,
      title: tr("Backup codes", "ބެކަޕް ކޯޑު"),
      hint: backupCodes
        ? tr("Downloaded today", "މިއަދު ޑައުންލޯޑްކުރެވިއްޖެ")
        : tr("Download codes in case you lose your device", "ޑިވައިސް ގެއްލިއްޖެނަމަ ބޭނުންކުރެވޭނެ ކޯޑު"),
      action: backupCodes ? undefined : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setBackupCodes(true)
            toast.success(tr("Backup codes downloaded", "ބެކަޕް ކޯޑު ޑައުންލޯޑްކުރެވިއްޖެ"))
          }}
        >
          {tr("Download", "ޑައުންލޯޑް")}
        </Button>
      ),
    },
  ]
  const doneCount = checks.filter((c) => c.done).length

  const activity: TimelineItem[] = [
    {
      title: tr("12 building permits approved", "12 ބިނާކުރުމުގެ ހުއްދަ ފާސްކުރެވިއްޖެ"),
      description: tr("By Ibrahim Nazeer", "އިބްރާހީމް ނަޒީރު"),
      time: "2026-10-07T09:40:00",
      status: "success",
      icon: "check",
    },
    {
      title: tr("MVR 18,250 in fees reconciled", "ރ. 18,250 ފީ ބަލައިގަނެވިއްޖެ"),
      description: tr("Bank of Maldives transfer", "ބޭންކް އޮފް މޯލްޑިވްސް"),
      time: "2026-10-07T08:15:00",
      icon: "credit-card",
    },
    {
      title: tr("New sign-in from Addu City", "އައްޑޫ ސިޓީން އައު ސައިން-އިން"),
      description: tr("Firefox on Windows · verified with 2FA", "ފަޔަރފޮކްސް · 2FA އިން ކަށަވަރުކުރެވިފަ"),
      time: "2026-10-06T16:02:00",
      icon: "lock",
    },
    {
      title: tr("240 records imported", "240 ރެކޯޑު އިމްޕޯޓްކުރެވިއްޖެ"),
      description: tr("From the Addu City registry", "އައްޑޫ ސިޓީގެ ރަޖިސްޓަރީން"),
      time: "2026-10-06T11:30:00",
      icon: "upload",
    },
    {
      title: tr("3 vessel registrations suspended", "3 އުޅަނދު ރަޖިސްޓްރީ ހުއްޓާލެވިއްޖެ"),
      time: "2026-10-05T14:12:00",
      status: "warning",
      icon: "warning",
    },
  ]

  const plan = [
    tr("10 staff seats", "10 މުވައްޒަފުންގެ ޖާގަ"),
    tr("2,000 records per month", "މަހަކު 2,000 ރެކޯޑު"),
    tr("Unlimited islands and services", "ރަށާއި ޚިދުމަތުގެ ލިމިޓެއް ނެތް"),
    tr("Audit log for 1 year", "1 އަހަރުގެ އޮޑިޓް ލޮގް"),
  ]

  return (
    <ProtonShell
      breadcrumbs={[
        { label: tr("Home", "ފުރަތަމަ ސަފްހާ"), href: PT_ROUTES.dashboard },
        { label: tr("Dashboard", "ޑޭޝްބޯޑް") },
      ]}
    >
      <ChartStyleProvider gradient={false}>
        <div className="gap-6 grid">
          <header className="gap-3 flex flex-wrap items-end justify-between">
            <div className="gap-1 grid">
              <h1 className="pt-h1">{tr("Dashboard", "ޑޭޝްބޯޑް")}</h1>
              <p className="text-sm text-muted-foreground">
                {tr(
                  `Welcome back, Shifa. ${pending.length} applications are waiting for review.`,
                  `މަރުޙަބާ، ޝިފާ. ${pending.length} އެޕްލިކޭޝަން ރިވިއުއަށް އިންތިޒާރުގައި.`,
                )}
              </p>
            </div>
            <div className="gap-2 flex flex-wrap">
              <LinkButton href={routes.adminRecords.export} variant="outline" startIcon="download">
                {tr("Export report", "ރިޕޯޓް އެކްސްޕޯޓް")}
              </LinkButton>
              <LinkButton href={PT_ROUTES.index} endIcon="arrow-right">
                {tr("Review applications", "އެޕްލިކޭޝަން ރިވިއުކުރޭ")}
              </LinkButton>
            </div>
          </header>

          {/* Plan, usage and security: the Proton account dashboard row */}
          <div className="gap-4 lg:grid-cols-2 xl:grid-cols-3 grid">
            <Panel
              title={tr("Your plan", "ތިބާގެ ޕްލޭން")}
              actions={<span className="pt-chip">{tr("Annual", "އަހަރީ")}</span>}
            >
              <div className="gap-4 grid">
                <div>
                  <p className="pt-plan-name">{tr("Atoll Professional", "އެޓޮލް ޕްރޮފެޝަނަލް")}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">MVR 1,240</span>{" "}
                    {tr("per month, renews 1 Jan 2027", "މަހަކު، 1 ޖަނަވަރީ 2027 ގައި އާވާނެ")}
                  </p>
                </div>
                <ul className="gap-2 grid">
                  {plan.map((p) => (
                    <li key={p} className="gap-2 text-sm flex items-center">
                      <Icon name="check" className="pt-tick size-4 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="gap-2 flex flex-wrap">
                  <LinkButton href={routes.adminSettings.settings}>{tr("Upgrade", "އަޕްގްރޭޑް")}</LinkButton>
                  <LinkButton href={routes.adminSettings.settings} variant="outline">
                    {tr("Manage plan", "ޕްލޭން ބަލަހައްޓާ")}
                  </LinkButton>
                </div>
              </div>
            </Panel>

            <Panel
              title={tr("Usage", "ބޭނުންކުރި މިންވަރު")}
              description={tr("Resets on 1 November", "1 ނޮވެމްބަރުގައި އަލުން ފަށާނެ")}
            >
              <div className="gap-5 grid">
                <ProgressBar
                  label={tr("Records this month", "މި މަހުގެ ރެކޯޑު")}
                  value={1284}
                  max={2000}
                  showValue
                  formatValue={(v, m) => `${v.toLocaleString("en")} / ${m.toLocaleString("en")}`}
                />
                <ProgressBar
                  label={tr("Staff seats", "މުވައްޒަފުންގެ ޖާގަ")}
                  value={7}
                  max={10}
                  showValue
                  formatValue={(v, m) => `${v} / ${m}`}
                />
                <ProgressBar
                  label={tr("Document storage", "ލިޔެކިޔުމުގެ ޖާގަ")}
                  value={14.2}
                  max={15}
                  showValue
                  className="pt-meter--warn"
                  formatValue={(v, m) => `${v} GB / ${m} GB`}
                />
                <p className="pt-note text-xs gap-2 flex items-start">
                  <Icon name="warning" className="size-4 shrink-0" />
                  {tr(
                    "Document storage is almost full. Archive old files or add space.",
                    "ލިޔެކިޔުމުގެ ޖާގަ ފުރެން ކައިރި. ޕުރާނާ ފައިލްތައް އާކައިވްކުރޭ ނުވަތަ ޖާގަ އިތުރުކުރޭ.",
                  )}
                </p>
              </div>
            </Panel>

            <Panel
              className="lg:col-span-2 xl:col-span-1"
              title={tr("Security checklist", "ސެކިއުރިޓީ ޗެކްލިސްޓް")}
              description={tr(
                `${doneCount} of ${checks.length} completed`,
                `${checks.length} ގެ ތެރެއިން ${doneCount} ނިމިއްޖެ`,
              )}
            >
              <ProgressBar
                value={doneCount}
                max={checks.length}
                size="sm"
                aria-label={tr("Security checklist progress", "ސެކިއުރިޓީ ޗެކްލިސްޓްގެ ކުރިއެރުން")}
                className="mb-1"
              />
              <ul className="pt-checklist">
                {checks.map((c) => (
                  <CheckRow key={c.title} {...c} />
                ))}
              </ul>
            </Panel>
          </div>

          {/* KPIs */}
          <section
            aria-label={tr("Key figures", "މުހިންމު އަދަދުތައް")}
            className="gap-4 sm:grid-cols-2 xl:grid-cols-4 grid"
          >
            <StatTile
              label={tr("New applications", "އައު އެޕްލިކޭޝަން")}
              value={last30.length}
              previousValue={prev30.length}
              deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
              icon="file-text"
              sparkline={perWeek.map((w) => w.applications)}
              sparklineGradient={false}
            />
            <StatTile
              label={tr("Fees collected", "ލިބުނު ފީ")}
              value={sum(last30)}
              previousValue={sum(prev30)}
              valueFormat="currency"
              deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
              icon="banknote"
            />
            <StatTile
              label={tr("Awaiting review", "ރިވިއުއަށް")}
              value={pending.length}
              delta={-0.043}
              positiveIsGood={false}
              deltaContext={tr("vs last week", "ފާއިތުވި ހަފްތާއާ")}
              icon="clock"
            />
            <StatTile
              label={tr("Approval rate", "ފާސްވާ މިންވަރު")}
              value={rate(last30)}
              valueFormat="percent"
              delta={rate(last30) - rate(prev30)}
              deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")}
              icon="success"
            />
          </section>

          {/* Charts */}
          <div className="gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
            <Panel
              title={tr("Applications per week", "ހަފްތާއަކަށް އެޕްލިކޭޝަން")}
              description={tr("Last 12 weeks", "ފާއިތުވި 12 ހަފްތާ")}
            >
              <TimeSeriesChart
                title={tr("Applications per week", "ހަފްތާއަކަށް އެޕްލިކޭޝަން")}
                hideTitle
                data={perWeek}
                config={{
                  applications: { label: tr("Received", "ލިބުނު"), color: "var(--chart-1)" },
                  approved: { label: tr("Approved", "ފާސްކުރެވިފަ"), color: "var(--chart-2)" },
                }}
                interval="week"
                valueFormat="integer"
                height={260}
              />
            </Panel>
            <Panel title={tr("By status", "ސްޓޭޓަސްއިން")} description={tr("All open records", "ހުރިހާ ރެކޯޑެއް")}>
              <PieChart
                title={tr("Applications by status", "ސްޓޭޓަސްއިން އެޕްލިކޭޝަން")}
                hideTitle
                variant="donut"
                data={byStatus}
                centerLabel={{ value: String(apps.length), label: tr("Total", "ޖުމްލަ") }}
                height={260}
              />
            </Panel>
          </div>

          <div className="gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
            <Panel
              title={tr("Recent applications", "ފަހުގެ އެޕްލިކޭޝަންތައް")}
              actions={
                <LinkButton
                  href={PT_ROUTES.index}
                  variant="ghost"
                  size="sm"
                  endIcon="arrow-right"
                  className="pt-link-btn"
                >
                  {tr("View all", "ހުރިހާ")}
                </LinkButton>
              }
            >
              <div className="-mx-4 overflow-x-auto">
                <Table className="pt-table min-w-[36rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tr("Applicant", "އެޕްލިކަންޓް")}</TableHead>
                      <TableHead>{tr("Service", "ޚިދުމަތް")}</TableHead>
                      <TableHead>{tr("Status", "ސްޓޭޓަސް")}</TableHead>
                      <TableHead className="text-end">{tr("Updated", "އަޕްޑޭޓްކުރި")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <span className="gap-3 flex items-center">
                            <UserAvatar name={labels.name(a)} size="sm" decorative className="pt-sq" />
                            <span className="min-w-0">
                              <ConditionalLink
                                href={showHref(a.id)}
                                className="font-medium block rounded-sm hover:underline"
                              >
                                {labels.name(a)}
                              </ConditionalLink>
                              <span className="text-xs block font-mono text-muted-foreground" dir="ltr">
                                {a.reference}
                              </span>
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>{labels.service(a.service)}</TableCell>
                        <TableCell>
                          <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />
                        </TableCell>
                        <TableCell className="text-end whitespace-nowrap text-muted-foreground">
                          {labels.date(a.updated)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Panel>

            <Panel
              title={tr("Recent activity", "ފަހުގެ ހަރަކާތްތައް")}
              actions={
                <LinkButton href={routes.adminRecords.activityLog} variant="ghost" size="sm" className="pt-link-btn">
                  {tr("Audit log", "އޮޑިޓް ލޮގް")}
                </LinkButton>
              }
            >
              <Timeline items={activity} size="sm" now={new Date("2026-10-07T12:00:00")} timeFormat="relative" />
            </Panel>
          </div>
        </div>
      </ChartStyleProvider>
    </ProtonShell>
  )
}
