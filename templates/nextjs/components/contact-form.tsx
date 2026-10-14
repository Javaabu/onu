"use client"

import { Callout, Form, FormField, SubmitButton, Textarea, TextInput } from "@javaabu/onu"
import { useState } from "react"

import { sendContactMessage } from "@/app/actions"
import type { Messages } from "@/lib/locale"

/**
 * A client component: `Form` takes an `onSubmit` function. Throwing the Server
 * Action's Laravel-shaped `{ message, errors }` puts each error under its field,
 * focuses the first one and shows the error summary.
 */
export function ContactForm({ t }: { t: Messages }) {
  const [sent, setSent] = useState(false)

  return (
    <Form
      className="gap-4 flex flex-col"
      onSubmit={async (values) => {
        setSent(false)
        const result = await sendContactMessage(values as Record<string, unknown>)
        if (!result.ok) throw result
        setSent(true)
      }}
    >
      {sent && <Callout variant="success" title={t.sent} />}
      <FormField label={t.name} name="name" required>
        <TextInput autoComplete="name" />
      </FormField>
      <FormField label={t.email} name="email" required>
        <TextInput type="email" autoComplete="email" dir="ltr" />
      </FormField>
      <FormField label={t.message} name="message" required>
        <Textarea rows={4} />
      </FormField>
      <div>
        <SubmitButton>{t.send}</SubmitButton>
      </div>
    </Form>
  )
}
