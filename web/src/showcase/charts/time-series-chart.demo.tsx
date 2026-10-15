import { TimeSeriesChart } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { dailyArrivals } from "./_data"

export const meta = {
  title: "Time-series chart",
  group: "Charts",
  order: 4,
  description: "A real date axis in the active locale, gaps, and a brush to zoom.",
}

const data = dailyArrivals()

const stayTypes = {
  resorts: { label: "Resorts" },
  guesthouses: { label: "Guesthouses" },
  liveaboards: { label: "Liveaboards" },
}
const byStayType = [
  { date: "2026-01-01", resorts: 118000, guesthouses: 52000, liveaboards: 21000 },
  { date: "2026-02-01", resorts: 112000, guesthouses: 55000, liveaboards: 24000 },
  { date: "2026-03-01", resorts: 104000, guesthouses: 58000, liveaboards: 26000 },
  { date: "2026-04-01", resorts: 86000, guesthouses: 47000, liveaboards: 19000 },
  { date: "2026-05-01", resorts: 61000, guesthouses: 33000, liveaboards: 11000 },
  { date: "2026-06-01", resorts: 58000, guesthouses: 31000, liveaboards: 9000 },
]

export default function TimeSeriesChartDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Brush and zoom"
        description="Drag the handles (or focus one and use the arrow keys) to zoom. Newest dates are on the left in RTL."
        className="block"
      >
        <TimeSeriesChart
          title="Velana International Airport, daily passengers"
          data={data}
          config={{ arrivals: { label: "Arrivals" }, departures: { label: "Departures" } }}
          interval="day"
          brush
        />
      </DemoSection>
      <DemoSection
        title="Gaps and area"
        description="Missing days are left as gaps (interval='day' inserts the missing dates)."
        className="block"
      >
        <TimeSeriesChart
          title="Arrivals"
          area
          data={data}
          series={["arrivals"]}
          config={{ arrivals: { label: "Arrivals" } }}
          interval="day"
          height={240}
        />
      </DemoSection>
      <DemoSection
        title="Stacked"
        description="stacked adds the series up: areas, or bars with variant='bar'. The table still lists each series."
        className="gap-6 lg:grid-cols-2 grid"
      >
        <TimeSeriesChart
          title="Tourist arrivals by stay type"
          variant="area"
          stacked
          data={byStayType}
          config={stayTypes}
          interval="month"
          height={240}
        />
        <TimeSeriesChart
          title="Tourist arrivals by stay type"
          variant="bar"
          stacked
          data={byStayType}
          config={stayTypes}
          interval="month"
          height={240}
        />
      </DemoSection>
      <DemoSection title="Monthly, MVR" className="block">
        <TimeSeriesChart
          title="Tourism tax collected"
          data={[
            { date: "2026-01-01", tax: 28400000 },
            { date: "2026-02-01", tax: 27100000 },
            { date: "2026-03-01", tax: 25900000 },
            { date: "2026-04-01", tax: 22800000 },
            { date: "2026-05-01", tax: 17600000 },
            { date: "2026-06-01", tax: 15400000 },
            { date: "2026-07-01", tax: 19900000 },
            { date: "2026-08-01", tax: 22300000 },
          ]}
          config={{ tax: { label: "Tourism tax" } }}
          interval="month"
          valueFormat="currency"
          height={240}
        />
      </DemoSection>
    </DemoPage>
  )
}
