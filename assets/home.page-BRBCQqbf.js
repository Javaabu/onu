var e=`import { useNavigate } from "react-router"
import {
  AnnouncementBar,
  Card,
  ContentCard,
  DateCalendar,
  Icon,
  IconText,
  LinkButton,
  SearchBox,
  Section,
  Tag,
} from "@javaabu/onu"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { PortalShell } from "../_shared/shells"
import { events, news, newsCategories, newsImage, services } from "./_data"
import { scene, useDates, useL, useMvr } from "./_i18n"
import { Container } from "./_ui"

export const meta = { title: "Home", group: "Public portal", layout: "bare", order: 1 }

export default function PortalHomePage() {
  const tr = useTr()
  const l = useL()
  const dv = useDv()
  const mvr = useMvr()
  const dates = useDates()
  const navigate = useNavigate()
  const search = (q: string) => navigate(\`\${routes.public.search}?q=\${encodeURIComponent(q)}\`)

  const quickLinks = [
    { icon: "user", label: tr("Passport and ID", "ޕާސްޕޯޓާއި ކާޑު"), href: routes.public.serviceDetail },
    { icon: "home", label: tr("Housing", "ގެދޮރު"), href: routes.public.services },
    { icon: "building", label: tr("Business", "ވިޔަފާރި"), href: routes.public.services },
    { icon: "file-text", label: tr("Laws", "ޤާނޫނުތައް"), href: routes.public.laws },
    { icon: "users", label: tr("Jobs", "ވަޒީފާ"), href: routes.public.jobs },
    { icon: "phone", label: tr("Contact us", "ގުޅުއްވާ"), href: routes.public.contact },
  ]
  const popular = services.filter((s) => s.popular).slice(0, 6)
  const upcoming = [...events].sort((a, b) => a.start.localeCompare(b.start)).slice(0, 4)
  const catLabel = (value: string) => l(newsCategories.find((c) => c.value === value)!.label)

  return (
    <PortalShell>
      <AnnouncementBar icon="megaphone" href={routes.public.newsArticle} linkText={tr("Read more", "ތަފްޞީލު")}>
        {tr(
          "Social housing applications open on 15 October.",
          "ސޯޝަލް ހައުސިންގ އެޕްލިކޭޝަން 15 އޮކްޓޫބަރުގައި ހުޅުވާލާނެ.",
        )}
      </AnnouncementBar>

      {/* Hero */}
      <div className="relative overflow-hidden border-b bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <Container className="py-14 sm:py-20 lg:py-24 gap-12 lg:grid-cols-[1.4fr_1fr] grid items-center">
          <div className="max-w-3xl">
            <p className="gap-2 px-3 py-1 text-sm font-medium inline-flex items-center rounded-full border bg-background/70 text-primary">
              <Icon name="success" className="size-4" />
              {tr("120+ services available online", "120 އަށް ވުރެ ގިނަ ޚިދުމަތް އޮންލައިންކޮށް")}
            </p>
            <h1 className="mt-5 font-semibold tracking-tight text-[clamp(2.25rem,1.4rem+3.6vw,4rem)] leading-[1.1] text-balance">
              {tr("Government services, wherever you live", "ކޮންމެ ރަށަކަށް ސަރުކާރުގެ ޚިދުމަތް")}
            </h1>
            <p className="mt-5 max-w-2xl text-[clamp(1.05rem,0.95rem+0.5vw,1.25rem)] text-pretty text-muted-foreground">
              {tr(
                "Renew a passport, register a business or apply for housing from your phone — no queue, no ferry ride.",
                "ފޯނުން ޕާސްޕޯޓް އާކުރައްވާ، ވިޔަފާރި ރަޖިސްޓްރީކުރައްވާ ނުވަތަ ގެދޮރަށް އެދިވަޑައިގަންނަވާ — ކިއު ނުހައްދަވައި، ދަތުރު ނުކުރައްވައި.",
              )}
            </p>
            <div className="mt-8 max-w-2xl">
              <SearchBox
                aria-label={tr("Search services, news and laws", "ޚިދުމަތް، ޚަބަރު އަދި ޤާނޫނު ހޯއްދަވާ")}
                placeholder={tr("Search services, news and laws…", "ޚިދުމަތް، ޚަބަރު އަދި ޤާނޫނު ހޯއްދަވާ…")}
                thaana={dv}
                submitOnBlur={false}
                onSearch={(q) => q && search(q)}
                className="sm:max-w-none"
                classNames={{ root: "h-12 bg-background", input: "text-base" }}
              />
              <div className="mt-3 gap-2 text-sm flex flex-wrap items-center text-muted-foreground">
                <span>{tr("Popular:", "ގިނައިން ހޯދާ:")}</span>
                {[tr("passport", "ޕާސްޕޯޓް"), tr("housing", "ހައުސިންގ"), tr("driving licence", "ލައިސަންސް")].map(
                  (q) => (
                    <Tag key={q} size="sm" variant="outline" onClick={() => search(q)}>
                      {q}
                    </Tag>
                  ),
                )}
              </div>
            </div>
          </div>
          <div aria-hidden className="lg:block relative hidden">
            <img
              src={scene("", 195, 900, 1000)}
              alt=""
              className="shadow-xl aspect-[9/10] w-full rounded-3xl border object-cover"
            />
            <div className="-bottom-6 gap-3 p-4 -start-6 shadow-lg absolute flex items-center rounded-xl border bg-card">
              <span className="size-10 grid place-items-center rounded-full bg-success/15 text-success">
                <Icon name="success" className="size-5" />
              </span>
              <div className="text-sm">
                <div className="font-medium">{tr("Passport renewed", "ޕާސްޕޯޓް އާކުރެވިއްޖެ")}</div>
                <div className="text-muted-foreground">{tr("Ready to collect in Addu", "އައްޑޫއިން ނަގާލެވޭނެ")}</div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Quick links */}
      <Container className="py-10 -mt-px">
        <h2 className="sr-only">{tr("Quick links", "އަވަސް ލިންކުތައް")}</h2>
        <ul className="gap-3 sm:grid-cols-3 lg:grid-cols-6 grid grid-cols-2">
          {quickLinks.map((q) => (
            <li key={q.label}>
              <Card
                href={q.href}
                size="sm"
                className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40"
                title={
                  <span className="gap-3 flex flex-col items-start">
                    <span className="size-10 grid place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon name={q.icon} className="size-5" />
                    </span>
                    {q.label}
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      </Container>

      {/* Popular services */}
      <Container className="py-10">
        <Section
          title={tr("Popular services", "ގިނައިން ބޭނުންކުރާ ޚިދުމަތްތައް")}
          description={tr(
            "Start online and track your application.",
            "އޮންލައިންކޮށް ފައްޓަވައި، އެޕްލިކޭޝަން ބައްލަވާ.",
          )}
          actions={
            <LinkButton href={routes.public.services} variant="outline" endIcon="arrow-right">
              {tr("All services", "ހުރިހާ ޚިދުމަތެއް")}
            </LinkButton>
          }
          classNames={{ title: "text-2xl", content: "mt-6" }}
        >
          <ul className="gap-4 sm:grid-cols-2 lg:grid-cols-3 grid">
            {popular.map((s) => (
              <li key={s.id}>
                <Card
                  href={routes.public.serviceDetail}
                  className="hover:shadow-md h-full transition-shadow"
                  title={l(s.title)}
                  description={l(s.summary)}
                  footer={
                    <div className="gap-x-4 gap-y-1 text-sm flex flex-wrap text-muted-foreground">
                      <IconText icon="credit-card" size="sm" tone="muted">
                        {s.fee ? mvr(s.fee) : tr("Free", "ހިލޭ")}
                      </IconText>
                      <IconText icon="clock" size="sm" tone="muted">
                        {tr(\`\${s.days} working days\`, \`\${s.days} ބަންދު ނޫން ދުވަސް\`)}
                      </IconText>
                    </div>
                  }
                />
              </li>
            ))}
          </ul>
        </Section>
      </Container>

      {/* News */}
      <div className="border-y bg-muted/30">
        <Container className="py-12">
          <Section
            title={tr("Latest news", "އެންމެ ފަހުގެ ޚަބަރު")}
            actions={
              <LinkButton href={routes.public.news} variant="outline" endIcon="arrow-right">
                {tr("All news", "ހުރިހާ ޚަބަރެއް")}
              </LinkButton>
            }
            classNames={{ title: "text-2xl", content: "mt-6" }}
          >
            <ul className="gap-6 md:grid-cols-3 grid">
              {news.slice(0, 3).map((n) => (
                <li key={n.id}>
                  <ContentCard
                    className="h-full"
                    title={l(n.title)}
                    excerpt={l(n.excerpt)}
                    image={{ src: newsImage(n, 800, 450), alt: "" }}
                    href={routes.public.newsArticle}
                    date={n.date}
                    category={catLabel(n.category)}
                  />
                </li>
              ))}
            </ul>
          </Section>
        </Container>
      </div>

      {/* Events */}
      <Container className="py-12">
        <Section
          title={tr("Upcoming events", "ކުރިއަށް އޮތް ހަރަކާތްތައް")}
          actions={
            <LinkButton href={routes.public.events} variant="outline" endIcon="arrow-right">
              {tr("Events calendar", "ހަރަކާތްތަކުގެ ކެލެންޑަރު")}
            </LinkButton>
          }
          classNames={{ title: "text-2xl", content: "mt-6" }}
        >
          <div className="gap-6 lg:grid-cols-[1fr_20rem] grid">
            <ul className="gap-3 grid">
              {upcoming.map((e) => {
                return (
                  <li key={e.id}>
                    <Card href={routes.public.eventDetail} size="sm" className="transition-colors hover:bg-muted/40">
                      <div className="gap-4 flex items-start">
                        <div
                          aria-hidden
                          className="w-14 py-2 shrink-0 rounded-lg bg-primary/10 text-center text-primary tabular-nums"
                        >
                          <div className="text-xs font-medium text-foreground uppercase">
                            {dates.monthShort(e.start)}
                          </div>
                          <div className="text-2xl font-semibold leading-none">{dates.day(e.start)}</div>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium">{l(e.title)}</h3>
                          <div className="mt-1 gap-x-4 gap-y-1 flex flex-wrap">
                            <IconText icon="clock" size="sm" tone="muted">
                              <time dateTime={e.start}>{dates.dateTime(e.start)}</time>
                            </IconText>
                            <IconText icon="map-pin" size="sm" tone="muted">
                              {l(e.venue)}
                            </IconText>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </li>
                )
              })}
            </ul>
            <Card size="sm" title={tr("Calendar", "ކެލެންޑަރު")} headingLevel={3}>
              <DateCalendar
                readOnly
                size="sm"
                className="px-2"
                defaultMonth={new Date(2026, 9, 1)}
                events={events.map((e) => ({
                  id: e.id,
                  date: e.start,
                  title: l(e.title),
                  href: routes.public.eventDetail,
                  tone: "primary" as const,
                }))}
              />
            </Card>
          </div>
        </Section>
      </Container>

      {/* Call to action */}
      <Container className="pb-16">
        <div className="gap-6 p-8 sm:p-10 md:flex-row md:items-center flex flex-col justify-between rounded-2xl bg-primary text-primary-foreground">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {tr("Track an application", "އެޕްލިކޭޝަނެއް ބައްލަވާ")}
            </h2>
            <p className="mt-2 max-w-xl">
              {tr(
                "Sign in with eFaas to see every application, payment and document in one place.",
                "އީފާސް މެދުވެރިކޮށް ލޮގިންވެ، ހުރިހާ އެޕްލިކޭޝަނެއް، ފައިސާ ދެއްކުމެއް އަދި ލިޔުމެއް އެއް ތަނަކުން ބައްލަވާ.",
              )}
            </p>
          </div>
          <LinkButton href={routes.auth.signIn} variant="secondary" size="lg" startIcon="log-in">
            {tr("Sign in to eServices", "އީ ސަރވިސަސްއަށް ލޮގިން")}
          </LinkButton>
        </div>
      </Container>
    </PortalShell>
  )
}
`;export{e as default};