import { FormField, TextInput, ValidationSummary } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "AJAX validation errors",
  group: "Form scaffolding",
  order: 7,
  description: "An error summary that accepts Laravel's 422 payload; every error links to its field.",
}

const response = {
  message: "The email has already been taken. (and 2 more errors)",
  errors: {
    email: ["The email has already been taken."],
    "contacts.0.phone": ["The contact phone must be 7 digits."],
    id_card: ["The ID card number format is invalid."],
  },
}

export default function ValidationSummaryDemo() {
  return (
    <DemoPage>
      <DemoSection title="Laravel 422 payload" className="max-w-xl gap-4 grid">
        <form className="gap-4 grid" onSubmit={(e) => e.preventDefault()}>
          <ValidationSummary errors={response} />
          <FormField label="Email" name="email" error={response.errors.email}>
            <TextInput defaultValue="ali@example.mv" dir="ltr" />
          </FormField>
          <FormField label="ID card" name="id_card" error={response.errors.id_card}>
            <TextInput defaultValue="A12345" dir="ltr" />
          </FormField>
          <FormField label="Contact phone" name="contacts[0][phone]" error={response.errors["contacts.0.phone"]}>
            <TextInput type="tel" defaultValue="77712" dir="ltr" />
          </FormField>
        </form>
      </DemoSection>

      <DemoSection title="With field labels and a custom title" className="max-w-xl grid">
        <ValidationSummary
          title="Please check your application"
          errors={{ island: "Select an island.", reason: "Tell us why you are applying." }}
          labels={{ island: "Island", reason: "Reason" }}
        />
      </DemoSection>

      <DemoSection title="General error" className="max-w-xl grid">
        <ValidationSummary message="The server is not responding. Try again in a few minutes." />
      </DemoSection>

      <DemoSection title="ދިވެހިން" className="max-w-xl grid">
        <div lang="dv" dir="rtl">
          <ValidationSummary errors={{ name: "ނަން ލިޔުއްވާ", address: "އެޑްރެސް ލިޔުއްވާ" }} />
        </div>
      </DemoSection>
    </DemoPage>
  )
}
