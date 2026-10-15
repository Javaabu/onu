import * as React from "react"
import { FormField, QuantityStepper } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Quantity stepper",
  group: "Text inputs",
  order: 7,
  description: "Large − and + buttons with press-and-hold repeat.",
}

const PRICE = 75

export default function QuantityStepperDemo() {
  const [tickets, setTickets] = React.useState(1)
  return (
    <DemoPage>
      <DemoSection title="Ferry tickets" className="max-w-md gap-4 grid">
        <FormField
          label="Tickets (Malé → Hulhumalé)"
          help={`MVR ${(tickets * PRICE).toLocaleString("en")} · hold + to add quickly`}
        >
          <QuantityStepper value={tickets} onValueChange={setTickets} min={1} max={20} />
        </FormField>
      </DemoSection>
      <DemoSection title="Sizes" className="gap-4 grid">
        <QuantityStepper aria-label="Small" size="sm" defaultValue={2} />
        <QuantityStepper aria-label="Default" defaultValue={2} />
        <QuantityStepper aria-label="Large (kiosk)" size="lg" defaultValue={2} />
      </DemoSection>
      <DemoSection title="States" className="max-w-md gap-4 grid">
        <FormField label="ކޮޕީ (5 ގެ ގޮތުގައި)">
          <QuantityStepper defaultValue={10} step={5} max={50} />
        </FormField>
        <FormField label="Disabled">
          <QuantityStepper defaultValue={3} disabled />
        </FormField>
        <FormField label="With error" error="Only 4 seats left">
          <QuantityStepper defaultValue={6} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
