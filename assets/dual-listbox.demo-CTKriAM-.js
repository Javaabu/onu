var e=`import * as React from "react"
import { DualListbox, FormField } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { permissions } from "./_data"

export const meta = {
  title: "Dual listbox",
  group: "Choice inputs",
  order: 7,
  description: "Two lists with move buttons. Space marks, Shift+arrows extend, Enter moves, double click moves.",
}

export default function DualListboxDemo() {
  const [value, setValue] = React.useState<string[]>(["users.view", "applications.view"])
  return (
    <DemoPage>
      <DemoSection title="Role permissions" className="gap-4 grid w-full">
        <FormField label="Permissions" help={\`\${value.length} granted\`}>
          <DualListbox
            options={permissions}
            value={value}
            onValueChange={setValue}
            availableLabel="Available"
            selectedLabel="Granted"
            name="permissions"
          />
        </FormField>
      </DemoSection>
      <DemoSection title="Narrow column and Dhivehi" className="max-w-sm gap-4 grid w-full">
        <FormField label="ހުއްދަތައް">
          <DualListbox
            options={["ބެލުން", "އުފެއްދުން", "ބަދަލުކުރުން", "ފޮހެލުން"]}
            defaultValue={["ބެލުން"]}
            thaana
          />
        </FormField>
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};