import * as React from "react"
import { FilterConditionBuilder, formatQuery, type ConditionGroup } from "@javaabu/onu/query-builder"

import { DemoPage, DemoSection } from "../../components/demo"
import { ISLANDS } from "./_data"

export const meta = {
  title: "Filter condition builder",
  group: "Listing pages",
  order: 27,
  description: "Advanced filters on react-querybuilder, from @javaabu/onu/query-builder.",
}

export default function FilterConditionBuilderDemo() {
  const [query, setQuery] = React.useState<ConditionGroup>({
    combinator: "and",
    rules: [
      { field: "status", operator: "=", value: "active" },
      { field: "island", operator: "in", value: "Malé,Hulhumalé" },
      { field: "balance", operator: "between", value: "1000,5000" },
    ],
  })
  return (
    <DemoPage>
      <DemoSection title="Conditions" className="gap-3 grid">
        <FilterConditionBuilder
          showNotToggle
          query={query}
          onQueryChange={setQuery}
          fields={[
            { name: "name", label: "Name" },
            {
              name: "status",
              label: "Status",
              valueEditorType: "select",
              values: [
                { name: "active", label: "Active" },
                { name: "pending", label: "Pending" },
                { name: "banned", label: "Banned" },
              ],
            },
            {
              name: "island",
              label: "Island",
              valueEditorType: "multiselect",
              values: ISLANDS.map((i) => ({ name: i, label: i })),
            },
            { name: "balance", label: "Balance (MVR)", inputType: "number" },
            { name: "created_at", label: "Created", inputType: "date" },
          ]}
        />
        <pre className="p-2 text-xs overflow-x-auto rounded-md bg-muted" dir="ltr">
          {formatQuery(query, "sql")}
        </pre>
      </DemoSection>
    </DemoPage>
  )
}
