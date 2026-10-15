import { FormField, PasswordInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Password input",
  group: "Text inputs",
  order: 3,
  description: "Show/hide toggle, Caps Lock warning and an optional strength meter.",
}

export default function PasswordInputDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Sign in"
        description="Turn Caps Lock on while typing to see the warning."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Password">
          <PasswordInput placeholder="Your password" />
        </FormField>
      </DemoSection>
      <DemoSection title="New password with strength meter" className="max-w-md gap-4 grid">
        <FormField label="New password" help="At least 12 characters. Mix words, numbers and symbols.">
          <PasswordInput strength />
        </FormField>
        <FormField label="އާ ޕާސްވޯޑް">
          <PasswordInput strength defaultValue="Hulhumale-2026" />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled">
          <PasswordInput disabled defaultValue="secret" />
        </FormField>
        <FormField label="With error" error="The password is incorrect">
          <PasswordInput defaultValue="wrong" />
        </FormField>
        <FormField label="No toggle">
          <PasswordInput toggleable={false} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
