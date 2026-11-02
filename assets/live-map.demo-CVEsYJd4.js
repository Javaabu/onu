var e=`import * as React from "react"
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
    push({ ...v, updatedAt: Date.now(), status: \`\${(8 + Math.random() * 6).toFixed(1)} kn\` })
  }, 2000)
  return () => clearInterval(id)
}

const FLEET: LiveMapMarker[] = [
  ...VESSELS,
  {
    id: "addu",
    title: "Ferry Addu · ފެރީ އައްޑޫ",
    position: { lat: -0.629, lng: 73.158 },
    heading: 10,
    tone: "chart-3",
  },
]

/** A vessel list outside the map: selecting one centres it on the map without following it. */
function ExternalSelection() {
  const [selected, setSelected] = React.useState<string | null>(null)
  return (
    <div className="gap-3 @container grid">
      <div role="group" aria-label="Fleet" className="gap-2 flex flex-wrap">
        {FLEET.map((v) => (
          <Button
            key={v.id}
            size="sm"
            variant={selected === v.id ? "default" : "outline"}
            aria-pressed={selected === v.id}
            onClick={() => setSelected(selected === v.id ? null : v.id)}
          >
            {v.title}
          </Button>
        ))}
      </div>
      <LiveMap markers={FLEET} selectedId={selected} onSelect={setSelected} list={false} />
    </div>
  )
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
      <DemoSection
        title="Selected from outside the map"
        description="Without a centre the map fits the whole fleet. Picking a vessel in your own list pans to it."
        className="grid"
      >
        <ExternalSelection />
      </DemoSection>
      <DemoSection title="Empty" className="grid">
        <LiveMap markers={[]} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};