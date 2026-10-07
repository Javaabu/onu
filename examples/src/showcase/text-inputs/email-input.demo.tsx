import { EmailInput, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Email input",
  group: "Text inputs",
  order: 2,
  description: "Email keyboard on phones, browser autofill, always LTR.",
}

export default function EmailInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Email" help="We send the receipt here.">
          <EmailInput placeholder="aishath@example.mv" />
        </FormField>
        <FormField label="Work email">
          <EmailInput showIcon placeholder="ahmed.ali@javaabu.com" />
        </FormField>
      </DemoSection>
      <DemoSection
        title="On a Dhivehi form"
        description="The label is Thaana, but the address is still typed LTR."
        className="max-w-md gap-4 grid"
      >
        <FormField label="އީމެއިލް" required>
          <EmailInput showIcon defaultValue="mariyam@gov.mv" />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled">
          <EmailInput disabled defaultValue="info@example.mv" />
        </FormField>
        <FormField label="With error" error="Enter a valid email address">
          <EmailInput defaultValue="hassan@" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
