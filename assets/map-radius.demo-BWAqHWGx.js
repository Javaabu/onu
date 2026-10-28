var e=`import * as React from "react"
import { FormField } from "@javaabu/onu"
import { MapRadius, type MapRadiusValue } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { JAVAABU_OFFICE } from "./_data"

export const meta = {
  title: "Map radius",
  group: "Maps",
  order: 2,
  description: "A centre and a radius, with drag handles on the map and a numeric field.",
}

export default function MapRadiusDemo() {
  const [value, setValue] = React.useState<MapRadiusValue | null>({
    center: JAVAABU_OFFICE,
    radius: 800,
  })
  return (
    <DemoPage>
      <DemoSection
        title="Delivery area"
        description="Submits area[lat], area[lng] and area[radius] in metres."
        className="grid"
      >
        <FormField label="Delivery area" name="area" help="Orders outside this circle are not accepted.">
          <MapRadius value={value} onChange={setValue} min={100} max={5000} step={50} zoom={14} />
        </FormField>
      </DemoSection>
      <DemoSection title="Empty" description="Click the map to place the centre." className="grid">
        <FormField label="Alert zone">
          <MapRadius tone="destructive" defaultRadius={1500} center={{ lat: 4.21, lng: 73.54 }} zoom={13} />
        </FormField>
      </DemoSection>
      <DemoSection title="Disabled" className="grid">
        <FormField label="Coverage" disabled>
          <MapRadius defaultValue={{ center: { lat: 3.942, lng: 73.49 }, radius: 600 }} zoom={14} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};