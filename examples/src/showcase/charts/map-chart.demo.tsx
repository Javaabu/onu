import { MapChart } from "@javaabu/onu/charts"

import { DemoPage, DemoSection } from "../../components/demo"
import { atollPopulation, atollShapes } from "./_data"

export const meta = {
  title: "Map chart",
  group: "Charts",
  order: 8,
  description: "A choropleth on Google Maps (deck.gl GeoJsonLayer), with a table fallback.",
}

export default function MapChartDemo() {
  return (
    <DemoPage>
      <DemoSection
        title="Population by atoll"
        description="Without VITE_GOOGLE_MAPS_API_KEY the map is replaced by a notice and the data table. Atoll outlines here are simplified boxes."
        className="block"
      >
        <MapChart
          title="Resident population by atoll"
          geojson={atollShapes}
          data={atollPopulation}
          valueFormat="integer"
          regionLabel="Atoll"
          zoom={6}
        />
      </DemoSection>
    </DemoPage>
  )
}
