import * as React from "react"
import { useNavigate } from "react-router"
import {
  ActivityFeed,
  Button,
  Callout,
  Card,
  ConfirmDialog,
  DescriptionList,
  EmptyState,
  Icon,
  LinkButton,
  RelativeDate,
  StatusBadge,
  toast,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import {
  recordActivity,
  restoreApplications,
  showTabsHref,
  trashApplications,
  updateApplication,
  useLabels,
  wait,
  type Application,
} from "./_data"
import { recordCrumbs } from "./_ui"

/** Title of a record page: the reference with its status. */
export function RecordTitle({ record }: { record: Application }) {
  const labels = useLabels()
  return (
    <span className="gap-x-3 gap-y-1 flex flex-wrap items-center">
      <span className="font-mono">{record.reference}</span>
      <StatusBadge status={record.status} statusMap={labels.statusMap} />
    </span>
  )
}

/** Approve / Suspend / Delete (§25.8). Risky actions confirm first. */
export function RecordActions({ record }: { record: Application }) {
  const tr = useTr()
  const labels = useLabels()
  const navigate = useNavigate()
  const canApprove = record.status === "submitted" || record.status === "in_review"
  const [approving, setApproving] = React.useState(false)

  if (record.deletedAt) return null

  return (
    <>
      <LinkButton href={routes.adminRecords.activityLog} variant="ghost" startIcon="history">
        {tr("Logs", "ލޮގް")}
      </LinkButton>
      {record.status === "suspended" ? (
        <Button
          variant="outline"
          onClick={async () => {
            await wait(300)
            updateApplication(record.id, { status: "in_review" })
            toast.success(tr("Application reinstated", "އެޕްލިކޭޝަން އަލުން ފަށައިފި"))
          }}
        >
          <Icon name="play" />
          {tr("Reinstate", "އަލުން ފަށާ")}
        </Button>
      ) : record.status !== "rejected" ? (
        <ConfirmDialog
          trigger={
            <Button variant="outline" startIcon="pause">
              {tr("Suspend", "ހުއްޓާލާ")}
            </Button>
          }
          title={tr(`Suspend ${record.reference}?`, `${record.reference} ހުއްޓާލަންތަ؟`)}
          description={tr(
            "The applicant is notified, and no one can act on the application until it is reinstated.",
            "އެޕްލިކަންޓަށް އަންގާނެ. އަލުން ފަށަންދެން އެޕްލިކޭޝަނުގައި އެއްވެސް ކަމެއް ނުކުރެވޭނެ.",
          )}
          confirmLabel={tr("Suspend", "ހުއްޓާލާ")}
          onConfirm={async () => {
            await wait(500)
            updateApplication(record.id, { status: "suspended" })
            toast.success(tr("Application suspended", "އެޕްލިކޭޝަން ހުއްޓާލެވިއްޖެ"))
          }}
        />
      ) : null}
      <ConfirmDialog
        trigger={
          <Button variant="outline" className="text-destructive" startIcon="trash">
            {tr("Delete", "ފޮހެލާ")}
          </Button>
        }
        variant="destructive"
        title={tr(`Delete ${record.reference}?`, `${record.reference} ފޮހެލަންތަ؟`)}
        description={tr(
          "It moves to the trash, where it can be restored.",
          "މި އެޕްލިކޭޝަން ކުނިފޮށިއަށް ދާނެ. އެތަނުން އަނބުރާ ގެނެވޭނެ.",
        )}
        confirmLabel={tr("Delete", "ފޮހެލާ")}
        onConfirm={async () => {
          await wait(500)
          trashApplications([record.id])
          toast(tr("Moved to trash", "ކުނިފޮށިއަށް ލެވިއްޖެ"), {
            description: `${record.reference} · ${labels.name(record)}`,
            action: {
              label: tr("Undo", "އަނބުރާ"),
              onClick: () => restoreApplications([record.id]),
            },
          })
          void navigate(routes.adminRecords.indexTable)
        }}
      />
      {canApprove ? (
        <Button
          loading={approving}
          startIcon="success"
          onClick={async () => {
            setApproving(true)
            await wait(500)
            updateApplication(record.id, { status: "approved" })
            setApproving(false)
            toast.success(tr("Application approved", "އެޕްލިކޭޝަން ފާސްކުރެވިއްޖެ"), {
              description: record.reference,
            })
          }}
        >
          {tr("Approve", "ފާސްކުރޭ")}
        </Button>
      ) : null}
    </>
  )
}

/** Shown on a record that is in the trash. */
export function TrashedNotice({ record }: { record: Application }) {
  const tr = useTr()
  const labels = useLabels()
  if (!record.deletedAt) return null
  return (
    <Callout
      variant="warning"
      title={tr("This application is in the trash", "މި އެޕްލިކޭޝަން ހުރީ ކުނިފޮށީގައި")}
      description={tr(`Deleted on ${labels.date(record.deletedAt)}.`, `ފޮހެލީ ${labels.date(record.deletedAt)}.`)}
      actions={
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            restoreApplications([record.id])
            toast.success(tr("Application restored", "އެޕްލިކޭޝަން އަނބުރާ ގެނެވިއްޖެ"))
          }}
        >
          <Icon name="restore" />
          {tr("Restore", "އަނބުރާ ގެންނާ")}
        </Button>
      }
    />
  )
}

/** Key facts under the header (§25.8). */
export function SummaryStrip({ record }: { record: Application }) {
  const tr = useTr()
  const labels = useLabels()
  const facts: [string, React.ReactNode][] = [
    [tr("Submitted", "ހުށަހެޅި"), <RelativeDate key="s" value={`${record.submitted}T11:02:00`} />],
    [tr("Last updated", "އެންމެ ފަހުން ބަދަލުކުރި"), <RelativeDate key="u" value={`${record.updated}T10:24:00`} />],
    [tr("Amount", "އަދަދު"), <span key="a">{labels.mvr(record.amount)}</span>],
    [
      tr("Assigned to", "ޙަވާލުވެފައިވަނީ"),
      record.assignee ? labels.staff(record.assignee) : tr("Unassigned", "ޙަވާލުނުކުރެވޭ"),
    ],
  ]
  return (
    <dl className="sm:grid-cols-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border">
      {facts.map(([label, value]) => (
        <div key={label} className="gap-0.5 px-4 py-3 grid bg-card">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Detail cards: applicant and application (§25.8). Missing values show "—". */
export function DetailCards({ record }: { record: Application }) {
  const tr = useTr()
  const labels = useLabels()
  return (
    <>
      <Card title={tr("Applicant", "އެޕްލިކަންޓް")} headingLevel={2}>
        <DescriptionList
          items={[
            { label: tr("Name (English)", "ނަން (އިނގިރޭސި)"), value: record.name },
            { label: tr("Name (Dhivehi)", "ނަން (ދިވެހި)"), value: <span lang="dv">{record.nameDv}</span> },
            { label: tr("ID card", "އައިޑީ ކާޑު"), value: record.idCard, copyable: true },
            { label: tr("Phone", "ފޯނު"), value: <span dir="ltr">{record.phone}</span>, copyValue: record.phone },
            { label: tr("Email", "އީމެއިލް"), value: record.email, copyable: true },
            { label: tr("Address", "އެޑްރެސް"), value: record.address },
          ]}
        />
      </Card>
      <Card title={tr("Application", "އެޕްލިކޭޝަން")} headingLevel={2}>
        <DescriptionList
          items={[
            { label: tr("Reference", "ރެފަރެންސް"), value: record.reference, copyable: true },
            { label: tr("Service", "ޚިދުމަތް"), value: labels.service(record.service) },
            { label: tr("Island", "ރަށް"), value: labels.island(record.island) },
            {
              label: tr("Status", "ސްޓޭޓަސް"),
              value: <StatusBadge status={record.status} statusMap={labels.statusMap} size="sm" />,
            },
            { label: tr("Fee", "ފީ"), value: labels.mvr(record.amount) },
            { label: tr("Submitted on", "ހުށަހެޅި ތާރީޚް"), value: labels.date(record.submitted) },
            { label: tr("Assignee", "ޙަވާލުވި"), value: record.assignee ? labels.staff(record.assignee) : null },
            { label: tr("Remarks", "ރިމާކްސް"), value: record.remarks, fullWidth: true },
          ]}
        />
      </Card>
    </>
  )
}

/** The last few changes with a "View all" link (§25.8). */
export function ActivityCard({ record, limit = 4 }: { record: Application; limit?: number }) {
  const tr = useTr()
  const labels = useLabels()
  return (
    <Card
      title={tr("Recent activity", "ފަހުގެ ހަރަކާތްތައް")}
      headingLevel={2}
      footer={
        <LinkButton href={showTabsHref(record.id, "history")} variant="link" endIcon="arrow-right" className="px-0">
          {tr("View all", "ހުރިހާ ހަރަކާތެއް")}
        </LinkButton>
      }
    >
      <ActivityFeed title={null} groupByDay={false} items={recordActivity(record, labels, tr).slice(0, limit)} />
    </Card>
  )
}

/** Page for a missing record id. */
export function RecordNotFound() {
  const tr = useTr()
  return (
    <AdminShell breadcrumbs={recordCrumbs(tr, null)}>
      <h1 className="sr-only">{tr("Application not found", "އެޕްލިކޭޝަން ނުފެނުނު")}</h1>
      <EmptyState
        bordered
        icon="search"
        title={tr("Application not found", "އެޕްލިކޭޝަން ނުފެނުނު")}
        description={tr("It may have been deleted permanently.", "ދާއިމީކޮށް ފޮހެލިފައި ވެދާނެ.")}
        action={
          <LinkButton href={routes.adminRecords.indexTable} startIcon="back">
            {tr("All applications", "ހުރިހާ އެޕްލިކޭޝަނެއް")}
          </LinkButton>
        }
      />
    </AdminShell>
  )
}
