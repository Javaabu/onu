import * as React from "react"
import { FormField } from "@javaabu/onu"
import { RouteStopEditor, type RouteStop } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { JAVAABU_OFFICE } from "./_data"

export const meta = {
  title: "Route stop editor",
  group: "Maps",
  order: 11,
  description:
    "An ordered list of stops synced with numbered markers. Drag the handle (or use the arrow buttons) to reorder.",
}

const initial: RouteStop[] = [
  { id: "a", label: "Malé ferry terminal", position: { lat: 4.1757, lng: 73.5166 } },
  { id: "b", label: "Hulhulé airport", position: { lat: 4.1918, lng: 73.5291 } },
  { id: "c", label: "ހުޅުމާލެ", position: { lat: 4.2105, lng: 73.5402 } },
  { id: "d", label: "Villimalé", position: null },
]

export default function RouteStopEditorDemo() {
  const [stops, setStops] = React.useState(initial)
  return (
    <DemoPage>
      <DemoSection
        title="Shuttle route"
        description="Click the map to add a stop. Submits stops[0][label], stops[0][lat], stops[0][lng], …"
        className="block"
      >
        <FormField label="Shuttle stops" name="stops">
          <RouteStopEditor value={stops} onChange={setStops} name="stops" max={8} />
        </FormField>
      </DemoSection>
      <DemoSection title="Empty, Thaana names" className="block">
        <RouteStopEditor center={JAVAABU_OFFICE} zoom={14} thaana />
      </DemoSection>
      <DemoSection title="Disabled" className="block">
        <RouteStopEditor defaultValue={initial.slice(0, 3)} disabled />
      </DemoSection>
    </DemoPage>
  )
}
