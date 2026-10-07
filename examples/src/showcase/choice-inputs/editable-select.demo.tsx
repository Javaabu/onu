import { EditableSelect, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Editable select",
  group: "Choice inputs",
  order: 5,
  description: "A text field with suggestions that also accepts anything the user types.",
}

const titles = [
  "Director",
  "Deputy Director",
  "Assistant Director",
  "Senior Project Officer",
  "Project Officer",
  "Intern",
]

export default function EditableSelectDemo() {
  return (
    <DemoPage>
      <DemoSection title="Suggestions" className="max-w-md gap-4 grid">
        <FormField label="Job title" help="Pick a suggestion or type your own.">
          <EditableSelect options={titles} placeholder="e.g. Director" />
        </FormField>
        <FormField label="Disabled" disabled>
          <EditableSelect options={titles} defaultValue="Director" />
        </FormField>
        <FormField label="With error" error="Job title is required">
          <EditableSelect options={titles} />
        </FormField>
      </DemoSection>
      <DemoSection title="Thaana" className="max-w-md gap-4 grid">
        <FormField label="މަޤާމު">
          <EditableSelect options={["ޑިރެކްޓަރ", "ޑެޕިއުޓީ ޑިރެކްޓަރ", "ޕްރޮޖެކްޓް އޮފިސަރ"]} thaana thaanaToggle />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
