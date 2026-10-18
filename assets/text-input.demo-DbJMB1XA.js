var e=`import { FormField, Icon, TextInput } from "@javaabu/onu"

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
        <FormField label="Typewriter layout">
          <TextInput thaana={{ keymap: "typewriter" }} thaanaToggle />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};