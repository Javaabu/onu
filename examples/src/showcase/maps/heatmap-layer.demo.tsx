import * as React from "react"
import { Label, Slider } from "@javaabu/onu"
import { HEATMAP_TONES, HeatmapLayer, MapLegend, MapView, toneVar } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { incidents } from "./_data"

export const meta = {
  title: "Heatmap layer",
  group: "Maps",
  order: 12,
  description: "A density heatmap drawn with deck.gl's HeatmapLayer (Google's own heatmap is deprecated).",
}

const points = incidents()

export default function HeatmapLayerDemo() {
  const [radius, setRadius] = React.useState(30)
  const id = React.useId()
  return (
    <DemoPage>
      <DemoSection
        title="Reported incidents"
        description="Weights 1–5. The layer adds a screen-reader summary; pair it with a table for detail."
        className="grid"
      >
        <MapView
          center={{ lat: 4.192, lng: 73.52 }}
          zoom={13}
          overlay={
            <MapLegend
              className="top-14 start-2 p-2 shadow-sm absolute z-30 rounded-md border bg-background/90"
              items={[{ label: "Low → high", shape: "gradient", colors: HEATMAP_TONES.map(toneVar) }]}
            />
          }
        >
          <HeatmapLayer points={points} radius={radius} />
        </MapView>
        <div className="gap-2 max-w-xs grid">
          <Label htmlFor={id}>Radius: {radius}px</Label>
          <Slider id={id} min={10} max={60} step={5} value={[radius]} onValueChange={([v]) => setRadius(v ?? 30)} />
        </div>
      </DemoSection>
    </DemoPage>
  )
}
