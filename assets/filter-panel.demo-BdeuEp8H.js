var e=`import * as React from "react"
import { ActiveFilterChips, FilterPanel, TextInput, type FilterDefinition, type FilterValues } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { personFilters } from "./_data"

export const meta = {
  title: "Filter panel",
  group: "Listing pages",
  order: 3,
  description: "A dropdown on desktop and a bottom sheet on phones. Changes apply only on Apply.",
}

const withCustom: FilterDefinition[] = [
  ...personFilters,
  {
    type: "custom",
    key: "min_balance",
    label: "Minimum balance (MVR)",
    render: ({ id, value, onChange }) => (
      <TextInput
        id={id}
        inputMode="decimal"
        endAddon="MVR"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
    format: (v) => \`MVR \${String(v)}+\`,
  },
]

export default function FilterPanelDemo() {
  const [value, setValue] = React.useState<FilterValues>({
    status: ["active"],
    created: { field: "created_at", from: "2026-03-01", to: "2026-03-31" },
  })
  return (
    <DemoPage>
      <DemoSection title="Filters with pills" className="gap-3 grid">
        <div className="gap-2 flex">
          <FilterPanel filters={withCustom} value={value} onApply={setValue} />
          <FilterPanel filters={withCustom} value={value} onApply={setValue} sheet trigger="Bottom sheet" />
        </div>
        <ActiveFilterChips
          filters={withCustom}
          value={value}
          onRemove={(key) => setValue(({ [key]: _removed, ...rest }) => rest)}
          onClearAll={() => setValue({})}
        />
        <pre className="text-xs text-muted-foreground" dir="ltr">
          {JSON.stringify(value, null, 2)}
        </pre>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};