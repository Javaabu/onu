import { FormField, MultipleFileInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Multiple file input", group: "Files and media", order: 2 }

export default function MultipleFileInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="With limits" className="max-w-md gap-4 grid">
        <FormField label="Tender documents" help="Each pick adds to the list; duplicates are skipped.">
          <MultipleFileInput accept=".pdf,.xlsx,.docx" maxFiles={5} maxSize={10 * 1024 * 1024} />
        </FormField>
      </DemoSection>
      <DemoSection title="Images, no limit hint" className="max-w-md gap-4 grid">
        <FormField label="Site photos">
          <MultipleFileInput accept="image/*" showLimits={false} />
        </FormField>
        <FormField label="Disabled" disabled>
          <MultipleFileInput maxFiles={3} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
