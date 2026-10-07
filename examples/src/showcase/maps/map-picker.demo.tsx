import * as React from "react"
import { FormField, useTranslation } from "@javaabu/onu"
import { formatLatLng, MapPicker, type LatLng } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { searchIslands } from "./_data"

export const meta = {
  title: "Map picker",
  group: "Maps",
  order: 1,
  description:
    "Pick a point by clicking the map, dragging the pin, searching, using the device location or typing coordinates.",
}

export default function MapPickerDemo() {
  const { t, locale } = useTranslation()
  const [value, setValue] = React.useState<LatLng | null>({ lat: 4.1752, lng: 73.5091 })
  return (
    <DemoPage>
      <DemoSection
        title="In a form field"
        description="Submits location[lat] and location[lng]. The search box here searches a demo island list (try “Maafushi” or “ހިތަދޫ”)."
        className="grid"
      >
        <FormField label="Business location" name="location" required help="Where customers can find you.">
          <MapPicker value={value} onChange={setValue} search={searchIslands} />
        </FormField>
        <p className="text-sm text-muted-foreground">
          Value: {value ? formatLatLng(value, t, locale.numberLocale, 5) : "—"}
        </p>
      </DemoSection>
      <DemoSection title="Empty, with Thaana search" className="grid">
        <FormField label="ތަން">
          <MapPicker search={searchIslands} thaana />
        </FormField>
      </DemoSection>
      <DemoSection title="Disabled" className="grid">
        <FormField label="Registered address" disabled>
          <MapPicker defaultValue={{ lat: 4.2105, lng: 73.5402 }} search={false} />
        </FormField>
      </DemoSection>
      <DemoSection title="Error" className="grid">
        <FormField label="Site location" error="Pick the site location on the map." required>
          <MapPicker search={false} locate={false} />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
