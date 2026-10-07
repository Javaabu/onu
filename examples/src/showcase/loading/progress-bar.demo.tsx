import * as React from "react"
import { Button, ProgressBar } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Progress bar",
  group: "Loading",
  order: 6,
  description: "Determinate or indeterminate, with label and value text, in semantic colours. Mirrored in RTL.",
}

export default function ProgressBarDemo() {
  const [value, setValue] = React.useState(35)
  return (
    <DemoPage>
      <DemoSection title="Determinate" className="max-w-md gap-4 grid">
        <ProgressBar label="Uploading permit-2041.pdf" value={value} />
        <div className="gap-2 flex">
          <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, v - 10))}>
            −10
          </Button>
          <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.min(100, v + 10))}>
            +10
          </Button>
        </div>
        <ProgressBar
          label="Files imported"
          value={7}
          max={12}
          formatValue={(v, max) => `${v} of ${max}`}
          color="info"
        />
        <ProgressBar aria-label="Quota" value={60} size="sm" />
      </DemoSection>
      <DemoSection title="Colours and sizes" className="max-w-md gap-4 grid">
        <ProgressBar label="Budget used" value={42} color="success" size="lg" />
        <ProgressBar label="Storage" value={78} color="warning" />
        <ProgressBar label="Leave balance used" value={96} color="destructive" size="sm" />
      </DemoSection>
      <DemoSection title="Indeterminate" className="max-w-md gap-4 grid">
        <ProgressBar label="Preparing export…" />
        <ProgressBar aria-label="Loading" size="sm" color="muted" />
      </DemoSection>
      <DemoSection title="ދިވެހި" className="max-w-md gap-4 grid">
        <ProgressBar label="ފައިލު އަޕްލޯޑުކުރަނީ" value={64} />
      </DemoSection>
    </DemoPage>
  )
}
