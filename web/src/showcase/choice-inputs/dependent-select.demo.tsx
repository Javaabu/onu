import * as React from "react"
import { DependentSelect, FormField, Select } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { atolls, islandsByAtoll } from "./_data"

export const meta = {
  title: "Dependent select",
  group: "Choice inputs",
  order: 3,
  description: "Options depend on another field; the value clears when that field changes.",
}

function delay<T>(value: T, ms = 400) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))
}

export default function DependentSelectDemo() {
  const [atoll, setAtoll] = React.useState("")
  const [island, setIsland] = React.useState<string | null>(null)
  const [atoll2, setAtoll2] = React.useState("K")
  return (
    <DemoPage>
      <DemoSection title="Atoll → island" className="max-w-md gap-4 grid">
        <FormField label="Atoll">
          <Select options={atolls} value={atoll} onValueChange={setAtoll} />
        </FormField>
        <FormField label="Island" help={`Value: ${island ?? "none"}`}>
          <DependentSelect
            parentValue={atoll}
            parentLabel="an atoll"
            options={islandsByAtoll}
            value={island}
            onValueChange={setIsland}
            clearable
          />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Loaded per parent"
        description="loadOptions runs through the same cached data layer as API select."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Atoll">
          <Select options={atolls} value={atoll2} onValueChange={setAtoll2} />
        </FormField>
        <FormField label="Islands">
          <DependentSelect
            parentValue={atoll2}
            parentLabel="an atoll"
            multiple
            loadOptions={(parent) => delay({ data: islandsByAtoll[parent] ?? [] })}
          />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
