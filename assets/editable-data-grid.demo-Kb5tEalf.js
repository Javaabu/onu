var e=`import * as React from "react"
import { EditableDataGrid } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { wait } from "./_data"

export const meta = {
  title: "Editable data grid",
  group: "Listing pages",
  order: 24,
  description:
    "Arrow keys move; Enter or typing edits; Enter saves and moves down; Tab saves and moves on; Escape cancels.",
}

interface Line {
  id: string
  item: string
  itemDv: string
  qty: number
  unit: string
  price: number
}

const initial: Line[] = [
  { id: "1", item: "Rice", itemDv: "ހަނޑޫ", qty: 25, unit: "kg", price: 18.5 },
  { id: "2", item: "Sugar", itemDv: "ހަކުރު", qty: 10, unit: "kg", price: 14 },
  { id: "3", item: "Tuna (canned)", itemDv: "ކޭންކުރި މަސް", qty: 48, unit: "tin", price: 22.75 },
  { id: "4", item: "Drinking water", itemDv: "ބޯފެން", qty: 12, unit: "box", price: 95 },
]

export default function EditableDataGridDemo() {
  const [rows, setRows] = React.useState(initial)
  return (
    <DemoPage>
      <DemoSection title="Supply order" className="block">
        <EditableDataGrid
          aria-label="Supply order"
          rows={rows}
          onCellChange={async ({ rowId, columnId, value }) => {
            await wait(200)
            if (columnId === "item" && rows.some((r) => r.id !== rowId && r.item.toLowerCase() === value.toLowerCase()))
              return "This item is already on the order"
            setRows((prev) =>
              prev.map((r) =>
                r.id === rowId ? { ...r, [columnId]: ["qty", "price"].includes(columnId) ? Number(value) : value } : r,
              ),
            )
          }}
          columns={[
            { id: "item", header: "Item", editable: true, required: true },
            { id: "itemDv", header: "ބައިގެ ނަން", editable: true, thaana: true },
            {
              id: "qty",
              header: "Qty",
              editable: true,
              type: "number",
              align: "end",
              validate: (v) => (Number(v) <= 0 ? "Must be more than 0" : undefined),
            },
            {
              id: "unit",
              header: "Unit",
              editable: true,
              type: "select",
              required: true,
              options: ["kg", "tin", "box", "bottle"].map((u) => ({ value: u, label: u })),
            },
            { id: "price", header: "Price (MVR)", editable: true, type: "number", align: "end" },
            {
              id: "total",
              header: "Total (MVR)",
              align: "end",
              accessor: (r) => (r.qty * r.price).toFixed(2),
            },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};