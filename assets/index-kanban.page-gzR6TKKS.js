var e=`import * as React from "react"
import {
  ConditionalLink,
  KanbanBoard,
  PageTitle,
  SearchBox,
  Select,
  toast,
  UserAvatar,
  type KanbanMove,
} from "@javaabu/onu"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import {
  setApplications,
  showHref,
  STATUSES,
  useApplications,
  useLabels,
  useTrashedApplications,
  type Application,
  type ApplicationStatus,
} from "./_data"
import { NewApplicationButton, ViewNav } from "./_index"

export const meta = {
  title: "Index: kanban board",
  group: "Admin: records",
  layout: "bare",
  order: 5,
}

const ACCENTS: Record<ApplicationStatus, string> = {
  submitted: "bg-chart-1",
  in_review: "bg-chart-3",
  approved: "bg-success",
  rejected: "bg-destructive",
  suspended: "bg-warning",
}

export default function IndexKanbanPage() {
  const tr = useTr()
  const labels = useLabels()
  const active = useApplications()
  const trashed = useTrashedApplications()
  const [service, setService] = React.useState("building")
  const [search, setSearch] = React.useState("")

  const visible = active.filter((a) => {
    if (service !== "all" && a.service !== service) return false
    if (!search) return true
    const q = search.toLowerCase()
    return [a.reference, a.name, a.nameDv].some((v) => v.toLowerCase().includes(q))
  })
  const items = Object.fromEntries(
    STATUSES.map((s) => [
      s.value,
      visible.filter((a) => a.status === s.value).sort((x, y) => y.submitted.localeCompare(x.submitted)),
    ]),
  ) as Record<string, Application[]>

  // Workflow rule: nothing goes back to "Submitted".
  const canMove = (move: KanbanMove) => move.to !== "submitted" || move.from === "submitted"

  const onItemsChange = (next: Record<string, Application[]>, move: KanbanMove) => {
    const status = move.to as ApplicationStatus
    const moved = next[move.to]?.find((a) => a.id === move.id)
    if (move.from === move.to || !moved) return
    setApplications((prev) => prev.map((a) => (a.id === move.id ? { ...a, status } : a)))
    toast.success(
      tr(
        \`\${moved.reference} moved to \${labels.status(status)}\`,
        \`\${moved.reference} ބަދަލުކުރެވިއްޖެ: \${labels.status(status)}\`,
      ),
    )
  }

  return (
    <AdminShell
      contentWidth="full"
      breadcrumbs={[
        { label: tr("Applications", "އެޕްލިކޭޝަންތައް"), href: routes.adminRecords.indexTable },
        { label: tr("Board", "ބޯޑް") },
      ]}
    >
      <div className="gap-4 min-w-0 grid">
        <PageTitle
          title={tr("Applications board", "އެޕްލިކޭޝަންތަކުގެ ބޯޑް")}
          description={tr(
            "Drag a card to change its status, or use its Move to… menu. Applications can't go back to Submitted.",
            "ސްޓޭޓަސް ބަދަލުކުރުމަށް ކާޑު ދަމާލާ، ނުވަތަ ކާޑުގެ މެނޫ ބޭނުންކުރޭ. ހުށަހެޅި ކޮލަމަށް އަނބުރާ ނުގެނެވޭނެ.",
          )}
          links={[
            { label: tr("Trash", "ކުނިފޮށި"), href: routes.adminRecords.trash, icon: "trash", dot: trashed.length > 0 },
          ]}
          action={<NewApplicationButton />}
        />
        <div className="gap-2 flex flex-wrap items-center">
          <div className="sm:w-72 w-full">
            <SearchBox
              value={search}
              onSearch={setSearch}
              placeholder={tr("Reference or name…", "ރެފަރެންސް ނުވަތަ ނަން…")}
              thaana={labels.dv}
            />
          </div>
          <div className="w-52">
            <Select
              aria-label={tr("Service", "ޚިދުމަތް")}
              value={service}
              onValueChange={setService}
              options={[{ value: "all", label: tr("All services", "ހުރިހާ ޚިދުމަތެއް") }, ...labels.options.services]}
            />
          </div>
          <div className="ms-auto">
            <ViewNav value="kanban" />
          </div>
        </div>
        <KanbanBoard<Application>
          columns={STATUSES.map((s) => ({
            id: s.value,
            title: labels.status(s.value),
            accentClassName: ACCENTS[s.value],
          }))}
          items={items}
          getName={(a) => \`\${a.reference} \${labels.name(a)}\`}
          canMove={canMove}
          onItemsChange={onItemsChange}
          emptyColumn={tr("No applications", "އެއްވެސް އެޕްލިކޭޝަނެއް ނެތް")}
          renderCard={(a, { handle, moveMenu }) => (
            <div className="gap-1 p-2 grid">
              <div className="gap-1 flex items-center">
                {handle}
                <ConditionalLink href={showHref(a.id)} className="text-xs font-mono hover:underline">
                  {a.reference}
                </ConditionalLink>
                <span className="ms-auto">{moveMenu}</span>
              </div>
              <div className="px-1 text-sm font-medium">{labels.name(a)}</div>
              <div className="gap-2 px-1 text-xs flex items-center justify-between text-muted-foreground">
                <span>{labels.island(a.island)}</span>
                <span className="text-foreground tabular-nums">{labels.mvr(a.amount)}</span>
              </div>
              <div className="gap-2 px-1 text-xs flex items-center justify-between text-muted-foreground">
                <span>{labels.date(a.submitted)}</span>
                {a.assignee ? (
                  <UserAvatar name={labels.staff(a.assignee)} size="xs" />
                ) : (
                  <span>{tr("Unassigned", "ޙަވާލުނުކުރެވޭ")}</span>
                )}
              </div>
            </div>
          )}
        />
      </div>
    </AdminShell>
  )
}
`;export{e as default};