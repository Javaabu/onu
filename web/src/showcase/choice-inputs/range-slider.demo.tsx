import * as React from "react"
import { FormField, RangeSlider } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Range slider",
  group: "Choice inputs",
  order: 13,
  description: "One value or a range, with marks and value labels. Mirrors in RTL.",
}

const mvr = new Intl.NumberFormat("en-MV", { style: "currency", currency: "MVR", maximumFractionDigits: 0 })

export default function RangeSliderDemo() {
  const [price, setPrice] = React.useState<number[]>([1500, 6000])
  return (
    <DemoPage>
      <DemoSection title="Range" className="max-w-md gap-8 grid w-full">
        <FormField label="Monthly rent" help={`${mvr.format(price[0]!)} – ${mvr.format(price[1]!)}`}>
          <RangeSlider
            min={0}
            max={20000}
            step={500}
            value={price}
            onValueChange={setPrice}
            formatValue={(v) => mvr.format(v)}
            showValue="always"
          />
        </FormField>
      </DemoSection>
      <DemoSection title="Single value with marks" className="max-w-md gap-8 grid w-full">
        <FormField label="Household size">
          <RangeSlider
            min={1}
            max={10}
            defaultValue={4}
            marks={[
              { value: 1, label: "1" },
              { value: 5, label: "5" },
              { value: 10, label: "10+" },
            ]}
          />
        </FormField>
        <FormField label="Volume" disabled>
          <RangeSlider defaultValue={30} />
        </FormField>
        <FormField label="ބަޖެޓު">
          <RangeSlider
            defaultValue={[20, 80]}
            marks={[
              { value: 0, label: "0" },
              { value: 100, label: "100" },
            ]}
          />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
