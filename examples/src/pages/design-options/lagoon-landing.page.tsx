import {
  ConditionalLink,
  FeatureGrid,
  Icon,
  LinkButton,
  ProgressBar,
  SearchBox,
  SiteFooter,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  ThemeToggle,
  Timeline,
  UserAvatar,
  UserAvatarGroup,
} from "@javaabu/onu"
import { StatTile, StatTiles, TimeSeriesChart } from "@javaabu/onu/charts"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { ATOLLS, IslandArt, LagoonLanguage, LagoonMark, Wave } from "./_lagoon"
import "./lagoon.css"

export const meta = {
  title: "Lagoon · Landing",
  group: "Design options",
  layout: "bare",
  order: 35,
  description:
    "Light-first and Maldivian: lagoon-to-ocean gradients, sand and coral neutrals, sunlit glows and gentle waves.",
}

const DASHBOARD = "/pages/design-options/lagoon-dashboard"
const INDEX = "/pages/design-options/lagoon-landing"

const WEEK = [
  { date: "2026-09-25", online: 1180, counter: 420 },
  { date: "2026-09-26", online: 1240, counter: 380 },
  { date: "2026-09-27", online: 980, counter: 210 },
  { date: "2026-09-28", online: 1320, counter: 460 },
  { date: "2026-09-29", online: 1460, counter: 440 },
  { date: "2026-09-30", online: 1510, counter: 410 },
  { date: "2026-10-01", online: 1620, counter: 390 },
  { date: "2026-10-02", online: 1580, counter: 360 },
  { date: "2026-10-03", online: 1390, counter: 240 },
  { date: "2026-10-04", online: 1710, counter: 350 },
  { date: "2026-10-05", online: 1820, counter: 330 },
  { date: "2026-10-06", online: 1900, counter: 310 },
  { date: "2026-10-07", online: 1960, counter: 300 },
  { date: "2026-10-08", online: 2040, counter: 280 },
]

function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <p className="text-sm font-semibold tracking-wide text-primary">{eyebrow}</p>
      <h2 className="lg-serif mt-3 font-semibold text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.15] text-balance">
        {title}
      </h2>
      {lead ? <p className="mt-4 text-lg text-pretty text-muted-foreground">{lead}</p> : null}
    </div>
  )
}

export default function LagoonIndexPage() {
  const tr = useTr()
  const dv = useDv()

  const nav = [
    { label: tr("Services", "ޚިދުމަތްތައް"), href: routes.public.services },
    { label: tr("Track", "ބައްލަވާ"), href: routes.applications.statusTracker },
    { label: tr("For councils", "ކައުންސިލްތަކަށް"), href: DASHBOARD },
    { label: tr("Help", "އެހީ"), href: routes.public.contact },
  ]

  const features = [
    {
      icon: "home",
      title: tr("Every service, one front door", "ހުރިހާ ޚިދުމަތެއް، އެއް ދޮރުން"),
      description: tr(
        "Passports, housing, licences and permits from 38 agencies, with one eRaajje account.",
        "38 މުއައްސަސާއެއްގެ ޕާސްޕޯޓް، ގެދޮރު، ލައިސަންސް އަދި ހުއްދަ، އެއް އީރާއްޖެ އެކައުންޓަކުން.",
      ),
    },
    {
      icon: "map-pin",
      title: tr("No ferry ride needed", "ދަތުރު ނުކޮށް"),
      description: tr(
        "Apply from your island. Collect at the nearest council office when it is ready.",
        "ރަށުން އެދިވަޑައިގަންނަވާ. ތައްޔާރުވީމަ ކައިރީގައިވާ ކައުންސިލުން ނަންގަވާ.",
      ),
    },
    {
      icon: "clock",
      title: tr("Queues that wait for you", "ކިއު ހައްދަވާނީ ފޯނުން"),
      description: tr(
        "Take a ticket from home and get a message when your counter is three away.",
        "ގޭގައި ހުރެ ޓިކެޓް ނަންގަވާ. ތިން މީހުން ކުރިއަށް ހުރިއިރު މެސެޖެއް ލިބޭނެ.",
      ),
    },
    {
      icon: "languages",
      title: tr("Dhivehi first", "ދިވެހިބަހަށް ފުރަތަމަ"),
      description: tr(
        "Every form, receipt and message in Dhivehi and English, right to left done right.",
        "ހުރިހާ ފޯމެއް، ރަސީދެއް އަދި މެސެޖެއް ދިވެހިބަހާއި އިނގިރޭސިބަހުން.",
      ),
    },
    {
      icon: "credit-card",
      title: tr("Pay once, securely", "އެއް ފަހަރު، ރައްކާތެރިކޮށް"),
      description: tr(
        "BML, MIB and card payments with instant receipts that every office accepts.",
        "ބީއެމްއެލް، އެމްއައިބީ އަދި ކާޑުން ފައިސާ ދައްކަވާ. ރަސީދު ވަގުތުން.",
      ),
    },
    {
      icon: "lock",
      title: tr("Private by design", "ސިއްރު ރައްކާތެރިކޮށް"),
      description: tr(
        "eFaas sign-in, consent on every data share and a full log of who saw what.",
        "އީފާސް ލޮގިން، ކޮންމެ މަޢުލޫމާތެއް ހިއްސާކުރުމުގައި ހުއްދަ، އަދި ފުރިހަމަ ލޮގެއް.",
      ),
    },
  ]

  const stats = [
    { value: tr("187", "187"), label: tr("inhabited islands served", "ރަށަށް ޚިދުމަތް") },
    { ltr: true, value: tr("120+", "120+"), label: tr("services online", "އޮންލައިން ޚިދުމަތް") },
    { value: tr("12 min", "12 މިނެޓް"), label: tr("average time to apply", "އެދުމަށް ހޭދަވާ ވަގުތު") },
    { ltr: true, value: tr("4.8 / 5", "4.8 / 5"), label: tr("citizen satisfaction", "ރައްޔިތުންގެ ހިތްހަމަޖެހުން") },
  ]

  const people = [
    { name: tr("Aishath Nazeema", "އާއިޝަތު ނާޒިމާ") },
    { name: tr("Mohamed Rasheed", "މުޙައްމަދު ރަޝީދު") },
    { name: tr("Fathimath Shaany", "ފާޠިމަތު ޝާނީ") },
    { name: tr("Ibrahim Waheed", "އިބްރާހީމް ވަޙީދު") },
  ]

  const quotes = [
    {
      name: tr("Aminath Sofa", "އާމިނަތު ސޮފާ"),
      place: tr("Fuvahmulah", "ފުވައްމުލައް"),
      text: tr(
        "I renewed my son's passport during his school break, without crossing to Malé once.",
        "ދަރިފުޅުގެ ޕާސްޕޯޓް ސްކޫލު ބަންދުގައި އާކުރީ، އެއްފަހަރުވެސް މާލެ ނުދިޔަޔަސް.",
      ),
    },
    {
      name: tr("Hassan Zahir", "ޙަސަން ޒާހިރު"),
      place: tr("Council officer, Thinadhoo", "ކައުންސިލް، ތިނަދޫ"),
      text: tr(
        "Our counter queue went from a bench full of people to a calm room. Everyone gets a message.",
        "ކުރިން ގޮނޑި ފުރިގެން ތިބި ކިއު، މިހާރު މަޑުމައިތިރި. ކޮންމެ މީހަކަށް މެސެޖެއް ލިބޭ.",
      ),
    },
    {
      name: tr("Mariyam Leena", "މަރިޔަމް ލީނާ"),
      place: tr("Business owner, Addu City", "ވިޔަފާރިވެރިޔާ، އައްޑޫ"),
      text: tr(
        "Registering the guesthouse took one evening. The receipt was in my inbox before dinner.",
        "ގެސްޓްހައުސް ރަޖިސްޓްރީކުރީ އެއް ހަވީރެއްގައި. ރަސީދު ރޭގަނޑު ކެއުމުގެ ކުރިން ލިބުނު.",
      ),
    },
  ]

  const recent = [
    {
      ref: "PPT-0815",
      name: tr("Aishath Nazeema", "އާއިޝަތު ނާޒިމާ"),
      service: tr("Passport renewal", "ޕާސްޕޯޓް"),
      island: tr("Hulhumalé", "ހުޅުމާލެ"),
      status: "info",
      label: tr("In review", "ރިވިއުގައި"),
    },
    {
      ref: "LIC-2207",
      name: tr("Ibrahim Waheed", "އިބްރާހީމް ވަޙީދު"),
      service: tr("Driving licence", "ލައިސަންސް"),
      island: tr("Thinadhoo", "ތިނަދޫ"),
      status: "success",
      label: tr("Approved", "ފާސްވެއްޖެ"),
    },
    {
      ref: "HSG-1190",
      name: tr("Fathimath Shaany", "ފާޠިމަތު ޝާނީ"),
      service: tr("Social housing", "ހައުސިންގ"),
      island: tr("Addu City", "އައްޑޫ"),
      status: "pending",
      label: tr("Awaiting documents", "ލިޔުން ބޭނުން"),
    },
    {
      ref: "BIZ-0472",
      name: tr("Mohamed Rasheed", "މުޙައްމަދު ރަޝީދު"),
      service: tr("Business registration", "ވިޔަފާރި"),
      island: tr("Kulhudhuffushi", "ކުޅުދުއްފުށި"),
      status: "success",
      label: tr("Approved", "ފާސްވެއްޖެ"),
    },
  ]

  const busiest = [...ATOLLS].sort((a, b) => b.v - a.v).slice(0, 5)

  return (
    <div className="design-lagoon min-h-svh">
      {/* Navigation: floating glass pill */}
      <header className="top-3 px-4 sticky z-40">
        <div className="lg-glass max-w-6xl gap-3 py-2 ps-3 pe-2 shadow-lg mx-auto flex items-center rounded-full shadow-primary/5">
          <ConditionalLink
            href={INDEX}
            className="gap-2.5 font-semibold flex items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <LagoonMark />
            <span className="lg-serif text-lg">{tr("eRaajje", "އީރާއްޖެ")}</span>
          </ConditionalLink>
          <nav aria-label={tr("Main", "މައި")} className="ms-4 md:flex hidden">
            <ul className="gap-1 flex">
              {nav.map((n) => (
                <li key={n.label}>
                  <LinkButton href={n.href} variant="ghost" className="lg-pill h-9 text-muted-foreground">
                    {n.label}
                  </LinkButton>
                </li>
              ))}
            </ul>
          </nav>
          <div className="gap-1 ms-auto flex items-center">
            <LagoonLanguage />
            <ThemeToggle />
            <LinkButton href={routes.auth.signIn} className="lg-pill ms-1 sm:inline-flex h-9 hidden" size="lg">
              {tr("Sign in", "ވަދެވަޑައިގަންނަވާ")}
            </LinkButton>
          </div>
        </div>
      </header>

      <main id="main" className="-mt-16">
        {/* Hero */}
        <section className="lg-mesh lg-grain pt-28 sm:pt-36 relative" aria-labelledby="lg-hero-title">
          <div aria-hidden className="lg-glow lg-glow-sun -top-20 end-0 size-[34rem]" />
          <div aria-hidden className="lg-glow top-40 -start-40 size-[30rem]" />
          <div className="max-w-6xl gap-14 px-4 lg:grid-cols-[1.1fr_1fr] relative mx-auto grid items-center">
            <div className="min-w-0">
              <p className="lg-glass gap-2 px-3 py-1.5 text-sm font-medium inline-flex items-center rounded-full">
                <span className="lg-pulse-dot size-2 rounded-full bg-success text-success" aria-hidden />
                {tr("Live on all 187 inhabited islands", "އާބާދީ ހުރި 187 ރަށުގައި")}
              </p>
              <h1
                id="lg-hero-title"
                className="lg-serif mt-6 font-semibold text-[clamp(2.5rem,1.6rem+4vw,4.5rem)] leading-[1.04] text-balance"
              >
                {tr("Government services, ", "ކޮންމެ ރަށަކަށް، ")}
                <span className="lg-gradient-text">
                  {tr("as calm as the lagoon.", "ފެންގަނޑު ފަދަ މަޑުމައިތިރިކަމާއެކު.")}
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-[clamp(1.05rem,0.95rem+0.4vw,1.2rem)] text-pretty text-muted-foreground">
                {tr(
                  "eRaajje brings passports, housing, licences and council services to every island: apply from your phone, wait from home, collect next door.",
                  "ޕާސްޕޯޓް، ގެދޮރު، ލައިސަންސް އަދި ކައުންސިލްގެ ޚިދުމަތް ކޮންމެ ރަށަކަށް: ފޯނުން އެދިވަޑައިގަންނަވާ، ގޭގައި އިންތިޒާރުކުރައްވާ، ކައިރިން ނަންގަވާ.",
                )}
              </p>
              <div className="mt-8 max-w-xl">
                <SearchBox
                  aria-label={tr("What do you need today?", "މިއަދު ބޭނުންވަނީ ކޮން ޚިދުމަތެއް؟")}
                  placeholder={tr("What do you need today? Try “passport”", "މިއަދު ބޭނުންވަނީ ކޮން ޚިދުމަތެއް؟")}
                  thaana={dv}
                  submitOnBlur={false}
                  className="sm:max-w-none"
                  classNames={{
                    root: "lg-glass h-13 rounded-full ps-2 shadow-lg shadow-primary/5",
                    input: "text-base",
                  }}
                />
              </div>
              <div className="mt-6 gap-3 flex flex-wrap items-center">
                <LinkButton
                  href={routes.public.services}
                  size="lg"
                  endIcon="arrow-right"
                  className="lg-pill lg-pill-primary h-11 px-5 text-[0.95rem]"
                >
                  {tr("Start a service", "ޚިދުމަތެއް ފައްޓަވާ")}
                </LinkButton>
                <LinkButton
                  href={routes.applications.statusTracker}
                  size="lg"
                  variant="outline"
                  className="lg-pill h-11 px-5 text-[0.95rem]"
                >
                  {tr("Track an application", "އެޕްލިކޭޝަން ބައްލަވާ")}
                </LinkButton>
              </div>
              <div className="mt-8 gap-3 text-sm flex items-center text-muted-foreground">
                <UserAvatarGroup users={people} size="sm" max={4} />
                <p>
                  <span className="font-semibold text-foreground">{tr("412,000", "412،000")}</span>{" "}
                  {tr("citizens served this year", "ރައްޔިތުންނަށް މިއަހަރު ޚިދުމަތް")}
                </p>
              </div>
            </div>

            {/* Live product mock built from Onu components */}
            <div className="max-w-md lg:max-w-none relative mx-auto w-full">
              <IslandArt className="-top-12 -end-4 absolute w-[110%] max-w-none opacity-90" />
              <div className="lg-card lg-float-slow p-5 sm:p-6 mt-36 sm:mt-44 lg:ms-10 relative rounded-[2rem]">
                <div className="gap-3 flex items-center">
                  <UserAvatar name={tr("Aishath Nazeema", "އާއިޝަތު ނާޒިމާ")} size="md" status="online" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{tr("Welcome back", "މަރުޙަބާ")}</p>
                    <p className="font-semibold">{tr("Aishath Nazeema", "އާއިޝަތު ނާޒިމާ")}</p>
                  </div>
                  <StatusBadge status="info">{tr("In review", "ރިވިއުގައި")}</StatusBadge>
                </div>
                <div className="mt-5 p-4 rounded-2xl bg-muted/70">
                  <div className="gap-2 flex items-baseline justify-between">
                    <p className="font-semibold">{tr("Passport renewal", "ޕާސްޕޯޓް އާކުރުން")}</p>
                    <p className="text-xs font-mono text-muted-foreground">PPT-0815</p>
                  </div>
                  <ProgressBar className="mt-3" value={72} label={tr("Step 3 of 4", "4 ގެ ތެރެއިން 3")} showValue />
                </div>
                <Timeline
                  size="sm"
                  className="mt-5"
                  items={[
                    {
                      title: tr("Submitted from Fuvahmulah", "ފުވައްމުލަކުން ހުށަހެޅި"),
                      status: "success",
                    },
                    { title: tr("Fee paid · MVR 250.00", "ފީ ދެއްކި · ރ 250.00"), status: "success" },
                    {
                      title: tr("Biometrics at the council office", "ކައުންސިލުގައި ބަޔޮމެޓްރިކްސް"),
                      description: tr("Thursday, 10:30", "ބުރާސްފަތި، 10:30"),
                      status: "current",
                    },
                    { title: tr("Ready to collect", "ނެންގެވޭނެ"), status: "pending" },
                  ]}
                />
              </div>
              <div className="lg-glass lg-float -bottom-12 -start-2 sm:-start-6 gap-3 p-3 pe-4 shadow-xl absolute flex items-center rounded-2xl">
                <span className="size-10 relative grid place-items-center rounded-full bg-primary text-primary-foreground">
                  <span aria-hidden className="lg-ripple" />
                  <span aria-hidden className="lg-ripple" />
                  <Icon name="clock" className="size-5" />
                </span>
                <div className="text-sm">
                  <p className="font-semibold">{tr("Ticket A-042", "ޓިކެޓް A-042")}</p>
                  <p className="text-muted-foreground">{tr("3 ahead · about 9 min", "3 މީހުން ކުރީގައި · 9 މިނެޓް")}</p>
                </div>
              </div>
            </div>
          </div>
          <Wave className="mt-20" />
        </section>

        {/* Atolls strip */}
        <section aria-labelledby="lg-atolls" className="max-w-6xl px-4 py-6 mx-auto">
          <h2 id="lg-atolls" className="text-sm font-medium text-center text-muted-foreground">
            {tr(
              "Serving councils in every atoll, from Haa Alif to Addu",
              "ހއ އިން ފެށިގެން އައްޑޫ އަށް، ހުރިހާ ކައުންސިލަކަށް",
            )}
          </h2>
          <ul className="mt-5 gap-x-6 gap-y-2 text-sm font-medium flex flex-wrap justify-center text-muted-foreground">
            {ATOLLS.filter((_, i) => i % 2 === 0).map((a) => (
              <li key={a.code} className="gap-2 flex items-center">
                <span aria-hidden className="size-1.5 rounded-full bg-primary/50" />
                {dv ? a.dv : a.en}
              </li>
            ))}
          </ul>
        </section>

        {/* Product showcase */}
        <section aria-labelledby="lg-showcase" className="py-20 sm:py-28 relative">
          <div
            aria-hidden
            className="lg-glow h-80 start-1/2 top-1/3 w-[60rem] max-w-full -translate-x-1/2 rtl:translate-x-1/2"
          />
          <div className="max-w-6xl px-4 relative mx-auto">
            <div id="lg-showcase">
              <SectionHeading
                eyebrow={tr("For island offices", "ރަށުގެ އޮފީސްތަކަށް")}
                title={tr("One calm desk for every counter", "ކޮންމެ ކައުންޓަރަކަށް، އެއް މަޑުމައިތިރި ޑެސްކެއް")}
                lead={tr(
                  "Staff see the whole day at a glance: who is waiting, what is due and which islands need a hand.",
                  "މުވައްޒަފުންނަށް މުޅި ދުވަސް އެއް ނަޒަރަކުން: އިންތިޒާރުގައި ތިބީ ކާކު، ނިންމަންޖެހެނީ ކޮބާ، އެހީ ބޭނުންވަނީ ކޮން ރަށަކަށް.",
                )}
              />
            </div>
            <div className="lg-card lg-ring mt-12 p-2 sm:p-3 rounded-[2rem]">
              <div className="rounded-[1.6rem] border bg-background/60">
                <div className="gap-3 px-4 py-3 flex items-center border-b">
                  <span aria-hidden className="gap-1.5 flex">
                    <span className="size-2.5 rounded-full bg-[var(--lg-coral)]" />
                    <span className="size-2.5 rounded-full bg-[var(--lg-sand)]" />
                    <span className="size-2.5 rounded-full bg-primary/50" />
                  </span>
                  <span className="max-w-xs px-3 py-1 text-xs mx-auto truncate rounded-full bg-muted text-muted-foreground">
                    eraajje.gov.mv/desk
                  </span>
                  <span aria-hidden className="w-10" />
                </div>
                <div className="p-4 sm:p-6">
                  <Tabs
                    listLabel={tr("Desk views", "ޑެސްކް")}
                    classNames={{ list: "rounded-full", trigger: "rounded-full px-4", content: "pt-4" }}
                    items={[
                      {
                        value: "overview",
                        label: tr("Overview", "ޚުލާޞާ"),
                        icon: "home",
                        content: (
                          <div className="gap-4 grid">
                            <StatTiles columns={3}>
                              <StatTile
                                className="lg-tile"
                                label={tr("Applications today", "މިއަދުގެ އެޕްލިކޭޝަން")}
                                value={2320}
                                previousValue={1980}
                                icon="file-text"
                                sparkline={WEEK.map((d) => d.online)}
                              />
                              <StatTile
                                className="lg-tile"
                                label={tr("Average wait", "އިންތިޒާރު")}
                                value={tr("9 min", "9 މިނެޓް")}
                                delta={-0.32}
                                positiveIsGood={false}
                                icon="clock"
                              />
                              <StatTile
                                className="lg-tile"
                                label={tr("Resolved first visit", "ފުރަތަމަ ފަހަރު ނިމުނު")}
                                value={0.91}
                                valueFormat="percent"
                                delta={0.04}
                                icon="success"
                              />
                            </StatTiles>
                            <div className="lg-tile p-4 rounded-3xl border bg-card">
                              <TimeSeriesChart
                                title={tr("Online vs counter", "އޮންލައިން އަދި ކައުންޓަރު")}
                                description={tr("Last 14 days, all islands", "ފަހުގެ 14 ދުވަސް")}
                                data={WEEK}
                                config={{
                                  online: { label: tr("Online", "އޮންލައިން") },
                                  counter: { label: tr("At the counter", "ކައުންޓަރުން") },
                                }}
                                interval="day"
                                area
                                valueFormat="integer"
                                height={220}
                              />
                            </div>
                          </div>
                        ),
                      },
                      {
                        value: "applications",
                        label: tr("Applications", "އެޕްލިކޭޝަން"),
                        icon: "file-text",
                        content: (
                          <div className="rounded-3xl border bg-card">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{tr("Reference", "ރެފަރެންސް")}</TableHead>
                                  <TableHead>{tr("Citizen", "ރައްޔިތު")}</TableHead>
                                  <TableHead className="md:table-cell hidden">{tr("Service", "ޚިދުމަތް")}</TableHead>
                                  <TableHead className="md:table-cell hidden">{tr("Island", "ރަށް")}</TableHead>
                                  <TableHead>{tr("Status", "ހާލަތު")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {recent.map((r) => (
                                  <TableRow key={r.ref}>
                                    <TableCell className="text-xs font-mono">{r.ref}</TableCell>
                                    <TableCell>
                                      <span className="gap-2 flex items-center">
                                        <UserAvatar name={r.name} size="xs" decorative />
                                        {r.name}
                                      </span>
                                    </TableCell>
                                    <TableCell className="md:table-cell hidden">{r.service}</TableCell>
                                    <TableCell className="md:table-cell hidden">{r.island}</TableCell>
                                    <TableCell>
                                      <StatusBadge status={r.status} size="sm">
                                        {r.label}
                                      </StatusBadge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ),
                      },
                      {
                        value: "islands",
                        label: tr("Islands", "ރަށްތައް"),
                        icon: "map-pin",
                        content: (
                          <ul className="gap-4 sm:grid-cols-2 lg:grid-cols-5 grid">
                            {busiest.map((a) => (
                              <li key={a.code} className="lg-tile p-4 rounded-3xl border bg-card">
                                <p className="text-sm font-semibold">{dv ? a.dv : a.en}</p>
                                <ProgressBar
                                  className="mt-3"
                                  value={Math.round(a.v * 100)}
                                  label={tr("Load", "ބުރަ")}
                                  showValue
                                  size="sm"
                                />
                              </li>
                            ))}
                          </ul>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm text-center text-muted-foreground">
              <LinkButton href={DASHBOARD} variant="link" endIcon="arrow-right">
                {tr("Open the service desk", "ސަރވިސް ޑެސްކް ހުޅުވާ")}
              </LinkButton>
            </p>
          </div>
        </section>

        {/* Features */}
        <section aria-labelledby="lg-features" className="max-w-6xl px-4 pb-24 mx-auto">
          <div id="lg-features">
            <SectionHeading
              eyebrow={tr("Built for island life", "ރަށުގެ ދިރިއުޅުމަށް")}
              title={tr("Services that come to you", "ޚިދުމަތް ތިޔަ ރަށަށް")}
            />
          </div>
          <FeatureGrid
            className="mt-12"
            items={features}
            classNames={{
              item: "lg-card lg-lift p-6 ring-0",
              icon: "lg-bubble size-12 rounded-2xl",
              title: "text-lg",
              description: "leading-relaxed",
            }}
          />
        </section>

        {/* Stats band */}
        <section aria-labelledby="lg-stats" className="lg-ocean lg-grain relative">
          <Wave flip className="-mt-px" />
          <div className="relative">
            <div className="max-w-6xl px-4 py-16 sm:py-20 mx-auto">
              <h2
                id="lg-stats"
                className="lg-serif font-semibold text-center text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)]"
              >
                {tr("A nation of islands, one service", "ރަށްރަށުގެ ޤައުމަކަށް، އެއް ޚިދުމަތެއް")}
              </h2>
              <dl className="mt-12 gap-8 sm:grid-cols-2 lg:grid-cols-4 grid text-center">
                {stats.map((s) => (
                  <div key={s.label} className="gap-1 flex flex-col-reverse">
                    <dt className="lg-ocean-muted text-sm">{s.label}</dt>
                    <dd className="lg-serif text-5xl font-semibold tabular-nums">
                      {"ltr" in s ? <bdi dir="ltr">{s.value}</bdi> : s.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-16 gap-5 lg:grid-cols-3 grid">
                {quotes.map((q) => (
                  <li key={q.name} className="p-6 border-white/15 bg-white/[0.07] backdrop-blur-sm rounded-3xl border">
                    <figure>
                      <blockquote className="leading-relaxed text-[1.05rem]">“{q.text}”</blockquote>
                      <figcaption className="mt-5 gap-3 flex items-center">
                        <UserAvatar name={q.name} size="sm" decorative />
                        <span className="text-sm">
                          <span className="font-semibold block">{q.name}</span>
                          <span className="lg-ocean-muted">{q.place}</span>
                        </span>
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Wave className="-mb-px" />
        </section>

        {/* Call to action */}
        <section aria-labelledby="lg-cta" className="max-w-6xl px-4 py-24 mx-auto">
          <div className="lg-card lg-grain relative overflow-hidden rounded-[2rem] border-0">
            <div className="lg-ocean gap-10 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.3fr_1fr] relative grid items-center">
              <div aria-hidden className="lg-glow -top-24 -end-24 size-96" />
              <div className="relative">
                <h2 id="lg-cta" className="lg-serif font-semibold text-[clamp(1.9rem,1.3rem+2.2vw,3rem)] leading-[1.1]">
                  {tr("Your island. Your services. Today.", "ތިޔަ ރަށް. ތިޔަ ޚިދުމަތް. މިއަދު.")}
                </h2>
                <p className="lg-ocean-muted mt-4 max-w-lg text-lg">
                  {tr(
                    "Sign in with eFaas and pick up where you left off, on your phone or at any council counter.",
                    "އީފާސްއިން ވަދެވަޑައިގަންނަވާ. ފޯނުން ނުވަތަ ކޮންމެ ކައުންސިލެއްގެ ކައުންޓަރުން ކުރިއަށް ގެންދަވާ.",
                  )}
                </p>
                <div className="mt-8 gap-3 flex flex-wrap">
                  <LinkButton
                    href={routes.auth.signIn}
                    size="lg"
                    endIcon="arrow-right"
                    className="lg-on-ocean-btn h-11 px-5"
                  >
                    {tr("Sign in with eFaas", "އީފާސްއިން ވަދެވަޑައިގަންނަވާ")}
                  </LinkButton>
                  <LinkButton href={DASHBOARD} size="lg" variant="outline" className="lg-on-ocean-ghost h-11 px-5">
                    {tr("I work at a council", "ކައުންސިލްގެ މުވައްޒަފެއް")}
                  </LinkButton>
                </div>
              </div>
              <IslandArt className="lg:block text-white/80 [&_.lg-art-water]:stroke-white/50 relative hidden w-full" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        className="border-t bg-[color-mix(in_oklab,var(--lg-sand)_30%,var(--background))]"
        logo={
          <span className="gap-2.5 font-semibold flex items-center">
            <LagoonMark />
            <span className="lg-serif text-lg">{tr("eRaajje", "އީރާއްޖެ")}</span>
          </span>
        }
        description={tr(
          "Government services for every island. A demo built with Onu.",
          "ކޮންމެ ރަށަކަށް ސަރުކާރުގެ ޚިދުމަތް. އޮނު އިން ހެދި ޑެމޯއެއް.",
        )}
        columns={[
          {
            title: tr("Services", "ޚިދުމަތްތައް"),
            links: [
              { label: tr("All services", "ހުރިހާ ޚިދުމަތެއް"), href: routes.public.services },
              { label: tr("Track an application", "އެޕްލިކޭޝަން ބައްލަވާ"), href: routes.applications.statusTracker },
              { label: tr("Payments", "ފައިސާ"), href: routes.applications.checkout },
            ],
          },
          {
            title: tr("Councils", "ކައުންސިލްތައް"),
            links: [
              { label: tr("Service desk", "ސަރވިސް ޑެސްކް"), href: DASHBOARD },
              { label: tr("Kiosks", "ކިއޮސްކް"), href: routes.kiosk.start },
            ],
          },
          {
            title: tr("Help", "އެހީ"),
            links: [
              { label: tr("Contact", "ގުޅުއްވާ"), href: routes.public.contact },
              { label: tr("About", "އަޅުގަނޑުމެން"), href: routes.public.about },
            ],
          },
        ]}
        name={tr("eRaajje", "އީރާއްޖެ")}
        year={2026}
      />
    </div>
  )
}
