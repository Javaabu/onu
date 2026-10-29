import { FormField, RadioGroup, type RadioGroupOption } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Radio group",
  group: "Choice inputs",
  order: 10,
  description: "Default, card and image variants, vertical or horizontal. Arrow keys follow RTL.",
}

const delivery = [
  { value: "post", label: "Post", description: "Collect from the post office" },
  { value: "courier", label: "Courier", description: "Delivered to your door", aside: "MVR 50" },
  { value: "counter", label: "Service counter", description: "Hulhumalé, Monday to Thursday", disabled: true },
]

/** Inline SVG swatches so the demo works offline. */
function swatch(from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/></svg>`
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, alt: "" }
}

const themes: RadioGroupOption[] = [
  { value: "lagoon", label: "Lagoon", image: swatch("#7dd3fc", "#0e7490"), description: "Turquoise" },
  { value: "reef", label: "Reef", image: swatch("#fda4af", "#be123c") },
  { value: "sandbank", label: "Sandbank", image: swatch("#fef3c7", "#d97706") },
  { value: "palm", label: "Palm", image: swatch("#bbf7d0", "#15803d") },
  { value: "monsoon", label: "Monsoon", image: swatch("#cbd5e1", "#334155"), disabled: true },
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
      <DemoSection
        title="Images"
        description="Tiles fit the container width; all arrow keys move between them."
        className="max-w-2xl gap-6 grid w-full"
      >
        <FormField label="Portal theme">
          <RadioGroup options={themes} variant="image" defaultValue="lagoon" />
        </FormField>
        <FormField label="Wide tiles">
          <RadioGroup options={themes} variant="image" aspectRatio="video" minItemWidth="10rem" />
        </FormField>
        <FormField label="Labels hidden visually" error="Choose a colour">
          <RadioGroup options={themes} variant="image" minItemWidth="4rem" classNames={{ label: "sr-only" }} />
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
