import * as React from "react"
import { Badge, GridView } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { ISLANDS } from "./_data"

export const meta = { title: "Grid view", group: "Listing pages", order: 19 }

const services = ISLANDS.map((island, i) => ({
  id: String(i),
  title: `${island} council office`,
  description: "Permits, registrations and certificates for residents.",
  open: i % 3 !== 0,
  hue: (i * 40) % 360,
}))

export default function GridViewDemo() {
  const [selection, setSelection] = React.useState<string[]>(["1"])
  return (
    <DemoPage>
      <DemoSection title="Cards follow the space available" className="block">
        <GridView
          aria-label="Council offices"
          items={services}
          title={(s) => s.title}
          description={(s) => s.description}
          media={(s) => (
            <div className="p-3 text-xs flex size-full items-end bg-linear-to-br from-primary/20 to-chart-2/30 text-muted-foreground">
              {s.hue}°
            </div>
          )}
          meta={(s) => <Badge variant={s.open ? "secondary" : "outline"}>{s.open ? "Open" : "Closed"}</Badge>}
          selection={selection}
          onSelectionChange={setSelection}
          itemActions={() => [{ id: "edit", label: "Edit", icon: "edit" }]}
          onItemClick={() => undefined}
        />
      </DemoSection>
      <DemoSection title="Narrow column" className="block">
        <div className="max-w-xs">
          <GridView minItemWidth="10rem" items={services.slice(0, 4)} title={(s) => s.title} />
        </div>
      </DemoSection>
      <DemoSection title="Loading" className="block">
        <GridView items={[]} title={() => ""} loading />
      </DemoSection>
    </DemoPage>
  )
}
