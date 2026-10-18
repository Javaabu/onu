var e=`import { HEATMAP_TONES, MapLegend, MapLegendSwatch, toneVar, type MapLegendShape } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Map legend swatch",
  group: "Maps",
  order: 14,
  description: "Colour and shape swatches that match how layers are drawn. Always paired with text.",
}

const shapes: MapLegendShape[] = ["circle", "square", "pin", "area", "line", "dashed"]

export default function MapLegendSwatchDemo() {
  return (
    <DemoPage>
      <DemoSection title="Shapes" className="gap-4 flex-wrap">
        {shapes.map((s) => (
          <span key={s} className="gap-2 text-sm flex items-center">
            <MapLegendSwatch shape={s} />
            {s}
          </span>
        ))}
        <span className="gap-2 text-sm flex items-center">
          <MapLegendSwatch shape="gradient" colors={HEATMAP_TONES.map(toneVar)} />
          gradient
        </span>
      </DemoSection>
      <DemoSection title="Sizes" className="gap-4 items-center">
        <MapLegendSwatch size="sm" tone="chart-2" />
        <MapLegendSwatch size="md" tone="chart-2" />
        <MapLegendSwatch size="lg" tone="chart-2" />
      </DemoSection>
      <DemoSection title="Legend" className="gap-8">
        <MapLegend
          items={[
            { label: "Under way", tone: "success", shape: "pin", description: "12" },
            { label: "At anchor", tone: "warning", shape: "pin", description: "4" },
            { label: "Distress", tone: "destructive", shape: "pin", description: "1" },
          ]}
        />
        <MapLegend
          title="ސަރަހައްދު"
          items={[
            { label: "ހެންވޭރު", tone: "chart-1", shape: "area" },
            { label: "މާފަންނު", tone: "chart-2", shape: "area" },
            { label: "ފެރީ މަގު", tone: "chart-3", shape: "dashed" },
          ]}
        />
        <MapLegend
          orientation="horizontal"
          title="Horizontal"
          items={[
            { label: "Clinic", tone: "destructive", shape: "circle" },
            { label: "School", tone: "info", shape: "circle" },
            { label: "Mosque", tone: "success", shape: "circle" },
          ]}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};