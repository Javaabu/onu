import { FormField, RadioGroup } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Radio group",
  group: "Choice inputs",
  order: 10,
  description: "Default and card variants, vertical or horizontal. Arrow keys follow RTL.",
}

const delivery = [
  { value: "post", label: "Post", description: "Collect from the post office" },
  { value: "courier", label: "Courier", description: "Delivered to your door", aside: "MVR 50" },
  { value: "counter", label: "Service counter", description: "Hulhumalé, Monday to Thursday", disabled: true },
]

export default function RadioGroupDemo() {
  return (
    <DemoPage>
      <DemoSection title="Default" className="max-w-md gap-6 grid">
        <FormField label="Delivery method">
          <RadioGroup options={delivery} defaultValue="post" />
        </FormField>
        <FormField label="Gender" required error="Select one">
          <RadioGroup options={["Female", "Male"]} orientation="horizontal" />
        </FormField>
      </DemoSection>
      <DemoSection title="Cards" className="max-w-2xl gap-6 grid w-full">
        <FormField label="Delivery method">
          <RadioGroup options={delivery} variant="card" defaultValue="courier" />
        </FormField>
        <FormField label="Horizontal (wraps on phones)">
          <RadioGroup options={delivery} variant="card" orientation="horizontal" defaultValue="post" />
        </FormField>
        <FormField label="Large (kiosk)">
          <RadioGroup options={delivery.slice(0, 2)} variant="card" size="lg" />
        </FormField>
      </DemoSection>
      <DemoSection title="Dhivehi" className="max-w-md gap-6 grid">
        <FormField label="ޖިންސު">
          <RadioGroup options={["އަންހެން", "ފިރިހެން"]} orientation="horizontal" defaultValue="އަންހެން" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
