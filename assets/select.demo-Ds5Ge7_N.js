var e=`import * as React from "react"
import { FormField, Select, SelectGroup, SelectItem, SelectLabel } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { atolls } from "./_data"

export const meta = {
  title: "Select",
  group: "Choice inputs",
  order: 1,
  description: "For short lists. Pass options or compose SelectItem children.",
}

export default function SelectDemo() {
  const [atoll, setAtoll] = React.useState("K")
  return (
    <DemoPage>
      <DemoSection title="Options array" className="max-w-md gap-4 grid">
        <FormField label="Atoll" help={\`Selected: \${atoll || "none"}\`}>
          <Select options={atolls} value={atoll} onValueChange={setAtoll} clearable />
        </FormField>
        <FormField label="Gender" required>
          <Select options={["Female", "Male"]} placeholder="Select gender" />
        </FormField>
      </DemoSection>
      <DemoSection title="Children and groups" className="max-w-md gap-4 grid">
        <FormField label="Office">
          <Select placeholder="Choose an office">
            <SelectGroup>
              <SelectLabel>Malé</SelectLabel>
              <SelectItem value="hq">Head office</SelectItem>
              <SelectItem value="hulhumale">Hulhumalé branch</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Atolls</SelectLabel>
              <SelectItem value="addu">Addu City branch</SelectItem>
              <SelectItem value="kulhudhuffushi">Kulhudhuffushi branch</SelectItem>
            </SelectGroup>
          </Select>
        </FormField>
      </DemoSection>
      <DemoSection title="Sizes and states" className="max-w-md gap-4 grid">
        <Select aria-label="Small" size="sm" options={atolls} defaultValue="S" />
        <Select aria-label="Default" options={atolls} defaultValue="S" />
        <Select aria-label="Large" size="lg" options={atolls} defaultValue="S" position="popper" />
        <FormField label="Disabled" disabled>
          <Select options={atolls} defaultValue="L" />
        </FormField>
        <FormField label="With error" error="Select the atoll you live in">
          <Select options={atolls} />
        </FormField>
      </DemoSection>
      <DemoSection title="Dhivehi" className="max-w-md gap-4 grid">
        <FormField label="އަތޮޅު">
          <Select
            options={atolls.map((a) => ({ value: a.value, label: String(a.description) }))}
            placeholder="އަތޮޅެއް އިޚްތިޔާރު ކުރައްވާ"
          />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};