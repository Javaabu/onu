var e=`import * as React from "react"
import { FormErrorsProvider } from "@javaabu/onu"
import { AddressInput, type MaldivesAddress } from "@javaabu/onu/maps"

import { DemoPage, DemoSection } from "../../components/demo"
import { ISLANDS, searchIslands } from "./_data"

export const meta = {
  title: "Address",
  group: "Maps",
  order: 8,
  description: "Maldivian address fields (atoll, island, road, house) with an optional map pin.",
}

export default function AddressInputDemo() {
  const [value, setValue] = React.useState<MaldivesAddress>({
    atoll: "MLE",
    island: "hulhumale",
    road: "Nirolhu Magu",
    house: "Lot 10294",
  })
  return (
    <DemoPage>
      <DemoSection
        title="With islands and a map pin"
        description="Submits address[atoll], address[island], address[road], address[house] and address[location][lat|lng]."
        className="grid"
      >
        <AddressInput
          name="address"
          value={value}
          onChange={setValue}
          islands={ISLANDS}
          pin
          search={searchIslands}
          required
        />
        <pre className="max-h-48 p-3 text-xs overflow-auto rounded-md bg-muted" dir="ltr">
          {JSON.stringify(value, null, 2)}
        </pre>
      </DemoSection>
      <DemoSection title="Free-text island, Thaana" className="grid">
        <AddressInput legend="ދާއިމީ އެޑްރެސް" thaana defaultValue={{ atoll: "S" }} />
      </DemoSection>
      <DemoSection
        title="Laravel errors"
        description="Errors from a 422 response, keyed by field name."
        className="grid"
      >
        <FormErrorsProvider
          errors={{ "home.atoll": ["Select the atoll."], "home.house": ["The house name is required."] }}
        >
          <AddressInput name="home" islands={ISLANDS} required />
        </FormErrorsProvider>
      </DemoSection>
      <DemoSection title="Disabled" className="grid">
        <AddressInput
          disabled
          islands={ISLANDS}
          defaultValue={{ atoll: "K", island: "maafushi", road: "Ziyaaraiy Magu", house: "Sunrise" }}
        />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};