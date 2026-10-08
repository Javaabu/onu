import * as React from "react"
import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  ConditionalLink,
  CopyInput,
  Icon,
  Kbd,
  LinkButton,
  Logo,
  SiteFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ThaanaInput,
  ThemeToggle,
  StatusBadge,
} from "@javaabu/onu"
import { BarChart, DeltaIndicator, Sparkline, TimeSeriesChart } from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { MicroLabel, NB_ROUTES, NbLanguage, NbMark, NeonBentoRoot } from "./_neon-bento"

export const meta = {
  title: "Neon Bento · Landing",
  group: "Design options",
  layout: "bare",
  order: 45,
  description: "Dark, data-forward bento grids with neon accents, conic borders and a ⌘K hero.",
}

const REQUESTS = [38, 42, 40, 51, 48, 56, 61, 58, 66, 72, 69, 78, 84, 81, 92, 97, 94, 108, 115, 112, 124]
const WEEKLY = [
  { date: "2026-07-06", web: 820, app: 410 },
  { date: "2026-07-13", web: 860, app: 470 },
  { date: "2026-07-20", web: 910, app: 520 },
  { date: "2026-07-27", web: 880, app: 610 },
  { date: "2026-08-03", web: 990, app: 640 },
  { date: "2026-08-10", web: 1040, app: 720 },
  { date: "2026-08-17", web: 1010, app: 810 },
  { date: "2026-08-24", web: 1120, app: 870 },
  { date: "2026-08-31", web: 1180, app: 940 },
  { date: "2026-09-07", web: 1210, app: 1050 },
]

export default function NeonBentoLandingPage() {
  const tr = useTr()
  const [paused, setPaused] = React.useState(false)

  const councils = [
    tr("Addu City Council", "އައްޑޫ ސިޓީ ކައުންސިލް"),
    tr("Fuvahmulah City Council", "ފުވައްމުލައް ސިޓީ ކައުންސިލް"),
    tr("Kulhudhuffushi City Council", "ކުޅުދުއްފުށި ސިޓީ ކައުންސިލް"),
    tr("Malé City Council", "މާލޭ ސިޓީ ކައުންސިލް"),
    tr("Thinadhoo Council", "ތިނަދޫ ކައުންސިލް"),
    tr("Naifaru Council", "ނައިފަރު ކައުންސިލް"),
    tr("Eydhafushi Council", "އޭދަފުށި ކައުންސިލް"),
    tr("Hithadhoo Council", "ހިތަދޫ ކައުންސިލް"),
    tr("Funadhoo Council", "ފުނަދޫ ކައުންސިލް"),
    tr("Mahibadhoo Council", "މަހިބަދޫ ކައުންސިލް"),
  ]

  const nav = [
    { label: tr("Platform", "ޕްލެޓްފޯމް"), href: "#platform" },
    { label: tr("Numbers", "ނަންބަރުތައް"), href: "#numbers" },
    { label: tr("Customers", "ކަސްޓަމަރުން"), href: "#customers" },
    { label: tr("Console", "ކޮންސޯލް"), href: NB_ROUTES.dashboard },
  ]

  return (
    <NeonBentoRoot>
      {/* Nav */}
      <header className="nb-nav top-0 sticky z-30">
        <div className="max-w-7xl gap-3 px-4 sm:px-6 h-14 mx-auto flex items-center">
          <Logo
            alt="Onu Platform"
            href={NB_ROUTES.landing}
            text={<span className="font-semibold tracking-tight">{tr("Onu Platform", "އޮނު ޕްލެޓްފޯމް")}</span>}
          >
            <NbMark />
          </Logo>
          <nav aria-label={tr("Main", "މައި")} className="ms-6 md:flex hidden">
            <ul className="gap-1 flex items-center">
              {nav.map((n) => (
                <li key={n.href}>
                  <ConditionalLink
                    href={n.href}
                    onClick={n.href.startsWith("#") ? jumpTo : undefined}
                    className="px-3 py-2 text-sm rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {n.label}
                  </ConditionalLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="gap-1 ms-auto flex items-center">
            <NbLanguage />
            <ThemeToggle />
            <LinkButton href={NB_ROUTES.dashboard} size="sm" className="nb-cta ms-1 sm:inline-flex hidden">
              {tr("Open console", "ކޮންސޯލް ހުޅުވާ")}
            </LinkButton>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="max-w-7xl px-4 sm:px-6 pt-14 sm:pt-20 mx-auto">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <a href="#platform" onClick={jumpTo} className="nb-pill text-xs sm:text-sm hover:text-foreground">
              <span className="nb-dot ms-1" aria-hidden />
              <span className="nb-mono nb-ink">v2.0</span>
              <span className="text-muted-foreground">
                {tr("Thaana-native charts and maps are here", "ތާނަ ޗާޓާއި މެޕް އައިއްސި")}
              </span>
              <Icon name="arrow-right" className="size-3.5 text-muted-foreground rtl:-scale-x-100" />
            </a>
            <h1 className="nb-display mt-6 text-[clamp(2.5rem,1.2rem+6vw,5.5rem)] text-balance">
              {tr("Build Dhivehi‑first apps", "ދިވެހި ބަހަށް ފުރިހަމަ އެޕްސް")}{" "}
              <span className="nb-gradient-text">{tr("in days.", "ދުވަސްކޮޅެއްގައި.")}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-[clamp(1rem,0.9rem+0.5vw,1.25rem)] text-pretty text-muted-foreground">
              {tr(
                "One React platform for every island service: Thaana inputs, RTL layouts, accessible charts and an admin shell — themed from a single colour.",
                "ކޮންމެ ރަށެއްގެ ޚިދުމަތަކަށް އެއް ރިއެކްޓް ޕްލެޓްފޯމް: ތާނަ އިންޕުޓް، ކަނާތުން ވާތަށް ލޭއައުޓް، ހުރިހާ އެންމެންނަށް ކިޔޭ ޗާޓް އަދި އެޑްމިން ޝެލް — އެއް ކުލައަކުން.",
              )}
            </p>
            <div className="mt-8 gap-3 sm:flex-row flex flex-col items-center">
              <LinkButton href={NB_ROUTES.dashboard} size="lg" endIcon="arrow-right" className="nb-cta">
                {tr("Start building", "ފަށާލަމާ")}
              </LinkButton>
              <div className="nb-tile px-4 h-10 gap-3 text-sm flex items-center rounded-lg" dir="ltr">
                <span className="nb-ink nb-code" aria-hidden>
                  $
                </span>
                <code className="nb-code">pnpm add @javaabu/onu</code>
              </div>
            </div>
          </div>

          {/* Product mock: a bento of live Onu components */}
          <div className="mt-14 sm:mt-20 gap-4 lg:grid-cols-12 grid">
            <div className="nb-tile nb-featured lg:col-span-7 lg:row-span-2 flex flex-col">
              <div className="gap-2 px-4 py-3 flex items-center border-b">
                <span aria-hidden className="gap-1.5 flex">
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                </span>
                <span className="nb-mono ms-2 text-muted-foreground">onu://command</span>
                <span className="gap-1 ms-auto flex items-center" dir="ltr">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </span>
              </div>
              <div className="nb-palette flex-1">
                <Command label={tr("Onu Command demo", "އޮނު ކޮމާންޑް")} loop>
                  <CommandInput
                    placeholder={tr("Search components, services, islands…", "ކޮމްޕޯނަންޓް، ޚިދުމަތް، ރަށް ހޯދާ…")}
                    aria-label={tr("Search the command demo", "ކޮމާންޑް ޑެމޯގައި ހޯދާ")}
                  />
                  <CommandList className="p-2 max-h-none min-h-[22rem]">
                    <CommandEmpty>{tr("No results. Try “passport”.", "ނުފެނުނު. “ޕާސްޕޯޓް” ބައްލަވާ.")}</CommandEmpty>
                    <CommandGroup heading={tr("Components", "ކޮމްޕޯނަންޓް")}>
                      <PaletteItem icon="table" label="DataTable" hint={tr("Listing", "ލިސްޓިންގ")} kbd="⌘D" />
                      <PaletteItem
                        icon="languages"
                        label="ThaanaInput"
                        hint={tr("Text inputs", "ޓެކްސްޓް އިންޕުޓް")}
                        kbd="⌘T"
                        accent
                      />
                      <PaletteItem icon="map-pin" label="MapChart" hint={tr("Charts", "ޗާޓް")} kbd="⌘M" />
                    </CommandGroup>
                    <CommandGroup heading={tr("Services", "ޚިދުމަތް")}>
                      <PaletteItem
                        icon="user"
                        label={tr("Passport renewal", "ޕާސްޕޯޓް އާކުރުން")}
                        hint={tr("Immigration", "އިމިގްރޭޝަން")}
                      />
                      <PaletteItem
                        icon="building"
                        label={tr("Business registration", "ވިޔަފާރި ރަޖިސްޓްރީ")}
                        hint={tr("Economic", "އިޤްތިޞާދީ")}
                      />
                    </CommandGroup>
                    <CommandGroup heading={tr("Islands", "ރަށްރަށް")}>
                      <PaletteItem icon="map-pin" label={tr("Addu City", "އައްޑޫ ސިޓީ")} hint="S. Hithadhoo" />
                      <PaletteItem icon="map-pin" label={tr("Fuvahmulah", "ފުވައްމުލައް")} hint="Gn." />
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            </div>

            <div className="nb-tile p-5 sm:p-6 lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between">
                <MicroLabel>{tr("eService requests · today", "ޚިދުމަތަށް އެދުން · މިއަދު")}</MicroLabel>
                <span className="nb-chip size-8">
                  <Icon name="send" className="size-4" />
                </span>
              </div>
              <div className="mt-4 gap-3 flex flex-wrap items-end">
                <span className="nb-kpi text-6xl sm:text-7xl">12,480</span>
                <DeltaIndicator value={0.184} context={tr("vs yesterday", "އިއްޔެއާ އަޅާބަލާއިރު")} />
              </div>
              <Sparkline
                data={REQUESTS}
                label={tr("Requests per hour", "ގަޑިއަކަށް އެދުން")}
                variant="area"
                height={72}
                className="mt-5"
              />
            </div>

            <div className="nb-tile p-5 sm:p-6 lg:col-span-5">
              <BarChart
                title={tr("Requests by atoll", "އަތޮޅުން އެދުން")}
                description={tr("Top five, this week", "މި ހަފްތާ، މަތީ ފަހެއް")}
                data={[
                  { atoll: tr("Malé", "މާލެ"), requests: 4210 },
                  { atoll: tr("Addu", "އައްޑޫ"), requests: 2380 },
                  { atoll: tr("Haa Dhaalu", "ހދ."), requests: 1460 },
                  { atoll: tr("Gnaviyani", "ޏ."), requests: 1120 },
                  { atoll: tr("Laamu", "ލ."), requests: 940 },
                ]}
                categoryKey="atoll"
                config={{ requests: { label: tr("Requests", "އެދުން"), color: "var(--nb-neon)" } }}
                height={170}
                radius={6}
                showGrid={false}
                showTableToggle={false}
                classNames={{ title: "text-sm", description: "text-xs" }}
              />
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section id="customers" tabIndex={-1} aria-labelledby="nb-customers" className="mt-20 sm:mt-24">
          <div className="max-w-7xl px-4 sm:px-6 gap-3 mx-auto flex items-center justify-center">
            <h2 id="nb-customers" className="nb-mono text-muted-foreground">
              {tr("Trusted by island councils across 20 atolls", "20 އަތޮޅުގެ ރަށު ކައުންސިލްތަކުގެ އިތުބާރު")}
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-pressed={paused}
              aria-label={paused ? tr("Play scrolling list", "ހިނގުވާ") : tr("Pause scrolling list", "ހުއްޓުވާ")}
              onClick={() => setPaused((p) => !p)}
            >
              <Icon name={paused ? "play" : "pause"} />
            </Button>
          </div>
          <div className="nb-marquee mt-6" data-paused={paused}>
            <div className="nb-marquee-track">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  aria-hidden={copy === 1 || undefined}
                  className={copy === 1 ? "nb-marquee-dupe flex shrink-0" : "flex shrink-0 flex-wrap"}
                >
                  {councils.map((c) => (
                    <li
                      key={c}
                      className="gap-2.5 px-6 text-sm font-medium flex shrink-0 items-center whitespace-nowrap text-muted-foreground"
                    >
                      <NbMark className="size-5 opacity-80" />
                      {c}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        {/* Features bento */}
        <section
          id="platform"
          tabIndex={-1}
          aria-labelledby="nb-platform"
          className="max-w-7xl px-4 sm:px-6 mt-24 sm:mt-32 scroll-mt-20 mx-auto"
        >
          <MicroLabel className="nb-ink">{tr("// 01 — Platform", "// 01 — ޕްލެޓްފޯމް")}</MicroLabel>
          <h2
            id="nb-platform"
            className="nb-display mt-3 max-w-3xl text-[clamp(2rem,1.4rem+2.6vw,3.5rem)] text-balance"
          >
            {tr("Everything a Maldivian service needs.", "ދިވެހި ޚިދުމަތަކަށް ބޭނުންވާ ހުރިހާ އެއްޗެއް.")}{" "}
            <span className="text-muted-foreground">{tr("Nothing it doesn’t.", "ބޭނުންނުވާ އެއްޗެއް ނޫން.")}</span>
          </h2>

          <div className="mt-10 gap-4 md:grid-cols-6 grid">
            {/* Thaana */}
            <article className="nb-tile p-6 md:col-span-4">
              <div className="gap-4 flex items-start justify-between">
                <div>
                  <MicroLabel>{tr("Thaana-native", "ތާނަ ފުރިހަމަ")}</MicroLabel>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">
                    {tr("Type Dhivehi from any keyboard", "ކޮންމެ ކީބޯޑަކުން ދިވެހި ލިޔުއްވާ")}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {tr(
                      "Phonetic Thaana in every text field, with a Latin toggle and correct fili rendering.",
                      "ކޮންމެ ފީލްޑެއްގައި ފޮނެޓިކް ތާނަ، ލަޓިން ބަދަލުކުރުމާއެކު.",
                    )}
                  </p>
                </div>
                <span className="nb-chip size-10 shrink-0">
                  <Icon name="languages" className="size-5" />
                </span>
              </div>
              <div className="mt-6 gap-6 sm:grid-cols-[1fr_auto] grid items-end">
                <div>
                  <label htmlFor="nb-thaana" className="text-sm font-medium">
                    {tr("Your island", "ތިބާގެ ރަށް")}
                  </label>
                  <ThaanaInput id="nb-thaana" defaultValue="ފުވައްމުލައް" className="mt-2" />
                </div>
                <div aria-hidden className="gap-1.5 grid grid-cols-4" dir="ltr">
                  {[
                    ["h", "ހ"],
                    ["n", "ނ"],
                    ["r", "ރ"],
                    ["b", "ބ"],
                    ["k", "ކ"],
                    ["m", "މ"],
                    ["f", "ފ"],
                    ["d", "ދ"],
                  ].map(([latin, thaana]) => (
                    <span
                      key={latin}
                      className="size-11 flex flex-col items-center justify-center rounded-lg border bg-background"
                    >
                      <span className="nb-code text-[0.625rem] leading-none text-muted-foreground">{latin}</span>
                      <span className="nb-ink text-lg leading-tight" lang="dv">
                        {thaana}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </article>

            {/* Accessibility */}
            <article className="nb-tile nb-featured p-6 md:col-span-2 flex flex-col">
              <MicroLabel>{tr("WCAG 2.2 AA", "WCAG 2.2 AA")}</MicroLabel>
              <p className="mt-6 flex-1">
                <span className="nb-kpi text-8xl">0</span>
              </p>
              <h3 className="mt-6 text-lg font-semibold tracking-tight">{tr("axe violations", "axe މައްސަލަ")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {tr(
                  "Across 1,200 demos, in light, dark, LTR and RTL.",
                  "1,200 ޑެމޯއެއްގައި، އަލި، އަނދިރި، ވާތުން އަދި ކަނާތުން.",
                )}
              </p>
            </article>

            {/* RTL */}
            <article className="nb-tile p-6 md:col-span-2">
              <MicroLabel>
                <bdi dir="ltr">dir=&quot;rtl&quot;</bdi>
              </MicroLabel>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                {tr("Layouts mirror themselves", "ލޭއައުޓް އަމިއްލައަށް ބަދަލުވޭ")}
              </h3>
              <div aria-hidden className="mt-6 gap-3 grid">
                {(["ltr", "rtl"] as const).map((d) => (
                  <div key={d} dir={d} className="gap-2 p-3 flex items-center rounded-lg border bg-background">
                    <span
                      className={d === "rtl" ? "nb-chip size-7" : "nb-chip size-7"}
                      data-accent={d === "rtl" ? "2" : undefined}
                    >
                      <Icon name="arrow-right" className="size-3.5 rtl:-scale-x-100" />
                    </span>
                    <span className="gap-1.5 flex flex-1 flex-col">
                      <span className="h-1.5 w-3/4 rounded-full bg-foreground/20" />
                      <span className="h-1.5 w-1/2 rounded-full bg-foreground/10" />
                    </span>
                    <span className="nb-code text-[0.625rem] text-muted-foreground">{d}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Charts */}
            <article className="nb-tile p-6 md:col-span-2">
              <TimeSeriesChart
                title={tr("Charts that read aloud", "އަޑުން ކިޔައިދޭ ޗާޓް")}
                description={tr("Every chart has a table and a summary", "ކޮންމެ ޗާޓަކަށް ޓޭބަލާއި ޚުލާޞާ")}
                data={WEEKLY}
                config={{
                  web: { label: tr("Web", "ވެބް"), color: "var(--nb-neon)" },
                  app: { label: tr("App", "އެޕް"), color: "var(--nb-neon-2)" },
                }}
                interval="week"
                area
                height={150}
                showLegend={false}
                classNames={{ title: "text-lg font-semibold tracking-tight", description: "text-sm" }}
              />
            </article>

            {/* Theming */}
            <article className="nb-tile p-6 md:col-span-2">
              <MicroLabel>
                <bdi dir="ltr">--onu-primary</bdi>
              </MicroLabel>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                {tr("One token, every brand", "އެއް ޓޯކަން، ކޮންމެ ބްރޭންޑަކަށް")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {tr("Tints, glows and charts follow your colour.", "ކުލަތަކާއި ޗާޓް ތިބާގެ ކުލައަށް.")}
              </p>
              <div aria-hidden className="mt-6 gap-2 grid grid-cols-6">
                {[12, 30, 55, 80, 100].map((pct) => (
                  <span
                    key={pct}
                    className="nb-swatch h-14"
                    style={{ background: `color-mix(in oklab, var(--nb-neon) ${pct}%, var(--card))` }}
                  />
                ))}
                <span className="nb-swatch h-14" style={{ background: "var(--nb-neon-2)" }} />
              </div>
            </article>

            {/* Data */}
            <article className="nb-tile md:col-span-3 flex flex-col">
              <div className="p-6 pb-4">
                <MicroLabel>{tr("Listing pages", "ލިސްޓިންގ ޕޭޖް")}</MicroLabel>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {tr("Tables, filters and exports", "ޓޭބަލް، ފިލްޓަރު އަދި އެކްސްޕޯޓް")}
                </h3>
              </div>
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="ps-6">{tr("Reference", "ރެފަރެންސް")}</TableHead>
                    <TableHead>{tr("Island", "ރަށް")}</TableHead>
                    <TableHead className="pe-6 text-end">{tr("Status", "ހާލަތު")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ["APP-2041", tr("Hithadhoo", "ހިތަދޫ"), "success", tr("Approved", "ފާސް")],
                    ["APP-2040", tr("Naifaru", "ނައިފަރު"), "info", tr("In review", "ރިވިއު")],
                    ["APP-2039", tr("Thinadhoo", "ތިނަދޫ"), "warning", tr("Pending", "އިންތިޒާރު")],
                  ].map(([ref, island, tone, label]) => (
                    <TableRow key={ref}>
                      <TableCell className="ps-6 nb-code text-xs">{ref}</TableCell>
                      <TableCell>{island}</TableCell>
                      <TableCell className="pe-6 text-end">
                        <StatusBadge status={tone} size="sm">
                          {label}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </article>

            {/* Install */}
            <article className="nb-tile p-6 md:col-span-3 flex flex-col">
              <MicroLabel>{tr("Install", "އިންސްޓޯލް")}</MicroLabel>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                {tr("From zero to a council portal", "ސުމެއްގެ ފެށިގެން ކައުންސިލް ޕޯޓަލަކަށް")}
              </h3>
              <div className="mt-5 p-4 text-sm leading-7 nb-code rounded-lg border bg-background" dir="ltr">
                <div>
                  <span className="nb-ink">$</span> pnpm add @javaabu/onu
                </div>
                <div className="text-muted-foreground">✓ 142 components · 0 config</div>
                <div>
                  <span className="nb-ink">$</span> pnpm dev <span className="nb-caret" aria-hidden />
                </div>
              </div>
              <div className="mt-4">
                <CopyInput
                  value="pnpm add @javaabu/onu"
                  aria-label={tr("Install command", "އިންސްޓޯލް ކޮމާންޑް")}
                  className="nb-code"
                />
              </div>
            </article>
          </div>
        </section>

        {/* Numbers */}
        <section
          id="numbers"
          tabIndex={-1}
          aria-labelledby="nb-numbers"
          className="max-w-7xl px-4 sm:px-6 mt-24 sm:mt-32 scroll-mt-20 mx-auto"
        >
          <MicroLabel className="nb-ink">{tr("// 02 — In production", "// 02 — ބޭނުންކުރަމުން")}</MicroLabel>
          <h2 id="nb-numbers" className="nb-display mt-3 text-[clamp(2rem,1.4rem+2.6vw,3.5rem)]">
            {tr("Running the islands.", "ރަށްރަށުގައި ހިނގަމުން.")}
          </h2>
          <dl className="mt-10 gap-3 sm:gap-4 lg:grid-cols-4 grid grid-cols-2">
            {[
              { value: "1.2M", label: tr("citizen sessions a month", "މަހަކު ރައްޔިތުންގެ ސެޝަން"), accent: false },
              { value: "142", label: tr("components and patterns", "ކޮމްޕޯނަންޓް އަދި ޕެޓަރން"), accent: true },
              { value: "64", label: tr("councils live", "ކައުންސިލް ލައިވް"), accent: false },
              { value: "99.98%", label: tr("uptime, last 12 months", "އަޕްޓައިމް، ފަހުގެ 12 މަސް"), accent: true },
            ].map((s) => (
              <div key={s.value} className="nb-tile p-4 sm:p-6 flex flex-col-reverse">
                <dt className="mt-3 text-sm text-muted-foreground">{s.label}</dt>
                <dd>
                  <span
                    className="nb-kpi text-[clamp(2rem,1.2rem+3vw,4.25rem)]"
                    data-accent={s.accent ? "2" : undefined}
                  >
                    {s.value}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CTA */}
        <section aria-labelledby="nb-cta" className="max-w-7xl px-4 sm:px-6 mt-24 sm:mt-32 mx-auto">
          <div className="nb-tile nb-featured px-6 py-14 sm:px-12 sm:py-20 relative text-center">
            <MicroLabel className="nb-ink">{tr("// Ship this week", "// މި ހަފްތާގައި ނެރުއްވާ")}</MicroLabel>
            <h2
              id="nb-cta"
              className="nb-display mt-4 max-w-3xl mx-auto text-[clamp(2rem,1.3rem+3vw,4rem)] text-balance"
            >
              {tr("Your next eService, in", "ތިބާގެ އަންނަ ޚިދުމަތް،")}{" "}
              <span className="nb-gradient-text">{tr("five days flat.", "ފަސް ދުވަހުން.")}</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-muted-foreground">
              {tr(
                "Start from the admin console, swap in your brand colour, and publish in Dhivehi and English.",
                "އެޑްމިން ކޮންސޯލުން ފައްޓަވާ، ބްރޭންޑް ކުލަ ބަދަލުކުރައްވާ، ދިވެހި އަދި އިނގިރޭސިން ނެރުއްވާ.",
              )}
            </p>
            <div className="mt-8 gap-3 flex flex-wrap justify-center">
              <LinkButton href={NB_ROUTES.dashboard} size="lg" className="nb-cta" endIcon="arrow-right">
                {tr("Open the console", "ކޮންސޯލް ހުޅުވާ")}
              </LinkButton>
              <Button size="lg" variant="outline" startIcon="message">
                {tr("Talk to Javaabu", "ޖަވާބާ ގުޅުއްވާ")}
              </Button>
            </div>
            <div className="mt-8 gap-2 flex flex-wrap justify-center">
              {[tr("Open source", "އޯޕަން ސޯސް"), "React 19", "Tailwind v4", tr("WCAG 2.2 AA", "WCAG 2.2 AA")].map(
                (t) => (
                  <Badge key={t} variant="outline" className="nb-mono">
                    {t}
                  </Badge>
                ),
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        className="mt-24 bg-transparent"
        logo={
          <Logo alt="" href={null} text={tr("Onu Platform", "އޮނު ޕްލެޓްފޯމް")}>
            <NbMark />
          </Logo>
        }
        description={tr(
          "Dhivehi-first building blocks for government and enterprise.",
          "ސަރުކާރާއި ވިޔަފާރިތަކަށް ދިވެހި ބަހަށް ފުރިހަމަ ބިނާކުރާ ބައިތައް.",
        )}
        columns={[
          {
            title: tr("Platform", "ޕްލެޓްފޯމް"),
            links: [
              { label: tr("Components", "ކޮމްޕޯނަންޓް"), href: "/components" },
              { label: tr("Console", "ކޮންސޯލް"), href: NB_ROUTES.dashboard },
            ],
          },
          {
            title: tr("Resources", "ވަސީލަތްތައް"),
            links: [
              { label: tr("Docs", "ޑޮކްސް"), href: "/" },
              { label: tr("Sample pages", "ނަމޫނާ ޞަފްޙާ"), href: "/pages" },
            ],
          },
        ]}
        name="Javaabu"
        year={2026}
      />
    </NeonBentoRoot>
  )
}

/** In-page jump: the examples app uses a hash router, so `#section` links scroll instead of navigating. */
function jumpTo(event: React.MouseEvent<HTMLAnchorElement>) {
  const id = event.currentTarget.getAttribute("href")?.slice(1)
  const target = id ? document.getElementById(id) : null
  if (!target) return
  event.preventDefault()
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
  target.focus({ preventScroll: true })
}

function PaletteItem({
  icon,
  label,
  hint,
  kbd,
  accent,
}: {
  icon: string
  label: string
  hint: string
  kbd?: string
  accent?: boolean
}) {
  return (
    <CommandItem value={`${label} ${hint}`} className="gap-3 px-2.5">
      <span className="nb-chip size-7" data-accent={accent ? "2" : undefined}>
        <Icon name={icon} className="size-3.5" />
      </span>
      <span className="min-w-0 flex flex-1 flex-col">
        <span className="font-medium truncate">{label}</span>
        <span className="text-xs truncate text-muted-foreground">
          <bdi>{hint}</bdi>
        </span>
      </span>
      {kbd ? (
        <CommandShortcut className="nb-code" dir="ltr">
          {kbd}
        </CommandShortcut>
      ) : null}
    </CommandItem>
  )
}
