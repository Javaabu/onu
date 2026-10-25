import * as React from "react"
import { Button, Icon, PageTitle, SegmentedControl, toast, useOnu } from "@javaabu/onu"
import {
  CategoryChart,
  MapChart,
  PeriodComparisonChart,
  PieChart,
  StatTile,
  StatTiles,
  TimeSeriesChart,
} from "@javaabu/onu/charts"

import { useTr } from "../_shared/i18n"
import { routes } from "../_shared/routes"
import { AdminShell } from "../_shared/shells"
import { DV_MONTHS } from "../system/_format"
import { wait } from "./_data"
import { ATOLLS, CHANNELS, DAILY, SERVICES, type DailyApplications } from "./_reports-data"

export const meta = { title: "Reports and analytics", group: "Maps and operations", layout: "bare", order: 5 }

type Period = "30" | "90" | "365"

const DV_DAYS = ["އާދިއްތަ", "ހޯމަ", "އަންގާރަ", "ބުދަ", "ބުރާސްފަތި", "ހުކުރު", "ހޮނިހިރު"]

const sum = (rows: DailyApplications[], pick: (r: DailyApplications) => number) =>
  rows.reduce((total, r) => total + pick(r), 0)

/** Splits a period into labelled buckets: weekdays (30 days), weeks (90 days) or months (a year). */
function bucketsOf(rows: DailyApplications[], period: Period) {
  const out = new Map<number, number>()
  rows.forEach((r, i) => {
    const key = period === "30" ? r.date.getDay() : period === "90" ? Math.floor(i / 7) : Math.floor(i / (365 / 12))
    out.set(key, (out.get(key) ?? 0) + r.online + r.counter)
  })
  return out
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="gap-4 grid">
      <h2 id={id} className="text-base font-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function ReportsPage() {
  const tr = useTr()
  const { locale } = useOnu()
  const dv = locale.code === "dv"
  const [period, setPeriod] = React.useState<Period>("90")
  const [exporting, setExporting] = React.useState(false)

  const days = Number(period)
  const current = DAILY.slice(-days)
  const previous = DAILY.slice(-days * 2, -days)
  const total = (rows: DailyApplications[]) => sum(rows, (r) => r.online + r.counter)
  const applications = total(current)
  const prevApplications = total(previous)
  const revenue = sum(current, (r) => r.revenue)
  const prevRevenue = sum(previous, (r) => r.revenue)
  const onlineShare = sum(current, (r) => r.online) / Math.max(applications, 1)
  const prevOnlineShare = sum(previous, (r) => r.online) / Math.max(prevApplications, 1)

  const periodLabel = {
    "30": tr("last 30 days", "ފަހުގެ 30 ދުވަސް"),
    "90": tr("last 90 days", "ފަހުގެ 90 ދުވަސް"),
    "365": tr("last 12 months", "ފަހުގެ 12 މަސް"),
  }[period]
  const vsPrevious = tr("vs previous period", "ކުރީގެ މުއްދަތާ އަޅާބަލާއިރު")

  // Period comparison: the same buckets in this period and the one before.
  const now = bucketsOf(current, period)
  const before = bucketsOf(previous, period)
  const monthName = (m: number) =>
    dv ? DV_MONTHS[m]! : new Intl.DateTimeFormat(locale.numberLocale, { month: "short" }).format(new Date(2026, m, 1))
  const dayName = (d: number) =>
    dv
      ? DV_DAYS[d]!
      : new Intl.DateTimeFormat(locale.numberLocale, { weekday: "short" }).format(new Date(2026, 9, 4 + d))
  const comparison = [...now.keys()]
    .sort((a, b) => a - b)
    .map((key) => ({
      bucket:
        period === "30"
          ? dayName(key)
          : period === "90"
            ? tr(`Wk ${key + 1}`, `ހަފްތާ ${key + 1}`)
            : monthName(current[Math.min(Math.floor(key * (365 / 12)), current.length - 1)]!.date.getMonth()),
      current: now.get(key) ?? 0,
      previous: before.get(key) ?? 0,
    }))

  const byService = SERVICES.map((s, i) => ({
    service: tr(s.en, s.dv),
    approved: Math.round(applications * s.share * (0.82 + i * 0.02)),
    rejected: Math.round(applications * s.share * (0.06 + (i % 2) * 0.03)),
  }))
  const byChannel = CHANNELS.map((c) => ({ name: tr(c.en, c.dv), value: Math.round(applications * c.share) }))
  const byAtoll = ATOLLS.map((a) => ({ id: a.id, value: Math.round(applications * a.share) }))
  const atollShapes = {
    type: "FeatureCollection" as const,
    features: ATOLLS.map((a) => ({
      type: "Feature" as const,
      properties: { id: a.id, name: tr(a.en, a.dv) },
      geometry: a.geometry,
    })),
  }

  return (
    <AdminShell
      contentWidth="wide"
      breadcrumbs={[
        { label: tr("Dashboard", "ޑޭޝްބޯޑް"), href: routes.adminRecords.dashboard },
        { label: tr("Reports", "ރިޕޯޓުތައް") },
      ]}
    >
      <div className="gap-8 grid">
        <PageTitle
          headingLevel={1}
          title={tr("Reports and analytics", "ރިޕޯޓުތަކާއި ތަޙުލީލު")}
          description={tr(
            `Applications and revenue across all services, ${periodLabel}.`,
            `ހުރިހާ ޚިދުމަތެއްގެ އެޕްލިކޭޝަނާއި އާމްދަނީ، ${periodLabel}.`,
          )}
          action={
            <Button
              variant="outline"
              className="touch:min-h-11"
              disabled={exporting}
              onClick={async () => {
                setExporting(true)
                await wait(1000)
                setExporting(false)
                toast.success(tr("Report exported", "ރިޕޯޓު އެކްސްޕޯޓް ކުރެވިއްޖެ"), {
                  description: `applications-${period}d.xlsx`,
                })
              }}
            >
              <Icon
                name={exporting ? "loading" : "download"}
                data-icon="inline-start"
                className={exporting ? "animate-spin" : undefined}
              />
              {tr("Export", "އެކްސްޕޯޓް")}
            </Button>
          }
        />

        <div className="flex">
          <SegmentedControl
            aria-label={tr("Period", "މުއްދަތު")}
            value={period}
            onValueChange={(v) => v && setPeriod(v as Period)}
            options={[
              { value: "30", label: tr("30 days", "30 ދުވަސް") },
              { value: "90", label: tr("90 days", "90 ދުވަސް") },
              { value: "365", label: tr("1 year", "1 އަހަރު") },
            ]}
          />
        </div>

        <Section id="overview" title={tr("Overview", "ޚުލާސާ")}>
          <StatTiles columns={4}>
            <StatTile
              label={tr("Applications", "އެޕްލިކޭޝަންތައް")}
              value={applications}
              previousValue={prevApplications}
              deltaContext={vsPrevious}
              icon="file-text"
              sparkline={current.slice(-21).map((r) => r.online + r.counter)}
            />
            <StatTile
              label={tr("Revenue", "އާމްދަނީ")}
              value={revenue}
              previousValue={prevRevenue}
              deltaContext={vsPrevious}
              valueFormat={{ style: "currency", currency: "MVR", notation: "compact", maximumFractionDigits: 1 }}
              icon="credit-card"
              sparkline={current.slice(-21).map((r) => r.revenue)}
            />
            <StatTile
              label={tr("Applied online", "އޮންލައިންކޮށް")}
              value={onlineShare}
              delta={onlineShare - prevOnlineShare}
              deltaContext={vsPrevious}
              valueFormat="percent"
              icon="globe"
            />
            <StatTile
              label={tr("Average processing", "އެވްރެޖް ޕްރޮސެސިން")}
              value={tr(`${(3.4 - days / 1000).toFixed(1)} days`, `${(3.4 - days / 1000).toFixed(1)} ދުވަސް`)}
              delta={-0.12}
              positiveIsGood={false}
              deltaContext={vsPrevious}
              icon="clock"
            />
          </StatTiles>
        </Section>

        <Section id="trends" title={tr("Trends", "ބަދަލުތައް")}>
          <TimeSeriesChart
            title={tr("Applications per day", "ދުވާލަކަށް ލިބޭ އެޕްލިކޭޝަން")}
            description={tr(
              "Online through eFaas and at counters. Drag the handles under the chart to zoom.",
              "eFaas އިން އޮންލައިންކޮށް އަދި ކައުންޓަރުން. ޒޫމް ކުރުމަށް ތިރީގައިވާ ހޭންޑަލް ދަމާލައްވާ.",
            )}
            data={current}
            series={["online", "counter"]}
            config={{
              online: { label: tr("Online", "އޮންލައިން") },
              counter: { label: tr("Counter", "ކައުންޓަރު") },
            }}
            interval="day"
            area
            brush
            height={280}
          />
          <PeriodComparisonChart
            title={tr("This period against the previous one", "މި މުއްދަތާއި ކުރީގެ މުއްދަތު")}
            description={
              period === "30"
                ? tr("Applications by day of the week.", "ހަފްތާގެ ދުވަސްތަކުން.")
                : period === "90"
                  ? tr("Applications by week.", "ހަފްތާއަކުން.")
                  : tr("Applications by month.", "މަހަކުން.")
            }
            variant="bar"
            data={comparison}
            categoryKey="bucket"
            currentLabel={tr("This period", "މި މުއްދަތު")}
            previousLabel={tr("Previous period", "ކުރީގެ މުއްދަތު")}
            height={260}
          />
        </Section>

        <Section id="breakdown" title={tr("Breakdown", "ތަފްސީލު")}>
          <div className="gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] grid">
            <CategoryChart
              variant="bar"
              title={tr("Decisions by service", "ޚިދުމަތުގެ ގޮތުން ނިންމުންތައް")}
              orientation="horizontal"
              stacked
              data={byService}
              categoryKey="service"
              config={{
                approved: { label: tr("Approved", "ފާސްކުރި") },
                rejected: { label: tr("Rejected", "ރިޖެކްޓްކުރި") },
              }}
              valueFormat="compact"
              height={300}
            />
            <PieChart
              title={tr("How people applied", "އެދުނު ގޮތް")}
              variant="donut"
              data={byChannel}
              centerLabel={{
                value: new Intl.NumberFormat(locale.numberLocale, { notation: "compact" }).format(applications),
                label: tr("Total", "ޖުމްލަ"),
              }}
              height={300}
            />
          </div>
          <MapChart
            title={tr("Applications by atoll", "އަތޮޅުތަކުން ލިބުނު އެޕްލިކޭޝަން")}
            description={tr(
              "Outlines are simplified. Without a Google Maps key the figures show as a table.",
              "އަތޮޅުތަކުގެ ބޯޑަރު ދައްކާފައިވަނީ ކުރުކޮށް. ގޫގަލް މެޕްސް ކީ ނެތިއްޔާ ޖަދުވަލެއްގެ ގޮތުގައި ދައްކާނެ.",
            )}
            geojson={atollShapes}
            data={byAtoll}
            valueFormat="integer"
            regionLabel={tr("Atoll", "އަތޮޅު")}
            zoom={6}
          />
        </Section>
      </div>
    </AdminShell>
  )
}
