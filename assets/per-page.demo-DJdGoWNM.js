var e=`import * as React from "react"
import { PerPage } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"

export const meta = { title: "Per page", group: "Listing pages", order: 7 }

export default function PerPageDemo() {
  const [value, setValue] = React.useState(25)
  return (
    <DemoPage>
      <DemoSection title="Rows per page">
        <PerPage value={value} onValueChange={setValue} />
        <PerPage value={value} onValueChange={setValue} options={[12, 24, 48]} label="Cards per page" size="default" />
        <PerPage value={value} onValueChange={setValue} label={null} disabled />
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};