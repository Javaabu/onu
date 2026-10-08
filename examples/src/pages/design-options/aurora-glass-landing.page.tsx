import * as React from "react"
import {
  Button,
  Card,
  FeatureGrid,
  Hero,
  Icon,
  LanguageSwitcher,
  LinkButton,
  Logo,
  ProgressBar,
  SiteFooter,
  StatusBadge,
  ThemeToggle,
  TopNav,
  UserAvatar,
  UserAvatarGroup,
  cn,
} from "@javaabu/onu"
import { StatTile, TimeSeriesChart } from "@javaabu/onu/charts"

import { useSettings } from "../../settings"
import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AuroraMark, AuroraRoot } from "./_aurora-glass"

export const meta = {
  title: "Aurora Glass · Landing",
  group: "Design options",
  layout: "bare",
  order: 25,
  description:
    "Dark-first frosted glass over a drifting brand aurora, with luminous edges, glow and a cursor spotlight.",
}

const DASHBOARD = "/pages/design-options/aurora-glass-dashboard"

// Fixed demo data (deterministic, so screenshots are stable).
const START = Date.parse("2026-09-08T00:00:00Z")
const DAY = 86_400_000
const traffic = Array.from({ length: 30 }, (_, i) => {
  const wave = Math.sin(i / 3.2) * 900 + Math.sin(i / 1.3) * 260
  const sessions = Math.round(5200 + i * 95 + wave)
  return { date: new Date(START + i * DAY).toISOString().slice(0, 10), sessions }
})

/** A centred page column. */
function Column({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("max-w-6xl px-4 sm:px-6 mx-auto w-full", className)}>{children}</div>
}

function Language() {
  const { settings, update } = useSettings()
  return (
    <LanguageSwitcher
      variant="menu"
      value={settings.locale}
      onChange={(code) => update({ locale: code as "en" | "dv" })}
      size="sm"
    />
  )
}

function Brand({ href = "/pages/design-options/aurora-glass-landing" }: { href?: string | null }) {
  const tr = useTr()
  return (
    <Logo
      alt="Raajje Cloud"
      href={href}
      text={<span className="ag-title text-base">{tr("Raajje Cloud", "ރާއްޖެ ކްލައުޑް")}</span>}
    >
      <AuroraMark />
    </Logo>
  )
}

/** The product, built from live Onu components, framed as an app window. */
function ProductPreview() {
  const tr = useTr()
  const queue = [
    {
      ref: "RC-24-0912",
      name: tr("Building permit · Fuvahmulah", "ބިނާކުރުމުގެ ހުއްދަ · ފުވައްމުލައް"),
      status: "success",
    },
    { ref: "RC-24-0911", name: tr("Fishing licence · Addu", "މަސްވެރިކަމުގެ ލައިސަންސް · އައްޑޫ"), status: "pending" },
    { ref: "RC-24-0910", name: tr("Land lease · Kulhudhuffushi", "ބިން ލީސް · ކުޅުދުއްފުށި"), status: "info" },
  ] as const
  const nav = [
    { icon: "home", label: tr("Overview", "ޚުލާޞާ") },
    { icon: "file-text", label: tr("Requests", "ރިކުއެސްޓް") },
    { icon: "credit-card", label: tr("Payments", "ފައިސާ") },
    { icon: "users", label: tr("Citizens", "ރައްޔިތުން") },
    { icon: "globe", label: tr("Islands", "ރަށްރަށް") },
  ]
  return (
    <figure className="ag-stage relative" aria-label={tr("Product preview", "ޕްރޮޑަކްޓް ޕްރިވިއު")}>
      <div className="ag-stage__glow" aria-hidden />
      <div className="ag-window ag-glass overflow-hidden rounded-2xl">
        {/* Window chrome */}
        <div className="gap-2 px-4 py-3 flex items-center border-b border-foreground/10">
          <span aria-hidden className="gap-1.5 flex">
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/20" />
          </span>
          <span className="px-3 py-1 text-xs ag-chip mx-auto rounded-md text-muted-foreground" dir="ltr">
            cloud.raajje.mv/overview
          </span>
        </div>
        <div className="md:grid-cols-[11rem_minmax(0,1fr)] grid">
          <ul className="gap-1 p-3 md:grid hidden content-start border-e border-foreground/10">
            {nav.map((n, i) => (
              <li
                key={n.icon}
                className={cn(
                  "gap-2.5 px-2.5 py-2 text-sm flex items-center rounded-lg",
                  i === 0 ? "font-medium bg-primary/15 text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon name={n.icon} className="size-4" />
                {n.label}
              </li>
            ))}
          </ul>
          <div className="gap-4 p-4 sm:p-5 min-w-0 grid">
            <div className="gap-3 sm:grid-cols-3 grid">
              <StatTile
                className="ag-glass ag-spot"
                label={tr("Requests today", "މިއަދުގެ ރިކުއެސްޓް")}
                value={8412}
                previousValue={7310}
                sparkline={traffic.slice(-12).map((d) => d.sessions)}
              />
              <StatTile
                className="ag-glass ag-spot"
                label={tr("Fees collected", "ލިބުނު ފީ")}
                value={412_880}
                previousValue={371_000}
                valueFormat="currency"
              />
              <StatTile
                className="ag-glass ag-spot sm:flex hidden"
                label={tr("Median wait (min)", "މެދު ވަގުތު (މިނެޓް)")}
                value={3.2}
                previousValue={4.1}
                positiveIsGood={false}
                valueFormat={{ maximumFractionDigits: 1 }}
              />
            </div>
            <div className="gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] grid">
              <div className="ag-glass ag-chart p-4 min-w-0 rounded-xl">
                <TimeSeriesChart
                  title={tr("Citizen sessions", "ރައްޔިތުންގެ ސެޝަން")}
                  description={tr("Last 30 days, all islands", "ފަހުގެ 30 ދުވަސް، ހުރިހާ ރަށެއް")}
                  data={traffic}
                  config={{ sessions: { label: tr("Sessions", "ސެޝަން"), color: "var(--ag-a)" } }}
                  area
                  interval="day"
                  valueFormat="integer"
                  height={170}
                  showTableToggle={false}
                  classNames={{ title: "text-sm", description: "text-xs" }}
                />
              </div>
              <div className="ag-glass p-4 gap-3 min-w-0 lg:grid hidden content-start rounded-xl">
                <p className="text-sm font-medium">{tr("Live queue", "ލައިވް ކިއު")}</p>
                <ul className="gap-3 grid">
                  {queue.map((q) => (
                    <li key={q.ref} className="gap-2 min-w-0 flex items-center justify-between">
                      <span className="min-w-0">
                        <span className="text-xs block font-mono text-muted-foreground" dir="ltr">
                          {q.ref}
                        </span>
                        <span className="text-sm block truncate">{q.name}</span>
                      </span>
                      <StatusBadge status={q.status} size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        {tr(
          "The Raajje Cloud overview: requests, fees, citizen sessions and a live queue.",
          "ރާއްޖެ ކްލައުޑްގެ ޚުލާޞާ: ރިކުއެސްޓް، ފީ، ސެޝަން އަދި ލައިވް ކިއު.",
        )}
      </figcaption>
    </figure>
  )
}

export default function AuroraGlassIndexPage() {
  const tr = useTr()

  const navItems = [
    { label: tr("Platform", "ޕްލެޓްފޯމް"), href: DASHBOARD },
    { label: tr("Services", "ޚިދުމަތްތައް"), href: routes.public.services },
    { label: tr("Customers", "ކަސްޓަމަރުން"), href: routes.public.about },
    { label: tr("Docs", "ޑޮކިއުމެންޓޭޝަން"), href: "/" },
  ]

  const features = [
    {
      icon: "user",
      title: tr("One identity, every service", "އެއް އައިޑެންޓިޓީ، ހުރިހާ ޚިދުމަތެއް"),
      description: tr(
        "Single sign-on for citizens, with two-factor and family delegation built in.",
        "ރައްޔިތުންނަށް އެއް ލޮގިން، ޓޫ-ފެކްޓަރާއި އާއިލާއަށް ހުއްދަ ދިނުމާއެކު.",
      ),
    },
    {
      icon: "credit-card",
      title: tr("Payments in MVR", "ރުފިޔާއިން ފައިސާ"),
      description: tr(
        "Card, transfer or counter: every fee reconciled to the laari, every night.",
        "ކާޑު، ޓްރާންސްފަރ ނުވަތަ ކައުންޓަރ: ކޮންމެ ފީއެއް ކޮންމެ ރެއަކު ލާރިއަށް ބެލެވޭ.",
      ),
    },
    {
      icon: "languages",
      title: tr("Bilingual by design", "ދެބަހުން ތަރުތީބުކުރެވިފަ"),
      description: tr(
        "Dhivehi and English side by side, mirrored RTL layouts and Thaana input everywhere.",
        "ދިވެހި އަދި އިނގިރޭސި، ކަނާތުން ވާތަށް ލޭއައުޓް އަދި ހުރިހާ ތަނެއްގައި ތާނަ.",
      ),
    },
    {
      icon: "wifi-off",
      title: tr("Built for island networks", "ރަށުގެ ނެޓްވޯކަށް ތައްޔާރު"),
      description: tr(
        "Forms save offline and sync when the signal returns, from Haa Alif to Addu.",
        "ސިގްނަލް ނެތަސް ފޯމު ރައްކާވެ، އަނބުރާ ސިންކުވޭ. ހއ އިން އައްޑޫއަށް.",
      ),
    },
    {
      icon: "history",
      title: tr("An audit trail for everything", "ހުރިހާ ކަމެއްގެ އޮޑިޓް"),
      description: tr(
        "Every approval, edit and payment is signed, timestamped and searchable.",
        "ކޮންމެ ފާސްކުރުމެއް، ބަދަލެއް އަދި ފައިސާއެއް ސޮއިކުރެވި، ވަގުތާއެކު ހޯދޭނެ.",
      ),
    },
    {
      icon: "lock",
      title: tr("Secure by default", "ފުރަތަމަ ދުވަހުން ރައްކާތެރި"),
      description: tr(
        "Encrypted at rest and in transit, hosted in-country, with role-based access.",
        "ރައްކާކޮށް އަދި ފޮނުވާއިރު އެންކްރިޕްޓްކުރެވި، ރާއްޖޭގައި ހޮސްޓްކުރެވި.",
      ),
    },
  ]

  const stats = [
    { value: "1.2M", label: tr("transactions a month", "މަހަކު ޓްރާންޒެކްޝަން") },
    { value: "187", label: tr("inhabited islands reached", "ޚިދުމަތް ލިބޭ ރަށް") },
    { value: "99.98%", label: tr("uptime, last 12 months", "އަޕްޓައިމް، ފަހުގެ 12 މަސް") },
    { value: "4 min", label: tr("median time to a permit", "ހުއްދައަކަށް މެދު ވަގުތު") },
  ]

  const customers = [
    tr("Atoll Health Network", "އަތޮޅު ހެލްތު ނެޓްވޯކް"),
    tr("Island Councils Union", "ރަށު ކައުންސިލް ޔޫނިއަން"),
    tr("Hulhumalé Works", "ހުޅުމާލެ ވޯކްސް"),
    tr("Raajje Transport", "ރާއްޖެ ޓްރާންސްޕޯޓް"),
    tr("Blue Lagoon Utilities", "ބްލޫ ލަގޫން ޔުޓިލިޓީޒް"),
  ]

  const atolls = [
    { name: tr("Addu City", "އައްޑޫ ސިޓީ"), value: 92 },
    { name: tr("Fuvahmulah", "ފުވައްމުލައް"), value: 86 },
    { name: tr("Kulhudhuffushi", "ކުޅުދުއްފުށި"), value: 78 },
    { name: tr("Thinadhoo", "ތިނަދޫ"), value: 64 },
  ]

  return (
    <AuroraRoot className="flex flex-col">
      {/* Navigation: a floating glass bar */}
      <header className="top-3 px-3 sm:px-4 sticky z-30">
        <div className="ag-glass max-w-6xl gap-3 px-3 py-2 sm:ps-4 mx-auto flex items-center rounded-2xl">
          <div className="md:block hidden shrink-0">
            <Brand />
          </div>
          <TopNav
            className="min-w-0 flex-1"
            items={navItems}
            logo={<Brand />}
            classNames={{ list: "justify-center" }}
          />
          <div className="gap-1 flex shrink-0 items-center">
            <Language />
            <ThemeToggle />
            <LinkButton href={routes.auth.signIn} variant="ghost" size="sm" className="sm:inline-flex hidden">
              {tr("Sign in", "ސައިން އިން")}
            </LinkButton>
            <LinkButton href={DASHBOARD} size="sm" className="ag-glow">
              {tr("Get started", "ފަށާލައްވާ")}
            </LinkButton>
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        {/* Hero */}
        <div className="relative">
          <div className="ag-grid" aria-hidden />
          <Hero
            align="center"
            size="lg"
            maxWidth="6xl"
            className="pb-10 @3xl/hero:pb-14 bg-transparent"
            eyebrow={
              <span className="ag-chip gap-2 px-3 py-1.5 text-sm font-medium inline-flex items-center rounded-full text-foreground">
                <span className="ag-pulse ag-pulse--primary" aria-hidden />
                {tr("Raajje Cloud 2.0 — now with offline sync", "ރާއްޖެ ކްލައުޑް 2.0 — އޮފްލައިން ސިންކާއެކު")}
                <Icon name="arrow-right" className="size-3.5 text-muted-foreground rtl:-scale-x-100" />
              </span>
            }
            title={
              <>
                {tr("One platform for ", "ކޮންމެ ރަށެއްގެ ޚިދުމަތަށް ")}
                <span className="ag-ink">{tr("every island service.", "އެއް ޕްލެޓްފޯމް.")}</span>
              </>
            }
            description={tr(
              "Raajje Cloud brings permits, payments, records and citizen services together: fast on a ferry's 3G, bilingual from day one, secure by default.",
              "ހުއްދަ، ފައިސާ، ރެކޯޑް އަދި ރައްޔިތުންގެ ޚިދުމަތްތައް އެއްތަނަކަށް: ދޯނީގެ 3G ގައިވެސް އަވަސް، ފުރަތަމަ ދުވަހުން ދެބަހުން، އަދި ރައްކާތެރި.",
            )}
            actions={
              <>
                <LinkButton href={DASHBOARD} size="lg" endIcon="arrow-right" className="ag-glow h-11 px-5">
                  {tr("Start building", "ފަށާލައްވާ")}
                </LinkButton>
                <Button variant="outline" size="lg" startIcon="play" className="ag-ghost h-11 px-5">
                  {tr("Watch the 2-minute tour", "2 މިނެޓުގެ ޓުއަރ ބައްލަވާ")}
                </Button>
              </>
            }
            classNames={{
              content: "max-w-5xl",
              title: "ag-display text-[clamp(2.6rem,1.4rem+4.6vw,5.25rem)] max-w-5xl",
              description: "text-muted-foreground max-w-2xl",
              actions: "gap-3 justify-center",
            }}
          >
            <div className="mt-2 gap-3 text-sm flex flex-wrap items-center justify-center text-muted-foreground">
              <UserAvatarGroup
                size="md"
                classNames={{ avatar: "ag-avatar" }}
                max={4}
                users={[
                  { name: tr("Aishath Shifa", "އައިޝަތު ޝިފާ") },
                  { name: tr("Ibrahim Nasheed", "އިބްރާހީމް ނަޝީދު") },
                  { name: tr("Mariyam Hana", "މަރިޔަމް ހަނާ") },
                  { name: tr("Hassan Rasheed", "ހަސަން ރަޝީދު") },
                ]}
              />
              {tr("Trusted by 40+ councils and agencies", "40 އަށްވުރެ ގިނަ ކައުންސިލް އަދި އިދާރާއަކުން ބޭނުންކުރޭ")}
            </div>
          </Hero>
        </div>

        {/* Product */}
        <Column className="pb-20 sm:pb-28">
          <ProductPreview />
        </Column>

        {/* Social proof */}
        <Column className="pb-20 sm:pb-24">
          <p className="ag-eyebrow text-center">
            {tr("Powering services across the atolls", "އަތޮޅުތަކުގެ ޚިދުމަތްތަކުގެ ފަހަތުގައި")}
          </p>
          <ul className="mt-6 gap-x-10 gap-y-4 flex flex-wrap items-center justify-center">
            {customers.map((c) => (
              <li key={c} className="ag-title text-lg gap-2 flex items-center text-foreground/70">
                <Icon name="building" className="size-4 text-primary" />
                {c}
              </li>
            ))}
          </ul>
        </Column>

        {/* Features */}
        <section aria-labelledby="ag-features" className="pb-20 sm:pb-28">
          <Column>
            <div className="max-w-3xl mx-auto text-center">
              <p className="ag-eyebrow">{tr("The platform", "ޕްލެޓްފޯމް")}</p>
              <h2 id="ag-features" className="ag-display mt-3 text-[clamp(2rem,1.3rem+3vw,3.4rem)] text-balance">
                {tr("Everything a service needs. ", "ޚިދުމަތަކަށް ބޭނުންވާ ހުރިހާ އެއްޗެއް. ")}
                <span className="text-muted-foreground">{tr("Nothing it doesn't.", "ބޭނުން ނުވާ އެއްޗެއް ނޫން.")}</span>
              </h2>
            </div>

            {/* Two showcase cards */}
            <div className="mt-12 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] grid">
              <Card
                headingLevel={3}
                className="ag-glass ag-spot rounded-3xl"
                classNames={{ title: "ag-title text-xl" }}
                title={tr("A command centre for every atoll", "ކޮންމެ އަތޮޅަކަށް ކޮމާންޑް ސެންޓަރެއް")}
                description={tr(
                  "See demand, queues and service levels island by island, live.",
                  "ރަށުން ރަށަށް ޑިމާންޑް، ކިއު އަދި ސަރވިސް ލެވެލް ލައިވްކޮށް.",
                )}
              >
                <div className="gap-4 pt-2 grid">
                  {atolls.map((a) => (
                    <ProgressBar
                      key={a.name}
                      value={a.value}
                      label={a.name}
                      showValue
                      classNames={{ indicator: "bg-linear-to-r rtl:bg-linear-to-l from-primary/70 to-primary" }}
                    />
                  ))}
                </div>
              </Card>
              <Card
                headingLevel={3}
                className="ag-glass ag-spot rounded-3xl"
                classNames={{ title: "ag-title text-xl" }}
                title={tr("Dhivehi first, not translated last", "ދިވެހި ފުރަތަމަ، ފަހުން ތަރުޖަމާ ނޫން")}
                description={tr(
                  "Every screen mirrors for Dhivehi, with Thaana type set properly.",
                  "ކޮންމެ ސްކްރީނެއް ކަނާތުން ވާތަށް، ތާނަ ރަނގަޅަށް.",
                )}
              >
                <div className="gap-3 pt-2 grid">
                  <div lang="dv" dir="rtl" className="ag-glass p-4 rounded-xl">
                    <p className="text-lg font-medium">ބިނާކުރުމުގެ ހުއްދަ</p>
                    <p className="text-sm text-muted-foreground">ހުށަހެޅުނީ ފުވައްމުލަކުން · 3 މިނެޓް ކުރިން</p>
                  </div>
                  <div lang="en" dir="ltr" className="ag-glass p-4 rounded-xl">
                    <p className="text-lg font-medium">Building permit</p>
                    <p className="text-sm text-muted-foreground">Submitted from Fuvahmulah · 3 minutes ago</p>
                  </div>
                </div>
              </Card>
            </div>

            <FeatureGrid
              className="mt-5"
              items={features}
              columns={3}
              variant="card"
              classNames={{
                root: "gap-5 @xl/features:gap-5",
                item: "ag-glass ag-spot rounded-2xl p-6",
                icon: "ag-chip text-primary bg-transparent rounded-xl",
                title: "ag-title text-lg",
                description: "text-muted-foreground",
              }}
            />
          </Column>
        </section>

        {/* Stats and testimonial */}
        <section aria-labelledby="ag-stats" className="pb-20 sm:pb-28">
          <Column>
            <h2 id="ag-stats" className="sr-only">
              {tr("Raajje Cloud in numbers", "ޢަދަދުތަކުން")}
            </h2>
            <div className="ag-glass overflow-hidden rounded-3xl">
              <dl className="sm:grid-cols-2 lg:grid-cols-4 grid">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      "px-6 py-8 sm:py-10 gap-2 flex flex-col-reverse",
                      i > 0 && "sm:border-t-0 border-t border-foreground/10",
                      i % 2 === 1 && "sm:border-s",
                      i === 2 && "lg:border-s sm:border-t lg:border-t-0",
                      i === 3 && "sm:border-t lg:border-t-0",
                    )}
                  >
                    <dt className="text-sm text-muted-foreground">{s.label}</dt>
                    <dd className="ag-figure text-[clamp(2.2rem,1.6rem+2vw,3.2rem)] leading-none" dir="ltr">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <figure className="gap-6 p-6 sm:p-10 md:grid-cols-[minmax(0,1fr)_auto] grid items-end border-t border-foreground/10">
                <blockquote className="ag-title text-[clamp(1.25rem,1rem+1vw,1.75rem)] text-balance">
                  {tr(
                    "“We moved 63 paper forms onto Raajje Cloud in one season. Islanders stopped taking the ferry to Malé just to get a stamp.”",
                    "„63 ކަރުދާސް ފޯމު އެއް މޫސުމުގައި ރާއްޖެ ކްލައުޑަށް. ތައްގަނޑަކަށް މާލެ ދާން ދިމާނުވޭ.“",
                  )}
                </blockquote>
                <figcaption className="gap-3 flex items-center">
                  <UserAvatar name={tr("Mariyam Hana", "މަރިޔަމް ހަނާ")} size="lg" />
                  <span className="text-sm">
                    <span className="font-medium block">{tr("Mariyam Hana", "މަރިޔަމް ހަނާ")}</span>
                    <span className="text-muted-foreground">
                      {tr("Digital lead, Addu City Council", "ޑިޖިޓަލް ލީޑް، އައްޑޫ ސިޓީ ކައުންސިލް")}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </div>
          </Column>
        </section>

        {/* Call to action */}
        <section aria-labelledby="ag-cta" className="pb-20 sm:pb-28">
          <Column>
            <div className="ag-glass ag-spot px-6 py-16 sm:py-20 relative overflow-hidden rounded-3xl text-center">
              <div className="ag-grid" aria-hidden />
              <div aria-hidden className="ag-stage__glow" />
              <p className="ag-eyebrow">{tr("Ready when your island is", "ތިޔަ ރަށް ތައްޔާރުވީމަ")}</p>
              <h2
                id="ag-cta"
                className="ag-display mt-3 max-w-3xl mx-auto text-[clamp(2.2rem,1.4rem+3.6vw,4.2rem)] text-balance"
              >
                <span className="ag-ink">{tr("Bring every island online.", "ކޮންމެ ރަށެއް އޮންލައިން ކުރަމާ.")}</span>
              </h2>
              <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
                {tr(
                  "Launch your first service in a week, with templates for permits, licences and payments.",
                  "ހުއްދަ، ލައިސަންސް އަދި ފައިސާގެ ޓެމްޕްލޭޓާއެކު، ހަފްތާއެއްގެ ތެރޭގައި ފުރަތަމަ ޚިދުމަތް.",
                )}
              </p>
              <div className="mt-8 gap-3 flex flex-wrap justify-center">
                <LinkButton href={DASHBOARD} size="lg" endIcon="arrow-right" className="ag-glow h-11 px-5">
                  {tr("Open the command centre", "ކޮމާންޑް ސެންޓަރ ހުޅުވާ")}
                </LinkButton>
                <LinkButton href={routes.public.contact} variant="outline" size="lg" className="ag-ghost h-11 px-5">
                  {tr("Talk to our team", "ޓީމާ ވާހަކަދައްކަވާ")}
                </LinkButton>
              </div>
            </div>
          </Column>
        </section>
      </main>

      <SiteFooter
        className="ag-header bg-transparent"
        logo={<Brand href={null} />}
        description={tr(
          "One platform for every island service. Built on Onu.",
          "ކޮންމެ ރަށެއްގެ ޚިދުމަތަށް އެއް ޕްލެޓްފޯމް. އޮނު މައްޗަށް ބިނާކޮށްފަ.",
        )}
        name={tr("Raajje Cloud", "ރާއްޖެ ކްލައުޑް")}
        year={2026}
        columns={[
          {
            title: tr("Product", "ޕްރޮޑަކްޓް"),
            links: [
              { label: tr("Command centre", "ކޮމާންޑް ސެންޓަރ"), href: DASHBOARD },
              { label: tr("Services", "ޚިދުމަތްތައް"), href: routes.public.services },
            ],
          },
          {
            title: tr("Company", "ކުންފުނި"),
            links: [
              { label: tr("About", "އަޅުގަނޑުމެން"), href: routes.public.about },
              { label: tr("Contact", "ގުޅުއްވާ"), href: routes.public.contact },
            ],
          },
          {
            title: tr("Developers", "ޑިވެލޮޕަރުން"),
            links: [
              { label: tr("Docs", "ޑޮކިއުމެންޓޭޝަން"), href: "/" },
              { label: tr("Components", "ކޮމްޕޯނަންޓް"), href: "/components" },
            ],
          },
        ]}
        legalLinks={[{ label: tr("Privacy", "ޕްރައިވެސީ"), href: routes.public.about }]}
      />
    </AuroraRoot>
  )
}
