import * as React from "react"
import {
  Button,
  DependentSelect,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Icon,
  SearchableSelect,
  Select,
  TextInput,
  type ChoiceOption,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { atolls, dvIslands, islands, islandsByAtoll, ministries } from "./_data"

export const meta = {
  title: "Searchable select",
  group: "Choice inputs",
  order: 2,
  description:
    "A select with a search field: several values, creating missing options, and fields that depend on another.",
}

const categories: ChoiceOption[] = [
  { value: "1", label: "Infrastructure" },
  { value: "2", label: "Health" },
  { value: "3", label: "Education" },
]

function delay<T>(value: T, ms = 400) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), ms))
}

export default function SearchableSelectDemo() {
  const [atoll, setAtoll] = React.useState("")
  const [island, setIsland] = React.useState<string | null>(null)
  const [atoll2, setAtoll2] = React.useState("K")
  return (
    <DemoPage>
      <DemoSection title="Grouped options" className="max-w-md gap-4 grid">
        <FormField label="Island" help="Try typing “male” — it finds Malé, Hulhumalé and Villimalé.">
          <SearchableSelect options={islands} clearable placeholder="Select an island" />
        </FormField>
        <FormField label="Ministry" required>
          <SearchableSelect options={ministries.map((m) => ({ value: m, label: m, icon: <Icon name="building" /> }))} />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Thaana search"
        description="The search field types Thaana from a Latin keyboard."
        className="max-w-md gap-4 grid"
      >
        <FormField label="ރަށް">
          <SearchableSelect options={dvIslands} thaana placeholder="ރަށެއް އިޚްތިޔާރު ކުރައްވާ" />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled" disabled>
          <SearchableSelect options={islands} defaultValue="male" />
        </FormField>
        <FormField label="Error" error="Select an island">
          <SearchableSelect options={islands} />
        </FormField>
        <FormField label="Empty list">
          <SearchableSelect options={[]} />
        </FormField>
        <FormField label="Large">
          <SearchableSelect options={islands} size="lg" />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Several values"
        description="Chips, select all, a maximum and Backspace to remove the last chip. MultiSelect is the same with multiple fixed on."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Service islands" help="Submits islands[] for Laravel.">
          <SearchableSelect multiple name="islands" options={islands} defaultValue={["male", "hulhumale"]} />
        </FormField>
        <FormField label="Ministries" help="Up to 3; extra chips collapse into “+N more”.">
          <SearchableSelect multiple options={ministries} max={3} maxVisibleChips={2} />
        </FormField>
        <FormField label="Disabled" disabled>
          <SearchableSelect multiple options={islands} defaultValue={["hithadhoo", "male"]} />
        </FormField>
        <FormField label="Error" error="Pick at least one island" required>
          <SearchableSelect multiple options={islands} />
        </FormField>
        <FormField label="ރަށްތައް">
          <SearchableSelect multiple options={dvIslands} thaana defaultValue={["male"]} />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Creating options"
        description="Type something that isn't in the list and create it, inline or through a dialog."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Category" help="Try “Tourism”.">
          <SearchableSelect
            options={categories}
            onCreate={(label) =>
              new Promise<ChoiceOption>((resolve) => setTimeout(() => resolve({ value: `new-${label}`, label }), 600))
            }
          />
        </FormField>
        <FormField label="Tags">
          <SearchableSelect options={categories} multiple onCreate={(label) => ({ value: label, label })} />
        </FormField>
        <FormField label="Vendor" help="Opens a dialog.">
          <SearchableSelect
            options={[
              { value: "v1", label: "Maldives Ports Ltd" },
              { value: "v2", label: "State Trading Organization" },
            ]}
            renderCreateDialog={({ query, open, onOpenChange, onCreated }) => (
              <CreateVendorDialog query={query} open={open} onOpenChange={onOpenChange} onCreated={onCreated} />
            )}
          />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Dependent fields"
        description="Options depend on another field; the value clears when that field changes."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Atoll">
          <Select options={atolls} value={atoll} onValueChange={setAtoll} />
        </FormField>
        <FormField label="Island" help={`Value: ${island ?? "none"}`}>
          <SearchableSelect
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
        description="DependentSelect with loadOptions runs through the same cached data layer as API select."
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

function CreateVendorDialog({
  query,
  open,
  onOpenChange,
  onCreated,
}: {
  query: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (option: ChoiceOption) => void
}) {
  const [name, setName] = React.useState(query)
  const [tin, setTin] = React.useState("")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New vendor</DialogTitle>
          <DialogDescription>The vendor is created and selected.</DialogDescription>
        </DialogHeader>
        <div className="gap-4 grid">
          <FormField label="Name" required>
            <TextInput value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="TIN">
            <TextInput value={tin} onChange={(e) => setTin(e.target.value)} placeholder="1000123GST001" />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onCreated({ value: `v-${Date.now()}`, label: name, description: tin })}>
            Create vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
