import { FormField, UnitInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Number with unit",
  group: "Text inputs",
  order: 8,
  description: "A number with a fixed unit or a unit select.",
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

export default function UnitInputDemo() {
  return (
    <DemoPage>
      <DemoSection title="Fixed unit" className="max-w-md gap-4 grid">
        <FormField label="Luggage weight">
          <UnitInput unit="kg" defaultValue={23} min={0} />
        </FormField>
        <FormField label="Fee">
          <UnitInput unit="MVR" unitPosition="start" defaultValue={1500} min={0} step={0.01} />
        </FormField>
        <FormField label="Discount">
          <UnitInput unit="%" defaultValue={10} min={0} max={100} />
        </FormField>
      </DemoSection>
      <DemoSection title="Unit select" className="max-w-md gap-4 grid">
        <FormField label="Distance to the airport">
          <UnitInput units={LENGTH_UNITS} defaultUnit="km" defaultValue={2.5} step={0.1} min={0} />
        </FormField>
        <FormField label="އަގު">
          <UnitInput units={CURRENCIES} unitPosition="start" defaultValue={750} min={0} />
        </FormField>
        <FormField label="Disabled">
          <UnitInput units={LENGTH_UNITS} defaultValue={12} disabled />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
