var e=`import * as React from "react"
import { BulkActionBar, NativeSelect, NativeSelectOption, type BulkAction } from "@javaabu/onu"

import { DemoPage, DemoSection } from "../../components/demo"
import { noun, wait } from "./_data"

export const meta = { title: "Bulk actions", group: "Listing pages", order: 8 }

const actions: BulkAction<unknown>[] = [
  {
    id: "island",
    label: "Move to island",
    icon: "map-pin",
    defaultValue: "Malé",
    form: ({ id, value, onChange }) => (
      <NativeSelect id={id} size="sm" value={String(value)} onChange={(e) => onChange(e.target.value)}>
        {["Malé", "Hulhumalé", "Addu City"].map((i) => (
          <NativeSelectOption key={i}>{i}</NativeSelectOption>
        ))}
      </NativeSelect>
    ),
    run: () => wait(),
    successMessage: (n) => \`\${n} users moved\`,
  },
  { id: "verify", label: "Verify", icon: "check", confirm: true, run: () => wait() },
  {
    id: "fail",
    label: "Notify (fails)",
    icon: "bell",
    run: () => wait(400).then(() => Promise.reject(new Error("SMS gateway is offline"))),
  },
  { id: "delete", label: "Delete", icon: "trash", destructive: true, run: () => wait(1200) },
]

export default function BulkActionsDemo() {
  const [selected, setSelected] = React.useState(["1", "2", "3"])
  return (
    <DemoPage>
      <DemoSection title="Bulk action bar" className="gap-3 grid">
        <BulkActionBar selected={selected} actions={actions} noun={noun} onClearSelection={() => setSelected([])} />
        {selected.length === 0 ? (
          <button
            type="button"
            className="text-sm w-fit text-primary underline"
            onClick={() => setSelected(["1", "2", "3"])}
          >
            Select 3 rows again
          </button>
        ) : null}
      </DemoSection>
    </DemoPage>
  )
}
`;export{e as default};