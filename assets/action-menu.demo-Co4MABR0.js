var e=`import * as React from "react"
import { ActionMenu, Button, ConfirmProvider, Icon, type MenuItem } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Dropdown menu",
  group: "Overlays",
  order: 7,
  description: "ActionMenu: items with icons, shortcuts, checkbox/radio items, submenus and confirmations.",
}

export default function ActionMenuDemo() {
  const [last, setLast] = React.useState("")
  const [columns, setColumns] = React.useState({ island: true, phone: false })
  const [sort, setSort] = React.useState("name")

  const rowActions: MenuItem[] = [
    { id: "view", label: "View", icon: "eye", onSelect: () => setLast("View") },
    { id: "edit", label: "Edit", icon: "edit", shortcut: "⌘E", onSelect: () => setLast("Edit") },
    { id: "copy", label: "Duplicate", icon: "copy", shortcut: "⌘D", onSelect: () => setLast("Duplicate") },
    { id: "archive", label: "Archive", icon: "archive", hidden: true },
    { type: "separator" },
    {
      type: "sub",
      label: "Move to island",
      icon: "map-pin",
      items: ["Malé", "Hulhumalé", "Addu City"].map((island) => ({
        id: island,
        label: island,
        onSelect: () => setLast(\`Moved to \${island}\`),
      })),
    },
    { type: "separator" },
    {
      id: "delete",
      label: "Delete",
      icon: "trash",
      variant: "destructive",
      confirm: { title: "Delete Aishath Ali?", variant: "destructive" },
      onSelect: () => setLast("Deleted"),
    },
  ]

  const viewOptions: MenuItem[] = [
    { type: "label", label: "Columns" },
    {
      type: "checkbox",
      label: "Island",
      checked: columns.island,
      onCheckedChange: (island) => setColumns((c) => ({ ...c, island })),
    },
    {
      type: "checkbox",
      label: "Phone",
      checked: columns.phone,
      onCheckedChange: (phone) => setColumns((c) => ({ ...c, phone })),
    },
    { type: "separator" },
    {
      type: "radio",
      label: "Sort by",
      value: sort,
      onValueChange: setSort,
      options: [
        { value: "name", label: "Name" },
        { value: "created", label: "Date created" },
        { value: "salary", label: "Salary (MVR)" },
      ],
    },
  ]

  return (
    <ConfirmProvider>
      <DemoPage>
        <DemoSection title="Row actions (⋯)" description="Delete asks for confirmation after the menu closes.">
          <div className="gap-3 px-3 py-2 flex items-center rounded-lg border">
            <span className="text-sm">Aishath Ali · Hulhumalé</span>
            <ActionMenu items={rowActions} />
          </div>
          <span role="status" className="text-sm self-center text-muted-foreground">
            {last}
          </span>
        </DemoSection>
        <DemoSection title="Checkbox and radio items">
          <ActionMenu
            items={viewOptions}
            align="start"
            trigger={
              <Button variant="outline">
                <Icon name="columns" />
                View
              </Button>
            }
          />
          <span className="text-sm self-center text-muted-foreground">
            Columns:{" "}
            {Object.keys(columns)
              .filter((k) => columns[k as keyof typeof columns])
              .join(", ")}{" "}
            · Sort: {sort}
          </span>
        </DemoSection>
        <DemoSection title="Links and disabled items">
          <ActionMenu
            label="Help"
            trigger={<Button variant="ghost">Help</Button>}
            items={[
              { label: "Documentation", icon: "external-link", href: "https://github.com/Javaabu/onu" },
              { label: "Keyboard shortcuts", icon: "keyboard", shortcut: "?" },
              { label: "Contact support (closed)", icon: "phone", disabled: true },
            ]}
          />
        </DemoSection>
        <DemoSection title="ދިވެހި">
          <ActionMenu
            items={[
              { label: "ބައްލަވާ", icon: "eye" },
              { label: "އެޑިޓްކުރޭ", icon: "edit", shortcut: "⌘E" },
              { type: "sub", label: "ރަށަށް ބަދަލުކުރޭ", items: [{ label: "މާލެ" }, { label: "ހުޅުމާލެ" }] },
              { label: "ފޮހެލާ", icon: "trash", variant: "destructive" },
            ]}
          />
        </DemoSection>
      </DemoPage>
    </ConfirmProvider>
  )
}
`;export{e as default};