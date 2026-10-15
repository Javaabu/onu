import * as React from "react"
import { FormField, Rating } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Rating",
  group: "Choice inputs",
  order: 14,
  description: "Stars with half steps, keyboard (arrows, Home/End, numbers) and a read-only mode.",
}

export default function RatingDemo() {
  const [value, setValue] = React.useState(3.5)
  return (
    <DemoPage>
      <DemoSection title="Interactive" className="max-w-md gap-4 grid">
        <FormField label="How was the service at the counter?" help={`Value: ${value}`}>
          <Rating value={value} onValueChange={setValue} allowHalf />
        </FormField>
        <FormField label="Large (kiosk)">
          <Rating size="lg" defaultValue={4} />
        </FormField>
        <FormField label="Out of 10">
          <Rating max={10} size="sm" defaultValue={7} icon="heart" />
        </FormField>
      </DemoSection>
      <DemoSection title="Read-only and disabled" className="max-w-md gap-4 grid">
        <div className="gap-2 flex items-center">
          <Rating readOnly value={4.5} size="sm" />
          <span className="text-sm text-muted-foreground">4.5 (128 reviews)</span>
        </div>
        <Rating disabled defaultValue={2} aria-label="Disabled rating" />
        <FormField label="ޚިދުމަތުގެ ފެންވަރު">
          <Rating defaultValue={3} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
