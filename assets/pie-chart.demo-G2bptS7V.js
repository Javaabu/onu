var e=`import { PieChart } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { applicationsByChannel, populationByAtoll } from "./_data"

export const meta = {
  title: "Pie chart",
  group: "Charts",
  order: 3,
  description: "Pie or donut with a centre label, legend and share table.",
}

export default function PieChartDemo() {
  return (
    <DemoPage>
      <DemoSection title="Pie and donut" className="gap-6 lg:grid-cols-2 grid">
        <PieChart title="Resident population by atoll" data={populationByAtoll} valueFormat="compact" />
        <PieChart
          title="Applications by channel"
          description="September 2026"
          variant="donut"
          data={applicationsByChannel}
        />
      </DemoSection>
      <DemoSection title="Custom centre and Dhivehi" className="gap-6 lg:grid-cols-2 grid">
        <PieChart
          title="Budget allocation"
          variant="donut"
          valueFormat="currency"
          centerLabel={{ value: "MVR 4.2M", label: "Budget" }}
          data={[
            { name: "Salaries", value: 2100000 },
            { name: "Operations", value: 1300000 },
            { name: "Projects", value: 800000 },
          ]}
        />
        <div lang="dv">
          <PieChart
            title="ޚިދުމަތް ހޯދި ގޮތް"
            variant="donut"
            data={[
              { name: "އީފާސް", value: 6420 },
              { name: "ރަށު ކައުންސިލް", value: 2190 },
              { name: "ކައުންޓަރު", value: 1340 },
            ]}
            centerLabel={{ value: "9,950", label: "ޖުމްލަ" }}
          />
        </div>
      </DemoSection>
      <DemoSection title="States" className="gap-6 lg:grid-cols-2 grid">
        <PieChart title="Loading" data={[]} loading height={220} />
        <PieChart title="No data" data={[]} height={220} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};