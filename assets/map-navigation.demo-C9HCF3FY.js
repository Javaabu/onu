var e=`import { MapNavigation, type NavigationStop } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Map navigation",
  group: "Maps",
  order: 6,
  description:
    "Directions between stops with a step list. Uses Google's routing service when available, otherwise straight segments with compass directions.",
}

const delivery: NavigationStop[] = [
  { label: "Warehouse, Maafannu", position: { lat: 4.1745, lng: 73.5015 } },
  { label: "IGMH", position: { lat: 4.1738, lng: 73.5068 } },
  { label: "Republic Square", position: { lat: 4.1771, lng: 73.5123 } },
  { label: "Hulhumalé Phase 1", position: { lat: 4.2135, lng: 73.5395 } },
]

const ferry: NavigationStop[] = [
  { label: "Malé ferry terminal · މާލެ", position: { lat: 4.1757, lng: 73.5166 } },
  { label: "Guraidhoo · ގުރައިދޫ", position: { lat: 3.8995, lng: 73.47 } },
  { label: "Maafushi · މާފުށި", position: { lat: 3.942, lng: 73.49 } },
]

export default function MapNavigationDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Delivery run"
        description="Use Previous / Next or pick a step; the map moves to it."
        className="block"
      >
        <MapNavigation stops={delivery} />
      </DemoSection>
      <DemoSection
        title="Sea route (straight segments)"
        description="routeService={false}: compass directions between stops."
        className="block"
      >
        <MapNavigation stops={ferry} routeService={false} tone="chart-2" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};