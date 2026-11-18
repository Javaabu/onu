import { Form, FormField, SubmitButton, TextInput } from "@javaabu/onu"

// 6.6: Enter-submit while fields are disabled during processing.
export default function FormEnterHarness() {
  return (
    <Form onSubmit={() => new Promise((resolve) => setTimeout(resolve, 400))}>
      <FormField label="Name" name="name">
        <TextInput defaultValue="Aishath" />
      </FormField>
      <SubmitButton>Save</SubmitButton>
    </Form>
  )
}
