import { FormField, Label, RequiredMarker, TextInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Required marker",
  group: "Form scaffolding",
  order: 5,
  description: "The * after a required field's label. Screen readers hear “required” from the control instead.",
}

export default function RequiredMarkerDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="With FormField and Label"
        description="Set required and the marker is added; the control gets required too."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Full name" required>
          <TextInput />
        </FormField>
        <div className="gap-2 grid">
          <Label htmlFor="marker-demo-island" required>
            Island
          </Label>
          <TextInput id="marker-demo-island" required />
        </div>
        <div className="gap-2 grid">
          <Label htmlFor="marker-demo-nickname" optional>
            Nickname
          </Label>
          <TextInput id="marker-demo-nickname" />
        </div>
      </DemoSection>

      <DemoSection title="Custom label" className="max-w-md gap-2 grid">
        <label htmlFor="marker-demo-phone" className="gap-1 text-sm font-medium flex">
          Mobile number <RequiredMarker />
        </label>
        <TextInput id="marker-demo-phone" type="tel" required aria-required="true" />
      </DemoSection>

      <DemoSection title="Other symbols" className="gap-6 text-sm flex flex-wrap items-center">
        <span>
          Default <RequiredMarker />
        </span>
        <span>
          Text <RequiredMarker symbol="(required)" className="text-xs" />
        </span>
        <span dir="rtl" lang="dv">
          ނަން <RequiredMarker />
        </span>
      </DemoSection>
    </DemoPage>
  )
}
