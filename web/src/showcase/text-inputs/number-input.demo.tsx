import * as React from "react"
import { FormField, NumberInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Number input",
  group: "Text inputs",
  order: 6,
  description: "Locale formatting, min/max/step, arrow keys, units and a stepper; the scroll wheel never changes it.",
}

const LENGTH_UNITS = [
  { value: "m", label: "m" },
  { value: "km", label: "km" },
  { value: "nmi", label: "nmi" },
]
const CURRENCIES = [
  { value: "MVR", label: "MVR" },
  { value: "USD", label: "USD" },
]
const TICKET_PRICE = 75

export default function NumberInputDemo() {
  const [amount, setAmount] = React.useState<number | null>(12500)
  const [tickets, setTickets] = React.useState(1)
  return (
    <DemoPage>
      <DemoSection
        title="Formatting"
        description="Formatted when you leave the field, raw while you edit. ↑/↓ step, Page Up/Down step by 10."
        className="max-w-md gap-4 grid"
      >
        <FormField label="Amount (MVR)" help={`Value: ${amount ?? "empty"}`}>
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
          <NumberInput defaultValue={23.5} step={0.5} min={0} unit="kg" />
        </FormField>
        <FormField label="Disabled">
          <NumberInput defaultValue={42} disabled />
        </FormField>
        <FormField label="With error" error="Must be 18 or over">
          <NumberInput defaultValue={16} min={0} />
        </FormField>
      </DemoSection>
      <DemoSection title="Units" description="A fixed unit, or a unit select." className="max-w-md gap-4 grid">
        <FormField label="Luggage weight">
          <NumberInput unit="kg" defaultValue={23} min={0} />
        </FormField>
        <FormField label="Fee">
          <NumberInput unit="MVR" unitPosition="start" defaultValue={1500} min={0} step={0.01} />
        </FormField>
        <FormField label="Distance to the airport">
          <NumberInput units={LENGTH_UNITS} defaultUnit="km" defaultValue={2.5} step={0.1} min={0} />
        </FormField>
        <FormField label="އަގު">
          <NumberInput units={CURRENCIES} unitPosition="start" defaultValue={750} min={0} />
        </FormField>
        <FormField label="Disabled unit select">
          <NumberInput units={LENGTH_UNITS} defaultValue={12} disabled />
        </FormField>
      </DemoSection>
      <DemoSection
        title="Stepper"
        description="Large − and + buttons; hold one to repeat."
        className="max-w-md gap-4 grid"
      >
        <FormField
          label="Tickets (Malé → Hulhumalé)"
          help={`MVR ${(tickets * TICKET_PRICE).toLocaleString("en")} · hold + to add quickly`}
        >
          <NumberInput stepper value={tickets} onValueChange={setTickets} min={1} max={20} />
        </FormField>
        <div className="gap-4 flex flex-wrap items-center">
          <NumberInput stepper aria-label="Small" size="sm" defaultValue={2} />
          <NumberInput stepper aria-label="Default" defaultValue={2} />
          <NumberInput stepper aria-label="Large (kiosk)" size="lg" defaultValue={2} />
        </div>
        <FormField label="ކޮޕީ (5 ގެ ގޮތުގައި)">
          <NumberInput stepper defaultValue={10} step={5} max={50} />
        </FormField>
        <FormField label="Disabled stepper">
          <NumberInput stepper defaultValue={3} disabled />
        </FormField>
        <FormField label="Stepper with error" error="Only 4 seats left">
          <NumberInput stepper defaultValue={6} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
