import * as React from "react"
import {
  Button,
  Card,
  Icon,
  LinkButton,
  ProgressBar,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Timeline,
  UserAvatar,
  toast,
} from "@javaabu/onu"
import { BarChart, PieChart, StatTile, StatTiles, TimeSeriesChart } from "@javaabu/onu/charts"

import { useDv, useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { ATOLLS, AtollMap, IslandArt, LagoonShell } from "./_lagoon"
import "./lagoon.css"

export const meta = {
  title: "Lagoon · Dashboard",
  group: "Design options",
  layout: "bare",
  order: 31,
  description: "A calm, friendly service desk: floating sand sidebar, glass header, live queue and an atoll map.",
}

// Fixed demo data.
const FORTNIGHT = [
  { date: "2026-09-25", online: 182, kiosk: 44, counter: 61 },
  { date: "2026-09-26", online: 190, kiosk: 40, counter: 58 },
  { date: "2026-09-27", online: 120, kiosk: 22, counter: 30 },
  { date: "2026-09-28", online: 204, kiosk: 51, counter: 66 },
  { date: "2026-09-29", online: 221, kiosk: 48, counter: 62 },
  { date: "2026-09-30", online: 236, kiosk: 55, counter: 57 },
  { date: "2026-10-01", online: 248, kiosk: 52, counter: 54 },
  { date: "2026-10-02", online: 240, kiosk: 58, counter: 50 },
  { date: "2026-10-03", online: 160, kiosk: 30, counter: 31 },
  { date: "2026-10-04", online: 262, kiosk: 61, counter: 49 },
  { date: "2026-10-05", online: 281, kiosk: 63, counter: 47 },
  { date: "2026-10-06", online: 294, kiosk: 66, counter: 44 },
  { date: "2026-10-07", online: 302, kiosk: 70, counter: 41 },
  { date: "2026-10-08", online: 318, kiosk: 72, counter: 39 },
]

function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card
      headingLevel={2}
      title={title}
      description={description}
      actions={action}
      className={`lg-card min-w-0 ring-0 ${className ?? ""}`}
      classNames={{ title: "text-base" }}
    >
      {children}
    </Card>
  )
}

export default function LagoonDashboardPage() {
  const tr = useTr()
  const dv = useDv()

  const counters = [
    { n: 1, staff: tr("Ahmed Shareef", "އަޙްމަދު ޝަރީފް"), ticket: "B-118", state: "serving" },
    { n: 2, staff: tr("Mariyam Shiuna", "މަރިޔަމް ޝިއުނާ"), ticket: "A-042", state: "serving" },
    { n: 3, staff: tr("Ali Nashid", "ޢަލީ ނާޝިދު"), ticket: "—", state: "break" },
    { n: 4, staff: tr("Hawwa Zeena", "ޙައްވާ ޒީނާ"), ticket: "C-007", state: "serving" },
  ]

  const byService = [
    { service: tr("Passports", "ޕާސްޕޯޓް"), count: 128 },
    { service: tr("ID cards", "އައިޑީ ކާޑު"), count: 96 },
    { service: tr("Housing", "ގެދޮރު"), count: 71 },
    { service: tr("Licences", "ލައިސަންސް"), count: 64 },
    { service: tr("Business", "ވިޔަފާރި"), count: 42 },
  ]

  const byChannel = [
    { name: tr("Online", "އޮންލައިން"), value: 318 },
    { name: tr("Kiosk", "ކިއޮސްކް"), value: 72 },
    { name: tr("Counter", "ކައުންޓަރު"), value: 39 },
  ]

  const busiest = [...ATOLLS].sort((a, b) => b.v - a.v).slice(0, 5)

  const recent = [
    {
      ref: "PPT-0815",
      name: tr("Aishath Nazeema", "އާއިޝަތު ނާޒިމާ"),
      service: tr("Passport renewal", "ޕާސްޕޯޓް"),
      island: tr("Fuvahmulah", "ފުވައްމުލައް"),
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
    {
      ref: "IDC-3301",
      name: tr("Hussain Fazeel", "ޙުސައިން ފަޟީލް"),
      service: tr("ID card", "އައިޑީ ކާޑު"),
      island: tr("Madaveli", "މަޑަވެލި"),
      status: "warning",
      label: tr("Payment due", "ފީ ދައްކަންޖެހޭ"),
    },
  ]

  const notices = [
    {
      icon: "megaphone",
      tone: "text-primary bg-primary/10",
      title: tr("Social housing opens 15 October", "ސޯޝަލް ހައުސިންގ 15 އޮކްޓޫބަރުގައި"),
      meta: tr("Ministry of Housing · 2h", "ހައުސިންގ މިނިސްޓްރީ · 2 ގަޑިއިރު"),
    },
    {
      icon: "warning",
      tone: "text-[color-mix(in_oklab,var(--warning),var(--foreground)_35%)] bg-warning/15",
      title: tr("Rough seas: Madaveli mobile desk moved to 14:00", "ކަނޑު ގަދަ: މަޑަވެލި ޑެސްކް 14:00 އަށް"),
      meta: tr("Met Office · 3h", "މޫސުމީ ޚިދުމަތް · 3 ގަޑިއިރު"),
    },
    {
      icon: "success",
      tone: "text-success bg-success/10",
      title: tr("Passport books arrived on the morning ferry", "ހެނދުނުގެ ފެރީގައި ޕާސްޕޯޓް ފޮތް އައި"),
      meta: tr("Logistics · 4h", "ލޮޖިސްޓިކްސް · 4 ގަޑިއިރު"),
    },
  ]

  return (
    <LagoonShell>
      <div className="gap-6 grid">
        {/* Greeting band with quick actions */}
        <section
          aria-labelledby="lg-greeting"
          className="lg-ocean lg-grain px-6 py-8 sm:px-10 relative overflow-hidden rounded-[2rem]"
        >
          <div aria-hidden className="lg-glow -top-24 end-10 size-80" />
          <IslandArt className="-bottom-6 end-0 lg:block text-white/70 [&_.lg-art-water]:stroke-white/40 absolute hidden w-[26rem]" />
          <div className="max-w-2xl relative">
            <p className="lg-ocean-muted text-sm">
              {tr("Thursday, 8 October · Calm seas, ", "ބުރާސްފަތި، 8 އޮކްޓޫބަރު · ކަނޑު މަޑު، ")}
              <bdi dir="ltr">29°C</bdi>
            </p>
            <h1
              id="lg-greeting"
              className="lg-serif mt-2 font-semibold leading-tight text-[clamp(1.8rem,1.4rem+1.5vw,2.6rem)]"
            >
              {tr("Good morning, Mariyam", "ސަލާމް، މަރިޔަމް")}
            </h1>
            <p className="lg-ocean-muted mt-2 max-w-lg">
              {tr(
                "38 citizens are waiting across 6 offices. The average wait is 9 minutes, 3 less than yesterday.",
                "6 އޮފީހެއްގައި 38 ރައްޔިތަކު އިންތިޒާރުގައި. އިންތިޒާރު 9 މިނެޓް، އިއްޔެއަށްވުރެ 3 މިނެޓް މަދު.",
              )}
            </p>
            <div className="mt-6 gap-2 flex flex-wrap">
              <Button
                size="lg"
                startIcon="megaphone"
                className="lg-on-ocean-btn h-10 px-4"
                onClick={() => toast(tr("Calling A-043 to counter 2", "A-043 ކައުންޓަރު 2 އަށް"))}
              >
                {tr("Call next ticket", "ދެން ހުރި ޓިކެޓް")}
              </Button>
              <LinkButton
                href={routes.adminRecords.create}
                size="lg"
                variant="outline"
                startIcon="add"
                className="lg-on-ocean-ghost h-10 px-4"
              >
                {tr("New application", "އައު އެޕްލިކޭޝަން")}
              </LinkButton>
              <LinkButton
                href={routes.public.events}
                size="lg"
                variant="outline"
                startIcon="calendar"
                className="lg-on-ocean-ghost h-10 px-4"
              >
                {tr("Book appointment", "އެޕޮއިންޓްމަންޓް")}
              </LinkButton>
            </div>
          </div>
        </section>

        <h2 className="sr-only">{tr("Today at a glance", "މިއަދު")}</h2>
        <StatTiles>
          <StatTile
            className="lg-tile"
            label={tr("Waiting now", "މިހާރު އިންތިޒާރުގައި")}
            value={38}
            previousValue={52}
            positiveIsGood={false}
            icon="users"
            deltaContext={tr("vs this time yesterday", "އިއްޔެ މިވަގުތާ")}
            sparkline={[52, 48, 44, 47, 41, 39, 38]}
          />
          <StatTile
            className="lg-tile"
            label={tr("Served today", "މިއަދު ޚިދުމަތް ދެވުނު")}
            value={214}
            previousValue={188}
            icon="success"
            deltaContext={tr("vs yesterday", "އިއްޔެއާ")}
            sparkline={FORTNIGHT.map((d) => d.online + d.kiosk + d.counter)}
          />
          <StatTile
            className="lg-tile"
            label={tr("Average wait", "އިންތިޒާރު")}
            value={tr("9 min", "9 މިނެޓް")}
            delta={-0.25}
            positiveIsGood={false}
            icon="clock"
            deltaContext={tr("vs yesterday", "އިއްޔެއާ")}
          />
          <StatTile
            className="lg-tile"
            label={tr("Satisfaction", "ހިތްހަމަޖެހުން")}
            value={0.94}
            valueFormat="percent"
            delta={0.02}
            icon="star"
            deltaContext={tr("last 7 days", "ފަހުގެ 7 ދުވަސް")}
          />
        </StatTiles>

        <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid">
          <div className="lg-card min-w-0 p-5">
            <TimeSeriesChart
              title={tr("Applications this fortnight", "މި ދެހަފްތާގެ އެޕްލިކޭޝަން")}
              description={tr("By channel, all islands", "ޗެނަލުން، ހުރިހާ ރަށެއް")}
              data={FORTNIGHT}
              config={{
                online: { label: tr("Online", "އޮންލައިން") },
                kiosk: { label: tr("Kiosk", "ކިއޮސްކް") },
                counter: { label: tr("Counter", "ކައުންޓަރު") },
              }}
              interval="day"
              area
              valueFormat="integer"
              height={280}
            />
          </div>

          <Panel
            title={tr("Now serving", "މިހާރު ޚިދުމަތް ދެނީ")}
            description={tr("Front desk queue", "ފްރަންޓް ޑެސްކް ކިއު")}
          >
            <div className="gap-5 flex items-center">
              <div className="size-24 relative grid shrink-0 place-items-center">
                <span aria-hidden className="lg-ripple" />
                <span aria-hidden className="lg-ripple" />
                <span aria-hidden className="lg-ripple" />
                <span className="lg-pill-primary size-24 shadow-lg grid place-items-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-center">
                    <span className="text-xs block">{tr("Ticket", "ޓިކެޓް")}</span>
                    <span className="text-xl font-semibold tabular-nums">A-042</span>
                  </span>
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold">{tr("Counter 2 · Passports", "ކައުންޓަރު 2 · ޕާސްޕޯޓް")}</p>
                <p className="text-sm text-muted-foreground">
                  {tr("Next: A-043, A-044, B-119", "ދެން: A-043، A-044، B-119")}
                </p>
                <Button
                  className="lg-pill mt-3"
                  startIcon="megaphone"
                  onClick={() => toast(tr("Calling A-043 to counter 2", "A-043 ކައުންޓަރު 2 އަށް"))}
                >
                  {tr("Call next", "ދެން")}
                </Button>
              </div>
            </div>
            <ul className="mt-6 gap-2 grid">
              {counters.map((c) => (
                <li key={c.n} className="gap-3 px-3 py-2 flex items-center rounded-2xl bg-muted/60">
                  <span className="size-7 text-xs font-semibold grid shrink-0 place-items-center rounded-full bg-card tabular-nums">
                    {c.n}
                  </span>
                  <UserAvatar name={c.staff} size="xs" decorative />
                  <span className="min-w-0 text-sm flex-1 truncate">{c.staff}</span>
                  {c.state === "break" ? (
                    <StatusBadge status="neutral" size="sm">
                      {tr("On break", "ބްރޭކް")}
                    </StatusBadge>
                  ) : (
                    <span className="text-sm font-semibold font-mono text-primary-subtle-foreground">{c.ticket}</span>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="gap-6 lg:grid-cols-2 xl:grid-cols-3 grid">
          <Panel
            title={tr("Islands today", "މިއަދު ރަށްރަށުން")}
            description={tr("Share of applications by atoll", "އަތޮޅުން އެޕްލިކޭޝަން")}
          >
            <div className="gap-4 flex">
              <div className="h-80 px-2 py-3 shrink-0 rounded-2xl bg-[color-mix(in_oklab,var(--primary)_5%,var(--muted))]">
                <AtollMap
                  label={tr(
                    "Map of the Maldives atolls. Kaafu, Addu and Fuvahmulah are busiest today.",
                    "ދިވެހިރާއްޖޭގެ އަތޮޅުތަކުގެ ޗާޓް. މިއަދު އެންމެ ބުރަ ކާފު، އައްޑޫ އަދި ފުވައްމުލައް.",
                  )}
                  equator={tr("Equator", "އިކުއޭޓަރު")}
                />
              </div>
              <ul className="min-w-0 gap-3 flex flex-1 flex-col justify-center">
                {busiest.map((a) => (
                  <li key={a.code}>
                    <ProgressBar
                      value={Math.round(a.v * 100)}
                      label={dv ? a.dv : a.en}
                      showValue
                      size="sm"
                      classNames={{ label: "truncate" }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <div className="lg-card min-w-0 p-5">
            <BarChart
              title={tr("By service", "ޚިދުމަތުން")}
              description={tr("Applications today", "މިއަދުގެ އެޕްލިކޭޝަން")}
              data={byService}
              categoryKey="service"
              config={{ count: { label: tr("Applications", "އެޕްލިކޭޝަން") } }}
              orientation="horizontal"
              valueFormat="integer"
              radius={10}
              height={280}
            />
          </div>

          <div className="lg-card min-w-0 p-5 lg:col-span-2 xl:col-span-1">
            <PieChart
              title={tr("By channel", "ޗެނަލުން")}
              description={tr("Where citizens applied today", "މިއަދު އެދުނު ގޮތް")}
              variant="donut"
              data={byChannel}
              centerLabel={{ value: "429", label: tr("Total", "ޖުމްލަ") }}
              height={280}
            />
          </div>
        </div>

        <div className="gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid items-start">
          <Panel
            title={tr("Recent applications", "ފަހުގެ އެޕްލިކޭޝަންތައް")}
            action={
              <LinkButton
                href={routes.adminRecords.indexTable}
                variant="ghost"
                endIcon="arrow-right"
                className="lg-pill"
              >
                {tr("View all", "ހުރިހާ")}
              </LinkButton>
            }
            className="[&_[data-slot=card-content]]:px-0"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="ps-6">{tr("Reference", "ރެފަރެންސް")}</TableHead>
                  <TableHead>{tr("Citizen", "ރައްޔިތު")}</TableHead>
                  <TableHead className="md:table-cell hidden">{tr("Service", "ޚިދުމަތް")}</TableHead>
                  <TableHead className="lg:table-cell hidden">{tr("Island", "ރަށް")}</TableHead>
                  <TableHead className="pe-6">{tr("Status", "ހާލަތު")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((r) => (
                  <TableRow key={r.ref}>
                    <TableCell className="ps-6 text-xs font-mono">{r.ref}</TableCell>
                    <TableCell>
                      <span className="gap-2 flex items-center">
                        <UserAvatar name={r.name} size="xs" decorative />
                        {r.name}
                      </span>
                    </TableCell>
                    <TableCell className="md:table-cell hidden">{r.service}</TableCell>
                    <TableCell className="lg:table-cell hidden">{r.island}</TableCell>
                    <TableCell className="pe-6">
                      <StatusBadge status={r.status} size="sm">
                        {r.label}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>

          <div className="gap-6 grid content-start">
            <Panel title={tr("Today", "މިއަދު")} description={tr("Thinadhoo office", "ތިނަދޫ އޮފީސް")}>
              <Timeline
                size="sm"
                items={[
                  {
                    title: tr("Morning ferry brought 40 passport books", "ހެނދުނުގެ ފެރީގައި 40 ޕާސްޕޯޓް ފޮތް"),
                    description: "08:00",
                    status: "success",
                  },
                  {
                    title: tr("Biometrics appointments", "ބަޔޮމެޓްރިކްސް އެޕޮއިންޓްމަންޓް"),
                    description: tr("10:30 · 12 booked", "10:30 · 12 ބުކް"),
                    status: "current",
                  },
                  {
                    title: tr("Mobile desk at Madaveli", "މަޑަވެލީގައި މޮބައިލް ޑެސްކް"),
                    description: tr("14:00 · moved for weather", "14:00 · މޫސުމުގެ ސަބަބުން"),
                    status: "pending",
                  },
                  {
                    title: tr("Council meeting", "ކައުންސިލް ބައްދަލުވުން"),
                    description: "15:30",
                    status: "pending",
                  },
                ]}
              />
            </Panel>
            <Panel title={tr("Notices", "އިޢުލާންތައް")}>
              <ul className="gap-4 grid">
                {notices.map((n) => (
                  <li key={n.title} className="gap-3 flex items-start">
                    <span className={`size-9 grid shrink-0 place-items-center rounded-xl ${n.tone}`}>
                      <Icon name={n.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 text-sm">
                      <span className="font-medium block">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.meta}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </LagoonShell>
  )
}
