var e=`import * as React from "react"
import { ColumnVisibility } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { personColumns } from "./_data"

export const meta = { title: "Column visibility", group: "Listing pages", order: 14 }

export default function ColumnVisibilityDemo() {
  const [value, setValue] = React.useState<Record<string, boolean>>({ balance: false })
  return (
    <DemoPage>
      <DemoSection title="Columns menu" description="The primary column (Name) can't be hidden.">
        <ColumnVisibility columns={personColumns()} value={value} onValueChange={setValue} />
        <ColumnVisibility columns={personColumns()} value={value} onValueChange={setValue} showLabel={false} />
        <code className="text-xs text-muted-foreground" dir="ltr">
          {JSON.stringify(value)}
        </code>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};