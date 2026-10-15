import * as React from "react"
import { SortableList } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Sortable list", group: "Listing pages", order: 22 }

const initial = [
  { id: "1", title: "Home", titleDv: "ފުރަތަމަ ސަފްހާ" },
  { id: "2", title: "Services", titleDv: "ޚިދުމަތްތައް" },
  { id: "3", title: "News", titleDv: "ޚަބަރު" },
  { id: "4", title: "Contact", titleDv: "ގުޅުއްވާ" },
]

export default function SortableListDemo() {
  const [items, setItems] = React.useState(initial)
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
    </DemoPage>
  )
}
