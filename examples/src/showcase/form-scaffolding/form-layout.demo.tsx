import { Fieldset, FormField, FormGroup, Label, TextInput, Textarea } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Form group, fieldset and label",
  group: "Form scaffolding",
  order: 2,
  description: "Responsive field grids, titled (and collapsible) sections and labels with required/optional markers.",
}

export default function FormLayoutDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Form group columns"
        description="Columns follow the group's own width; resize the window."
        className="grid"
      >
        <FormGroup columns={3}>
          <FormField label="First name" required>
            <TextInput defaultValue="Mohamed" />
          </FormField>
          <FormField label="Middle name">
            <TextInput />
          </FormField>
          <FormField label="Last name" required>
            <TextInput defaultValue="Ibrahim" />
          </FormField>
          <FormField label="Address" className="col-span-full">
            <TextInput defaultValue="H. Seaview, Majeedhee Magu, Malé" />
          </FormField>
        </FormGroup>
      </DemoSection>

      <DemoSection title="Fieldset variants" className="gap-6 grid">
        <Fieldset legend="Plain section" description="Default look, for simple forms.">
          <FormField label="Island">
            <TextInput defaultValue="Fuvahmulah" />
          </FormField>
        </Fieldset>
        <Fieldset legend="Card section" variant="card" labelLayout="inline">
          <FormField label="Atoll">
            <TextInput defaultValue="Gnaviyani" />
          </FormField>
          <FormField label="Notes" help="Shown to the reviewer.">
            <Textarea />
          </FormField>
        </Fieldset>
        <div className="gap-6 grid">
          <Fieldset legend="Separated 1" variant="separated">
            <FormField label="Phone">
              <TextInput type="tel" defaultValue="+960 7771234" dir="ltr" />
            </FormField>
          </Fieldset>
          <Fieldset legend="Separated 2" variant="separated">
            <FormField label="Email">
              <TextInput type="email" dir="ltr" />
            </FormField>
          </Fieldset>
        </div>
      </DemoSection>

      <DemoSection title="Collapsible and disabled sections" className="gap-6 grid">
        <Fieldset legend="Advanced settings" collapsible defaultOpen={false} variant="card">
          <FormField label="Webhook URL">
            <TextInput type="url" dir="ltr" placeholder="https://" />
          </FormField>
        </Fieldset>
        <Fieldset legend="ދިވެހި ބައި" collapsible variant="card">
          <FormField label="ނަން">
            <TextInput thaana />
          </FormField>
        </Fieldset>
        <Fieldset legend="Locked section" disabled variant="card">
          <FormField label="Licence number">
            <TextInput defaultValue="TL-2026-118" />
          </FormField>
        </Fieldset>
      </DemoSection>

      <DemoSection title="Labels" className="gap-4 flex flex-wrap items-center">
        <Label htmlFor="l1" required>
          Required
        </Label>
        <Label htmlFor="l2" optional>
          Nickname
        </Label>
        <Label htmlFor="l3" invalid>
          Invalid
        </Label>
        <input id="l1" hidden readOnly />
        <input id="l2" hidden readOnly />
        <input id="l3" hidden readOnly />
      </DemoSection>
    </DemoPage>
  )
}
