var e=`import * as React from "react"
import { Button, Spinner } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Spinner",
  group: "Loading",
  order: 1,
  description: "Spinning indicator with a screen-reader label (role=status).",
}

export default function SpinnerDemo() {
  const [saving, setSaving] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection title="Sizes" className="items-center">
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
        <Spinner size="xl" />
      </DemoSection>
      <DemoSection title="Tones and visible label" className="items-center">
        <Spinner tone="primary" size="lg" />
        <Spinner tone="muted" showLabel />
        <Spinner showLabel label="Fetching permits…" />
      </DemoSection>
      <DemoSection title="In a button" description="Prevents double submits while saving.">
        <Button
          disabled={saving}
          onClick={() => {
            setSaving(true)
            setTimeout(() => setSaving(false), 1500)
          }}
        >
          {saving ? <Spinner label="Saving…" /> : null}
          {saving ? "Saving…" : "Save"}
        </Button>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};