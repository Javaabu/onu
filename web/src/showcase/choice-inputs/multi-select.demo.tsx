import { FormField, MultiSelect } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { dvIslands, islands, ministries } from "./_data"

export const meta = {
  title: "Multi-select",
  group: "Choice inputs",
  order: 6,
  description: "Chips, select all, a maximum and Backspace to remove the last chip.",
}

export default function MultiSelectDemo() {
  return (
    <DemoPage>
      <DemoSection title="Chips and select all" className="max-w-md gap-4 grid">
        <FormField label="Service islands" help="Submits islands[] for Laravel.">
          <MultiSelect name="islands" options={islands} defaultValue={["male", "hulhumale"]} />
        </FormField>
        <FormField label="Ministries" help="Up to 3; extra chips collapse into “+N more”.">
          <MultiSelect options={ministries} max={3} maxVisibleChips={2} />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled" disabled>
          <MultiSelect options={islands} defaultValue={["hithadhoo", "male"]} />
        </FormField>
        <FormField label="Error" error="Pick at least one island" required>
          <MultiSelect options={islands} />
        </FormField>
        <FormField label="ރަށްތައް">
          <MultiSelect options={dvIslands} thaana defaultValue={["male"]} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
