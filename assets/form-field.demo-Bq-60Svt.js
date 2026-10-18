var e=`import { FormErrorsProvider, FormField, FormLayoutProvider, TextInput, Textarea } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Form field",
  group: "Form scaffolding",
  description: "Label, control, help text and errors, with stacked or inline labels.",
}

export default function FormFieldDemo() {
  return (
    <DemoPage>
      <DemoSection title="Stacked (default)" className="max-w-md gap-4 grid">
        <FormField label="Full name" help="As shown on your ID card." required>
          <TextInput placeholder="Ahmed Ali" />
        </FormField>
        <FormField
          label="Email"
          labelAside={
            <a className="text-primary underline-offset-4 hover:underline" href="#why">
              Why?
            </a>
          }
        >
          <TextInput type="email" placeholder="you@example.com" />
        </FormField>
      </DemoSection>

      <DemoSection
        title="Inline labels"
        description="Falls back to stacked when the container is narrow."
        className="gap-4 grid"
      >
        <FormLayoutProvider labelLayout="inline">
          <FormField label="Full name" required>
            <TextInput />
          </FormField>
          <FormField label="Bio" help="A few words about you.">
            <Textarea />
          </FormField>
        </FormLayoutProvider>
      </DemoSection>

      <DemoSection title="Errors from a Laravel 422 response" className="max-w-md gap-4 grid">
        <FormErrorsProvider
          errors={{ email: ["The email has already been taken."], "items.0.name": "The name field is required." }}
        >
          <FormField label="Email" name="email">
            <TextInput defaultValue="ali@example.com" />
          </FormField>
          <FormField label="Item name" name="items[0][name]">
            <TextInput />
          </FormField>
        </FormErrorsProvider>
      </DemoSection>

      <DemoSection title="Disabled" className="max-w-md gap-4 grid">
        <FormField label="Reference" disabled>
          <TextInput defaultValue="APP-2026-0042" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};