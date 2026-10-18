var e=`import * as React from "react"
import { useSearchParams } from "react-router"
import { EmptyState, FilterTabs, SearchBox, SearchResults, type SearchResultGroup } from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { events, jobs, law, news, services } from "./_data"
import type { L } from "./_i18n"
import { useDates, useL, useMvr } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Search results", group: "Public portal", layout: "bare", order: 11 }

const hit = (q: string, ...values: L[]) =>
  values.some((v) => v.en.toLowerCase().includes(q) || v.dv.toLowerCase().includes(q))

export default function SearchResultsPage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const mvr = useMvr()
  const dates = useDates()
  const [params, setParams] = useSearchParams()
  const query = params.get("q") ?? (dv ? "ޕާސްޕޯޓް" : "passport")
  const [type, setType] = React.useState("all")
  const [loading, setLoading] = React.useState(false)

  const run = (q: string) => {
    setLoading(true)
    setParams(q ? { q } : {}, { replace: true })
    setTimeout(() => setLoading(false), 600)
  }

  const q = query.trim().toLowerCase()
  const sections = law.chapters.flatMap((c) => c.sections)
  const all: SearchResultGroup[] = q
    ? [
        {
          id: "services",
          label: tr("Services", "ޚިދުމަތްތައް"),
          items: services
            .filter((s) => hit(q, s.title, s.summary))
            .map((s) => ({
              id: s.id,
              title: l(s.title),
              description: l(s.summary),
              href: routes.public.serviceDetail,
              icon: s.icon,
              meta: s.fee ? mvr(s.fee) : tr("Free", "ހިލޭ"),
            })),
        },
        {
          id: "news",
          label: tr("News", "ޚަބަރު"),
          items: news
            .filter((n) => hit(q, n.title, n.excerpt))
            .map((n) => ({
              id: n.id,
              title: l(n.title),
              description: l(n.excerpt),
              href: routes.public.newsArticle,
              icon: "file-text",
              meta: dates.date(n.date),
            })),
        },
        {
          id: "events",
          label: tr("Events", "ހަރަކާތްތައް"),
          items: events
            .filter((e) => hit(q, e.title, e.summary))
            .map((e) => ({
              id: e.id,
              title: l(e.title),
              description: l(e.summary),
              href: routes.public.eventDetail,
              icon: "calendar",
              meta: \`\${dates.dateTime(e.start)} · \${l(e.venue)}\`,
            })),
        },
        {
          id: "jobs",
          label: tr("Jobs", "ވަޒީފާ"),
          items: jobs
            .filter((j) => hit(q, j.title, j.department))
            .map((j) => ({
              id: j.id,
              title: l(j.title),
              description: l(j.department),
              href: routes.public.jobDetail,
              icon: "users",
              meta: j.reference,
            })),
        },
        {
          id: "laws",
          label: tr("Laws", "ޤާނޫނުތައް"),
          items: sections
            .filter((s) => hit(q, s.title, ...s.body))
            .map((s) => ({
              id: s.id,
              title: \`\${l(law.title)} — \${tr("Section", "މާއްދާ")} \${s.number}: \${l(s.title)}\`,
              description: l(s.body.find((b) => hit(q, b)) ?? s.body[0]),
              href: routes.public.laws,
              icon: "file",
            })),
        },
      ]
    : []

  const nonEmpty = all.filter((g) => g.items.length)
  const groups =
    type === "all"
      ? all.map((g) => ({ ...g, items: g.items.slice(0, 3), total: g.items.length }))
      : all.filter((g) => g.id === type)
  const total = nonEmpty.reduce((n, g) => n + g.items.length, 0)

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Search", "ހޯދުން") }]}
        title={tr("Search", "ހޯދުން")}
        description={tr(
          "Search services, news, events, jobs and laws.",
          "ޚިދުމަތް، ޚަބަރު، ހަރަކާތް، ވަޒީފާ އަދި ޤާނޫނު ހޯއްދަވާ.",
        )}
      >
        <SearchBox
          key={query}
          defaultValue={query}
          onSearch={run}
          thaana={dv}
          submitOnBlur={false}
          aria-label={tr("Search the site", "ސައިޓުގައި ހޯދާ")}
          className="sm:max-w-2xl"
          classNames={{ root: "h-12 bg-background", input: "text-base" }}
        />
      </PortalPageHeader>
      <Container className="py-8 sm:py-10">
        {q && total ? (
          <FilterTabs
            tabs={[
              { value: "all", label: tr("All", "ހުރިހާ"), count: total },
              ...nonEmpty.map((g) => ({ value: g.id, label: g.label, count: g.items.length })),
            ]}
            value={type}
            onValueChange={setType}
            controls="search-results"
            aria-label={tr("Result types", "ނަތީޖާގެ ބާވަތް")}
          />
        ) : null}
        <div id="search-results" className="mt-6">
          {q && total ? (
            <SearchResults query={query} loading={loading} groups={groups} />
          ) : (
            <EmptyState
              variant="no-results"
              bordered
              noun={{ one: tr("result", "ނަތީޖާ"), other: tr("results", "ނަތީޖާ") }}
              search={query || undefined}
              title={q ? undefined : tr("Type something to search", "ހޯދުމަށް ލިޔުއްވާ")}
              description={
                q
                  ? tr(
                      "Try fewer words, or check the spelling.",
                      "މަދު ބަސްތަކެއް ލިޔުއްވާ، ނުވަތަ އިމްލާ ޗެކްކުރައްވާ.",
                    )
                  : undefined
              }
              onClearSearch={q ? () => run("") : undefined}
            />
          )}
        </div>
      </Container>
    </PortalShell>
  )
}
`;export{e as default};