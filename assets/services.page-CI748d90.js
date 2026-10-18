var e=`import * as React from "react"
import { useSearchParams } from "react-router"
import { Card, EmptyState, FilterTabs, Icon, IconText, SearchBox, Select, Switch, Tag } from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { serviceCategories, services, type Service } from "./_data"
import { useL, useMvr } from "./_i18n"
import { Container, PortalPageHeader } from "./_ui"

export const meta = { title: "Services directory", group: "Public portal", layout: "bare", order: 2 }

export default function ServicesDirectoryPage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const mvr = useMvr()
  const [params] = useSearchParams()
  const [query, setQuery] = React.useState(params.get("q") ?? "")
  const [category, setCategory] = React.useState("all")
  const [onlineOnly, setOnlineOnly] = React.useState(false)
  const [freeOnly, setFreeOnly] = React.useState(false)
  const [sort, setSort] = React.useState("popular")

  const matches = (s: Service) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [s.title.en, s.title.dv, s.summary.en, s.summary.dv].some((t) => t.toLowerCase().includes(q))
  }
  const base = services.filter((s) => matches(s) && (!onlineOnly || s.online) && (!freeOnly || s.fee === 0))
  const results = base
    .filter((s) => category === "all" || s.category === category)
    .sort((a, b) => {
      if (sort === "fee") return a.fee - b.fee
      if (sort === "time") return a.days - b.days
      if (sort === "name") return l(a.title).localeCompare(l(b.title))
      return Number(!!b.popular) - Number(!!a.popular)
    })

  const tabs = [
    { value: "all", label: tr("All", "ހުރިހާ"), count: base.length },
    ...serviceCategories.map((c) => ({
      value: c.value,
      label: l(c.label),
      count: base.filter((s) => s.category === c.value).length,
    })),
  ]
  const clearFilters = () => {
    setCategory("all")
    setOnlineOnly(false)
    setFreeOnly(false)
  }

  return (
    <PortalShell>
      <PortalPageHeader
        crumbs={[{ label: tr("Services", "ޚިދުމަތްތައް") }]}
        title={tr("Find a service", "ޚިދުމަތެއް ހޯއްދަވާ")}
        description={tr(
          "Every government service in one place — with fees, documents and how long it takes.",
          "ސަރުކާރުގެ ހުރިހާ ޚިދުމަތެއް އެއް ތަނެއްގައި — ފީ، ލިޔެކިޔުންތައް އަދި ނިމޭނެ މުއްދަތާއެކު.",
        )}
      >
        <SearchBox
          value={query}
          onSearch={setQuery}
          thaana={dv}
          aria-label={tr("Search services", "ޚިދުމަތް ހޯދާ")}
          placeholder={tr("Search for passport, licence, housing…", "ޕާސްޕޯޓް، ލައިސަންސް، ހައުސިންގ…")}
          className="sm:max-w-2xl"
          classNames={{ root: "h-12 bg-background", input: "text-base" }}
        />
      </PortalPageHeader>

      <Container className="py-8 sm:py-10">
        <FilterTabs
          tabs={tabs}
          value={category}
          onValueChange={setCategory}
          controls="service-results"
          aria-label={tr("Service categories", "ޚިދުމަތުގެ ބައިތައް")}
        />

        <div className="mt-4 gap-x-6 gap-y-3 flex flex-wrap items-center justify-between">
          <div className="gap-x-6 gap-y-3 flex flex-wrap items-center">
            <Switch
              label={tr("Available online", "އޮންލައިންކޮށް ލިބޭ")}
              checked={onlineOnly}
              onCheckedChange={setOnlineOnly}
            />
            <Switch label={tr("Free services", "ހިލޭ ޚިދުމަތް")} checked={freeOnly} onCheckedChange={setFreeOnly} />
          </div>
          <div className="gap-2 text-sm flex items-center">
            <span id="sort-label" className="whitespace-nowrap text-muted-foreground">
              {tr("Sort by", "ތަރުތީބު")}
            </span>
            <Select
              aria-labelledby="sort-label"
              size="sm"
              classNames={{ root: "w-auto" }}
              value={sort}
              onValueChange={setSort}
              options={[
                { value: "popular", label: tr("Most used", "ގިނައިން ބޭނުންކުރާ") },
                { value: "name", label: tr("Name", "ނަން") },
                { value: "fee", label: tr("Lowest fee", "އެންމެ ކުޑަ ފީ") },
                { value: "time", label: tr("Fastest", "އެންމެ އަވަސް") },
              ]}
            />
          </div>
        </div>

        <div id="service-results" className="mt-6">
          <p className="sr-only" role="status">
            {tr(\`\${results.length} services\`, \`\${results.length} ޚިދުމަތް\`)}
          </p>
          {results.length ? (
            <ul className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid">
              {results.map((s) => {
                const cat = serviceCategories.find((c) => c.value === s.category)!
                return (
                  <li key={s.id}>
                    <Card
                      href={routes.public.serviceDetail}
                      className="hover:shadow-md h-full transition-shadow"
                      title={
                        <span className="gap-3 flex items-start">
                          <span className="size-9 grid shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon name={s.icon} className="size-4" />
                          </span>
                          <span className="pt-1.5">{l(s.title)}</span>
                        </span>
                      }
                      description={<span className="mt-1 block">{l(s.summary)}</span>}
                      footer={
                        <div className="gap-x-4 gap-y-2 text-sm flex w-full flex-wrap items-center">
                          <IconText icon="credit-card" size="sm" tone="muted">
                            {s.fee ? mvr(s.fee) : tr("Free", "ހިލޭ")}
                          </IconText>
                          <IconText icon="clock" size="sm" tone="muted">
                            {tr(\`\${s.days} days\`, \`\${s.days} ދުވަސް\`)}
                          </IconText>
                          <span className="gap-1 ms-auto flex">
                            {s.online ? (
                              <Tag size="sm" variant="primary" icon="globe">
                                {tr("Online", "އޮންލައިން")}
                              </Tag>
                            ) : (
                              <Tag size="sm" variant="outline" icon="building">
                                {tr("In person", "ކައުންޓަރުން")}
                              </Tag>
                            )}
                          </span>
                        </div>
                      }
                    >
                      <span className="sr-only">{l(cat.label)}</span>
                    </Card>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyState
              variant="no-results"
              bordered
              noun={{ one: tr("service", "ޚިދުމަތް"), other: tr("services", "ޚިދުމަތް") }}
              search={query || undefined}
              onClearSearch={query ? () => setQuery("") : undefined}
              onClearFilters={category !== "all" || onlineOnly || freeOnly ? clearFilters : undefined}
            />
          )}
        </div>
      </Container>
    </PortalShell>
  )
}
`;export{e as default};