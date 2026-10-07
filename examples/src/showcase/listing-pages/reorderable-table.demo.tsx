import * as React from "react"
import { ReorderableTable } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Row reordering",
  group: "Listing pages",
  order: 23,
  description: "Drag-and-drop row reordering.",
}

const stops = [
  { id: "s1", island: "Malé", time: "07:00", passengers: 42 },
  { id: "s2", island: "Hulhumalé", time: "07:30", passengers: 18 },
  { id: "s3", island: "Villimalé", time: "08:10", passengers: 9 },
  { id: "s4", island: "Thilafushi", time: "08:45", passengers: 4 },
]

export default function ReorderableTableDemo() {
  const [rows, setRows] = React.useState(stops)
  return (
    <DemoPage>
      <DemoSection title="Ferry route stops" className="block">
        <ReorderableTable
          caption="Ferry route stops"
          rows={rows}
          getName={(r) => r.island}
          onReorder={setRows}
          columns={[
            { id: "order", header: "#", cell: (r) => rows.indexOf(r) + 1, className: "w-10 tabular-nums" },
            { id: "island", header: "Island", cell: (r) => r.island },
            { id: "time", header: "Departs", cell: (r) => r.time, className: "tabular-nums" },
            { id: "passengers", header: "Passengers", cell: (r) => r.passengers, className: "text-end tabular-nums" },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
