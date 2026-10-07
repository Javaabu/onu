import * as React from "react"
import { Badge, Button, Icon } from "@javaabu/onu"
import { LiveMap, MapInfoPanel, type LiveMapMarker, type LiveMapSubscribe } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Live map",
  group: "Maps",
  order: 5,
  description: "Markers that move as positions stream in, glide between updates, and can be followed.",
}

const VESSELS: LiveMapMarker[] = [
  {
    id: "hiyala",
    title: "Dhoni Hiyala · ދޯނި ހިޔާލަ",
    position: { lat: 4.17, lng: 73.5 },
    heading: 90,
    tone: "primary",
  },
  {
    id: "raajje",
    title: "Ferry Raajje · ފެރީ ރާއްޖެ",
    position: { lat: 4.19, lng: 73.53 },
    heading: 200,
    tone: "chart-4",
  },
  {
    id: "kandu",
    title: "Speedboat Kandu · ކަނޑު",
    position: { lat: 4.205, lng: 73.505 },
    heading: 140,
    tone: "chart-2",
  },
]

/** Simulates a WebSocket feed: every 2 s one vessel reports a new position. */
const subscribe: LiveMapSubscribe = (push) => {
  const state = VESSELS.map((v) => ({ ...v }))
  let i = 0
  const id = setInterval(() => {
    const v = state[i % state.length]!
    i++
    const rad = ((v.heading ?? 0) * Math.PI) / 180
    v.position = { lat: v.position.lat + Math.cos(rad) * 0.0018, lng: v.position.lng + Math.sin(rad) * 0.0018 }
    v.heading = ((v.heading ?? 0) + (Math.random() - 0.5) * 50 + 360) % 360
    push({ ...v, updatedAt: Date.now(), status: `${(8 + Math.random() * 6).toFixed(1)} kn` })
  }, 2000)
  return () => clearInterval(id)
}

export default function LiveMapDemo() {
  const [selected, setSelected] = React.useState<string | null>(null)
  const vessel = VESSELS.find((v) => v.id === selected)
  return (
    <DemoPage>
      <DemoSection
        title="Vessel tracking"
        description="A simulated stream moves one vessel every 2 seconds. Select a vessel for details; Follow keeps it centred."
        className="grid"
      >
        <LiveMap
          markers={VESSELS}
          subscribe={subscribe}
          selectedId={selected}
          onSelect={setSelected}
          zoom={13}
          overlay={
            <MapInfoPanel
              open={!!vessel}
              onOpenChange={(open) => !open && setSelected(null)}
              title={vessel?.title}
              description="Registered in Malé"
              actions={
                <Button size="sm" variant="outline">
                  <Icon name="history" />
                  Trip history
                </Button>
              }
            >
              <dl className="gap-x-3 gap-y-1 grid grid-cols-[auto_1fr]">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="secondary">Under way</Badge>
                </dd>
                <dt className="text-muted-foreground">Crew</dt>
                <dd>6</dd>
                <dt className="text-muted-foreground">Licence</dt>
                <dd dir="ltr">MV-4471-K</dd>
              </dl>
            </MapInfoPanel>
          }
        />
      </DemoSection>
      <DemoSection title="Empty" className="grid">
        <LiveMap markers={[]} />
      </DemoSection>
    </DemoPage>
  )
}
