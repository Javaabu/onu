import * as React from "react"
import { SortableList } from "@javaabu/onu"

// 6.6: focus after "Move down" and Alt+ArrowDown.
export default function SortableListHarness() {
  const [items, setItems] = React.useState(["Malé", "Hulhumalé", "Villimalé"].map((name) => ({ id: name, name })))
  return (
    <SortableList
      aria-label="Islands"
      items={items}
      getName={(i) => i.name}
      moveButtons
      onReorder={setItems}
      renderItem={(item, { handle, moveButtons }) => (
        <div className="gap-2 p-2 flex items-center rounded-lg border">
          {handle}
          <span className="flex-1">{item.name}</span>
          {moveButtons}
        </div>
      )}
    />
  )
}
