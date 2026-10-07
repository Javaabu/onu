import * as React from "react"
import { Badge, TreeView, type TreeNode } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Tree view", group: "Listing pages", order: 21 }

const atolls: TreeNode[] = [
  {
    id: "kaafu",
    label: "Kaafu Atoll",
    icon: "folder",
    end: <Badge variant="secondary">3</Badge>,
    children: [
      {
        id: "male",
        label: "Malé City",
        icon: "map-pin",
        children: [
          { id: "henveiru", label: "Henveiru" },
          { id: "galolhu", label: "Galolhu" },
          { id: "maafannu", label: "Maafannu" },
          { id: "machangolhi", label: "Machangolhi", disabled: true },
        ],
      },
      { id: "hulhumale", label: "Hulhumalé", icon: "map-pin" },
      { id: "villimale", label: "Villimalé", icon: "map-pin" },
    ],
  },
  {
    id: "seenu",
    label: "Seenu Atoll (Addu City)",
    icon: "folder",
    children: [
      { id: "hithadhoo", label: "Hithadhoo" },
      { id: "feydhoo", label: "Feydhoo" },
    ],
  },
  { id: "gnaviyani", label: "ފުވައްމުލަކު", icon: "map-pin" },
]

export default function TreeViewDemo() {
  const [selected, setSelected] = React.useState<string[]>(["henveiru"])
  const [action, setAction] = React.useState("")
  return (
    <DemoPage>
      <DemoSection
        title="Wards"
        description="Arrow keys move; Right/Left (mirrored in RTL) expand and collapse; Enter opens."
        className="max-w-md block"
      >
        <TreeView aria-label="Wards" items={atolls} defaultExpandedKeys={["kaafu"]} onAction={setAction} />
        <p className="mt-2 text-sm text-muted-foreground">Opened: {action || "—"}</p>
      </DemoSection>
      <DemoSection title="Multiple selection" className="max-w-md block">
        <TreeView
          aria-label="Wards to include"
          items={atolls}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
          defaultExpandedKeys={["kaafu", "male"]}
        />
        <p className="mt-2 text-sm text-muted-foreground">{selected.join(", ")}</p>
      </DemoSection>
    </DemoPage>
  )
}
