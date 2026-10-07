import * as React from "react"
import { Badge, Button, Icon } from "@javaabu/onu"
import { googleMapsUrl, MapInfoPanel, MapMarker, MapView } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { ISLANDS } from "./_data"

export const meta = {
  title: "Map info panel",
  group: "Maps",
  order: 10,
  description: "Details of the selected marker: a side panel over the map on desktop, a bottom sheet on phones.",
}

const places = ISLANDS.filter((i) => i.atoll === "K" || i.atoll === "MLE")

export default function MapInfoPanelDemo() {
  const [selected, setSelected] = React.useState<string | null>("maafushi")
  const [sheet, setSheet] = React.useState(false)
  const place = places.find((p) => p.value === selected)
  return (
    <DemoPage>
      <DemoSection
        title="Selected island"
        description="Click a pin (or Tab to it and press Enter). Escape closes the panel and focus returns to the pin."
        className="grid"
      >
        <MapView
          center={{ lat: 4.1, lng: 73.53 }}
          zoom={10}
          className="sm:h-96"
          overlay={
            <MapInfoPanel
              open={!!place}
              onOpenChange={(open) => !open && setSelected(null)}
              title={
                <>
                  {place?.label} <span lang="dv">· {place?.dvLabel}</span>
                </>
              }
              description={place?.atoll === "MLE" ? "Malé City" : "Kaafu Atoll"}
              actions={
                <Button size="sm" asChild>
                  <a href={place ? googleMapsUrl(place.position!) : "#"} target="_blank" rel="noreferrer">
                    <Icon name="external-link" />
                    Directions
                  </a>
                </Button>
              }
            >
              <dl className="gap-x-3 gap-y-1.5 grid grid-cols-[auto_1fr]">
                <dt className="text-muted-foreground">Population</dt>
                <dd className="tabular-nums">3,025</dd>
                <dt className="text-muted-foreground">Council</dt>
                <dd>
                  <Badge variant="secondary">Island council</Badge>
                </dd>
                <dt className="text-muted-foreground">Harbour</dt>
                <dd>Yes</dd>
              </dl>
            </MapInfoPanel>
          }
        >
          {places.map((p) => (
            <MapMarker
              key={p.value}
              position={p.position!}
              title={p.label}
              selected={p.value === selected}
              onClick={() => setSelected(p.value === selected ? null : p.value)}
            />
          ))}
        </MapView>
      </DemoSection>
      <DemoSection title="Bottom sheet" description='variant="sheet" (the default on phones).'>
        <Button variant="outline" onClick={() => setSheet(true)}>
          Open sheet
        </Button>
        <MapInfoPanel
          variant="sheet"
          open={sheet}
          onOpenChange={setSheet}
          title="Villimalé · ވިލިމާލެ"
          description="Malé City"
          actions={<Button onClick={() => setSheet(false)}>Done</Button>}
        >
          <p>A quiet island ward of Malé, reached by a 10-minute ferry.</p>
        </MapInfoPanel>
      </DemoSection>
    </DemoPage>
  )
}
