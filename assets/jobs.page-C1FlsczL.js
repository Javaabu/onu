var e=`import * as React from "react"
import {
  ActiveFilterChips,
  EmptyState,
  FilterPanel,
  IconText,
  ListView,
  SearchBox,
  StatusBadge,
  Tag,
  type FilterDefinition,
  type FilterValues,
} from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { atolls, jobs, jobTypes, type Job } from "./_data"
import { toDate, useDates, useL, useMvr } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Job listings", group: "Public portal", layout: "bare", order: 9 }

const TODAY = new Date(2026, 9, 7)

export default function JobListingsPage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const mvr = useMvr()
  const dates = useDates()
  const [query, setQuery] = React.useState("")
  const [filters, setFilters] = React.useState<FilterValues>({})

  const departments = Array.from(new Map(jobs.map((j) => [j.department.en, j.department])).values())
  const definitions: FilterDefinition[] = [
    {
      type: "select",
      key: "type",
      label: tr("Job type", "ވަޒީފާގެ ބާވަތް"),
      options: jobTypes.map((t) => ({ value: t.value, label: l(t.label) })),
    },
    {
      type: "select",
      key: "atoll",
      label: tr("Atoll", "އަތޮޅު"),
      options: atolls.map((a) => ({ value: a.value, label: l(a.label) })),
    },
    {
      type: "select",
      key: "department",
      label: tr("Department", "ޑިޕާޓްމަންޓް"),
      options: departments.map((d) => ({ value: d.en, label: l(d) })),
    },
  ]

  const inList = (key: string, value: string) => {
    const v = filters[key]
    return !v || (Array.isArray(v) && (v.length === 0 || v.includes(value)))
  }
  const q = query.trim().toLowerCase()
  const rows = jobs
    .filter(
      (j) =>
        (!q ||
          [j.title.en, j.title.dv, j.department.en, j.department.dv, j.reference].some((t) =>
            t.toLowerCase().includes(q),
          )) &&
        inList("type", j.type) &&
        inList("atoll", j.atoll) &&
        inList("department", j.department.en),
    )
    .sort((a, b) => b.posted.localeCompare(a.posted))

  const daysLeft = (job: Job) => Math.round((toDate(job.closes).getTime() - TODAY.getTime()) / 86_400_000)

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Jobs", "ވަޒީފާ") }]}
        title={tr("Work with us", "އަޅުގަނޑުމެންނާއެކު މަސައްކަތްކުރައްވާ")}
        description={tr(
          "Open positions in Malé and at our island service centres.",
          "މާލޭގައާއި ރަށްރަށުގެ ސަރވިސް ސެންޓަރުތަކުގައި ހުޅުވިފައިވާ ވަޒީފާތައް.",
        )}
      />
      <Container className="py-8 sm:py-10">
        <div className="gap-3 sm:flex-row sm:items-center flex flex-col">
          <SearchBox
            value={query}
            onSearch={setQuery}
            thaana={dv}
            aria-label={tr("Search jobs", "ވަޒީފާ ހޯދާ")}
            placeholder={tr("Job title, department or reference…", "މަޤާމު، ޑިޕާޓްމަންޓް ނުވަތަ ނަންބަރު…")}
            className="sm:max-w-md"
          />
          <FilterPanel filters={definitions} value={filters} onApply={setFilters} />
        </div>
        <ActiveFilterChips
          className="mt-3"
          filters={definitions}
          value={filters}
          onRemove={(key) => setFilters(({ [key]: _removed, ...rest }) => rest)}
          onClearAll={() => setFilters({})}
        />

        <h2 className="mt-8 text-sm font-medium text-muted-foreground" role="status">
          {tr(\`\${rows.length} open positions\`, \`ހުޅުވިފައިވާ \${rows.length} މަޤާމު\`)}
        </h2>
        <ListView
          className="mt-3"
          aria-label={tr("Open positions", "ހުޅުވިފައިވާ މަޤާމުތައް")}
          items={rows}
          getName={(j) => l(j.title)}
          getHref={() => routes.public.jobDetail}
          title={(j) => l(j.title)}
          description={(j) => (
            <span className="gap-x-4 gap-y-1 flex flex-wrap">
              <IconText icon="building" size="sm" tone="muted">
                {l(j.department)}
              </IconText>
              <IconText icon="map-pin" size="sm" tone="muted">
                {l(j.location)}
              </IconText>
              <IconText icon="credit-card" size="sm" tone="muted">
                {tr(\`\${mvr(j.salary)} a month\`, \`މަހަކު \${mvr(j.salary)}\`)}
              </IconText>
            </span>
          )}
          meta={(j) => (
            <span className="gap-2 flex flex-wrap items-center">
              <Tag size="sm" variant="outline">
                {l(jobTypes.find((t) => t.value === j.type)!.label)}
              </Tag>
              <Tag size="sm" variant="outline">
                {j.grade}
              </Tag>
              {daysLeft(j) <= 7 ? (
                <StatusBadge status="warning" size="sm">
                  {tr(\`Closes in \${daysLeft(j)} days\`, \`\${daysLeft(j)} ދުވަހުން ބަންދުވާނެ\`)}
                </StatusBadge>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {tr("Closes", "ބަންދުވާނީ")} {dates.date(j.closes, "abbreviated")}
                </span>
              )}
            </span>
          )}
          empty={
            <EmptyState
              variant="no-results"
              bordered
              noun={{ one: tr("job", "ވަޒީފާ"), other: tr("jobs", "ވަޒީފާ") }}
              search={query || undefined}
              onClearSearch={query ? () => setQuery("") : undefined}
              onClearFilters={Object.keys(filters).length ? () => setFilters({}) : undefined}
            />
          }
        />
      </Container>
    </PortalShell>
  )
}
`;export{e as default};