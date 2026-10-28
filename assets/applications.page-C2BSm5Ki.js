var e=`import {
  applyListingState,
  DataTable,
  Tabs,
  LinkButton,
  PageTitle,
  SearchBox,
  StatusBadge,
  useListingState,
  type DataTableColumn,
} from "@javaabu/onu"

import { CitizenShell } from "../_shared/shells"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { applications, useApplicationStatuses, useFormat, type Application } from "../applications/_data"

export const meta = { title: "My applications", group: "Citizen portal", layout: "bare", order: 2 }

const TABS = ["all", "needs_info", "draft", "in_progress", "approved", "rejected"] as const

function inTab(a: Application, tab: string) {
  if (tab === "all") return true
  if (tab === "in_progress") return a.status === "submitted" || a.status === "in_review"
  return a.status === tab
}

export default function MyApplicationsPage() {
  const tr = useTr()
  const { money, date } = useFormat()
  const statuses = useApplicationStatuses()
  const state = useListingState({ url: false, defaultState: { perPage: 10, sort: { id: "updated", desc: true } } })

  const tab = typeof state.filters.tab === "string" ? state.filters.tab : "all"
  const labels: Record<(typeof TABS)[number], string> = {
    all: tr("All", "ހުރިހާ"),
    needs_info: tr("Action needed", "ޢަމަލު ކުރަން ޖެހޭ"),
    draft: tr("Drafts", "ޑްރާފްޓް"),
    in_progress: tr("In progress", "ކުރިއަށް ދަނީ"),
    approved: tr("Approved", "ފާސްވެފައި"),
    rejected: tr("Rejected", "ރިޖެކްޓްވެފައި"),
  }

  const { rows, total } = applyListingState(applications, state, {
    searchFields: (a) => [a.ref, a.service[0], a.service[1]],
    filterFns: { tab: (a, v) => inTab(a, String(v)) },
    sortValue: (a, id) => (id === "service" ? tr(...a.service) : (a as unknown as Record<string, unknown>)[id]),
  })

  const columns: DataTableColumn<Application>[] = [
    {
      id: "ref",
      header: tr("Reference", "ރެފަރެންސް"),
      sortable: true,
      cell: (a) => <span className="tabular-nums">{a.ref}</span>,
    },
    {
      id: "service",
      header: tr("Service", "ޚިދުމަތް"),
      sortable: true,
      primary: true,
      accessor: (a) => tr(...a.service),
    },
    {
      id: "submitted",
      header: tr("Submitted", "ހުށަހެޅީ"),
      sortable: true,
      cell: (a) => (a.submitted ? date(a.submitted) : null),
    },
    { id: "updated", header: tr("Last update", "ފަހުގެ ބަދަލު"), sortable: true, cell: (a) => date(a.updated) },
    {
      id: "status",
      header: tr("Status", "ހާލަތު"),
      cell: (a) => <StatusBadge status={a.status} statusMap={statuses} size="sm" />,
    },
    { id: "fee", header: tr("Fee", "ފީ"), numeric: true, sortable: true, cell: (a) => money(a.fee) },
  ]

  const hrefFor = (a: Application) =>
    a.status === "draft" ? routes.applications.wizard : routes.applications.statusTracker

  return (
    <CitizenShell>
      <div className="gap-5 grid">
        <PageTitle
          title={tr("My applications", "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތައް")}
          description={tr("Everything you've applied for, newest first.", "ހުށަހަޅާފައިވާ ހުރިހާ އެޕްލިކޭޝަނެއް.")}
          action={
            <LinkButton href={routes.applications.wizard} startIcon="add">
              {tr("New application", "އައު އެޕްލިކޭޝަން")}
            </LinkButton>
          }
        />

        <Tabs
          variant="line"
          countAppearance="pill"
          listLabel={tr("Filter by status", "ހާލަތުން ފިލްޓަރ")}
          value={tab}
          onValueChange={(v) => {
            state.setFilter("tab", v === "all" ? undefined : v)
          }}
          items={TABS.map((t) => ({
            value: t,
            label: labels[t],
            count: applications.filter((a) => inTab(a, t)).length,
          }))}
        />

        <SearchBox
          value={state.search}
          onSearch={state.setSearch}
          placeholder={tr("Search by reference or service…", "ރެފަރެންސް ނުވަތަ ޚިދުމަތުން ހޯދާ…")}
          aria-label={tr("Search applications", "އެޕްލިކޭޝަން ހޯދާ")}
          className="max-w-md"
        />

        <DataTable
          caption={tr("My applications", "އަޅުގަނޑުގެ އެޕްލިކޭޝަންތައް")}
          columns={columns}
          data={rows}
          total={total}
          state={state}
          selectable={false}
          noun={{ one: tr("application", "އެޕްލިކޭޝަން"), other: tr("applications", "އެޕްލިކޭޝަން") }}
          getRowName={(a) => \`\${a.ref} \${tr(...a.service)}\`}
          getRowHref={hrefFor}
          rowActions={(a) => [
            {
              id: "open",
              label: a.status === "draft" ? tr("Continue", "ކުރިއަށް ގެންދާ") : tr("Track", "ބަލާ"),
              icon: a.status === "draft" ? "edit" : "eye",
              href: hrefFor(a),
            },
            {
              id: "docs",
              label: tr("Documents", "ލިޔެކިޔުން"),
              icon: "file",
              href: routes.applications.documentChecklist,
              permitted: a.status === "needs_info",
            },
            {
              id: "receipt",
              label: tr("Receipt", "ރަސީދު"),
              icon: "file-text",
              href: routes.applications.receipt,
              permitted: a.status !== "draft",
            },
            {
              id: "certificate",
              label: tr("Licence", "ލައިސަންސް"),
              icon: "download",
              href: routes.applications.certificate,
              permitted: a.status === "approved",
            },
          ]}
          emptyAction={
            <LinkButton href={routes.applications.wizard} startIcon="add">
              {tr("New application", "އައު އެޕްލިކޭޝަން")}
            </LinkButton>
          }
        />
      </div>
    </CitizenShell>
  )
}
`;export{e as default};