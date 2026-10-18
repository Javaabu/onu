var e=`import * as React from "react"
import { FormField, PhoneInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Phone input",
  group: "Text inputs",
  order: 9,
  description: "Country picker (Maldives by default), formatting as you type, E.164 value.",
}

export default function PhoneInputDemo() {
  const [phone, setPhone] = React.useState<string | undefined>("+9607771234")
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Mobile number" help={\`Value: \${phone ?? "—"}\`}>
          <PhoneInput value={phone} onValueChange={setPhone} />
        </FormField>
        <FormField label="ފޯނު ނަންބަރު">
          <PhoneInput placeholder="777-1234" />
        </FormField>
      </DemoSection>
      <DemoSection title="Options" className="max-w-md gap-4 grid">
        <FormField label="South Asia only">
          <PhoneInput countries={["MV", "LK", "IN", "BD", "PK", "NP"]} defaultValue="+94771234567" />
        </FormField>
        <FormField label="International format">
          <PhoneInput international defaultValue="+9603001234" />
        </FormField>
        <FormField label="No country picker">
          <PhoneInput countrySelect={false} />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled">
          <PhoneInput disabled defaultValue="+9603331234" />
        </FormField>
        <FormField label="With error" error="Enter a valid Maldivian mobile number">
          <PhoneInput defaultValue="+960123" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};