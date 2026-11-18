var e=`import { Button, Icon } from "@javaabu/onu"
import { LocationCard } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = {
  title: "Location card",
  group: "Maps",
  order: 7,
  description: "A static map thumbnail (or a placeholder without a key), the address, and an Open in Google Maps link.",
}

export default function LocationCardDemo() {
  return (
    <DemoPage>
      <DemoSection title="Vertical" className="gap-4 sm:grid-cols-2 grid">
        <LocationCard
          position={{ lat: 4.1771, lng: 73.5123 }}
          title="Ministry of Finance"
          address={
            <>
              Ameenee Magu, Malé 20379
              <br />
              Republic of Maldives
            </>
          }
        />
        <LocationCard
          position={{ lat: 4.2105, lng: 73.5402 }}
          title="ހުޅުމާލެ ހޮސްޕިޓަލް"
          address="ނިރޮޅު މަގު، ހުޅުމާލެ"
          lang="dv"
          dir="rtl"
        />
      </DemoSection>
      <DemoSection title="Horizontal with actions" className="grid">
        <LocationCard
          layout="horizontal"
          position={{ lat: 3.942, lng: 73.49 }}
          title="Maafushi Guest House"
          address="Kaafu Atoll, Maafushi"
          actions={
            <Button size="sm" variant="outline">
              <Icon name="phone" />
              Call
            </Button>
          }
        />
      </DemoSection>
      <DemoSection title="No thumbnail" className="max-w-sm grid">
        <LocationCard thumbnail={false} position={{ lat: -0.6094, lng: 73.0891 }} title="Hithadhoo Harbour" />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};