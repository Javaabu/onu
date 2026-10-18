var e=`import * as React from "react"
import { FilterSubmit, FormField, TextInput } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { wait } from "./_data"

export const meta = { title: "Filter submit", group: "Listing pages", order: 17 }

export default function FilterSubmitDemo() {
  const [loading, setLoading] = React.useState(false)
  return (
    <DemoPage>
      <DemoSection title="Classic filter form" className="block">
        <form
          className="gap-3 flex flex-wrap items-end"
          onSubmit={(e) => {
            e.preventDefault()
            setLoading(true)
            void wait().then(() => setLoading(false))
          }}
        >
          <FormField label="Name" className="w-56">
            <TextInput placeholder="Aishath" />
          </FormField>
          <FormField label="ނަން" className="w-56">
            <TextInput thaana />
          </FormField>
          <FilterSubmit loading={loading} onReset={() => undefined} />
        </form>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};