import * as React from "react"
import { Button } from "@javaabu/onu"
import { DeltaIndicator, StatTile, StatTiles } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { trend } from "./_data"

export const meta = {
  title: "Stat tiles",
  group: "Charts",
  order: 7,
  description: "KPI tiles with delta, icon, sparkline and loading state, in a responsive grid.",
}

export default function StatTileDemo() {
  const [loading, setLoading] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection title="Dashboard row" className="block">
        <div className="mb-3">
          <Button variant="outline" size="sm" onClick={() => setLoading((l) => !l)}>
            {loading ? "Show data" : "Show loading state"}
          </Button>
        </div>
        <StatTiles>
          <StatTile
            label="Applications"
            value={1284}
            previousValue={1102}
            icon="file-text"
            sparkline={trend(2, 14, 80, 20)}
            loading={loading}
          />
          <StatTile
            label="Revenue"
            value={2481500}
            previousValue={2610200}
            valueFormat="currency"
            icon="credit-card"
            sparkline={trend(9, 14, 170000, 30000)}
            loading={loading}
          />
          <StatTile
            label="Average wait"
            value="3.4 days"
            delta={-0.18}
            positiveIsGood={false}
            deltaContext="vs last month"
            icon="clock"
            loading={loading}
          />
          <StatTile label="Active users" value={18240} delta={0} icon="users" loading={loading} />
        </StatTiles>
      </DemoSection>
      <DemoSection title="Sizes, link and Dhivehi" className="block">
        <StatTiles columns={3}>
          <StatTile size="sm" label="Open tickets" value={42} previousValue={51} positiveIsGood={false} />
          <StatTile asChild label="Pending approvals" value={17} icon="arrow-right" footer="Open the approvals queue">
            <a href="#/components/charts/stat-tile">Pending approvals</a>
          </StatTile>
          <div lang="dv">
            <StatTile size="lg" label="ހުށަހެޅުންތައް" value={1284} previousValue={1102} icon="file-text" />
          </div>
        </StatTiles>
      </DemoSection>
      <DemoSection title="Delta indicator on its own" className="gap-4 items-center">
        <DeltaIndicator value={0.124} />
        <DeltaIndicator value={-0.05} />
        <DeltaIndicator value={0} />
        <DeltaIndicator value={0.08} positiveIsGood={false} variant="badge" />
        <DeltaIndicator value={-0.08} positiveIsGood={false} variant="badge" />
      </DemoSection>
    </DemoPage>
  )
}
