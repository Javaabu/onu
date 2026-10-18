var e=`import * as React from "react"
import { Checkbox, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Checkbox",
  group: "Choice inputs",
  order: 8,
  description: "shadcn's checkbox with a label, description and an indeterminate state.",
}

const services = ["Water", "Electricity", "Sewerage"]

export default function CheckboxDemo() {
  const [picked, setPicked] = React.useState<string[]>(["Water"])
  const all = picked.length === services.length
  return (
    <DemoPage>
      <DemoSection title="Label and description" className="max-w-md gap-4 grid">
        <Checkbox label="Send me SMS updates" description="We text you when your application status changes." />
        <Checkbox label="I accept the terms and conditions" defaultChecked />
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled and checked" disabled defaultChecked />
      </DemoSection>
      <DemoSection title="Indeterminate (select all)" className="max-w-md gap-3 grid">
        <Checkbox
          label="All utilities"
          checked={all}
          indeterminate={!all && picked.length > 0}
          onCheckedChange={() => setPicked(all ? [] : services)}
        />
        <div className="ps-6 gap-3 grid">
          {services.map((s) => (
            <Checkbox
              key={s}
              label={s}
              checked={picked.includes(s)}
              onCheckedChange={(c) => setPicked((p) => (c ? [...p, s] : p.filter((x) => x !== s)))}
            />
          ))}
        </div>
      </DemoSection>
      <DemoSection title="Sizes, form field and Dhivehi" className="max-w-md gap-4 grid">
        <div className="gap-4 flex items-center">
          <Checkbox aria-label="Small" size="sm" defaultChecked />
          <Checkbox aria-label="Default" defaultChecked />
          <Checkbox aria-label="Large" size="lg" defaultChecked />
        </div>
        <FormField label="Consent" required error="You must agree to continue">
          <Checkbox label="I confirm the information is correct" />
        </FormField>
        <Checkbox label="ޝަރުތުތައް ގަބޫލުކުރަން" description="ތިރީގައިވާ ޝަރުތުތައް ކިޔައި ގަބޫލުކުރަން." />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};