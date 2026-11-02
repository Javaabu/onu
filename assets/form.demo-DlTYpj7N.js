var e=`import * as React from "react"
import {
  Fieldset,
  Form,
  FormField,
  FormGroup,
  SubmitButton,
  TextInput,
  Textarea,
  ValidationError,
  type FormErrors,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Form",
  group: "Form scaffolding",
  order: 1,
  description:
    "Processing state, Laravel 422 errors under fields, an error summary and focus on the first invalid field.",
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function FormDemo() {
  const [result, setResult] = React.useState<string | null>(null)
  const [inertiaErrors, setInertiaErrors] = React.useState<FormErrors | null>(null)
  const [processing, setProcessing] = React.useState(false)

  return (
    <DemoPage>
      <DemoSection
        title="Async submit with server validation"
        description="Submit with an email ending in @taken.mv to get a 422 response."
        className="max-w-2xl grid"
      >
        <Form
          noValidate
          onSubmit={async (values) => {
            setResult(null)
            await wait(1200)
            const email = String(values.email ?? "")
            if (email.endsWith("@taken.mv") || !values.name) {
              throw {
                message: "The given data was invalid.",
                errors: {
                  ...(!values.name ? { name: ["The name field is required."] } : {}),
                  ...(email.endsWith("@taken.mv") ? { email: ["The email has already been taken."] } : {}),
                },
              }
            }
            setResult(\`Saved \${values.name}\`)
          }}
        >
          <FormGroup columns={2}>
            <FormField label="Full name" name="name" required>
              <TextInput placeholder="Aishath Shifa" />
            </FormField>
            <FormField label="Email" name="email" required>
              <TextInput type="email" defaultValue="shifa@taken.mv" dir="ltr" />
            </FormField>
            <FormField label="ނަން (ދިވެހިން)" name="name_dv" className="col-span-full">
              <TextInput thaana />
            </FormField>
          </FormGroup>
          <Fieldset legend="Address" description="Permanent address as registered." collapsible defaultOpen={false}>
            <FormGroup columns={2}>
              <FormField label="Island" name="island">
                <TextInput defaultValue="Hulhumalé" />
              </FormField>
              <FormField label="House" name="house">
                <TextInput defaultValue="Ma. Fehi Villa" />
              </FormField>
            </FormGroup>
          </Fieldset>
          <div className="gap-3 flex flex-wrap items-center">
            <SubmitButton startIcon="save">Save</SubmitButton>
            {result ? (
              <span role="status" className="text-sm text-success">
                {result}
              </span>
            ) : null}
          </div>
        </Form>
      </DemoSection>

      <DemoSection
        title="Controlled errors and processing (Inertia style)"
        description="errors and processing come from outside, e.g. Inertia's useForm."
        className="max-w-2xl grid"
      >
        <Form
          errors={inertiaErrors}
          processing={processing}
          labelLayout="inline"
          onSubmit={async () => {
            setProcessing(true)
            await wait(900)
            setProcessing(false)
            setInertiaErrors({ amount: "The amount must be at least MVR 100." })
          }}
        >
          <FormField label="Amount (MVR)" name="amount" help="Minimum MVR 100.">
            <TextInput inputMode="decimal" defaultValue="50" dir="ltr" />
          </FormField>
          <FormField label="Remarks" name="remarks">
            <Textarea placeholder="Optional" />
          </FormField>
          <div>
            <SubmitButton>Pay</SubmitButton>
          </div>
        </Form>
      </DemoSection>

      <DemoSection title="Throwing a ValidationError" className="max-w-2xl grid">
        <Form
          onSubmit={() => {
            throw new ValidationError({ "items.0.name": "The item name is required." })
          }}
        >
          <FormField label="First item" name="items[0][name]">
            <TextInput />
          </FormField>
          <div>
            <SubmitButton />
          </div>
        </Form>
      </DemoSection>

      <DemoSection title="Disabled" className="max-w-2xl grid">
        <Form disabled>
          <FormField label="Reference" name="ref">
            <TextInput defaultValue="APP-2026-0042" />
          </FormField>
        </Form>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};