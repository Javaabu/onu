import { FloatingSubmit, Form, FormField, SubmitButton, TextInput, Textarea } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Floating submit",
  group: "Form scaffolding",
  order: 15,
  description: "A submit button that floats while the main one is scrolled out of view.",
}

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

export default function FloatingSubmitDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Long application form"
        description="Scroll: the floating Submit appears while the main button is off screen."
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
          <FloatingSubmit startIcon="send">Submit</FloatingSubmit>
        </Form>
      </DemoSection>
    </DemoPage>
  )
}
