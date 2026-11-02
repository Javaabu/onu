var e=`import * as React from "react"
import { ColorPicker, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Colour picker",
  group: "Text inputs",
  order: 17,
  description: "Area, hue slider, hex field and presets. Opens as a bottom sheet on phones.",
}

export default function ColorPickerDemo() {
  const [colour, setColour] = React.useState<string | null>("#1f7a4d")
  return (
    <DemoPage>
      <DemoSection title="Basic" className="max-w-md gap-4 grid">
        <FormField label="Brand colour" help={\`Value: \${colour ?? "none"}\`}>
          <ColorPicker value={colour} onValueChange={setColour} />
        </FormField>
        <div
          className="h-12 rounded-lg border border-border"
          style={{ backgroundColor: colour ?? undefined }}
          aria-hidden="true"
        />
      </DemoSection>
      <DemoSection title="Options" className="max-w-md gap-4 grid">
        <FormField label="Category colour" help="Custom presets">
          <ColorPicker presets={["#0f766e", "#0369a1", "#7c3aed", "#be123c", "#ca8a04", "#4d7c0f"]} />
        </FormField>
        <FormField label="ކުލަ">
          <ColorPicker defaultValue="#dc2626" presets={[]} />
        </FormField>
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="Disabled">
          <ColorPicker defaultValue="#2563eb" disabled />
        </FormField>
        <FormField label="With error" error="Choose a colour with more contrast">
          <ColorPicker defaultValue="#fef9c3" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};