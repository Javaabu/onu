var e=`import { MapReplay } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { ferryTrack } from "./_data"

export const meta = {
  title: "Map replay",
  group: "Maps",
  order: 9,
  description:
    "Plays back a timestamped track: play/pause, speed and a keyboard-operable scrubber. The trail uses deck.gl on Google Maps.",
}

const track = ferryTrack()

const feature = {
  type: "Feature" as const,
  properties: { timestamps: track.map((p) => new Date(p.time).toISOString()) },
  geometry: { type: "LineString" as const, coordinates: track.map((p) => [p.lng, p.lat]) },
}

export default function MapReplayDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Ferry Malé → Maafushi"
        description="Points with times ({ lat, lng, time })."
        className="block"
      >
        <MapReplay track={track} title="Ferry Raajje" defaultSpeed={60} />
      </DemoSection>
      <DemoSection
        title="From GeoJSON"
        description="A LineString with properties.timestamps (ISO strings), starting halfway."
        className="block"
      >
        <MapReplay track={feature} title="Dhoni Hiyala" tone="chart-4" defaultTime={track[20]!.time} />
      </DemoSection>
      <DemoSection title="Empty" className="block">
        <MapReplay track={[]} />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};