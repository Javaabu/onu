import { RowActions } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { wait } from "./_data"

export const meta = { title: "Row actions", group: "Listing pages", order: 9 }

export default function RowActionsDemo() {
  return (
    <DemoPage>
      <DemoSection title="⋯ menu" description="Only permitted actions are listed; Delete asks first.">
        <RowActions
          name="Aishath Hassan"
          actions={[
            { id: "view", label: "View", icon: "eye", href: "#/components/listing-pages/row-actions" },
            { id: "edit", label: "Edit", icon: "edit" },
            { id: "ban", label: "Ban", permitted: false },
            {
              id: "delete",
              label: "Delete",
              icon: "trash",
              destructive: true,
              separator: true,
              onSelect: () => wait(),
            },
          ]}
        />
        <RowActions
          name="ޢަލީ ޙަސަން"
          actions={[
            { id: "view", label: "ބައްލަވާ", icon: "eye" },
            { id: "delete", label: "ފޮހެލާ", icon: "trash", destructive: true, onSelect: () => wait() },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
