var e=`import * as React from "react"
import { FilterTabs } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { people } from "./_data"

export const meta = { title: "Filter tabs", group: "Listing pages", order: 15 }

const count = (status: string) => people.filter((p) => p.status === status).length

export default function FilterTabsDemo() {
  const [tab, setTab] = React.useState("all")
  const tabs = [
    { value: "all", label: "All", count: people.length },
    { value: "active", label: "Active", count: count("active") },
    { value: "pending", label: "Pending", count: count("pending") },
    { value: "banned", label: "Banned", count: count("banned") },
    { value: "archived", label: "Archived", disabled: true },
  ]
  return (
    <DemoPage>
      <DemoSection title="Line (default)" className="block">
        <FilterTabs value={tab} onValueChange={setTab} tabs={tabs} />
      </DemoSection>
      <DemoSection title="Pills" className="block">
        <FilterTabs variant="default" value={tab} onValueChange={setTab} tabs={tabs} />
      </DemoSection>
      <DemoSection title="Dhivehi labels" className="block">
        <FilterTabs
          tabs={[
            { value: "all", label: "ހުރިހާ", count: 312 },
            { value: "new", label: "އާ", count: 18 },
            { value: "done", label: "ނިމިފައި", count: 294 },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};