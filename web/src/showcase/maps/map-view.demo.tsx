import * as React from "react"
import { Button, Icon } from "@javaabu/onu"
import {
  MapCircleShape,
  MapLegend,
  MapMarker,
  MapPolygonShape,
  MapPolylineShape,
  MapView,
  polygonsToShapes,
  type MapHandle,
} from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { ISLANDS, MALE, ZONES } from "./_data"

export const meta = {
  title: "Map view",
  group: "Maps",
  order: 0,
  description:
    "The base map. Google Maps when an API key is configured, otherwise a labelled schematic preview so pages keep working.",
}

const bridge = [
  { lat: 4.1745, lng: 73.5195 },
  { lat: 4.1798, lng: 73.5262 },
  { lat: 4.1878, lng: 73.5313 },
  { lat: 4.2002, lng: 73.5352 },
]

export default function MapViewDemo() {
  const mapRef = React.useRef<MapHandle>(null)
  const [selected, setSelected] = React.useState<string | null>(null)
  const capital = ISLANDS.filter((i) => i.atoll === "MLE")
  return (
    <DemoPage>
      <DemoSection
        title="Markers and shapes"
        description="Markers with onClick are focusable buttons. Arrow keys pan and +/- zoom when the map has focus."
        className="grid"
      >
        <MapView
          center={{ lat: 4.192, lng: 73.522 }}
          zoom={13}
          mapRef={mapRef}
          overlay={
            <MapLegend
              className="top-14 start-2 p-2 shadow-sm absolute z-30 rounded-md border bg-background/90"
              items={[
                { label: "Ward", shape: "area", tone: "chart-2" },
                { label: "Sinamalé Bridge", shape: "line", tone: "chart-3" },
                { label: "Island", shape: "pin", tone: "primary" },
              ]}
            />
          }
        >
          {polygonsToShapes(ZONES).map((z) => (
            <MapPolygonShape key={z.id} path={z.path} tone="chart-2" />
          ))}
          <MapPolylineShape path={bridge} tone="chart-3" width={5} />
          <MapCircleShape center={MALE} radius={400} tone="warning" />
          {capital.map((i) => (
            <MapMarker
              key={i.value}
              position={i.position!}
              title={`${i.label} (${i.dvLabel})`}
              selected={selected === i.value}
              onClick={() => setSelected(selected === i.value ? null : i.value)}
            />
          ))}
        </MapView>
        <div className="gap-2 flex flex-wrap">
          {capital.map((i) => (
            <Button key={i.value} variant="outline" size="sm" onClick={() => mapRef.current?.panTo(i.position!, 15)}>
              <Icon name="map-pin" />
              {i.label}
            </Button>
          ))}
        </div>
      </DemoSection>
      <DemoSection title="Heading markers" description="Vessels and vehicles show their heading." className="grid">
        <MapView center={{ lat: 4.18, lng: 73.51 }} zoom={14} className="h-56 sm:h-64">
          <MapMarker position={{ lat: 4.181, lng: 73.505 }} heading={45} title="Dhoni Hiyala, heading north-east" />
          <MapMarker
            position={{ lat: 4.177, lng: 73.517 }}
            heading={200}
            tone="chart-4"
            title="Ferry Raajje, heading south-south-west"
          />
        </MapView>
      </DemoSection>
    </DemoPage>
  )
}
