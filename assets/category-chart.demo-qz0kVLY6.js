var e=`import { CategoryChart, type ChartConfig } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { arrivalsByMonth, fishCatch, revenueByIsland, revenueByIslandDv } from "./_data"

export const meta = {
  title: "Category chart",
  group: "Charts",
  order: 1,
  description:
    "Bars (vertical or horizontal, grouped or stacked), lines or filled areas over categories, with gaps for missing values and a data-table view.",
}

const revenueConfig = {
  revenue: { label: "Revenue" },
  expenses: { label: "Expenses" },
} satisfies ChartConfig

const revenueConfigDv = {
  revenue: { label: "އާމްދަނީ" },
  expenses: { label: "ޚަރަދު" },
} satisfies ChartConfig

const fishConfig = {
  skipjack: { label: "Skipjack" },
  yellowfin: { label: "Yellowfin" },
  reef: { label: "Reef fish" },
}

export default function CategoryChartDemo() {
  return (
    <DemoPage>
      <DemoSection title="Grouped columns" className="block">
        <CategoryChart
          variant="bar"
          title="Council revenue and expenses, 2026"
          description="Five largest councils, in Maldivian Rufiyaa."
          data={revenueByIsland}
          categoryKey="island"
          config={revenueConfig}
          valueFormat="currency"
        />
      </DemoSection>
      <DemoSection title="Single series" className="block">
        <CategoryChart
          variant="bar"
          title="Tourist arrivals by month"
          data={arrivalsByMonth}
          categoryKey="month"
          series={["arrivals"]}
          config={{ arrivals: { label: "Arrivals" } }}
          height={260}
        />
      </DemoSection>
      <DemoSection title="Horizontal and stacked" className="gap-6 lg:grid-cols-2 grid">
        <CategoryChart
          variant="bar"
          title="Revenue by council"
          orientation="horizontal"
          data={revenueByIsland}
          categoryKey="island"
          series={["revenue"]}
          config={revenueConfig}
          valueFormat="compact"
          height={280}
        />
        <CategoryChart
          variant="bar"
          title="Revenue and expenses, stacked"
          stacked
          data={revenueByIsland}
          categoryKey="island"
          config={revenueConfig}
          valueFormat="compact"
          height={280}
        />
      </DemoSection>
      <DemoSection title="Lines with a target" className="block">
        <CategoryChart
          variant="line"
          title="Tourist arrivals against target"
          description="2026, monthly. The target line is dashed."
          data={arrivalsByMonth}
          categoryKey="month"
          config={{ arrivals: { label: "Arrivals" }, target: { label: "Target" } }}
          dashedSeries={["target"]}
          valueFormat="compact"
        />
      </DemoSection>
      <DemoSection
        title="Gaps"
        description="April yellowfin is missing, so the line breaks instead of guessing."
        className="block"
      >
        <CategoryChart
          variant="line"
          title="Fish catch (tonnes)"
          data={fishCatch}
          categoryKey="month"
          config={fishConfig}
          height={260}
        />
      </DemoSection>
      <DemoSection title="Area" className="gap-6 lg:grid-cols-2 grid">
        <CategoryChart
          variant="area"
          title="Arrivals (area)"
          data={arrivalsByMonth}
          categoryKey="month"
          series={["arrivals"]}
          config={{ arrivals: { label: "Arrivals" } }}
          valueFormat="compact"
          height={240}
        />
        <CategoryChart
          variant="area"
          title="Fish catch, stacked"
          stacked
          connectNulls
          data={fishCatch}
          categoryKey="month"
          config={fishConfig}
          height={240}
        />
      </DemoSection>
      <DemoSection
        title="Solid fills"
        description="Bars fade gently towards their base and areas fade to the baseline by default; gradient={false} draws flat fills. Wrap a page in <ChartStyleProvider gradient={false}> to switch every chart."
        className="gap-6 lg:grid-cols-2 grid"
      >
        <CategoryChart
          variant="bar"
          title="Tourist arrivals by month"
          data={arrivalsByMonth}
          categoryKey="month"
          series={["arrivals"]}
          config={{ arrivals: { label: "Arrivals" } }}
          gradient={false}
          height={240}
        />
        <CategoryChart
          variant="area"
          title="Fish catch, stacked (solid)"
          stacked
          gradient={false}
          connectNulls
          data={fishCatch}
          categoryKey="month"
          config={fishConfig}
          height={240}
        />
      </DemoSection>
      <DemoSection
        title="Dhivehi labels"
        description="Switch the toolbar to RTL to mirror the axes."
        className="gap-6 lg:grid-cols-2 grid"
      >
        <div lang="dv">
          <CategoryChart
            variant="bar"
            title="ކައުންސިލްތަކުގެ އާމްދަނީ"
            data={revenueByIslandDv}
            categoryKey="island"
            config={revenueConfigDv}
            valueFormat="currency"
          />
        </div>
        <div lang="dv">
          <CategoryChart
            variant="line"
            title="މަހުގެ ބޭރު ފަތުރުވެރިން"
            data={arrivalsByMonth}
            categoryKey="month"
            series={["arrivals"]}
            config={{ arrivals: { label: "ފަތުރުވެރިން" } }}
            valueFormat="compact"
          />
        </div>
      </DemoSection>
      <DemoSection title="States" className="gap-6 lg:grid-cols-3 grid">
        <CategoryChart
          variant="bar"
          title="Loading"
          data={[]}
          categoryKey="island"
          config={revenueConfig}
          loading
          height={200}
        />
        <CategoryChart
          variant="bar"
          title="No data"
          data={[]}
          categoryKey="island"
          config={revenueConfig}
          height={200}
        />
        <CategoryChart
          variant="bar"
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
`;export{e as default};