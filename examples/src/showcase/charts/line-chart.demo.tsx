import { LineChart } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { arrivalsByMonth, fishCatch } from "./_data"

export const meta = {
  title: "Line graph",
  group: "Charts",
  order: 2,
  description: "Multi-series lines or filled areas, with gaps for missing values.",
}

const fishConfig = {
  skipjack: { label: "Skipjack" },
  yellowfin: { label: "Yellowfin" },
  reef: { label: "Reef fish" },
}

export default function LineChartDemo() {
  return (
    <DemoPage>
      <DemoSection title="Multiple series with a target" className="block">
        <LineChart
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
        <LineChart title="Fish catch (tonnes)" data={fishCatch} categoryKey="month" config={fishConfig} height={260} />
      </DemoSection>
      <DemoSection title="Area" className="gap-6 lg:grid-cols-2 grid">
        <LineChart
          title="Arrivals (area)"
          area
          data={arrivalsByMonth}
          categoryKey="month"
          series={["arrivals"]}
          config={{ arrivals: { label: "Arrivals" } }}
          valueFormat="compact"
          height={240}
        />
        <LineChart
          title="Fish catch, stacked"
          area
          stacked
          connectNulls
          data={fishCatch}
          categoryKey="month"
          config={fishConfig}
          height={240}
        />
      </DemoSection>
      <DemoSection title="Dhivehi" className="block">
        <div lang="dv">
          <LineChart
            title="މަހުގެ ބޭރު ފަތުރުވެރިން"
            data={arrivalsByMonth}
            categoryKey="month"
            series={["arrivals"]}
            config={{ arrivals: { label: "ފަތުރުވެރިން" } }}
            valueFormat="compact"
            height={240}
          />
        </div>
      </DemoSection>
    </DemoPage>
  )
}
