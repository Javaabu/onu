import * as React from "react"
import { ViewSwitcher, type ListingView } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "View switcher", group: "Listing pages", order: 13 }

export default function ViewSwitcherDemo() {
  const [view, setView] = React.useState<ListingView>("table")
  return (
    <DemoPage>
      <DemoSection title="Icons" description="Arrow keys move between views (mirrored in RTL).">
        <ViewSwitcher value={view} onValueChange={setView} />
        <span className="text-sm text-muted-foreground">Current: {view}</span>
      </DemoSection>
      <DemoSection title="With labels, fewer views">
        <ViewSwitcher defaultValue="list" showLabels views={["list", "grid"]} />
        <ViewSwitcher
          defaultValue="map"
          showLabels
          views={["table", { value: "map", label: "Map", icon: "map-pin" }]}
        />
      </DemoSection>
    </DemoPage>
  )
}
