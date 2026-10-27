import * as React from "react"
import { ContentCard, EmptyState, Tabs, IconText, Pagination, SearchBox } from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { news, newsCategories, newsImage } from "./_data"
import { useL } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "News index", group: "Public portal", layout: "bare", order: 4 }

const PER_PAGE = 6

export default function NewsIndexPage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const [category, setCategory] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)

  const q = query.trim().toLowerCase()
  const searched = news.filter(
    (n) => !q || [n.title.en, n.title.dv, n.excerpt.en, n.excerpt.dv].some((t) => t.toLowerCase().includes(q)),
  )
  const filtered = searched.filter((n) => category === "all" || n.category === category)
  const rows = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const featured = page === 1 && category === "all" && !q ? rows[0] : undefined
  const rest = featured ? rows.slice(1) : rows
  const catLabel = (value: string) => l(newsCategories.find((c) => c.value === value)!.label)

  const tabs = [
    { value: "all", label: tr("All", "ހުރިހާ"), count: searched.length },
    ...newsCategories.map((c) => ({
      value: c.value,
      label: l(c.label),
      count: searched.filter((n) => n.category === c.value).length,
    })),
  ]

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("News", "ޚަބަރު") }]}
        title={tr("News and announcements", "ޚަބަރާއި އިޢުލާންތައް")}
        description={tr(
          "Updates on services, projects and events across the islands.",
          "ރަށްރަށުގައި ކުރިއަށްދާ ޚިދުމަތްތަކާއި މަޝްރޫޢުތަކާއި ހަރަކާތްތަކުގެ ޚަބަރު.",
        )}
      />
      <Container className="py-8 sm:py-10">
        <div className="gap-4 md:flex-row md:items-end flex flex-col justify-between">
          <Tabs
            variant="line"
            countAppearance="pill"
            className="min-w-0 flex-1"
            items={tabs}
            value={category}
            onValueChange={(v) => {
              setCategory(v)
              setPage(1)
            }}
            controls="news-list"
            listLabel={tr("News categories", "ޚަބަރުގެ ބައިތައް")}
          />
          <SearchBox
            value={query}
            thaana={dv}
            onSearch={(v) => {
              setQuery(v)
              setPage(1)
            }}
            aria-label={tr("Search news", "ޚަބަރު ހޯދާ")}
            placeholder={tr("Search news…", "ޚަބަރު ހޯދާ…")}
            className="md:w-72 sm:max-w-none"
          />
        </div>

        <div id="news-list" className="mt-8">
          {filtered.length === 0 ? (
            <EmptyState
              variant="no-results"
              bordered
              noun={{ one: tr("article", "ލިޔުން"), other: tr("articles", "ލިޔުން") }}
              search={query || undefined}
              onClearSearch={() => setQuery("")}
              onClearFilters={category !== "all" ? () => setCategory("all") : undefined}
            />
          ) : (
            <>
              {featured ? (
                <ContentCard
                  className="mb-8"
                  orientation="horizontal"
                  headingLevel={2}
                  title={l(featured.title)}
                  excerpt={l(featured.excerpt)}
                  image={{
                    src: newsImage(featured),
                    alt: tr("Ferry at the Hulhumalé jetty", "ހުޅުމާލޭ ޖެޓީގައި ފެރީ"),
                  }}
                  href={routes.public.newsArticle}
                  date={featured.date}
                  category={catLabel(featured.category)}
                  meta={
                    <IconText icon="clock" size="sm" tone="muted">
                      {tr(`${featured.minutes} min read`, `${featured.minutes} މިނިޓު`)}
                    </IconText>
                  }
                  classNames={{ title: "text-2xl" }}
                />
              ) : null}
              <h2 className="sr-only">{tr("Articles", "ލިޔުންތައް")}</h2>
              <ul className="gap-6 sm:grid-cols-2 lg:grid-cols-3 grid">
                {rest.map((n) => (
                  <li key={n.id}>
                    <ContentCard
                      className="h-full"
                      title={l(n.title)}
                      excerpt={l(n.excerpt)}
                      image={{ src: newsImage(n, 800, 450), alt: "" }}
                      href={routes.public.newsArticle}
                      date={n.date}
                      category={catLabel(n.category)}
                      meta={
                        <IconText icon="clock" size="sm" tone="muted">
                          {tr(`${n.minutes} min read`, `${n.minutes} މިނިޓު`)}
                        </IconText>
                      }
                    />
                  </li>
                ))}
              </ul>
              <Pagination
                className="mt-10"
                page={page}
                perPage={PER_PAGE}
                total={filtered.length}
                numbered
                noun={{ one: tr("article", "ލިޔުން"), other: tr("articles", "ލިޔުން") }}
                onPageChange={(p) => {
                  setPage(p)
                  window.scrollTo({ top: 0 })
                }}
              />
            </>
          )}
        </div>
      </Container>
    </PortalShell>
  )
}
