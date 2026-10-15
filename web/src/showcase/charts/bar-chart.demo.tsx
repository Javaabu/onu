import { BarChart, type ChartConfig } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { arrivalsByMonth, revenueByIsland, revenueByIslandDv } from "./_data"

export const meta = {
  title: "Bar graph",
  group: "Charts",
  order: 1,
  description: "Vertical or horizontal, grouped or stacked bars with a data-table view.",
}

const revenueConfig = {
  revenue: { label: "Revenue" },
  expenses: { label: "Expenses" },
} satisfies ChartConfig

const revenueConfigDv = {
  revenue: { label: "އާމްދަނީ" },
  expenses: { label: "ޚަރަދު" },
} satisfies ChartConfig

export default function BarChartDemo() {
  return (
    <DemoPage>
      <DemoSection title="Grouped columns" className="block">
        <BarChart
          title="Council revenue and expenses, 2026"
          description="Five largest councils, in Maldivian Rufiyaa."
          data={revenueByIsland}
          categoryKey="island"
          config={revenueConfig}
          valueFormat="currency"
        />
      </DemoSection>
      <DemoSection title="Single series" className="block">
        <BarChart
          title="Tourist arrivals by month"
          data={arrivalsByMonth}
          categoryKey="month"
          series={["arrivals"]}
          config={{ arrivals: { label: "Arrivals" } }}
          height={260}
        />
      </DemoSection>
      <DemoSection title="Horizontal and stacked" className="gap-6 lg:grid-cols-2 grid">
        <BarChart
          title="Revenue by council"
          orientation="horizontal"
          data={revenueByIsland}
          categoryKey="island"
          series={["revenue"]}
          config={revenueConfig}
          valueFormat="compact"
          height={280}
        />
        <BarChart
          title="Revenue and expenses, stacked"
          stacked
          data={revenueByIsland}
          categoryKey="island"
          config={revenueConfig}
          valueFormat="compact"
          height={280}
        />
      </DemoSection>
      <DemoSection
        title="Solid fills"
        description="Bars fade gently towards their base by default; gradient={false} draws flat bars. Wrap a page in <ChartStyleProvider gradient={false}> to switch every chart."
        className="block"
      >
        <BarChart
          title="Tourist arrivals by month"
          data={arrivalsByMonth}
          categoryKey="month"
          series={["arrivals"]}
          config={{ arrivals: { label: "Arrivals" } }}
          gradient={false}
          height={240}
        />
      </DemoSection>
      <DemoSection title="Dhivehi labels" description="Switch the toolbar to RTL to mirror the axes." className="block">
        <div lang="dv">
          <BarChart
            title="ކައުންސިލްތަކުގެ އާމްދަނީ"
            data={revenueByIslandDv}
            categoryKey="island"
            config={revenueConfigDv}
            valueFormat="currency"
          />
        </div>
      </DemoSection>
      <DemoSection title="States" className="gap-6 lg:grid-cols-3 grid">
        <BarChart title="Loading" data={[]} categoryKey="island" config={revenueConfig} loading height={200} />
        <BarChart title="No data" data={[]} categoryKey="island" config={revenueConfig} height={200} />
        <BarChart
          title="Table view first"
          data={revenueByIsland.slice(0, 3)}
          categoryKey="island"
          config={revenueConfig}
          valueFormat="currency"
          defaultView="table"
          height={200}
        />
      </DemoSection>
    </DemoPage>
  )
}
