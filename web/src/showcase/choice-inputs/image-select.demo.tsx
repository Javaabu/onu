import { FormField, ImageSelect, type ImageOption } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Image select",
  group: "Choice inputs",
  order: 17,
  description: "A grid of image options with radio (one) or checkbox (several) semantics.",
}

/** Inline SVG swatches so the demo works offline. */
function swatch(from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const themes: ImageOption[] = [
  { value: "lagoon", label: "Lagoon", src: swatch("#7dd3fc", "#0e7490"), alt: "", description: "Turquoise" },
  { value: "reef", label: "Reef", src: swatch("#fda4af", "#be123c"), alt: "" },
  { value: "sandbank", label: "Sandbank", src: swatch("#fef3c7", "#d97706"), alt: "" },
  { value: "palm", label: "Palm", src: swatch("#bbf7d0", "#15803d"), alt: "" },
  { value: "monsoon", label: "Monsoon", src: swatch("#cbd5e1", "#334155"), alt: "", disabled: true },
]

export default function ImageSelectDemo() {
  return (
    <DemoPage>
      <DemoSection title="One choice" className="max-w-2xl gap-4 grid w-full">
        <FormField label="Portal theme">
          <ImageSelect options={themes} defaultValue="lagoon" />
        </FormField>
      </DemoSection>
      <DemoSection title="Several (max 2), wide tiles" className="max-w-2xl gap-4 grid w-full">
        <FormField label="Cover images" help="Pick up to two.">
          <ImageSelect options={themes} multiple max={2} aspectRatio="video" minItemWidth="10rem" name="covers" />
        </FormField>
        <FormField label="Without labels" error="Choose a colour">
          <ImageSelect options={themes} showLabels={false} minItemWidth="4rem" />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
