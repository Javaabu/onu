import * as React from "react"
import { MapInfoPanel, MapLegend, ViewportMarkerMap, type ViewportMarker } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { fetchPois, POI_CATEGORIES } from "./_data"

export const meta = {
  title: "Viewport-loaded marker map",
  group: "Maps",
  order: 13,
  description:
    "Loads markers for the visible area through your fetcher (debounced, stale requests aborted) and clusters them.",
}

export default function ViewportMarkerMapDemo() {
  const [selected, setSelected] = React.useState<ViewportMarker | null>(null)
  return (
    <DemoPage>
      <DemoSection
        title="Public services"
        description="Pan or zoom: a request goes out 300 ms after the map stops, and any older request is cancelled."
        className="grid"
      >
        <MapLegend
          orientation="horizontal"
          title={null}
          items={POI_CATEGORIES.map((c) => ({ label: c.name, tone: c.tone, shape: "pin" as const }))}
        />
        <ViewportMarkerMap
          fetcher={fetchPois}
          center={{ lat: 4.19, lng: 73.52 }}
          zoom={13}
          minZoom={9}
          selectedId={selected?.id ?? null}
          onSelect={(_, marker) => setSelected(marker)}
          overlay={
            <MapInfoPanel
              open={!!selected}
              onOpenChange={(open) => !open && setSelected(null)}
              title={selected?.title}
              description={selected?.description}
            >
              <p className="text-muted-foreground">Open 8:00–14:00, Sunday to Thursday.</p>
            </MapInfoPanel>
          }
        />
      </DemoSection>
      <DemoSection title="Without clustering" className="grid">
        <ViewportMarkerMap fetcher={fetchPois} center={{ lat: 3.942, lng: 73.49 }} zoom={15} cluster={false} />
      </DemoSection>
    </DemoPage>
  )
}
