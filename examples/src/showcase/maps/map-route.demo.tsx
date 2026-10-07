import * as React from "react"
import { FormField, useTranslation } from "@javaabu/onu"
import { formatDistance, MapRoute, type RouteFeature } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Map route",
  group: "Maps",
  order: 4,
  description: "Draw a route as a line. The length is measured with turf.",
}

const patrol: RouteFeature = {
  type: "Feature",
  id: "patrol",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: [
      [73.5012, 4.1772],
      [73.5085, 4.1785],
      [73.5165, 4.1768],
      [73.5195, 4.1735],
      [73.5142, 4.1702],
      [73.5045, 4.1708],
    ],
  },
}

export default function MapRouteDemo() {
  const { t, locale } = useTranslation()
  const [meters, setMeters] = React.useState<number | null>(null)
  return (
    <DemoPage>
      <DemoSection title="Patrol route" description="Move points, reorder them, or remove them." className="grid">
        <FormField label="Night patrol" name="route">
          <MapRoute defaultValue={patrol} onDistanceChange={setMeters} tone="chart-4" />
        </FormField>
        {meters !== null ? (
          <p className="text-sm text-muted-foreground">
            onDistanceChange: {formatDistance(meters, t, locale.numberLocale)}
          </p>
        ) : null}
      </DemoSection>
      <DemoSection title="Empty" className="grid">
        <FormField label="Ferry line" required>
          <MapRoute center={{ lat: 4.1, lng: 73.5 }} zoom={11} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
