import { FileInput, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "File input", group: "Files and media", order: 1 }

export default function FileInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="National ID card" help="PDF or image, up to 2 MB." name="id_card" required>
          <FileInput accept=".pdf,image/*" maxSize={2 * 1024 * 1024} />
        </FormField>
        <FormField label="Supporting documents" help="Choose several at once.">
          <FileInput multiple accept=".pdf,.docx" />
        </FormField>
      </DemoSection>
      <DemoSection title="Sizes" className="max-w-md gap-4 grid">
        <FileInput aria-label="Small" size="sm" />
        <FileInput aria-label="Default" />
        <FileInput aria-label="Large" size="lg" />
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled" disabled>
          <FileInput />
        </FormField>
        <FormField label="With a server error" error="The trade licence field is required.">
          <FileInput />
        </FormField>
        <FormField label="Photos only, 200 KB max" help="Try a larger file or a PDF to see the messages.">
          <FileInput accept="image/*" maxSize={200 * 1024} multiple />
        </FormField>
      </DemoSection>
      <DemoSection
        title="ދިވެހި"
        className="max-w-md gap-4 grid"
        description="Switch the locale to Dhivehi in the toolbar."
      >
        <FormField label="ކާޑުގެ ކޮޕީ">
          <FileInput accept="image/*,.pdf" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
