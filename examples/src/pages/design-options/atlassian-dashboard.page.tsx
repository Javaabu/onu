import * as React from "react"
import {
  ActionMenu,
  ActivityFeed,
  Breadcrumbs,
  Button,
  ConditionalLink,
  DataTable,
  Icon,
  LinkButton,
  ProgressBar,
  UserAvatarGroup,
  type DataTableColumn,
} from "@javaabu/onu"
import { ChartStyleProvider, PieChart, StatTile, StatTiles, TimeSeriesChart } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { showHref, STAFF, STATUSES, TODAY, useApplications, useLabels, type Application } from "../admin-records/_data"
import {
  ATL_NOW,
  ATL_ROUTES,
  AtlassianShell,
  AtlAvatar,
  Gadget,
  GadgetActions,
  issueKey,
  Lozenge,
  PriorityIcon,
  priorityLabel,
  priorityOf,
  STATUS_APPEARANCE,
  TypeIcon,
} from "./_atlassian"

export const meta = {
  title: "Atlassian · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 51,
  description:
    "Inspired by the Atlassian Design System (Jira dashboards): gadgets on a sunken canvas, created-vs-resolved and pie charts, an activity stream and a cycle-health bar.",
}

const DAY = 86_400_000
const dayString = (t: number) => new Date(t).toISOString().slice(0, 10)
const STATUS_COLOR: Record<string, string> = {
  submitted: "var(--atl-chart-neutral)",
  in_review: "var(--atl-chart-brand)",
  approved: "var(--atl-chart-green)",
  rejected: "var(--atl-chart-red)",
  suspended: "var(--atl-chart-orange)",
}

export default function AtlassianDashboardPage() {
  const tr = useTr()
  const labels = useLabels()
  const apps = useApplications()
  const today = Date.parse(`${TODAY}T00:00:00Z`)
  const at = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)
  const within = (iso: string, from: number, to = 0) => at(iso) > today - from * DAY && at(iso) <= today - to * DAY
  const closed = (a: Application) => a.status === "approved" || a.status === "rejected"

  const created30 = apps.filter((a) => within(a.submitted, 30))
  const createdPrev = apps.filter((a) => within(a.submitted, 60, 30))
  const resolved30 = apps.filter((a) => closed(a) && within(a.updated, 30))
  const resolvedPrev = apps.filter((a) => closed(a) && within(a.updated, 60, 30))
  const open = apps.filter((a) => !closed(a))
  const unassigned = open.filter((a) => !a.assignee)

  // Created vs resolved, per week for 12 weeks.
  const weeks = Array.from({ length: 12 }, (_, i) => {
    const end = today - (11 - i) * 7 * DAY
    const inWeek = (iso: string) => at(iso) > end - 7 * DAY && at(iso) <= end
    return {
      date: dayString(end - 6 * DAY),
      created: apps.filter((a) => inWeek(a.submitted)).length,
      resolved: apps.filter((a) => closed(a) && inWeek(a.updated)).length,
    }
  })

  const byStatus = STATUSES.map((s) => ({ status: s.value, value: apps.filter((a) => a.status === s.value).length }))
  const statusConfig = Object.fromEntries(
    STATUSES.map((s) => [s.value, { label: labels.status(s.value), color: STATUS_COLOR[s.value] }]),
  )

  const mine = open
    .filter((a) => a.assignee === "shifa")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
  const recent = [...apps].sort((a, b) => b.submitted.localeCompare(a.submitted)).slice(0, 6)
  const stream = [...apps].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 7)

  // "Sprint health": the current review cycle split into done / in progress / to do.
  const cycle = apps.filter((a) => within(a.submitted, 14))
  const done = cycle.filter(closed).length
  const doing = cycle.filter((a) => a.status === "in_review" || a.status === "suspended").length
  const todo = cycle.length - done - doing
  const pct = (n: number) => (cycle.length ? Math.round((n / cycle.length) * 100) : 0)

  const recentColumns: DataTableColumn<Application>[] = [
    {
      id: "type",
      header: tr("Type", "ބާވަތް"),
      className: "w-10",
      cell: (a) => <TypeIcon service={a.service} label={labels.service(a.service)} />,
    },
    { id: "key", header: tr("Key", "ކީ"), primary: true, accessor: (a) => issueKey(a), className: "atl-key-cell" },
    {
      id: "summary",
      header: tr("Summary", "ޚުލާސާ"),
      cell: (a) => <span className="atl-summary">{labels.name(a)}</span>,
    },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      cell: (a) => <Lozenge appearance={STATUS_APPEARANCE[a.status]}>{labels.status(a.status)}</Lozenge>,
    },
    {
      id: "created",
      header: tr("Created", "ހެދި"),
      cell: (a) => <span className="whitespace-nowrap">{labels.date(a.submitted)}</span>,
    },
  ]

  return (
    <AtlassianShell active="dashboard" sunken>
      <ChartStyleProvider gradient={false}>
        <div className="gap-4 grid">
          <div className="gap-1 grid">
            <Breadcrumbs
              items={[
                { label: tr("Dashboards", "ޑޭޝްބޯޑުތައް"), href: ATL_ROUTES.dashboard },
                { label: tr("Permits operations", "ހުއްދަތަކުގެ މަސައްކަތް") },
              ]}
              classNames={{ list: "atl-crumbs" }}
            />
            <div className="gap-3 flex flex-wrap items-center justify-between">
              <h1 className="atl-heading-lg">{tr("Permits operations", "ހުއްދަތަކުގެ މަސައްކަތް")}</h1>
              <div className="gap-2 flex flex-wrap items-center">
                <UserAvatarGroup
                  users={STAFF.map((s) => ({ id: s.value, name: labels.staff(s.value) }))}
                  size="sm"
                  max={3}
                  classNames={{ avatar: "atl-group-avatar" }}
                />
                <Button variant="outline" startIcon="star">
                  {tr("Star", "ތަރި")}
                </Button>
                <Button variant="outline" startIcon="share">
                  {tr("Share", "ޝެއާ")}
                </Button>
                <Button variant="outline" startIcon="edit">
                  {tr("Edit", "އެޑިޓް")}
                </Button>
                <ActionMenu
                  label={tr("More dashboard actions", "ޑޭޝްބޯޑުގެ އިތުރު")}
                  items={[
                    { id: "copy", label: tr("Copy dashboard", "ކޮޕީ ކުރޭ"), icon: "copy" },
                    { id: "print", label: tr("Print", "ޕްރިންޓް"), icon: "print" },
                  ]}
                />
              </div>
            </div>
          </div>

          <StatTiles className="atl-metrics">
            <StatTile
              label={tr("Created", "ހެދި")}
              value={created30.length}
              previousValue={createdPrev.length}
              icon="file-text"
              deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ އަޅާބަލާއިރު")}
            />
            <StatTile
              label={tr("Resolved", "ނިމުނު")}
              value={resolved30.length}
              previousValue={resolvedPrev.length}
              icon="success"
              deltaContext={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ އަޅާބަލާއިރު")}
            />
            <StatTile label={tr("Open", "ހުޅުވިފައި")} value={open.length} icon="clock" />
            <StatTile
              label={tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}
              value={unassigned.length}
              icon="user"
              positiveIsGood={false}
            />
          </StatTiles>

          <div className="atl-dash-grid">
            <div className="gap-4 min-w-0 grid content-start">
              <Gadget
                title={tr("Assigned to me", "އަޅުގަނޑާ ޙަވާލުކުރެވިފަ")}
                actions={<GadgetActions name={tr("Assigned to me", "އަޅުގަނޑާ ޙަވާލުކުރެވިފަ")} tr={tr} />}
                bodyClassName="p-0!"
              >
                <ul className="atl-issue-list">
                  {mine.map((a) => {
                    const p = priorityOf(a)
                    return (
                      <li key={a.id}>
                        <TypeIcon service={a.service} label={labels.service(a.service)} />
                        <ConditionalLink href={showHref(a.id)} className="atl-key">
                          {issueKey(a)}
                        </ConditionalLink>
                        <span className="atl-summary min-w-0 flex-1 truncate">
                          {labels.service(a.service)} · {labels.name(a)}
                        </span>
                        <span className="sr-only">{priorityLabel(p, tr)}</span>
                        <PriorityIcon priority={p} />
                        <Lozenge appearance={STATUS_APPEARANCE[a.status]}>{labels.status(a.status)}</Lozenge>
                      </li>
                    )
                  })}
                </ul>
                <div className="atl-gadget__foot">
                  <ConditionalLink href={`${ATL_ROUTES.index}?atl_assignee=shifa`} className="atl-link text-sm">
                    {tr(
                      `View all ${open.filter((a) => a.assignee === "shifa").length} issues`,
                      "ހުރިހާ އެއްޗެއް ބައްލަވާ",
                    )}
                  </ConditionalLink>
                </div>
              </Gadget>

              <Gadget
                title={tr("Review cycle health", "ރިވިއު ސައިކަލްގެ ޙާލަތު")}
                actions={<GadgetActions name={tr("Review cycle health", "ރިވިއު ސައިކަލްގެ ޙާލަތު")} tr={tr} />}
              >
                <div className="gap-4 grid">
                  <div className="gap-2 grid">
                    <div className="gap-2 text-sm flex flex-wrap items-baseline justify-between">
                      <span className="font-semibold">{tr("Cycle 41", "ސައިކަލް 41")}</span>
                      <span className="text-muted-foreground">{tr("6 days remaining", "6 ދުވަސް ބާކީ")}</span>
                    </div>
                    <div
                      className="atl-health"
                      role="img"
                      aria-label={tr(
                        `${pct(done)}% done, ${pct(doing)}% in progress, ${pct(todo)}% to do`,
                        `${pct(done)}% ނިމިފަ، ${pct(doing)}% ކުރިއަށްދަނީ، ${pct(todo)}% ކުރަންޖެހޭ`,
                      )}
                    >
                      <span className="atl-health__done" style={{ inlineSize: `${pct(done)}%` }} />
                      <span className="atl-health__doing" style={{ inlineSize: `${pct(doing)}%` }} />
                      <span className="atl-health__todo" style={{ inlineSize: `${pct(todo)}%` }} />
                    </div>
                    <ul className="gap-x-4 gap-y-1 text-xs flex flex-wrap text-muted-foreground" aria-hidden>
                      <li className="gap-1.5 flex items-center">
                        <span className="atl-swatch atl-health__done" />
                        {tr("Done", "ނިމިފަ")} {done}
                      </li>
                      <li className="gap-1.5 flex items-center">
                        <span className="atl-swatch atl-health__doing" />
                        {tr("In progress", "ކުރިއަށްދަނީ")} {doing}
                      </li>
                      <li className="gap-1.5 flex items-center">
                        <span className="atl-swatch atl-health__todo" />
                        {tr("To do", "ކުރަންޖެހޭ")} {todo}
                      </li>
                    </ul>
                  </div>
                  <ProgressBar
                    value={57}
                    size="sm"
                    label={tr("Time elapsed", "ހޭދަވި ވަގުތު")}
                    showValue
                    classNames={{ label: "text-xs", value: "text-xs" }}
                  />
                  <dl className="atl-health-stats">
                    <div>
                      <dt>{tr("Scope change", "ސްކޯޕް ބަދަލު")}</dt>
                      <dd dir="ltr">+3</dd>
                    </div>
                    <div>
                      <dt>{tr("Blockers", "ހުރަސް")}</dt>
                      <dd>{apps.filter((a) => a.status === "suspended").length}</dd>
                    </div>
                    <div>
                      <dt>{tr("Flagged", "ފްލެގްކުރެވިފަ")}</dt>
                      <dd>2</dd>
                    </div>
                  </dl>
                </div>
              </Gadget>

              <Gadget
                title={tr("Activity stream", "ހަރަކާތްތައް")}
                actions={<GadgetActions name={tr("Activity stream", "ހަރަކާތްތައް")} tr={tr} />}
              >
                <ActivityFeed
                  title={null}
                  now={ATL_NOW}
                  items={stream.map((a, i) => ({
                    id: a.id,
                    actor: { name: a.assignee ? labels.staff(a.assignee) : labels.name(a) },
                    action: (
                      <>
                        {a.assignee ? tr("changed the status of ", "") : tr("created ", "")}
                        <ConditionalLink href={showHref(a.id)} className="atl-key">
                          {issueKey(a)}
                        </ConditionalLink>
                        {a.assignee ? (
                          <>
                            {tr(" to ", " ގެ ސްޓޭޓަސް ")}
                            <Lozenge appearance={STATUS_APPEARANCE[a.status]}>{labels.status(a.status)}</Lozenge>
                          </>
                        ) : (
                          tr("", " ހެއްދެވި")
                        )}
                      </>
                    ),
                    timestamp: `${a.updated}T${String(16 - (i % 7)).padStart(2, "0")}:${i % 2 ? "15" : "40"}:00`,
                  }))}
                />
              </Gadget>
            </div>

            <div className="gap-4 min-w-0 grid content-start">
              <Gadget
                title={tr("Created vs. resolved", "ހެދުނު އަދި ނިމުނު")}
                actions={<GadgetActions name={tr("Created vs. resolved", "ހެދުނު އަދި ނިމުނު")} tr={tr} />}
              >
                <TimeSeriesChart
                  title={tr("Created vs. resolved", "ހެދުނު އަދި ނިމުނު")}
                  hideTitle
                  description={tr("Last 12 weeks", "ފަހުގެ 12 ހަފްތާ")}
                  data={weeks}
                  config={{
                    created: { label: tr("Created", "ހެދި"), color: "var(--atl-chart-red)" },
                    resolved: { label: tr("Resolved", "ނިމުނު"), color: "var(--atl-chart-green)" },
                  }}
                  interval="week"
                  area
                  valueFormat="integer"
                  height={240}
                />
              </Gadget>

              <Gadget
                title={tr("Applications by status", "ސްޓޭޓަސްއިން")}
                actions={<GadgetActions name={tr("Applications by status", "ސްޓޭޓަސްއިން")} tr={tr} />}
              >
                <PieChart
                  title={tr("Applications by status", "ސްޓޭޓަސްއިން")}
                  hideTitle
                  description={tr(`Total: ${apps.length}`, `ޖުމްލަ: ${apps.length}`)}
                  data={byStatus}
                  nameKey="status"
                  config={statusConfig}
                  variant="pie"
                  height={240}
                />
              </Gadget>

              <Gadget
                title={tr("Recently created", "ފަހުން ހެދުނު")}
                actions={
                  <LinkButton href={ATL_ROUTES.index} variant="ghost" size="sm" endIcon="arrow-right">
                    {tr("View all", "ހުރިހާ")}
                  </LinkButton>
                }
                bodyClassName="p-0!"
              >
                <DataTable<Application>
                  caption={tr("Recently created", "ފަހުން ހެދުނު")}
                  columns={recentColumns}
                  data={recent}
                  density="compact"
                  getRowHref={(a) => showHref(a.id)}
                  getRowName={(a) => `${issueKey(a)} (${labels.name(a)})`}
                  className="atl-flush-table"
                />
              </Gadget>

              <Gadget title={tr("Workload", "މަސައްކަތުގެ ބުރަ")} bodyClassName="gap-3 grid">
                {STAFF.map((s) => {
                  const n = open.filter((a) => a.assignee === s.value).length
                  return (
                    <div key={s.value} className="gap-3 flex items-center">
                      <AtlAvatar name={labels.staff(s.value)} size="xs" decorative />
                      <ProgressBar
                        className="min-w-0 flex-1"
                        value={n}
                        max={Math.max(1, open.length)}
                        label={labels.staff(s.value)}
                        showValue
                        formatValue={(v) => String(v)}
                        classNames={{ label: "text-sm", value: "text-xs tabular-nums" }}
                      />
                    </div>
                  )
                })}
                <p className="gap-1 text-xs flex items-center text-muted-foreground">
                  <Icon name="info" className="size-3.5" />
                  {tr(
                    `${unassigned.length} open applications are unassigned`,
                    `${unassigned.length} އެޕްލިކޭޝަން ޙަވާލުކުރެވިފައެއް ނުވޭ`,
                  )}
                  <ConditionalLink href={routes.adminRecords.indexKanban} className="atl-link ms-1">
                    {tr("Assign", "ޙަވާލުކުރޭ")}
                  </ConditionalLink>
                </p>
              </Gadget>
            </div>
          </div>
        </div>
      </ChartStyleProvider>
    </AtlassianShell>
  )
}
