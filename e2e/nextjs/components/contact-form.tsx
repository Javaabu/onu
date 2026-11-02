"use client"

import { Form, FormField, PasswordInput, SubmitButton, TextInput } from "@javaabu/onu"

export function ContactForm() {
  return (
    <Form onSubmit={async () => {}}>
      <FormField label="Name" name="name" required>
        <TextInput />
      </FormField>
      <FormField label="Password" name="password">
        <PasswordInput />
      </FormField>
      <SubmitButton>Send</SubmitButton>
    </Form>
  )
}
