import * as React from "react"
import { FormField, TextInput, Textarea, ThaanaToggle } from "@javaabu/onu"
import { useThaanaInput } from "@javaabu/onu/thaana"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Thaana toggle",
  group: "Text inputs",
  order: 13.5,
  description: "Switches a field between Thaana and Latin typing (also Alt+Shift+T), and announces the change.",
}

function CustomField() {
  const ref = React.useRef<HTMLInputElement>(null)
  const { enabled, toggle } = useThaanaInput(ref)
  return (
    <div className="gap-2 flex items-center">
      <input
        ref={ref}
        aria-label="Reference"
        dir={enabled ? "rtl" : "auto"}
        lang={enabled ? "dv" : undefined}
        className="h-9 px-3 text-sm min-w-0 flex-1 rounded-md border bg-background"
      />
      <ThaanaToggle enabled={enabled} onToggle={toggle} />
    </div>
  )
}

export default function ThaanaToggleDemo() {
  const [enabled, setEnabled] = React.useState(true)
  return (
    <DemoPage>
      <DemoSection
        title="In text inputs"
        description="thaanaToggle adds the button inside the field. Type “dhivehi”, then switch to Latin."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Name">
          <TextInput thaana thaanaToggle />
        </FormField>
        <FormField label="Address">
          <Textarea thaana thaanaToggle />
        </FormField>
      </DemoSection>

      <DemoSection
        title="Custom field"
        description="Use the button with useThaanaInput on your own elements."
        className="max-w-md gap-4 grid"
      >
        <CustomField />
      </DemoSection>

      <DemoSection title="States" description={enabled ? "Thaana is on" : "Latin is on"}>
        <ThaanaToggle enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <ThaanaToggle enabled={false} onToggle={() => {}} disabled />
      </DemoSection>
    </DemoPage>
  )
}
