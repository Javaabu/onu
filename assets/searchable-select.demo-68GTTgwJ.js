var e=`import { FormField, Icon, SearchableSelect } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { dvIslands, islands, ministries } from "./_data"

export const meta = {
  title: "Searchable select",
  group: "Choice inputs",
  order: 2,
  description: "A select with a search field. Matching ignores case and accents and handles Thaana.",
}

export default function SearchableSelectDemo() {
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
    </DemoPage>
  )
}
`;export{e as default};