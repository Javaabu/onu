var e=`import * as React from "react"
import { SortableList } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Sortable list",
  group: "Listing pages",
  order: 22,
  description:
    "Drag-and-drop reordering of a list or of table rows, with keyboard and Move up / Move down alternatives.",
}

const initial = [
  { id: "1", title: "Home", titleDv: "ފުރަތަމަ ސަފްހާ" },
  { id: "2", title: "Services", titleDv: "ޚިދުމަތްތައް" },
  { id: "3", title: "News", titleDv: "ޚަބަރު" },
  { id: "4", title: "Contact", titleDv: "ގުޅުއްވާ" },
]

const stops = [
  { id: "s1", island: "Malé", time: "07:00", passengers: 42 },
  { id: "s2", island: "Hulhumalé", time: "07:30", passengers: 18 },
  { id: "s3", island: "Villimalé", time: "08:10", passengers: 9 },
  { id: "s4", island: "Thilafushi", time: "08:45", passengers: 4 },
]

export default function SortableListDemo() {
  const [items, setItems] = React.useState(initial)
  const [rows, setRows] = React.useState(stops)
  return (
    <DemoPage>
      <DemoSection
        title="Menu order"
        description="Drag the handle, press Space on it and use the arrows, Alt+↑/↓, or the buttons."
        className="max-w-md block"
      >
        <SortableList
          aria-label="Menu items"
          items={items}
          getName={(i) => i.title}
          onReorder={setItems}
          renderItem={(item, { handle, moveButtons }) => (
            <div className="gap-2 p-2 flex items-center rounded-lg border bg-card">
              {handle}
              <span className="flex-1">{item.title}</span>
              <span className="text-sm text-muted-foreground" lang="dv">
                {item.titleDv}
              </span>
              {moveButtons}
            </div>
          )}
        />
      </DemoSection>
      <DemoSection title="Table: ferry route stops" className="block">
        <SortableList
          aria-label="Ferry route stops"
          items={rows}
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
`;export{e as default};