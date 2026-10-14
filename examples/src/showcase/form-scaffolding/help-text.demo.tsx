import { FormField, HelpText, Label, TextInput, ThaanaInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Help text",
  group: "Form scaffolding",
  order: 4,
  description: "Supporting text under a control, linked to it with aria-describedby.",
}

export default function HelpTextDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="With FormField"
        description="The help prop renders HelpText and links it to the control."
        className="max-w-md gap-4 grid"
      >
        <FormField label="National ID" help="As shown on your ID card, e.g. A123456.">
          <TextInput placeholder="A123456" />
        </FormField>
        <FormField label="Email" help="We send the receipt here." error="The email must be a valid email address.">
          <TextInput type="email" defaultValue="aishath@" />
        </FormField>
      </DemoSection>

      <DemoSection
        title="Custom layout"
        description="Give HelpText an id and reference it from the control."
        className="max-w-md gap-2 grid"
      >
        <Label htmlFor="help-demo-username">Username</Label>
        <input
          id="help-demo-username"
          aria-describedby="help-demo-username-help"
          className="h-9 px-3 text-sm rounded-md border bg-background"
        />
        <HelpText id="help-demo-username-help">Letters, numbers and dashes. You can change it later.</HelpText>
      </DemoSection>

      <DemoSection title="Dhivehi" className="max-w-md gap-4 grid">
        <div dir="rtl" lang="dv" className="gap-4 grid">
          <FormField label="ނަން" help="ކާޑުގައި ލިޔެވިފައިވާ ގޮތަށް">
            <ThaanaInput />
          </FormField>
        </div>
      </DemoSection>
    </DemoPage>
  )
}
