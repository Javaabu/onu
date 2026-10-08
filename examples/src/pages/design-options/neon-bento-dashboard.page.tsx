import * as React from "react"
import {
  AppHeader,
  AppLayout,
  AppSidebar,
  Button,
  CommandPalette,
  Icon,
  Kbd,
  LinkButton,
  Logo,
  NotificationCenter,
  SegmentedControl,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ThemeToggle,
  Timeline,
  UserAvatar,
  UserProfile,
  toast,
  type NavGroup,
} from "@javaabu/onu"
import {
  BarChart,
  DeltaIndicator,
  PieChart,
  Sparkline,
  StatTile,
  TimeSeriesChart,
  type ValueFormat,
} from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { MicroLabel, NB_ROUTES, NbLanguage, NbMark, NeonBentoRoot } from "./_neon-bento"

export const meta = {
  title: "Neon Bento · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 41,
  description: "An insights console where the whole page is a neon bento grid.",
}

// Fixed demo data (deterministic, computed once).
const NOW = new Date("2026-10-08T14:20:00")
function wave(n: number, base: number, amp: number, seed: number) {
  return Array.from({ length: n }, (_, i) =>
    Math.round(base + amp * Math.sin((i + seed) / 3.1) + (i * base) / (n * 6) + ((i * 7 + seed) % 5) * (amp / 8)),
  )
}
const DAILY = wave(30, 1480, 260, 2)
const WEEKS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 6, 20 + i * 7))
  return {
    date: d.toISOString().slice(0, 10),
    web: 5200 + i * 260 + ((i * 37) % 7) * 120,
    app: 2900 + i * 340 + ((i * 53) % 5) * 150,
    kiosk: 900 + ((i * 29) % 6) * 80,
  }
})
// Activity heatmap: 7 days × 12 two-hour slots, 0…1.
const HEAT = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 12 }, (_, h) => {
    const work = d < 5 ? 1 : 0.45
    const peak = Math.exp(-((h - 5) ** 2) / 6) + 0.55 * Math.exp(-((h - 9.5) ** 2) / 2)
    return Math.min(1, Math.max(0.04, work * peak * (0.85 + ((d * 13 + h * 7) % 5) * 0.06)))
  }),
)
const UPTIME = Array.from({ length: 30 }, (_, i) => (i === 11 || i === 23 ? "degraded" : "ok"))

export default function NeonBentoDashboardPage() {
  const tr = useTr()
  const [range, setRange] = React.useState("30d")

  const nav: NavGroup[] = [
    {
      items: [
        { label: tr("Insights", "އިންސައިޓްސް"), href: NB_ROUTES.dashboard, icon: "home" },
        { label: tr("Live map", "ލައިވް މެޕް"), href: routes.maps.fleet, icon: "map-pin" },
        { label: tr("Reports", "ރިޕޯޓް"), href: routes.adminRecords.export, icon: "file-spreadsheet" },
      ],
    },
    {
      label: tr("Services", "ޚިދުމަތް"),
      items: [
        {
          label: tr("Applications", "އެޕްލިކޭޝަން"),
          href: routes.adminRecords.indexTable,
          icon: "file-text",
          badge: 24,
        },
        { label: tr("Payments", "ފައިސާ"), href: routes.adminRecords.indexList, icon: "credit-card" },
        { label: tr("Islands", "ރަށްރަށް"), href: routes.adminRecords.indexGrid, icon: "globe" },
      ],
    },
    {
      label: tr("Platform", "ޕްލެޓްފޯމް"),
      items: [
        { label: tr("API keys", "އޭޕީއައި ކީ"), href: routes.adminSettings.apiKeys, icon: "key" },
        { label: tr("Settings", "ސެޓިންގްސް"), href: routes.adminSettings.settings, icon: "settings" },
      ],
    },
  ]

  const days = [
    tr("Sun", "އާދި"),
    tr("Mon", "ހޯމަ"),
    tr("Tue", "އަން"),
    tr("Wed", "ބުދަ"),
    tr("Thu", "ބުރާ"),
    tr("Fri", "ހުކު"),
    tr("Sat", "ހޮނި"),
  ]

  const recent = [
    {
      ref: "APP-20418",
      name: tr("Aminath Rasheed", "އާމިނަތު ރަޝީދު"),
      service: tr("Passport renewal", "ޕާސްޕޯޓް އާކުރުން"),
      island: tr("Hithadhoo", "ހިތަދޫ"),
      status: "success",
      label: tr("Approved", "ފާސް"),
    },
    {
      ref: "APP-20417",
      name: tr("Mohamed Naseem", "މުޙައްމަދު ނަސީމް"),
      service: tr("Business licence", "ވިޔަފާރީގެ ލައިސަންސް"),
      island: tr("Naifaru", "ނައިފަރު"),
      status: "info",
      label: tr("In review", "ރިވިއު"),
    },
    {
      ref: "APP-20416",
      name: tr("Fathimath Shiyana", "ފާތިމަތު ޝިޔާނާ"),
      service: tr("Housing", "ހައުސިންގ"),
      island: tr("Fuvahmulah", "ފުވައްމުލައް"),
      status: "warning",
      label: tr("Needs info", "މަޢުލޫމާތު ބޭނުން"),
    },
    {
      ref: "APP-20415",
      name: tr("Ibrahim Waheed", "އިބްރާހީމް ވަޙީދު"),
      service: tr("Land lease", "ބިމުގެ ލީސް"),
      island: tr("Kulhudhuffushi", "ކުޅުދުއްފުށި"),
      status: "success",
      label: tr("Approved", "ފާސް"),
    },
    {
      ref: "APP-20414",
      name: tr("Mariyam Lubna", "މަރިޔަމް ލުބްނާ"),
      service: tr("Driving licence", "ޑްރައިވިންގ ލައިސަންސް"),
      island: tr("Thinadhoo", "ތިނަދޫ"),
      status: "error",
      label: tr("Rejected", "ރިޖެކްޓް"),
    },
    {
      ref: "APP-20413",
      name: tr("Hassan Shareef", "ޙަސަން ޝަރީފް"),
      service: tr("Passport renewal", "ޕާސްޕޯޓް އާކުރުން"),
      island: tr("Eydhafushi", "އޭދަފުށި"),
      status: "success",
      label: tr("Approved", "ފާސް"),
    },
    {
      ref: "APP-20412",
      name: tr("Aishath Nuha", "އައިޝަތު ނުހާ"),
      service: tr("Building permit", "ބިނާކުރުމުގެ ހުއްދަ"),
      island: tr("Funadhoo", "ފުނަދޫ"),
      status: "info",
      label: tr("In review", "ރިވިއު"),
    },
  ]

  const actions = [
    { icon: "plus", label: tr("New service", "އައު ޚިދުމަތެއް"), kbd: "N" },
    { icon: "users", label: tr("Invite staff", "މުވައްޒަފުން"), kbd: "I" },
    { icon: "megaphone", label: tr("Broadcast", "އިޢުލާނެއް"), kbd: "B" },
    { icon: "download", label: tr("Export CSV", "އެކްސްޕޯޓް"), kbd: "E" },
  ]

  return (
    <NeonBentoRoot variant="app">
      <AppLayout
        contentWidth="full"
        sidebar={
          <AppSidebar
            collapsible="icon"
            groups={nav}
            currentHref={NB_ROUTES.dashboard}
            match="exact"
            header={
              <Logo alt="Onu Platform" text={tr("Onu Console", "އޮނު ކޮންސޯލް")} href={NB_ROUTES.index}>
                <NbMark />
              </Logo>
            }
            footer={
              <UserProfile
                name={tr("Aishath Shifa", "އައިޝަތު ޝިފާ")}
                subtitle={tr("Addu City Council", "އައްޑޫ ސިޓީ ކައުންސިލް")}
                onSignOut={() => {}}
                side="top"
              />
            }
          />
        }
        header={
          <AppHeader
            sidebarTrigger
            className="nb-appheader"
            logo={
              <span className="md:hidden">
                <Logo alt="Onu Console" href={NB_ROUTES.index}>
                  <NbMark />
                </Logo>
              </span>
            }
            actions={
              <>
                <NbLanguage />
                <ThemeToggle />
                <NotificationCenter
                  now={NOW}
                  notifications={[
                    {
                      id: "1",
                      title: tr("SLA breach risk: 6 housing files", "ހައުސިންގ 6 ފައިލް ލަސްވެދާނެ"),
                      time: new Date(NOW.getTime() - 1000 * 60 * 8),
                      variant: "warning",
                      icon: "warning",
                    },
                    {
                      id: "2",
                      title: tr("Fuvahmulah council went live", "ފުވައްމުލައް ކައުންސިލް ލައިވް"),
                      time: new Date(NOW.getTime() - 1000 * 60 * 60 * 2),
                      variant: "success",
                      icon: "success",
                    },
                    {
                      id: "3",
                      title: tr("Weekly report is ready", "ހަފްތާގެ ރިޕޯޓް ތައްޔާރު"),
                      time: new Date(NOW.getTime() - 1000 * 60 * 60 * 26),
                      read: true,
                      icon: "file-text",
                    },
                  ]}
                  onMarkRead={() => {}}
                />
              </>
            }
          >
            <CommandPalette
              groups={[
                {
                  heading: tr("Go to", "ދާ"),
                  items: [
                    {
                      id: "insights",
                      label: tr("Insights", "އިންސައިޓްސް"),
                      icon: "home",
                      href: "#" + NB_ROUTES.dashboard,
                    },
                    {
                      id: "site",
                      label: tr("Onu Platform site", "އޮނު ޕްލެޓްފޯމް"),
                      icon: "globe",
                      href: "#" + NB_ROUTES.index,
                    },
                  ],
                },
                {
                  heading: tr("Actions", "ޢަމަލުތައް"),
                  items: actions.map((a) => ({ id: a.label, label: a.label, icon: a.icon, shortcut: a.kbd })),
                },
              ]}
              trigger={
                <button
                  type="button"
                  className="gap-2 h-9 px-3 text-sm max-w-sm sm:flex hidden w-full items-center rounded-lg border bg-card/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Icon name="search" className="size-4" />
                  <span className="flex-1 text-start">{tr("Search or jump to…", "ހޯދާ ނުވަތަ ދާ…")}</span>
                  <span className="gap-1 flex" aria-hidden dir="ltr">
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </span>
                </button>
              }
            />
          </AppHeader>
        }
      >
        <div className="gap-4 grid">
          {/* Title row */}
          <div className="gap-4 md:flex-row md:items-end flex flex-col justify-between">
            <div>
              <MicroLabel className="gap-2 flex items-center">
                <span className="nb-dot" aria-hidden />
                <span className="nb-ink">{tr("Live", "ލައިވް")}</span>
                <span>·</span>
                <span>{tr("Addu City Council", "އައްޑޫ ސިޓީ ކައުންސިލް")}</span>
              </MicroLabel>
              <h1 className="nb-display mt-2 text-3xl sm:text-4xl">{tr("Service insights", "ޚިދުމަތުގެ ތަފްޞީލު")}</h1>
            </div>
            <div className="gap-2 flex flex-wrap items-center">
              <SegmentedControl
                aria-label={tr("Date range", "މުއްދަތު")}
                options={[
                  { value: "7d", label: tr("7 days", "7 ދުވަސް") },
                  { value: "30d", label: tr("30 days", "30 ދުވަސް") },
                  { value: "90d", label: tr("90 days", "90 ދުވަސް") },
                ]}
                value={range}
                onValueChange={setRange}
                size="sm"
              />
              <LinkButton href={routes.adminRecords.export} variant="outline" size="sm" startIcon="download">
                {tr("Export", "އެކްސްޕޯޓް")}
              </LinkButton>
            </div>
          </div>

          {/* Bento */}
          <div className="gap-4 md:grid-cols-6 xl:grid-cols-12 grid">
            {/* Hero KPI */}
            <section
              aria-labelledby="nb-kpi-title"
              className="nb-tile nb-featured p-6 md:col-span-6 xl:row-span-2 flex flex-col"
            >
              <div className="gap-3 flex items-start justify-between">
                <div>
                  <MicroLabel>{tr("North star", "މައި މިންގަނޑު")}</MicroLabel>
                  <h2 id="nb-kpi-title" className="mt-1 font-medium">
                    {tr("Applications processed", "ނިމުނު އެޕްލިކޭޝަން")}
                  </h2>
                </div>
                <span className="nb-chip size-9">
                  <Icon name="success" className="size-4" />
                </span>
              </div>
              <div className="mt-6 gap-x-4 gap-y-2 flex flex-wrap items-end">
                <span className="nb-kpi text-[clamp(3.5rem,2.5rem+4vw,6.5rem)]">48,213</span>
                <DeltaIndicator value={0.231} context={tr("vs previous 30 days", "ކުރީގެ 30 ދުވަހާ")} />
              </div>
              <Sparkline
                data={DAILY}
                label={tr("Applications processed per day", "ދުވާލަކު ނިމުނު އެޕްލިކޭޝަން")}
                variant="area"
                height={128}
                className="mt-6"
              />
              <dl className="pt-6 gap-4 mt-auto grid grid-cols-3 border-t">
                {[
                  { k: tr("Median time", "މެޑިއަން"), v: tr("2.4 d", "2.4 ދުވަސް") },
                  { k: tr("First-time right", "ފުރަތަމަ ފަހަރު"), v: "91%" },
                  { k: tr("Within SLA", "SLA ތެރޭ"), v: "97.2%" },
                ].map((s) => (
                  <div key={s.k} className="min-w-0 flex flex-col-reverse">
                    <dt className="nb-mono mt-1 truncate text-muted-foreground">{s.k}</dt>
                    <dd className="text-xl sm:text-2xl font-semibold tracking-tight tabular-nums">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Stat tiles */}
            {[
              {
                label: tr("Active citizens", "ފަޢާލު ރައްޔިތުން"),
                value: 18420,
                delta: 0.082,
                icon: "users",
                spark: wave(16, 60, 12, 1),
              },
              {
                label: tr("Fees collected", "ލިބުނު ފީ"),
                value: 1284500,
                delta: 0.146,
                icon: "banknote",
                format: {
                  style: "currency",
                  currency: "MVR",
                  notation: "compact",
                  maximumFractionDigits: 2,
                } as Intl.NumberFormatOptions,
                spark: wave(16, 80, 18, 4),
              },
              {
                label: tr("Avg. response", "ޖަވާބުދޭ ވަގުތު"),
                value: "1.8 h",
                delta: -0.12,
                icon: "clock",
                good: false,
                spark: wave(16, 40, 8, 7),
              },
              {
                label: tr("Satisfaction", "ހިތްހަމަޖެހުން"),
                value: 0.94,
                delta: 0.021,
                icon: "star",
                format: "percent" as ValueFormat,
                spark: wave(16, 70, 6, 3),
              },
            ].map((s) => (
              <StatTile
                key={s.label}
                className="nb-tile p-5 md:col-span-3"
                label={s.label}
                value={s.value}
                valueFormat={s.format}
                delta={s.delta}
                positiveIsGood={s.good ?? true}
                deltaContext={tr("vs last period", "ކުރީގެ މުއްދަތާ")}
                icon={s.icon}
                sparkline={s.spark}
                classNames={{
                  label: "nb-mono",
                  value: "text-4xl font-semibold tracking-tighter",
                  icon: "nb-chip size-8 [&_svg]:size-4",
                }}
              />
            ))}

            {/* Traffic chart */}
            <section className="nb-tile p-5 sm:p-6 md:col-span-6 xl:col-span-8">
              <TimeSeriesChart
                title={tr("Traffic by channel", "ޗެނަލުން ޓްރެފިކް")}
                description={tr("Sessions per week, last 12 weeks", "ހަފްތާއަކަށް ސެޝަން، ފަހުގެ 12 ހަފްތާ")}
                data={WEEKS}
                config={{
                  web: { label: tr("Web", "ވެބް"), color: "var(--nb-neon)" },
                  app: { label: tr("Mobile app", "މޯބައިލް އެޕް"), color: "var(--nb-neon-2)" },
                  kiosk: {
                    label: tr("Kiosk", "ކިއޮސްކް"),
                    color: "color-mix(in oklab, var(--foreground) 55%, var(--card))",
                  },
                }}
                interval="week"
                area
                stacked
                valueFormat="integer"
                height={280}
                classNames={{ title: "text-base", description: "nb-mono" }}
              />
            </section>

            {/* Donut */}
            <section className="nb-tile p-5 sm:p-6 md:col-span-6 xl:col-span-4">
              <PieChart
                title={tr("Requests by atoll", "އަތޮޅުން އެދުން")}
                description={tr("Share, last 30 days", "ފަހުގެ 30 ދުވަސް")}
                variant="donut"
                data={[
                  { name: tr("Malé", "މާލެ"), value: 21400 },
                  { name: tr("Addu", "އައްޑޫ"), value: 11200 },
                  { name: tr("Haa Dhaalu", "ހދ."), value: 6400 },
                  { name: tr("Gnaviyani", "ޏ."), value: 4800 },
                  { name: tr("Other", "އެހެނިހެން"), value: 4413 },
                ]}
                config={{
                  [tr("Malé", "މާލެ")]: { label: tr("Malé", "މާލެ"), color: "var(--nb-neon)" },
                  [tr("Addu", "އައްޑޫ")]: { label: tr("Addu", "އައްޑޫ"), color: "var(--nb-neon-2)" },
                  [tr("Haa Dhaalu", "ހދ.")]: {
                    label: tr("Haa Dhaalu", "ހދ."),
                    color: "color-mix(in oklab, var(--nb-neon) 55%, var(--card))",
                  },
                  [tr("Gnaviyani", "ޏ.")]: {
                    label: tr("Gnaviyani", "ޏ."),
                    color: "color-mix(in oklab, var(--nb-neon-2) 55%, var(--card))",
                  },
                  [tr("Other", "އެހެނިހެން")]: {
                    label: tr("Other", "އެހެނިހެން"),
                    color: "color-mix(in oklab, var(--foreground) 25%, var(--card))",
                  },
                }}
                centerLabel={{ value: "48.2k", label: tr("Total", "ޖުމްލަ") }}
                height={240}
                classNames={{ title: "text-base", description: "nb-mono" }}
              />
            </section>

            {/* Heatmap */}
            <section aria-labelledby="nb-heat-title" className="nb-tile p-5 sm:p-6 md:col-span-6 xl:col-span-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 id="nb-heat-title" className="font-semibold">
                    {tr("Peak hours", "އެންމެ ބުރަ ގަޑިތައް")}
                  </h2>
                  <MicroLabel className="mt-1">{tr("Requests by day and hour", "ދުވަހާއި ގަޑިން އެދުން")}</MicroLabel>
                </div>
                <span className="nb-chip size-8" data-accent="2">
                  <Icon name="clock" className="size-4" />
                </span>
              </div>
              <div
                role="img"
                aria-label={tr(
                  "Heatmap: busiest on weekdays between 10:00 and 12:00, with a second peak at 18:00–20:00. Weekends are about half as busy.",
                  "ހީޓްމެޕް: ހަފްތާގެ ދުވަސްތަކުގައި 10:00 އާއި 12:00 އާ ދެމެދު އެންމެ ބުރަ. ހޮނިހިރާއި ހުކުރު ދުވަހު ދެބައިކުޅަ އެއްބައި.",
                )}
                className="mt-5 gap-1.5 grid grid-cols-[2.5rem_1fr]"
                dir="ltr"
              >
                {HEAT.map((row, d) => (
                  <React.Fragment key={d}>
                    <span className="nb-mono self-center text-muted-foreground">{days[d]}</span>
                    <span className="gap-1 grid grid-cols-12">
                      {row.map((v, h) => (
                        <span
                          key={h}
                          className="nb-heat"
                          data-hot={v > 0.85 || undefined}
                          style={{ "--v": v.toFixed(2) } as React.CSSProperties}
                        />
                      ))}
                    </span>
                  </React.Fragment>
                ))}
                <span />
                <span className="nb-mono flex justify-between text-muted-foreground" aria-hidden>
                  <span>00</span>
                  <span>06</span>
                  <span>12</span>
                  <span>18</span>
                  <span>24</span>
                </span>
              </div>
            </section>

            {/* Top services */}
            <section className="nb-tile p-5 sm:p-6 md:col-span-3 xl:col-span-4">
              <BarChart
                title={tr("Top services", "ގިނައިން ބޭނުންކުރާ")}
                description={tr("Completed, last 30 days", "ނިމުނު، ފަހުގެ 30 ދުވަސް")}
                data={[
                  { service: tr("Passport", "ޕާސްޕޯޓް"), count: 9820 },
                  { service: tr("Licences", "ލައިސަންސް"), count: 7340 },
                  { service: tr("Housing", "ހައުސިންގ"), count: 5110 },
                  { service: tr("Land", "ބިން"), count: 3260 },
                  { service: tr("Permits", "ހުއްދަ"), count: 2480 },
                ]}
                categoryKey="service"
                config={{ count: { label: tr("Completed", "ނިމުނު"), color: "var(--nb-neon)" } }}
                orientation="horizontal"
                valueFormat="integer"
                radius={6}
                showGrid={false}
                height={230}
                classNames={{ title: "text-base", description: "nb-mono" }}
              />
            </section>

            {/* Status */}
            <section aria-labelledby="nb-status-title" className="nb-tile p-5 sm:p-6 md:col-span-3 xl:col-span-3">
              <h2 id="nb-status-title" className="font-semibold">
                {tr("System status", "ސިސްޓަމްގެ ހާލަތު")}
              </h2>
              <p className="mt-1 gap-2 text-sm flex items-center">
                <span className="nb-dot" aria-hidden />
                {tr("All systems normal", "ހުރިހާ ސިސްޓަމެއް ރަނގަޅު")}
              </p>
              <ul className="mt-5 gap-4 grid">
                {[
                  { name: tr("eServices API", "އީސަރވިސަސް API"), up: "99.99%" },
                  { name: tr("Payments", "ފައިސާ"), up: "99.95%" },
                  { name: tr("SMS gateway", "އެސްއެމްއެސް"), up: "99.90%" },
                ].map((s, i) => (
                  <li key={s.name}>
                    <div className="text-sm flex justify-between">
                      <span>{s.name}</span>
                      <span className="nb-code text-xs text-muted-foreground tabular-nums">{s.up}</span>
                    </div>
                    <div aria-hidden className="mt-1.5 h-6 grid grid-cols-[repeat(30,1fr)] gap-[2px]">
                      {UPTIME.map((state, d) => (
                        <span key={d} className="nb-bar" data-state={i === 0 ? "ok" : state} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Recent table */}
            <section
              aria-labelledby="nb-recent-title"
              className="nb-tile md:col-span-6 xl:col-span-8 xl:row-span-2 flex flex-col"
            >
              <div className="gap-3 p-5 sm:p-6 pb-4 flex items-center justify-between">
                <div>
                  <h2 id="nb-recent-title" className="font-semibold">
                    {tr("Recent applications", "ފަހުގެ އެޕްލިކޭޝަން")}
                  </h2>
                  <MicroLabel className="mt-1">{tr("Updated live", "ލައިވްކޮށް")}</MicroLabel>
                </div>
                <LinkButton href={routes.adminRecords.indexTable} variant="ghost" size="sm" endIcon="arrow-right">
                  {tr("View all", "ހުރިހާ")}
                </LinkButton>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-[40rem]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="ps-6">{tr("Reference", "ރެފަރެންސް")}</TableHead>
                      <TableHead>{tr("Applicant", "އެދުނު ފަރާތް")}</TableHead>
                      <TableHead>{tr("Service", "ޚިދުމަތް")}</TableHead>
                      <TableHead>{tr("Island", "ރަށް")}</TableHead>
                      <TableHead className="pe-6 text-end">{tr("Status", "ހާލަތު")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((r) => (
                      <TableRow key={r.ref}>
                        <TableCell className="ps-6 nb-code text-xs nb-ink">{r.ref}</TableCell>
                        <TableCell>
                          <span className="gap-2.5 flex items-center">
                            <UserAvatar name={r.name} size="sm" decorative />
                            <span className="font-medium">{r.name}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{r.service}</TableCell>
                        <TableCell className="text-muted-foreground">{r.island}</TableCell>
                        <TableCell className="pe-6 text-end">
                          <StatusBadge status={r.status} size="sm">
                            {r.label}
                          </StatusBadge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="nb-mono px-6 py-4 mt-auto border-t text-muted-foreground">
                {tr("Showing 7 of 1,284 this week", "މި ހަފްތާގެ 1,284 އިން 7")}
              </p>
            </section>

            {/* Live feed */}
            <section aria-labelledby="nb-feed-title" className="nb-tile p-5 sm:p-6 md:col-span-3 xl:col-span-4">
              <h2 id="nb-feed-title" className="font-semibold">
                {tr("Live feed", "ލައިވް ފީޑް")}
              </h2>
              <Timeline
                className="mt-4"
                size="sm"
                timeFormat="relative"
                now={NOW}
                items={[
                  {
                    title: tr("Hithadhoo approved 42 passports", "ހިތަދޫން 42 ޕާސްޕޯޓް ފާސްކޮށްފި"),
                    time: new Date(NOW.getTime() - 1000 * 60 * 4),
                    status: "success",
                  },
                  {
                    title: tr("Payments gateway latency spike", "ޕޭމަންޓް ގޭޓްވޭ ލަސްވި"),
                    time: new Date(NOW.getTime() - 1000 * 60 * 38),
                    status: "warning",
                  },
                  {
                    title: tr("New kiosk online in Naifaru", "ނައިފަރުގައި އައު ކިއޮސްކެއް"),
                    time: new Date(NOW.getTime() - 1000 * 60 * 60 * 3),
                    status: "info",
                  },
                ]}
              />
            </section>

            {/* Quick actions */}
            <section aria-labelledby="nb-actions-title" className="nb-tile p-5 sm:p-6 md:col-span-3 xl:col-span-4">
              <h2 id="nb-actions-title" className="font-semibold">
                {tr("Quick actions", "އަވަސް ޢަމަލުތައް")}
              </h2>
              <div className="mt-4 gap-2 grid grid-cols-2">
                {actions.map((a) => (
                  <Button
                    key={a.label}
                    variant="outline"
                    className="py-3 px-3 gap-2 h-auto flex-col items-start bg-background/40 text-start hover:border-primary/40"
                    onClick={() => toast(a.label)}
                  >
                    <span className="flex w-full items-center justify-between">
                      <span className="nb-chip size-7">
                        <Icon name={a.icon} className="size-3.5" />
                      </span>
                      <Kbd aria-hidden>{a.kbd}</Kbd>
                    </span>
                    <span className="text-sm font-medium">{a.label}</span>
                  </Button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </AppLayout>
    </NeonBentoRoot>
  )
}
