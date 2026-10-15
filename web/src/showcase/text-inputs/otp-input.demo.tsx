import * as React from "react"
import { FormField, OtpInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "OTP input",
  group: "Text inputs",
  order: 14,
  description: "One-time codes: numeric keyboard, SMS autofill, paste, auto-submit.",
}

export default function OtpInputDemo() {
  const [code, setCode] = React.useState("")
  const [verified, setVerified] = React.useState<string | null>(null)
  return (
    <DemoPage>
      <DemoSection
        title="Verify your phone"
        description="Paste “482 913” or type six digits; the form submits itself."
        className="gap-4 grid"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setVerified(code)
          }}
        >
          <FormField
            label="Verification code"
            help={verified ? `Submitted ${verified}` : "Sent by SMS to +960 777-1234"}
          >
            <OtpInput value={code} onValueChange={setCode} autoSubmit />
          </FormField>
        </form>
      </DemoSection>
      <DemoSection title="Variants" className="gap-4 grid">
        <FormField label="Grouped (3–3)">
          <OtpInput groupSize={3} />
        </FormField>
        <FormField label="4 digits, large (kiosk)">
          <OtpInput length={4} size="lg" />
        </FormField>
        <FormField label="Voucher (letters and digits)">
          <OtpInput length={8} groupSize={4} alphanumeric size="sm" />
        </FormField>
        <FormField label="ކޯޑު">
          <OtpInput length={6} />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="gap-4 grid">
        <FormField label="Disabled">
          <OtpInput disabled defaultValue="123" />
        </FormField>
        <FormField label="With error" error="This code has expired">
          <OtpInput defaultValue="999999" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
