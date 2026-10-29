import { FormField, Icon, TextInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Text input", group: "Text inputs", order: 1 }

export default function TextInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Name">
          <TextInput placeholder="Ahmed Ali" />
        </FormField>
        <FormField label="Disabled">
          <TextInput disabled defaultValue="Read only value" />
        </FormField>
      </DemoSection>
      <DemoSection title="Addons" className="max-w-md gap-4 grid">
        <FormField label="Search">
          <TextInput startAddon={<Icon name="search" />} placeholder="Search records" />
        </FormField>
        <FormField label="Amount">
          <TextInput inputMode="decimal" endAddon="MVR" placeholder="0.00" />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Thaana"
        description="Type on a Latin keyboard; Alt+Shift+T or the button switches to Latin."
        className="max-w-md gap-4 grid"
      >
        <FormField label="ނަން">
          <TextInput thaana thaanaToggle placeholder="ނަން ލިޔުއްވާ" />
        </FormField>
        <FormField label="Phonetic (Hassan Hameed)">
          <TextInput thaana={{ keymap: "phonetic-hh" }} thaanaToggle />
        </FormField>
        <FormField label="Typewriter layout">
          <TextInput thaana={{ keymap: "typewriter" }} thaanaToggle />
        </FormField>
        <FormField label="Paste converts Latin text">
          <TextInput thaana={{ paste: "transliterate" }} thaanaToggle />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Email"
        description='type="email": email keyboard on phones, browser autofill, always LTR.'
        className="max-w-md gap-4 grid"
      >
        <FormField label="Email" help="We send the receipt here.">
          <TextInput type="email" placeholder="aishath@example.mv" />
        </FormField>
        <FormField label="Work email">
          <TextInput type="email" startAddon={<Icon name="mail" />} placeholder="ahmed.ali@javaabu.com" />
        </FormField>
        <FormField label="އީމެއިލް" help="The label is Thaana, but the address is still typed LTR." required>
          <TextInput type="email" startAddon={<Icon name="mail" />} defaultValue="mariyam@gov.mv" />
        </FormField>
        <FormField label="With error" error="Enter a valid email address">
          <TextInput type="email" defaultValue="hassan@" />
        </FormField>
      </DemoSection>
      <DemoSection
        title="URL"
        description='type="url": type “javaabu.com” and leave the field to get https://. Always LTR.'
        className="max-w-md gap-4 grid"
      >
        <FormField label="Website">
          <TextInput type="url" placeholder="example.mv" />
        </FormField>
        <FormField label="ވެބްސައިޓް">
          <TextInput type="url" startAddon={<Icon name="link" />} defaultValue="https://gov.mv" />
        </FormField>
        <FormField label="Internal link" help="No protocol is added (urlProtocol={false}).">
          <TextInput type="url" urlProtocol={false} placeholder="/news/ferry-schedule" />
        </FormField>
        <FormField label="With error" error="The URL must start with https://">
          <TextInput type="url" defaultValue="ftp://files.example.mv" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
