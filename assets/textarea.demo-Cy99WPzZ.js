var e=`import { FormField, Textarea } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Textarea", group: "Text inputs", order: 12 }

export default function TextareaDemo() {
  return (
    <DemoPage>
      <DemoSection title="Auto-resizing" className="max-w-md gap-4 grid">
        <FormField label="Remarks" help="Grows as you type.">
          <Textarea placeholder="Add your remarks" />
        </FormField>
      </DemoSection>
      <DemoSection title="Counter and Thaana" className="max-w-md gap-4 grid">
        <FormField label="Summary">
          <Textarea showCount maxLength={280} />
        </FormField>
        <FormField label="ތަފްސީލު">
          <Textarea thaana thaanaToggle showCount />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};