var e=`import * as React from "react"
import { FormField, NumberInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Number input",
  group: "Text inputs",
  order: 6,
  description: "Locale formatting, min/max/step, arrow keys; the scroll wheel never changes it.",
}

export default function NumberInputDemo() {
  const [amount, setAmount] = React.useState<number | null>(12500)
  return (
    <DemoPage>
      <DemoSection
        title="Formatting"
        description="Formatted when you leave the field, raw while you edit. ↑/↓ step, Page Up/Down step by 10."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Amount (MVR)" help={\`Value: \${amount ?? "empty"}\`}>
          <NumberInput
            value={amount}
            onValueChange={setAmount}
            min={0}
            step={0.01}
            formatOptions={{ style: "currency", currency: "MVR" }}
          />
        </FormField>
        <FormField label="Population">
          <NumberInput defaultValue={211908} min={0} />
        </FormField>
        <FormField label="GST rate">
          <NumberInput defaultValue={0.08} min={0} max={1} step={0.01} formatOptions={{ style: "percent" }} />
        </FormField>
      </DemoSection>
      <DemoSection title="Limits and states" className="max-w-md gap-4 grid">
        <FormField label="Guests (1–30)">
          <NumberInput defaultValue={2} min={1} max={30} />
        </FormField>
        <FormField label="ބަރު (ކިލޯ)">
          <NumberInput defaultValue={23.5} step={0.5} min={0} endAddon="kg" />
        </FormField>
        <FormField label="Disabled">
          <NumberInput defaultValue={42} disabled />
        </FormField>
        <FormField label="With error" error="Must be 18 or over">
          <NumberInput defaultValue={16} min={0} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};