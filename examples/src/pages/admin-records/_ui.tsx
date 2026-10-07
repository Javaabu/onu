import * as React from "react"
import { useLocation, useSearchParams } from "react-router"
import {
  NavTabs,
  PageTitle,
  StatusBadge,
  UserAvatar,
  type DataTableColumn,
  type FilterDefinition,
  type NavTabItem,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import {
  DEFAULT_ID,
  editHref,
  showHref,
  showTabsHref,
  useAllApplications,
  useTrashedApplications,
  type Application,
  type Labels,
} from "./_data"

export type Tr = ReturnType<typeof useTr>

/** Table columns for applications. */
export function applicationColumns(labels: Labels, tr: Tr): DataTableColumn<Application>[] {
  return [
    {
      id: "reference",
      header: tr("Reference", "ރެފަރެންސް"),
      sortable: true,
      primary: true,
      className: "font-mono text-xs whitespace-nowrap",
    },
    { id: "name", header: tr("Applicant", "އެޕްލިކަންޓް"), sortable: true, accessor: (a) => labels.name(a) },
    { id: "service", header: tr("Service", "ޚިދުމަތް"), sortable: true, accessor: (a) => labels.service(a.service) },
    { id: "island", header: tr("Island", "ރަށް"), sortable: true, accessor: (a) => labels.island(a.island) },
    {
      id: "status",
      header: tr("Status", "ސްޓޭޓަސް"),
      sortable: true,
      cell: (a) => <StatusBadge status={a.status} statusMap={labels.statusMap} size="sm" />,
    },
    {
      id: "amount",
      header: tr("Amount", "އަދަދު"),
      sortable: true,
      numeric: true,
      cell: (a) => <span className="whitespace-nowrap">{labels.mvr(a.amount)}</span>,
    },
    {
      id: "submitted",
      header: tr("Submitted", "ހުށަހެޅި"),
      sortable: true,
      cell: (a) => <span className="whitespace-nowrap">{labels.date(a.submitted)}</span>,
    },
    {
      id: "assignee",
      header: tr("Assignee", "ޙަވާލުވި"),
      cell: (a) =>
        a.assignee ? (
          <span className="gap-2 inline-flex items-center whitespace-nowrap">
            <UserAvatar name={labels.staff(a.assignee)} size="xs" />
            {labels.staff(a.assignee)}
          </span>
        ) : (
          <span className="text-muted-foreground">{tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}</span>
        ),
    },
  ]
}

/** Sort values for `applyListingState` (labels, not keys, so sorting follows what is shown). */
export function sortValue(labels: Labels) {
  return (a: Application, key: string): unknown => {
    switch (key) {
      case "name":
        return labels.name(a)
      case "service":
        return labels.service(a.service)
      case "island":
        return labels.island(a.island)
      case "status":
        return labels.status(a.status)
      default:
        return (a as unknown as Record<string, unknown>)[key]
    }
  }
}

/** Filters for the Filters panel (§25.7). */
export function applicationFilters(labels: Labels, tr: Tr, { trashed = true } = {}): FilterDefinition[] {
  const list: FilterDefinition[] = [
    { type: "select", key: "status", label: tr("Status", "ސްޓޭޓަސް"), options: labels.options.statuses },
    { type: "select", key: "service", label: tr("Service", "ޚިދުމަތް"), options: labels.options.services },
    {
      type: "select",
      key: "island",
      label: tr("Island", "ރަށް"),
      options: labels.options.islands,
      searchable: true,
    },
    {
      type: "select",
      key: "assignee",
      label: tr("Assignee", "ޙަވާލުވި"),
      options: [...labels.options.staff, { value: "none", label: tr("Unassigned", "ޙަވާލުނުކުރެވޭ") }],
    },
    {
      type: "date-range",
      key: "date",
      label: tr("Date", "ތާރީޚް"),
      fields: [
        { value: "submitted", label: tr("Submitted", "ހުށަހެޅި") },
        { value: "updated", label: tr("Updated", "އަޕްޑޭޓްކުރި") },
      ],
    },
    { type: "text", key: "email", label: tr("Email contains", "އީމެއިލްގައި ހިމެނޭ"), placeholder: "gmail.com" },
  ]
  if (trashed) list.push({ type: "trashed", key: "trashed", label: tr("Deleted records", "ފޮހެލެވުނު ރެކޯޑު") })
  return list
}

export const emailFilter = (a: Application, v: unknown) => a.email.toLowerCase().includes(String(v).toLowerCase())

/** The record named by `?id=` (defaults to a fixed record so the page always shows something). */
export function useRecord() {
  const [params] = useSearchParams()
  const id = params.get("id") ?? DEFAULT_ID
  const all = useAllApplications()
  return all.find((a) => a.id === id) ?? null
}

/** Current hash path plus query, to highlight the right tab. */
export function useCurrentHref() {
  const { pathname, search } = useLocation()
  return `${pathname}${search}`
}

/** Tabs shared by the show and edit pages (§25.8, §25.9). */
export function recordTabs(record: Application | null, tr: Tr, { disabled = false } = {}): NavTabItem[] {
  const id = record?.id ?? "new"
  return [
    { label: tr("Details", "ތަފްޞީލު"), href: showHref(id), disabled },
    { label: tr("Edit", "އެޑިޓް"), href: editHref(id), disabled },
    { label: tr("Documents", "ލިޔެކިޔުން"), href: showTabsHref(id, "documents"), count: record?.documents, disabled },
    { label: tr("History", "ތާރީޚު"), href: showTabsHref(id, "history"), count: record ? 5 : undefined, disabled },
  ]
}

/** Header of a record page: title, back/trash links, record actions and tabs. */
export function RecordHeader({
  title,
  description,
  media,
  action,
  actions,
  tabs,
  currentHref,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  media?: React.ReactNode
  action?: React.ReactNode
  actions?: React.ReactNode
  tabs: NavTabItem[]
  currentHref: string
}) {
  const tr = useTr()
  const trashed = useTrashedApplications()
  return (
    <div className="gap-4 grid">
      <PageTitle
        title={title}
        description={description}
        media={media}
        links={[
          {
            label: tr("All applications", "ހުރިހާ އެޕްލިކޭޝަނެއް"),
            href: routes.adminRecords.indexTable,
            icon: "back",
          },
          { label: tr("Trash", "ކުނިފޮށި"), href: routes.adminRecords.trash, icon: "trash", dot: trashed.length > 0 },
        ]}
        actions={actions}
        action={action}
      />
      <NavTabs items={tabs} currentHref={currentHref} aria-label={tr("Record sections", "ރެކޯޑުގެ ބައިތައް")} />
    </div>
  )
}

/** Breadcrumbs for a record page. */
export function recordCrumbs(tr: Tr, record: Application | null, last?: string) {
  const crumbs: { label: string; href?: string }[] = [
    { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
  ]
  if (record) crumbs.push({ label: record.reference, href: last ? showHref(record.id) : undefined })
  if (last) crumbs.push({ label: last })
  return crumbs
}
