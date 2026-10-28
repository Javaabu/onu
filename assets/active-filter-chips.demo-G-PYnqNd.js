var e=`import * as React from "react"
import { ActiveFilterChips, type FilterValues } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { personFilters } from "./_data"

export const meta = { title: "Active filter chips", group: "Listing pages", order: 4 }

const initial: FilterValues = {
  status: ["active", "pending"],
  island: ["Malé", "Addu City"],
  created: { field: "created_at", from: "2026-03-01", to: "2026-03-31" },
  verified: "1",
  trashed: "with",
}

export default function ActiveFilterChipsDemo() {
  const [value, setValue] = React.useState<FilterValues>(initial)
  const [single, setSingle] = React.useState<FilterValues>({ created: { field: "updated_at", from: "2026-03-01" } })
  return (
    <DemoPage>
      <DemoSection title="Several filters" description="Clear all appears with two or more pills." className="block">
        <ActiveFilterChips
          filters={personFilters}
          value={value}
          onRemove={(key) => setValue(({ [key]: _removed, ...rest }) => rest)}
          onClearAll={() => setValue({})}
        />
        {Object.keys(value).length === 0 ? (
          <button type="button" className="text-sm text-primary underline" onClick={() => setValue(initial)}>
            Reset demo
          </button>
        ) : null}
      </DemoSection>
      <DemoSection title="Open-ended date" className="block">
        <ActiveFilterChips filters={personFilters} value={single} onRemove={() => setSingle({})} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};