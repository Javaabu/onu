import * as React from "react"
import {
  Fieldset,
  Form,
  FormField,
  FormGroup,
  SaveBar,
  SubmitButton,
  TextInput,
  Textarea,
  ValidationError,
  describeChanges,
} from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Save buttons bar",
  group: "Form scaffolding",
  order: 13,
  description:
    "The edit-page save bar (§25.9): plain-words change list, Save/Discard, sticky side panel on desktop, fixed bar on phones, unsaved-changes guard.",
}

const initial = {
  name: "Jane Doe",
  email: "jane@example.mv",
  role: "Viewer",
  island: "Malé",
}

const labels = { name: "Name", email: "Email", role: "Role", island: "Island" }

const questions = [
  "Name of the business",
  "Registration number",
  "Island",
  "Address",
  "Contact person",
  "Phone",
  "Email",
  "Number of employees",
  "Opening hours",
  "Website",
]

export default function SaveBarDemo() {
  const [saved, setSaved] = React.useState(initial)
  const [values, setValues] = React.useState(initial)
  const changes = describeChanges(saved, values, labels)
  const set = (key: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  return (
    <DemoPage>
      <DemoSection
        title="Edit user"
        description="Change a field. Use an email ending in @taken.mv to see the error path. Try the link below with unsaved changes."
        className="grid"
      >
        <Form
          onSubmit={async () => {
            await new Promise((r) => setTimeout(r, 1000))
            if (values.email.endsWith("@taken.mv")) {
              throw new ValidationError({ email: ["The email has already been taken."] })
            }
            setSaved(values)
          }}
          className="w-full"
        >
          <div className="gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start grid">
            <div className="gap-6 min-w-0 grid">
              <Fieldset legend="Profile" variant="card">
                <FormGroup columns={2}>
                  <FormField label="Name" name="name">
                    <TextInput value={values.name} onChange={set("name")} />
                  </FormField>
                  <FormField label="Email" name="email">
                    <TextInput type="email" dir="ltr" value={values.email} onChange={set("email")} />
                  </FormField>
                </FormGroup>
              </Fieldset>
              <Fieldset legend="Access" variant="card">
                <FormGroup columns={2}>
                  <FormField label="Role" name="role">
                    <TextInput value={values.role} onChange={set("role")} />
                  </FormField>
                  <FormField label="Island" name="island">
                    <TextInput value={values.island} onChange={set("island")} />
                  </FormField>
                </FormGroup>
              </Fieldset>
              <p className="text-sm">
                <a className="text-primary underline" href="#/components/form-scaffolding/form">
                  Go to another page
                </a>
              </p>
            </div>
            <SaveBar changes={changes} onDiscard={() => setValues(saved)} successMessage="User saved" />
          </div>
        </Form>
      </DemoSection>
      <DemoSection
        title="Floating"
        description='layout="floating": a Submit button floats while the main one is scrolled out of view. Here it is sticky to this form; by default it is fixed to the screen.'
        className="max-w-xl grid"
      >
        <Form onSubmit={() => new Promise((r) => setTimeout(r, 1200))}>
          {questions.map((q) => (
            <FormField key={q} label={q}>
              <TextInput />
            </FormField>
          ))}
          <FormField label="Anything else?">
            <Textarea />
          </FormField>
          <div>
            <SubmitButton startIcon="send">Submit application</SubmitButton>
          </div>
          <SaveBar layout="floating" saveLabel="Submit" className="sticky flex justify-end" />
        </Form>
      </DemoSection>
    </DemoPage>
  )
}
