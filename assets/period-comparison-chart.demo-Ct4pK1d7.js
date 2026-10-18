var e=`import { PeriodComparisonChart } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { monthlyCosts, weeklyApplications } from "./_data"

export const meta = {
  title: "Period comparison chart",
  group: "Charts",
  order: 5,
  description: "This period against the previous one, with totals and change.",
}

export default function PeriodComparisonChartDemo() {
  return (
    <DemoPage>
      <DemoSection title="Lines" className="block">
        <PeriodComparisonChart
          title="Applications this week"
          description="Compared with the previous week."
          data={weeklyApplications}
          categoryKey="day"
          currentLabel="This week"
          previousLabel="Last week"
        />
      </DemoSection>
      <DemoSection
        title="Bars, lower is better"
        description="positiveIsGood={false}: a fall in costs is shown in green."
        className="block"
      >
        <PeriodComparisonChart
          title="Electricity costs, Q3"
          variant="bar"
          data={monthlyCosts}
          categoryKey="month"
          currentLabel="2026"
          previousLabel="2025"
          valueFormat="currency"
          positiveIsGood={false}
          height={240}
        />
      </DemoSection>
      <DemoSection title="Average and Dhivehi" className="block">
        <div lang="dv">
          <PeriodComparisonChart
            title="ދުވާލަކަށް ލިބޭ ހުށަހެޅުންތައް"
            data={weeklyApplications.map((d, i) => ({
              ...d,
              day: ["އާދީއްތަ", "ހޯމަ", "އަންގާރަ", "ބުދަ", "ބުރާސްފަތި", "ހުކުރު", "ހޮނިހިރު"][i],
            }))}
            categoryKey="day"
            aggregate="average"
            height={240}
          />
        </div>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};