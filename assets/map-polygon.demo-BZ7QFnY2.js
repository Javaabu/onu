var e=`import * as React from "react"
import { FormField } from "@javaabu/onu"
import { MapPolygon, type PolygonCollection } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { ZONES } from "./_data"

export const meta = {
  title: "Map polygon",
  group: "Maps",
  order: 3,
  description:
    "Draw and edit polygons (terra-draw on Google Maps). The value is GeoJSON; areas are measured with turf. Points can also be added with the keyboard.",
}

export default function MapPolygonDemo() {
  const [value, setValue] = React.useState<PolygonCollection | null>(ZONES)
  return (
    <DemoPage>
      <DemoSection title="Zones" description="Two wards in Malé. Select one to see its points." className="grid">
        <FormField label="Collection zones" name="zones">
          <MapPolygon value={value} onChange={setValue} tone="chart-2" />
        </FormField>
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">GeoJSON value</summary>
          <pre className="mt-2 max-h-56 p-3 text-xs overflow-auto rounded-md bg-muted" dir="ltr">
            {JSON.stringify(value, null, 2)}
          </pre>
        </details>
      </DemoSection>
      <DemoSection title="Single polygon, empty" className="grid">
        <FormField label="Plot boundary" required help="Draw the plot on the map, or add its corners below.">
          <MapPolygon multiple={false} center={{ lat: 4.2105, lng: 73.5402 }} zoom={16} />
        </FormField>
      </DemoSection>
      <DemoSection title="Read only" className="grid">
        <FormField label="Approved zones" disabled>
          <MapPolygon defaultValue={ZONES} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};